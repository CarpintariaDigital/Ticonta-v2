export interface CompanyProfile {
  name: string;
  legal_name: string;
  nuit: string;
  phone: string;
  whatsapp: string;
  email: string;
  address: string;
  city: string;
  province: string;
  logo_url?: string;
  default_vat_rate: number;
  currency: string;
  receipt_footer_note: string;
}

export const DEFAULT_COMPANY_PROFILE: CompanyProfile = {
  name: "TiConta Comercial & Serviços",
  legal_name: "TiConta Comercial Lda",
  nuit: "400123456",
  phone: "+258 84 123 4567",
  whatsapp: "+258 84 123 4567",
  email: "contacto@ticonta.co.mz",
  address: "Av. 24 de Julho, nº 1234",
  city: "Maputo",
  province: "Maputo Cidade",
  logo_url: "/logo-ticonta.png",
  default_vat_rate: 16,
  currency: "MT",
  receipt_footer_note: "Obrigado pela sua preferência! Volte sempre.",
};
