"use client";

import React, { useState } from "react";
import {
  Car,
  Wrench,
  Plus,
  Trash2,
  AlertTriangle,
  X,
  Gauge,
  Flame,
  CheckCircle2,
  DollarSign,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AutoServiceType, Vehicle } from "@/types/auto_services";

interface ServiceOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  vehicles: Vehicle[];
  onSubmit: (orderData: any) => Promise<void>;
}

export const ServiceOrderModal: React.FC<ServiceOrderModalProps> = ({
  isOpen,
  onClose,
  vehicles,
  onSubmit,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedVehicleId, setSelectedVehicleId] = useState<number | "new">(vehicles[0]?.id || "new");

  // New Vehicle Fields
  const [plate, setPlate] = useState("");
  const [make, setMake] = useState("Toyota");
  const [model, setModel] = useState("Hilux GD-6");
  const [year, setYear] = useState(2023);
  const [fuelType, setFuelType] = useState("diesel");
  const [mileage, setMileage] = useState(50000);

  // OS Details
  const [serviceType, setServiceType] = useState<AutoServiceType>("maintenance");
  const [customerComplaint, setCustomerComplaint] = useState("");
  const [diagnosticSummary, setDiagnosticSummary] = useState("");
  const [fuelLevel, setFuelLevel] = useState("1/2");
  const [damages, setDamages] = useState<string[]>([]);
  const [newDamageArea, setNewDamageArea] = useState("");

  // Items
  const [items, setItems] = useState<
    { item_type: string; description: string; quantity: number; unit_price: number }[]
  >([
    { item_type: "part", description: "Óleo 5W30 Sintético (8L)", quantity: 1, unit_price: 4500 },
    { item_type: "part", description: "Filtros de Óleo & Combustível", quantity: 1, unit_price: 1800 },
    { item_type: "labor", description: "Mão-de-Obra Revisão & Travões", quantity: 1, unit_price: 2500 },
  ]);

  if (!isOpen) return null;

  const handleAddItem = () => {
    setItems([...items, { item_type: "part", description: "", quantity: 1, unit_price: 0 }]);
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleItemChange = (index: number, field: string, val: any) => {
    const updated = [...items];
    (updated[index] as any)[field] = val;
    setItems(updated);
  };

  const handleAddDamage = () => {
    if (newDamageArea.trim()) {
      setDamages([...damages, newDamageArea.trim()]);
      setNewDamageArea("");
    }
  };

  const totalParts = items
    .filter((it) => it.item_type !== "labor")
    .reduce((sum, it) => sum + it.quantity * it.unit_price, 0);

  const totalLabor = items
    .filter((it) => it.item_type === "labor")
    .reduce((sum, it) => sum + it.quantity * it.unit_price, 0);

  const subtotal = totalParts + totalLabor;
  const iva = Math.round(subtotal * 0.16 * 100) / 100;
  const totalFinal = subtotal + iva;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload: any = {
        service_type: serviceType,
        entry_mileage: mileage,
        fuel_level: fuelLevel,
        customer_complaint: customerComplaint,
        diagnostic_summary: diagnosticSummary,
        visible_damages: damages.map((d) => ({ area: d, damage: "identificado_na_entrada" })),
        items,
        discount: 0,
        iva_rate: 16,
      };

      if (selectedVehicleId === "new") {
        payload.vehicle_data = {
          license_plate: plate.toUpperCase(),
          make,
          model,
          year: Number(year),
          fuel_type: fuelType,
          mileage_km: Number(mileage),
        };
      } else {
        payload.vehicle_id = selectedVehicleId;
      }

      await onSubmit(payload);
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/40 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-3xl rounded-2xl border border-emerald-900/10 bg-white p-6 text-zinc-900 shadow-2xl space-y-6 max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-200 pb-4">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-emerald-50 p-2.5 text-emerald-700 border border-emerald-200">
              <Wrench className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-zinc-900">Nova Ordem de Serviço (OS)</h2>
              <p className="text-xs text-zinc-500">Recepção, Checklist 360º e Orçamentação da Viatura</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-700 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Seleção do Veículo */}
          <div className="rounded-xl border border-zinc-200 bg-zinc-50/70 p-4 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-800 flex items-center gap-1.5">
              <Car className="h-4 w-4" />
              1. Identificação do Veículo
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-zinc-600 font-medium block mb-1">Selecionar Viatura</label>
                <select
                  value={selectedVehicleId}
                  onChange={(e) =>
                    setSelectedVehicleId(e.target.value === "new" ? "new" : Number(e.target.value))
                  }
                  className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs text-zinc-900 shadow-xs focus:ring-1 focus:ring-emerald-600 focus:outline-none"
                >
                  <option value="new">+ Registar Nova Viatura</option>
                  {vehicles.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.license_plate} — {v.make} {v.model}
                    </option>
                  ))}
                </select>
              </div>

              {selectedVehicleId === "new" && (
                <div>
                  <label className="text-xs text-zinc-600 font-medium block mb-1">Matrícula (ex: ABC-123-MC)</label>
                  <Input
                    required
                    value={plate}
                    onChange={(e) => setPlate(e.target.value)}
                    placeholder="MM-00-00 ou ABC-123-MC"
                    className="bg-white border-zinc-200 text-xs text-zinc-900"
                  />
                </div>
              )}
            </div>

            {selectedVehicleId === "new" && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                <div>
                  <label className="text-[11px] text-zinc-600 font-medium block mb-1">Marca</label>
                  <Input
                    value={make}
                    onChange={(e) => setMake(e.target.value)}
                    className="bg-white border-zinc-200 text-xs text-zinc-900"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-zinc-600 font-medium block mb-1">Modelo</label>
                  <Input
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    className="bg-white border-zinc-200 text-xs text-zinc-900"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-zinc-600 font-medium block mb-1">Ano</label>
                  <Input
                    type="number"
                    value={year}
                    onChange={(e) => setYear(Number(e.target.value))}
                    className="bg-white border-zinc-200 text-xs text-zinc-900"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-zinc-600 font-medium block mb-1">Combustível</label>
                  <select
                    value={fuelType}
                    onChange={(e) => setFuelType(e.target.value)}
                    className="w-full rounded-lg border border-zinc-200 bg-white px-2 py-1.5 text-xs text-zinc-900 shadow-xs focus:ring-1 focus:ring-emerald-600"
                  >
                    <option value="gasolina">Gasolina</option>
                    <option value="diesel">Diesel</option>
                    <option value="hybrid">Híbrido</option>
                    <option value="electric">Elétrico</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* Dados do Serviço & Diagnóstico Inicial */}
          <div className="rounded-xl border border-zinc-200 bg-zinc-50/70 p-4 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-800 flex items-center gap-1.5">
              <Wrench className="h-4 w-4" />
              2. Detalhes do Serviço & Checklist
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-xs text-zinc-600 font-medium block mb-1">Tipo de Serviço</label>
                <select
                  value={serviceType}
                  onChange={(e) => setServiceType(e.target.value as AutoServiceType)}
                  className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs text-zinc-900 shadow-xs focus:ring-1 focus:ring-emerald-600"
                >
                  <option value="maintenance">Mecânica Geral / Revisão</option>
                  <option value="bodywork_chapa">Bate-Chapa & Alinhamento</option>
                  <option value="diagnosis">Diagnóstico OBD-II / Elétrico</option>
                  <option value="painting">Pintura em Estufa</option>
                  <option value="tuning">Tuning / Modificação / ECU</option>
                  <option value="full_service">Serviço Completo 360º</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-zinc-600 font-medium block mb-1">Quilometragem de Entrada (KM)</label>
                <Input
                  type="number"
                  value={mileage}
                  onChange={(e) => setMileage(Number(e.target.value))}
                  className="bg-white border-zinc-200 text-xs text-zinc-900"
                />
              </div>

              <div>
                <label className="text-xs text-zinc-600 font-medium block mb-1">Nível de Combustível</label>
                <select
                  value={fuelLevel}
                  onChange={(e) => setFuelLevel(e.target.value)}
                  className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs text-zinc-900 shadow-xs"
                >
                  <option value="Reserva">Reserva (Quase vazio)</option>
                  <option value="1/4">1/4 de Depósito</option>
                  <option value="1/2">1/2 de Depósito</option>
                  <option value="3/4">3/4 de Depósito</option>
                  <option value="Cheio">Depósito Cheio</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs text-zinc-600 font-medium block mb-1">Sintomas / Queixa do Cliente</label>
              <textarea
                rows={2}
                value={customerComplaint}
                onChange={(e) => setCustomerComplaint(e.target.value)}
                placeholder="Ex: Barulho na suspensão ao passar em lombas; Troca de óleo 45.000 km..."
                className="w-full rounded-lg border border-zinc-200 bg-white p-2.5 text-xs text-zinc-900 placeholder:text-zinc-500 focus:ring-1 focus:ring-emerald-600 focus:outline-none"
              />
            </div>

            {/* Checklist Danos 360º */}
            <div>
              <label className="text-xs text-zinc-600 font-medium block mb-1">Inspeção Visual (Danos Anteriores)</label>
              <div className="flex gap-2 mb-2">
                <Input
                  value={newDamageArea}
                  onChange={(e) => setNewDamageArea(e.target.value)}
                  placeholder="Ex: Risco no parachoques traseiro esquerdo"
                  className="bg-white border-zinc-200 text-xs flex-1 text-zinc-900"
                />
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={handleAddDamage}
                  className="border-zinc-200 text-zinc-700 bg-white hover:bg-zinc-50 text-xs"
                >
                  + Adicionar Dano
                </Button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {damages.map((d, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1 rounded bg-amber-50 border border-amber-200 px-2 py-0.5 text-[11px] text-amber-900 font-medium"
                  >
                    ⚠️ {d}
                    <button
                      type="button"
                      onClick={() => setDamages(damages.filter((_, idx) => idx !== i))}
                      className="text-amber-700 hover:text-red-600 ml-1"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Peças & Mão-de-Obra */}
          <div className="rounded-xl border border-zinc-200 bg-zinc-50/70 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-800 flex items-center gap-1.5">
                <DollarSign className="h-4 w-4" />
                3. Orçamento de Peças & Mão-de-Obra
              </h3>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={handleAddItem}
                className="border-emerald-200 bg-emerald-50 text-emerald-800 text-xs h-7 hover:bg-emerald-100"
              >
                + Adicionar Item
              </Button>
            </div>

            <div className="space-y-2">
              {items.map((it, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <select
                    value={it.item_type}
                    onChange={(e) => handleItemChange(idx, "item_type", e.target.value)}
                    className="w-32 rounded-lg border border-zinc-200 bg-white px-2 py-1.5 text-xs text-zinc-900 shadow-xs"
                  >
                    <option value="part">Peça</option>
                    <option value="labor">Mão-de-Obra</option>
                    <option value="consumable">Consumível</option>
                    <option value="paint_material">Tinta/Material</option>
                    <option value="tuning_kit">Kit Tuning</option>
                  </select>

                  <Input
                    placeholder="Descrição do serviço ou peça..."
                    value={it.description}
                    onChange={(e) => handleItemChange(idx, "description", e.target.value)}
                    className="bg-white border-zinc-200 text-xs flex-1 text-zinc-900"
                  />

                  <Input
                    type="number"
                    placeholder="Qtd"
                    value={it.quantity}
                    onChange={(e) => handleItemChange(idx, "quantity", Number(e.target.value))}
                    className="bg-white border-zinc-200 text-xs w-16 text-center text-zinc-900"
                  />

                  <Input
                    type="number"
                    placeholder="Preço MT"
                    value={it.unit_price}
                    onChange={(e) => handleItemChange(idx, "unit_price", Number(e.target.value))}
                    className="bg-white border-zinc-200 text-xs w-28 text-right font-mono text-zinc-900"
                  />

                  <button
                    type="button"
                    onClick={() => handleRemoveItem(idx)}
                    className="p-1 text-zinc-500 hover:text-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>

            {/* Totais com IVA */}
            <div className="pt-3 border-t border-zinc-200 flex justify-end">
              <div className="w-64 space-y-1 text-xs">
                <div className="flex justify-between text-zinc-600">
                  <span>Total Peças/Materiais:</span>
                  <span className="font-mono text-zinc-900 font-semibold">{totalParts.toLocaleString("pt-MZ")} MT</span>
                </div>
                <div className="flex justify-between text-zinc-600">
                  <span>Total Mão-de-Obra:</span>
                  <span className="font-mono text-zinc-900 font-semibold">{totalLabor.toLocaleString("pt-MZ")} MT</span>
                </div>
                <div className="flex justify-between text-zinc-600">
                  <span>IVA (16% MZ):</span>
                  <span className="font-mono text-zinc-900 font-semibold">{iva.toLocaleString("pt-MZ")} MT</span>
                </div>
                <div className="flex justify-between font-bold text-emerald-800 pt-1 border-t border-zinc-200 text-sm">
                  <span>Total Final:</span>
                  <span className="font-mono">{totalFinal.toLocaleString("pt-MZ")} MT</span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="border-zinc-200 text-zinc-700 bg-white hover:bg-zinc-50 text-xs shadow-xs"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs px-6 shadow-sm"
            >
              {isSubmitting ? "A registar..." : "Abrir Ordem de Serviço"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
