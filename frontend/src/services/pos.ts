import { apiClient } from "@/services/auth";
import { localDb } from "@/lib/dexie";
import { CartItem, OfflineSalePayload, PaymentMethod, Product } from "@/types/pos";

export interface CreateSaleInput {
  company_id?: number;
  customer_id?: number;
  items: {
    product_id: number;
    quantity: number;
    unit_price?: number;
    tax_rate?: number;
  }[];
  payment_method: PaymentMethod;
  discount?: number;
  payments?: {
    method: string;
    amount: number;
    reference?: string;
  }[];
}

export const getTerminalId = (): string => {
  if (typeof window === "undefined") return "CX01";
  let termId = localStorage.getItem("ticonta_terminal_id");
  if (!termId) {
    termId = `CX${Math.floor(Math.random() * 90 + 10)}`;
    localStorage.setItem("ticonta_terminal_id", termId);
  }
  return termId;
};

export const posService = {
  async getProducts(): Promise<Product[]> {
    try {
      const response = await apiClient.get<Product[]>("/api/v1/products");
      // Cache products locally in Dexie
      if (response.data && response.data.length > 0) {
        await localDb.products.bulkPut(response.data);
      }
      return response.data;
    } catch (error) {
      // Fallback offline from Dexie
      const cached = await localDb.products.toArray();
      if (cached.length > 0) {
        return cached;
      }
      // Initial mock products fallback if DB is empty and server is down
      return defaultPOSProducts;
    }
  },

  async createSale(data: CreateSaleInput): Promise<any> {
    const terminalId = getTerminalId();
    try {
      const response = await apiClient.post("/api/v1/sales", {
        ...data,
        terminal_id: terminalId,
      });
      return { success: true, data: response.data, offline: false };
    } catch (error: any) {
      // Create and save locally in Dexie with unique multi-device terminal partition
      const timestamp = Date.now();
      const uniqueSuffix = Math.random().toString(36).substr(2, 4).toUpperCase();
      const offlineId = `OFF-${terminalId}-${timestamp}-${uniqueSuffix}`;
      const invoiceNumber = `VD-${terminalId}-${new Date().getFullYear().toString().slice(-2)}${String(timestamp).slice(-4)}-${uniqueSuffix}`;

      const offlineSale: OfflineSalePayload = {
        offline_id: offlineId,
        company_id: data.company_id || 1,
        customer_id: data.customer_id,
        items: data.items.map((i) => ({
          product_id: i.product_id,
          product_name: `Produto #${i.product_id}`,
          quantity: i.quantity,
          unit_price: i.unit_price || 0,
          tax_rate: i.tax_rate || 16,
        })),
        payment_method: data.payment_method,
        payment_status: "completed",
        discount: data.discount || 0,
        total_amount: data.items.reduce((acc, curr) => acc + (curr.unit_price || 0) * curr.quantity, 0),
        tax_amount: 0,
        discount_amount: data.discount || 0,
        net_amount: 0,
        created_at: new Date().toISOString(),
        synced: false,
      };

      await localDb.offlineSales.add(offlineSale);
      return {
        success: true,
        data: {
          id: timestamp % 100000,
          invoice_number: invoiceNumber,
          net_amount: offlineSale.total_amount - (data.discount || 0),
          sale_date: offlineSale.created_at,
          payment_method: data.payment_method,
          offline: true,
          terminal_id: terminalId,
        },
        offline: true,
      };
    }
  },

  async getSaleReceipt(saleId: number): Promise<string> {
    const response = await apiClient.post(`/api/v1/sales/${saleId}/print`);
    return response.data;
  },

  async getTodayTotal(): Promise<any> {
    try {
      const response = await apiClient.get("/api/v1/sales/today/total");
      return response.data;
    } catch (error) {
      return {
        date: new Date().toISOString().split("T")[0],
        total_sales_count: 0,
        total_revenue: 0,
        total_tax: 0,
        total_discounts: 0,
        payment_breakdown: {},
      };
    }
  },

  async findProductByBarcode(barcode: string): Promise<Product | null> {
    const cleanCode = barcode.trim().toLowerCase();
    const all = await this.getProducts();
    const found = all.find(
      (p) =>
        p.sku?.toLowerCase() === cleanCode ||
        p.name.toLowerCase().includes(cleanCode) ||
        (p as any).barcode?.toLowerCase() === cleanCode
    );
    return found || null;
  },

  async registerProduct(productData: Partial<Product>): Promise<Product> {
    const newProduct: Product = {
      id: Date.now(),
      company_id: 1,
      name: productData.name || "Novo Produto",
      sku: productData.sku || `BAR-${Date.now().toString().slice(-6)}`,
      category: productData.category || "Geral",
      unit_price: Number(productData.unit_price) || 0,
      cost_price: Number(productData.cost_price) || 0,
      quantity: Number(productData.quantity) || 0,
      iva_rate: productData.iva_rate !== undefined ? productData.iva_rate : 16,
      active: true,
      created_at: new Date().toISOString(),
    };

    try {
      await apiClient.post("/api/v1/products", newProduct);
    } catch {}

    await localDb.products.put(newProduct);
    return newProduct;
  },

  async addStockByBarcode(
    barcode: string,
    quantityToAdd: number,
    costPrice?: number,
    sellingPrice?: number,
    name?: string
  ): Promise<{ product: Product; isNew: boolean }> {
    const existing = await this.findProductByBarcode(barcode);

    if (existing) {
      const updatedProduct: Product = {
        ...existing,
        quantity: existing.quantity + quantityToAdd,
        cost_price: costPrice !== undefined ? costPrice : existing.cost_price,
        unit_price: sellingPrice !== undefined ? sellingPrice : existing.unit_price,
      };

      try {
        await apiClient.put(`/api/v1/products/${existing.id}`, updatedProduct);
      } catch {}

      await localDb.products.put(updatedProduct);
      return { product: updatedProduct, isNew: false };
    } else {
      const created = await this.registerProduct({
        name: name || `Produto ${barcode}`,
        sku: barcode,
        unit_price: sellingPrice || 100,
        cost_price: costPrice || 70,
        quantity: quantityToAdd,
        category: "Geral",
        iva_rate: 16,
        active: true,
      });
      return { product: created, isNew: true };
    }
  },

  async syncPendingSales(): Promise<number> {
    const pending = await localDb.offlineSales.where("synced").equals(0).toArray();
    let syncedCount = 0;
    for (const sale of pending) {
      try {
        await apiClient.post("/api/v1/sales", {
          company_id: sale.company_id,
          customer_id: sale.customer_id,
          items: sale.items,
          payment_method: sale.payment_method,
          discount: sale.discount,
        });
        await localDb.offlineSales.update(sale.offline_id, { synced: true });
        syncedCount++;
      } catch (err) {
        break; // retry later
      }
    }
    return syncedCount;
  },
};

export const defaultPOSProducts: Product[] = [
  {
    id: 1,
    name: "Cimento Nacional 50kg",
    sku: "CIM-001",
    category: "Construção",
    unit_price: 450.0,
    cost_price: 380.0,
    quantity: 120,
    iva_rate: 16.0,
    active: true,
  },
  {
    id: 2,
    name: "Tinta Acrílica Branca 20L",
    sku: "TNT-002",
    category: "Pintura",
    unit_price: 1250.0,
    cost_price: 950.0,
    quantity: 35,
    iva_rate: 16.0,
    active: true,
  },
  {
    id: 3,
    name: "Tubo PVC Esgoto 110mm",
    sku: "PVC-110",
    category: "Canalização",
    unit_price: 380.0,
    cost_price: 260.0,
    quantity: 80,
    iva_rate: 16.0,
    active: true,
  },
  {
    id: 4,
    name: "Varão de Aço 12mm (12m)",
    sku: "VAR-12",
    category: "Construção",
    unit_price: 620.0,
    cost_price: 490.0,
    quantity: 200,
    iva_rate: 16.0,
    active: true,
  },
  {
    id: 5,
    name: "Disjuntor Bipolar 25A",
    sku: "ELT-025",
    category: "Eletricidade",
    unit_price: 290.0,
    cost_price: 190.0,
    quantity: 45,
    iva_rate: 16.0,
    active: true,
  },
  {
    id: 6,
    name: "Piso Cerâmico 60x60 Bege (m²)",
    sku: "CER-060",
    category: "Acabamentos",
    unit_price: 520.0,
    cost_price: 390.0,
    quantity: 150,
    iva_rate: 16.0,
    active: true,
  },
  {
    id: 7,
    name: "Lâmpada LED 12W Branca",
    sku: "LED-012",
    category: "Eletricidade",
    unit_price: 85.0,
    cost_price: 45.0,
    quantity: 300,
    iva_rate: 16.0,
    active: true,
  },
  {
    id: 8,
    name: "Chapa de Zinco Ondulada 3m",
    sku: "CHP-003",
    category: "Construção",
    unit_price: 410.0,
    cost_price: 310.0,
    quantity: 90,
    iva_rate: 16.0,
    active: true,
  },
];
