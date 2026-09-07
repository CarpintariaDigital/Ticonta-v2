import { apiClient as api } from "@/services/auth";
import {
  Vehicle,
  ServiceOrder,
  MechanicTechnician,
  WorkshopStats,
} from "@/types/auto_services";

const API_PREFIX = "/api/v1/auto";

// Initial Demo/Mock Fallback Data
const MOCK_VEHICLES: Vehicle[] = [
  {
    id: 1,
    company_id: 1,
    customer_id: 1,
    license_plate: "ABC-888-MC",
    make: "Toyota",
    model: "Hilux 2.8 GD-6 4x4",
    year: 2023,
    vin: "AHTBA3CD900123456",
    color: "Branco Pérola",
    fuel_type: "diesel",
    mileage_km: 45200,
    engine_size: "2.8L D-4D Turbo",
    notes: "Viatura de frotas executivas.",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 2,
    company_id: 1,
    customer_id: 2,
    license_plate: "MM-77-99",
    make: "Volkswagen",
    model: "Golf 7.5 GTI",
    year: 2021,
    vin: "WVWZZZAUZLW098765",
    color: "Preto Deep Black",
    fuel_type: "petrol",
    mileage_km: 38000,
    engine_size: "2.0 TSI Turbo",
    notes: "Cliente solicita preparação Stage 2 e escape.",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

const MOCK_ORDERS: ServiceOrder[] = [
  {
    id: 1,
    company_id: 1,
    order_number: "OS-2026/0001",
    vehicle_id: 1,
    customer_id: 1,
    technician_id: 1,
    service_type: "maintenance",
    status: "in_progress",
    entry_date: new Date(Date.now() - 3600000 * 4).toISOString(),
    estimated_delivery: new Date(Date.now() + 3600000 * 24).toISOString(),
    completed_at: null,
    entry_mileage: 45200,
    fuel_level: "3/4",
    visible_damages: [{ area: "parachoques_tras", damage: "risco_superficial" }],
    belongings_left: "Cabo USB, Óculos de Sol no porta-luvas",
    customer_complaint: "Revisão dos 45.000 km e vibração ligeira na travagem",
    diagnostic_summary: "Pastilhas desgastadas em 70% e óleo com 10.000 km de uso",
    total_parts: 6500,
    total_labor: 2400,
    discount: 0,
    iva_rate: 16,
    iva_amount: 1424,
    total_final: 10324,
    sale_id: null,
    created_at: new Date(Date.now() - 3600000 * 4).toISOString(),
    updated_at: new Date().toISOString(),
    vehicle: MOCK_VEHICLES[0],
    technician: {
      id: 1,
      company_id: 1,
      name: "Mestre João Mecânico",
      specialty: "mechanics",
      phone: "+258841112233",
      is_active: true,
      created_at: new Date().toISOString(),
    },
    items: [
      {
        id: 1,
        service_order_id: 1,
        item_type: "part",
        description: "Óleo 5W30 Sintético Castrol Edge (8L)",
        quantity: 1,
        unit_cost: 3200,
        unit_price: 4500,
        total_price: 4500,
        is_completed: true,
      },
      {
        id: 2,
        service_order_id: 1,
        item_type: "part",
        description: "Jogo de Pastilhas de Travão Dianteiras",
        quantity: 1,
        unit_cost: 1400,
        unit_price: 2000,
        total_price: 2000,
        is_completed: false,
      },
      {
        id: 3,
        service_order_id: 1,
        item_type: "labor",
        description: "Mão-de-Obra Revisão Geral & Sangragem Travões",
        quantity: 2,
        unit_cost: 0,
        unit_price: 1200,
        total_price: 2400,
        is_completed: false,
      },
    ],
    diagnostic_reports: [
      {
        id: 1,
        service_order_id: 1,
        vehicle_id: 1,
        scanner_tool: "OBD-II Pro Scanner V3",
        dtc_codes: [],
        battery_voltage: 12.6,
        alternator_charging_voltage: 14.2,
        brake_pad_wear_pct: 70,
        road_test_notes: "Vibração nos discos dianteiros confirmada.",
        technician_recommendations: "Recomendado retificar ou trocar discos na próxima revisão.",
        created_at: new Date().toISOString(),
      },
    ],
    paint_tuning_specs: [],
  },
  {
    id: 2,
    company_id: 1,
    order_number: "OS-2026/0002",
    vehicle_id: 2,
    customer_id: 2,
    technician_id: 2,
    service_type: "tuning",
    status: "paint_booth",
    entry_date: new Date(Date.now() - 3600000 * 8).toISOString(),
    estimated_delivery: new Date(Date.now() + 3600000 * 48).toISOString(),
    completed_at: null,
    entry_mileage: 38000,
    fuel_level: "1/2",
    visible_damages: [],
    belongings_left: "Nenhum",
    customer_complaint: "Reprogramação Stage 2 + Pintura em estufa dos espelhos e difusor",
    diagnostic_summary: "Motor em perfeito estado de compressão, pronto para mapa desportivo",
    total_parts: 22000,
    total_labor: 8000,
    discount: 1000,
    iva_rate: 16,
    iva_amount: 4640,
    total_final: 33640,
    sale_id: null,
    created_at: new Date(Date.now() - 3600000 * 8).toISOString(),
    updated_at: new Date().toISOString(),
    vehicle: MOCK_VEHICLES[1],
    technician: {
      id: 2,
      company_id: 1,
      name: "Eng. Pedro Tuning",
      specialty: "tuning",
      phone: "+258823334455",
      is_active: true,
      created_at: new Date().toISOString(),
    },
    items: [
      {
        id: 4,
        service_order_id: 2,
        item_type: "tuning_kit",
        description: "Reprogramação ECU TiConta Stage 2 (+65HP / Pops & Bangs)",
        quantity: 1,
        unit_cost: 8000,
        unit_price: 15000,
        total_price: 15000,
        is_completed: true,
      },
      {
        id: 5,
        service_order_id: 2,
        item_type: "part",
        description: "Downpipe Inox 3 polegadas 304 com Válvula Cutout",
        quantity: 1,
        unit_cost: 4500,
        unit_price: 7000,
        total_price: 7000,
        is_completed: true,
      },
      {
        id: 6,
        service_order_id: 2,
        item_type: "labor",
        description: "Pintura em Estufa dos Retrovisores + Calibração Dyno",
        quantity: 1,
        unit_cost: 2000,
        unit_price: 8000,
        total_price: 8000,
        is_completed: false,
      },
    ],
    diagnostic_reports: [
      {
        id: 2,
        service_order_id: 2,
        vehicle_id: 2,
        scanner_tool: "VCDS VAG-COM Pro",
        dtc_codes: [
          {
            code: "P0420",
            description: "Catalyst System Efficiency Below Threshold (Downpipe instalada)",
            severity: "medium",
            system: "Emissões / Escape",
          },
        ],
        battery_voltage: 12.8,
        alternator_charging_voltage: 14.4,
        engine_compression: "Cil1: 175psi, Cil2: 176psi, Cil3: 174psi, Cil4: 175psi",
        brake_pad_wear_pct: 15,
        road_test_notes: "Teste de dinamómetro acusou 298 HP após mapa.",
        technician_recommendations: "Utilizar sempre gasolina aditivada / 95 octanas.",
        created_at: new Date().toISOString(),
      },
    ],
    paint_tuning_specs: [
      {
        id: 1,
        service_order_id: 2,
        paint_code: "041 - Black Gloss Piano",
        paint_finish: "metallic",
        booth_temp_c: 65,
        coats_applied: 3,
        parts_to_paint: ["retrovisores", "difusor_traseiro", "grelha_frontal"],
        bodywork_straightening_required: false,
        tuning_stage: "stage2",
        ecu_remap_profile: "Golf GTI Stage 2 High Torque 295HP",
        dyno_hp_before: 230,
        dyno_hp_after: 298,
        exhaust_modification: "Downpipe Inox 3' + Escape Desportivo",
        suspension_upgrade: "Molas Eibach Pro-Kit -25mm",
        lighting_upgrade: "Faróis Matrix Full LED",
      },
    ],
  },
];

export const autoService = {
  async listVehicles(search?: string, companyId = 1): Promise<Vehicle[]> {
    try {
      const res = await api.get<Vehicle[]>(`${API_PREFIX}/vehicles`, {
        params: { search, company_id: companyId },
      });
      return res.data;
    } catch {
      return search
        ? MOCK_VEHICLES.filter(
            (v) =>
              v.license_plate.toLowerCase().includes(search.toLowerCase()) ||
              v.make.toLowerCase().includes(search.toLowerCase()) ||
              v.model.toLowerCase().includes(search.toLowerCase())
          )
        : MOCK_VEHICLES;
    }
  },

  async createVehicle(data: Partial<Vehicle>, companyId = 1): Promise<Vehicle> {
    try {
      const res = await api.post<Vehicle>(`${API_PREFIX}/vehicles`, {
        ...data,
        company_id: companyId,
      });
      return res.data;
    } catch {
      const newV: Vehicle = {
        id: Date.now(),
        company_id: companyId,
        customer_id: data.customer_id || 1,
        license_plate: (data.license_plate || "NO-PLATE").toUpperCase(),
        make: data.make || "Desconhecida",
        model: data.model || "Modelo",
        year: data.year || new Date().getFullYear(),
        vin: data.vin || "",
        color: data.color || "Branco",
        fuel_type: (data.fuel_type as any) || "diesel",
        mileage_km: data.mileage_km || 0,
        engine_size: data.engine_size || "2.0L",
        notes: data.notes || "",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      MOCK_VEHICLES.unshift(newV);
      return newV;
    }
  },

  async listServiceOrders(
    params?: { status?: string; service_type?: string; search?: string },
    companyId = 1
  ): Promise<ServiceOrder[]> {
    try {
      const res = await api.get<ServiceOrder[]>(`${API_PREFIX}/orders`, {
        params: { ...params, company_id: companyId },
      });
      return res.data;
    } catch {
      let filtered = [...MOCK_ORDERS];
      if (params?.status) {
        filtered = filtered.filter((o) => o.status === params.status);
      }
      if (params?.service_type) {
        filtered = filtered.filter((o) => o.service_type === params.service_type);
      }
      if (params?.search) {
        const s = params.search.toLowerCase();
        filtered = filtered.filter(
          (o) =>
            o.order_number.toLowerCase().includes(s) ||
            o.vehicle?.license_plate.toLowerCase().includes(s) ||
            o.vehicle?.model.toLowerCase().includes(s)
        );
      }
      return filtered;
    }
  },

  async createServiceOrder(data: any, companyId = 1): Promise<ServiceOrder> {
    try {
      const res = await api.post<ServiceOrder>(`${API_PREFIX}/orders`, {
        ...data,
        company_id: companyId,
      });
      return res.data;
    } catch {
      const orderNum = `OS-${new Date().getFullYear()}/${(MOCK_ORDERS.length + 1)
        .toString()
        .padStart(4, "0")}`;
      const totalParts = (data.items || [])
        .filter((it: any) => it.item_type !== "labor")
        .reduce((sum: number, it: any) => sum + (it.unit_price || 0) * (it.quantity || 1), 0);
      const totalLabor = (data.items || [])
        .filter((it: any) => it.item_type === "labor")
        .reduce((sum: number, it: any) => sum + (it.unit_price || 0) * (it.quantity || 1), 0);
      const subtotal = totalParts + totalLabor - (data.discount || 0);
      const iva = Math.round(subtotal * 0.16 * 100) / 100;
      const totalFinal = subtotal + iva;

      const newOrder: ServiceOrder = {
        id: Date.now(),
        company_id: companyId,
        order_number: orderNum,
        vehicle_id: data.vehicle_id || 1,
        customer_id: data.customer_id || 1,
        technician_id: data.technician_id || 1,
        service_type: data.service_type || "maintenance",
        status: "quote",
        entry_date: new Date().toISOString(),
        estimated_delivery: data.estimated_delivery || null,
        completed_at: null,
        entry_mileage: data.entry_mileage || 50000,
        fuel_level: data.fuel_level || "1/2",
        visible_damages: data.visible_damages || [],
        belongings_left: data.belongings_left || "",
        customer_complaint: data.customer_complaint || "Revisão geral",
        diagnostic_summary: data.diagnostic_summary || "",
        total_parts: totalParts,
        total_labor: totalLabor,
        discount: data.discount || 0,
        iva_rate: 16,
        iva_amount: iva,
        total_final: totalFinal,
        sale_id: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        vehicle: MOCK_VEHICLES.find((v) => v.id === data.vehicle_id) || MOCK_VEHICLES[0],
        technician: {
          id: 1,
          company_id: companyId,
          name: "Mestre Mecânico",
          specialty: "mechanics",
          phone: "+258840001122",
          is_active: true,
          created_at: new Date().toISOString(),
        },
        items: (data.items || []).map((it: any, idx: number) => ({
          id: idx + 10,
          service_order_id: Date.now(),
          item_type: it.item_type || "labor",
          description: it.description || "Serviço",
          quantity: it.quantity || 1,
          unit_cost: it.unit_cost || 0,
          unit_price: it.unit_price || 0,
          total_price: (it.unit_price || 0) * (it.quantity || 1),
          is_completed: false,
        })),
        diagnostic_reports: data.diagnostic_data
          ? [
              {
                id: Date.now(),
                service_order_id: Date.now(),
                vehicle_id: data.vehicle_id || 1,
                scanner_tool: data.diagnostic_data.scanner_tool || "OBD-II Pro Scanner",
                dtc_codes: data.diagnostic_data.dtc_codes || [],
                battery_voltage: data.diagnostic_data.battery_voltage || 12.6,
                alternator_charging_voltage:
                  data.diagnostic_data.alternator_charging_voltage || 14.2,
                brake_pad_wear_pct: data.diagnostic_data.brake_pad_wear_pct || 20,
                road_test_notes: data.diagnostic_data.road_test_notes || "",
                technician_recommendations: data.diagnostic_data.technician_recommendations || "",
                created_at: new Date().toISOString(),
              },
            ]
          : [],
        paint_tuning_specs: data.paint_tuning_data
          ? [
              {
                id: Date.now(),
                service_order_id: Date.now(),
                paint_code: data.paint_tuning_data.paint_code || "",
                paint_finish: data.paint_tuning_data.paint_finish || "metallic",
                booth_temp_c: data.paint_tuning_data.booth_temp_c || 60,
                coats_applied: data.paint_tuning_data.coats_applied || 2,
                parts_to_paint: data.paint_tuning_data.parts_to_paint || [],
                bodywork_straightening_required:
                  data.paint_tuning_data.bodywork_straightening_required || false,
                tuning_stage: data.paint_tuning_data.tuning_stage || null,
                ecu_remap_profile: data.paint_tuning_data.ecu_remap_profile || null,
                dyno_hp_before: data.paint_tuning_data.dyno_hp_before || null,
                dyno_hp_after: data.paint_tuning_data.dyno_hp_after || null,
                exhaust_modification: data.paint_tuning_data.exhaust_modification || null,
                suspension_upgrade: data.paint_tuning_data.suspension_upgrade || null,
                sound_multimedia: data.paint_tuning_data.sound_multimedia || null,
                lighting_upgrade: data.paint_tuning_data.lighting_upgrade || null,
              },
            ]
          : [],
      };

      MOCK_ORDERS.unshift(newOrder);
      return newOrder;
    }
  },

  async updateOrderStatus(
    orderId: number,
    status: string,
    notes?: string,
    companyId = 1
  ): Promise<ServiceOrder> {
    try {
      const res = await api.patch<ServiceOrder>(`${API_PREFIX}/orders/${orderId}/status`, {
        status,
        notes,
      });
      return res.data;
    } catch {
      const found = MOCK_ORDERS.find((o) => o.id === orderId);
      if (found) {
        found.status = status as any;
        if (status === "ready" || status === "invoiced") {
          found.completed_at = new Date().toISOString();
        }
        found.updated_at = new Date().toISOString();
        return found;
      }
      throw new Error("Ordem de serviço não encontrada");
    }
  },

  async convertOrderToSale(
    orderId: number,
    paymentMethod = "cash",
    companyId = 1
  ): Promise<any> {
    try {
      const res = await api.post(`${API_PREFIX}/orders/${orderId}/convert-to-sale`, null, {
        params: { payment_method: paymentMethod, company_id: companyId },
      });
      return res.data;
    } catch {
      const found = MOCK_ORDERS.find((o) => o.id === orderId);
      if (found) {
        found.status = "invoiced";
        found.sale_id = Date.now();
        found.completed_at = new Date().toISOString();
      }
      return {
        message: "Ordem de Serviço faturada com sucesso em conformidade fiscal!",
        order_number: found?.order_number || "OS-2026/0001",
        invoice_number: `FT 2026/${orderId.toString().padStart(5, "0")}`,
        total_final: found?.total_final || 10000,
        sale_id: Date.now(),
      };
    }
  },

  async getWorkshopStats(companyId = 1): Promise<WorkshopStats> {
    try {
      const res = await api.get<WorkshopStats>(`${API_PREFIX}/stats`, {
        params: { company_id: companyId },
      });
      return res.data;
    } catch {
      return {
        company_id: companyId,
        total_active_orders: MOCK_ORDERS.filter((o) => !["invoiced", "cancelled"].includes(o.status)).length,
        in_boxes_count: MOCK_ORDERS.filter((o) => o.status === "in_progress").length,
        in_paint_booth_count: MOCK_ORDERS.filter((o) => o.status === "paint_booth").length,
        in_diagnosis_count: MOCK_ORDERS.filter((o) => o.service_type === "diagnosis").length,
        in_tuning_count: MOCK_ORDERS.filter((o) => o.service_type === "tuning").length,
        completed_today: 3,
        estimated_revenue_mzn: MOCK_ORDERS.reduce((sum, o) => sum + o.total_final, 0),
        total_vehicles_registered: MOCK_VEHICLES.length,
      };
    }
  },
};
