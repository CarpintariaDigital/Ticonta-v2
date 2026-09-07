import { apiClient } from "@/services/auth";
import { BarcodeProduct } from "@/types/barcode";

export const barcodeService = {
  /**
   * Resolve o código de barras ou SKU instantaneamente (<100ms)
   */
  async resolveBarcode(barcode: string, companyId: number = 1): Promise<BarcodeProduct> {
    const response = await apiClient.get<BarcodeProduct>(
      `/api/v1/barcodes/resolve/${encodeURIComponent(barcode)}?company_id=${companyId}`
    );
    return response.data;
  },

  /**
   * Gera uma imagem de código de barras para o produto
   */
  async generateProductBarcode(
    productId: number,
    payload: { barcode_string?: string; barcode_format?: string }
  ) {
    const response = await apiClient.post(
      `/api/v1/products/${productId}/barcode/generate`,
      payload
    );
    return response.data;
  },
};
