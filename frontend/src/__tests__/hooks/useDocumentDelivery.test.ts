import { describe, it, expect, beforeEach } from "vitest";
import { useDocumentDeliveryStore } from "@/store/document_delivery.store";

describe("Document Delivery Frontend Logic", () => {
  beforeEach(() => {
    useDocumentDeliveryStore.setState({
      savedContacts: {},
      history: [],
      isLoading: false,
      error: null,
    });
  });

  it("saves and retrieves customer contact details", () => {
    const store = useDocumentDeliveryStore.getState();

    store.saveContact("cust_123", {
      phone: "+258841234567",
      email: "cliente@empresa.co.mz",
    });

    const updated = useDocumentDeliveryStore.getState().savedContacts["cust_123"];
    expect(updated).toBeDefined();
    expect(updated.phone).toBe("+258841234567");
    expect(updated.email).toBe("cliente@empresa.co.mz");
  });

  it("adds sent documents to history list", () => {
    useDocumentDeliveryStore.setState({
      history: [
        {
          id: 1,
          company_id: 1,
          document_type: "invoice",
          document_id: 101,
          customer_phone: "+258841234567",
          delivery_method: "whatsapp",
          status: "sent",
          pdf_url: "https://documents.ticonta.co.mz/docs/fatura_101.pdf",
        },
      ],
    });

    const list = useDocumentDeliveryStore.getState().history;
    expect(list.length).toBe(1);
    expect(list[0].delivery_method).toBe("whatsapp");
    expect(list[0].status).toBe("sent");
  });
});
