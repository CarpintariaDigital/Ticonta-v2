export enum BarcodeFormat {
  EAN_13 = "EAN-13",
  UPC_A = "UPC-A",
  CODE_128 = "Code-128",
  QR_CODE = "QR-Code",
}

export interface BarcodeProduct {
  product_id: number;
  name: string;
  sku: string;
  barcode?: string;
  barcode_format?: BarcodeFormat | string;
  unit_price: number;
  stock_quantity: number;
  tax_rate: number;
  category?: string;
  active: boolean;
  scan_count: number;
}

export interface CartItem {
  product_id: number;
  name: string;
  sku: string;
  barcode?: string;
  unit_price: number;
  quantity: number;
  tax_rate: number;
  total_price: number;
}
