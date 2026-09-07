import { create } from 'zustand';
import { FiscalDocument, generateFiscalDocNumber } from '@/lib/fiscalMoz';
import { calculateIVA16 } from '@/lib/currency';

export interface Product {
  id: string;
  code: string;
  name: string;
  price: number;
  stock: number;
  category: 'Bar/Bebidas' | 'Mercearia' | 'Ferragens' | 'Oficina' | 'Restaurante';
}

export interface CartItem {
  product: Product;
  qty: number;
  discount: number;
}

interface PosState {
  products: Product[];
  cart: CartItem[];
  selectedCategory: string;
  searchQuery: string;
  activeClientName: string;
  activeClientPhone: string;
  activeClientNUIT: string;
  paymentMethod: 'M-Pesa' | 'e-Mola' | 'POS/Cartão' | 'Numerário';
  paymentReference: string;
  amountTendered: number;
  lastIssuedDoc: FiscalDocument | null;
  isCheckoutModalOpen: boolean;
  isReceiptModalOpen: boolean;

  addToCart: (product: Product, qty?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQty: (productId: string, qty: number) => void;
  clearCart: () => void;
  setCategory: (cat: string) => void;
  setSearchQuery: (query: string) => void;
  setClientDetails: (name: string, phone: string, nuit: string) => void;
  setPaymentMethod: (method: PosState['paymentMethod']) => void;
  setPaymentReference: (ref: string) => void;
  setAmountTendered: (amount: number) => void;
  openCheckoutModal: () => void;
  closeCheckoutModal: () => void;
  closeReceiptModal: () => void;
  completeSale: (company: { name: string; nuit: string; address: string; phone: string }) => FiscalDocument;
}

const initialProducts: Product[] = [
  { id: 'PRD-01', code: 'BEB-001', name: 'Água Mineral Vumba 500ml', price: 40, stock: 120, category: 'Bar/Bebidas' },
  { id: 'PRD-02', code: 'BEB-002', name: 'Cerveja 2M Lata 330ml', price: 85, stock: 96, category: 'Bar/Bebidas' },
  { id: 'PRD-03', code: 'BEB-003', name: 'Refrigerante Frozy 330ml', price: 35, stock: 150, category: 'Bar/Bebidas' },
  { id: 'PRD-04', code: 'ALI-001', name: 'Arroz Dona Ana 5kg', price: 380, stock: 45, category: 'Mercearia' },
  { id: 'PRD-05', code: 'ALI-002', name: 'Óleo Alimentar Camelo 1L', price: 110, stock: 60, category: 'Mercearia' },
  { id: 'PRD-06', code: 'ALI-003', name: 'Farinha de Milho Chissano 10kg', price: 420, stock: 30, category: 'Mercearia' },
  { id: 'PRD-07', code: 'FER-001', name: 'Parafuso Auto-roscante 4.2x25 (100un)', price: 180, stock: 80, category: 'Ferragens' },
  { id: 'PRD-08', code: 'FER-002', name: 'Cola de Madeira Fixador 500g', price: 290, stock: 24, category: 'Ferragens' },
  { id: 'PRD-09', code: 'OFI-001', name: 'Óleo Motor 20W50 Total 4L', price: 1850, stock: 15, category: 'Oficina' },
  { id: 'PRD-10', code: 'OFI-002', name: 'Pastilhas de Travão Dianteiras Toyota', price: 2400, stock: 8, category: 'Oficina' },
  { id: 'PRD-11', code: 'RES-001', name: 'Prato do Dia: Frango à Zambeziana', price: 350, stock: 25, category: 'Restaurante' },
  { id: 'PRD-12', code: 'RES-002', name: 'Prato Especial: Matapa c/ Camarão', price: 550, stock: 18, category: 'Restaurante' },
];

export const usePosStore = create<PosState>((set, get) => ({
  products: initialProducts,
  cart: [
    { product: initialProducts[0], qty: 2, discount: 0 },
    { product: initialProducts[1], qty: 4, discount: 0 },
  ],
  selectedCategory: 'Todos',
  searchQuery: '',
  activeClientName: 'Armando Cossa',
  activeClientPhone: '+258 84 392 8190',
  activeClientNUIT: '100829143',
  paymentMethod: 'M-Pesa',
  paymentReference: 'MP-843928190',
  amountTendered: 420,
  lastIssuedDoc: null,
  isCheckoutModalOpen: false,
  isReceiptModalOpen: false,

  addToCart: (product, qty = 1) => {
    set((state) => {
      const existing = state.cart.find((i) => i.product.id === product.id);
      if (existing) {
        return {
          cart: state.cart.map((i) =>
            i.product.id === product.id ? { ...i, qty: i.qty + qty } : i
          ),
        };
      }
      return { cart: [...state.cart, { product, qty, discount: 0 }] };
    });
  },

  removeFromCart: (productId) => {
    set((state) => ({ cart: state.cart.filter((i) => i.product.id !== productId) }));
  },

  updateQty: (productId, qty) => {
    if (qty <= 0) {
      get().removeFromCart(productId);
      return;
    }
    set((state) => ({
      cart: state.cart.map((i) => (i.product.id === productId ? { ...i, qty } : i)),
    }));
  },

  clearCart: () => set({ cart: [] }),
  setCategory: (selectedCategory) => set({ selectedCategory }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setClientDetails: (activeClientName, activeClientPhone, activeClientNUIT) =>
    set({ activeClientName, activeClientPhone, activeClientNUIT }),
  setPaymentMethod: (paymentMethod) => set({ paymentMethod }),
  setPaymentReference: (paymentReference) => set({ paymentReference }),
  setAmountTendered: (amountTendered) => set({ amountTendered }),
  openCheckoutModal: () => set({ isCheckoutModalOpen: true }),
  closeCheckoutModal: () => set({ isCheckoutModalOpen: false }),
  closeReceiptModal: () => set({ isReceiptModalOpen: false }),

  completeSale: (company) => {
    const state = get();
    const subtotalBruto = state.cart.reduce((acc, i) => acc + i.product.price * i.qty, 0);
    const { net, tax, total } = calculateIVA16(subtotalBruto, true);

    const doc: FiscalDocument = {
      id: `DOC-${Date.now().toString(36).toUpperCase()}`,
      docNumber: generateFiscalDocNumber('FR', Math.floor(1000 + Math.random() * 9000)),
      docType: 'Factura-Recibo',
      date: new Date().toLocaleDateString('pt-MZ') + ' ' + new Date().toLocaleTimeString('pt-MZ'),
      clientName: state.activeClientName || 'Consumidor Final',
      clientPhone: state.activeClientPhone || '+258 84 000 0000',
      clientNUIT: state.activeClientNUIT || '999999999',
      companyName: company.name,
      companyNUIT: company.nuit,
      companyAddress: company.address,
      companyContact: company.phone,
      items: state.cart.map((i) => ({
        id: i.product.id,
        description: i.product.name,
        qty: i.qty,
        unitPrice: i.product.price,
        total: i.product.price * i.qty,
      })),
      subtotal: net,
      tax16: tax,
      total,
      paymentMethod: state.paymentMethod,
      paymentReference: state.paymentReference,
      amountReceived: state.amountTendered || total,
      change: Math.max(0, (state.amountTendered || total) - total),
      verificationHash: `MZ-AT-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
    };

    set({
      lastIssuedDoc: doc,
      cart: [],
      isCheckoutModalOpen: false,
      isReceiptModalOpen: true,
    });

    return doc;
  },
}));
