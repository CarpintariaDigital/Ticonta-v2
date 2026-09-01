"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  UtensilsCrossed,
  ChefHat,
  BarChart3,
  Settings,
  Wifi,
  WifiOff,
  ArrowLeft,
  RefreshCw,
  PlusCircle,
  Sparkles,
  Split,
  CalendarCheck,
  Receipt,
  Layers,
} from "lucide-react";
import ProtectedRoute from "@/components/ProtectedRoute";
import TableMap from "@/components/restaurant/TableMap";
import OrderPanel from "@/components/restaurant/OrderPanel";
import MenuSelector from "@/components/restaurant/MenuSelector";
import KitchenDisplaySystem from "@/components/restaurant/KitchenDisplaySystem";
import BillSplitter from "@/components/restaurant/BillSplitter";
import TableBill from "@/components/restaurant/TableBill";
import ReservationForm from "@/components/restaurant/ReservationForm";
import RestaurantReports from "@/components/restaurant/RestaurantReports";
import RestaurantSettingsModal from "@/components/restaurant/RestaurantSettingsModal";
import { useRestaurant } from "@/hooks/useRestaurant";
import { Button } from "@/components/ui/button";
import { Table, MenuItem } from "@/types/restaurant";

export default function RestaurantPage() {
  const {
    tables,
    selectedTable,
    menuItems,
    activeCategory,
    currentOrder,
    orders,
    kdsItems,
    kdsStats,
    billData,
    splitData,
    reports,
    settings,
    activeView,
    filterLocation,
    isLoading,
    isOnline,
    wsConnected,
    isAddOrderModalOpen,
    isBillModalOpen,
    isSplitModalOpen,
    isReservationModalOpen,
    isSettingsModalOpen,
    setActiveView,
    setFilterLocation,
    setActiveCategory,
    setIsAddOrderModalOpen,
    setIsBillModalOpen,
    setIsSplitModalOpen,
    setIsReservationModalOpen,
    setIsSettingsModalOpen,
    selectTable,
    createOrder,
    addItemToOrder,
    updateItemStatus,
    closeTable,
    splitBill,
    reserveTable,
    updateTableStatus,
    fetchBill,
    fetchReports,
    fetchTables,
    fetchKDS,
    fetchSettings,
    updateSettings,
  } = useRestaurant();

  const [tableForReservation, setTableForReservation] = useState<Table | null>(null);

  const handleOpenReservation = (table: Table) => {
    setTableForReservation(table);
    setIsReservationModalOpen(true);
  };

  const handleOpenBill = async () => {
    if (!currentOrder) return;
    await fetchBill(currentOrder.id);
    setIsBillModalOpen(true);
  };

  const handleOpenSplit = () => {
    if (!currentOrder) return;
    setIsSplitModalOpen(true);
  };

  return (
    <ProtectedRoute>
      <div className="flex flex-col h-screen bg-[#FAF8F5] text-zinc-900 overflow-hidden font-sans select-none">
        {/* Top Navigation Bar */}
        <header className="flex h-14 shrink-0 items-center justify-between border-b border-emerald-900/10 bg-white/85 px-4 backdrop-blur z-20 shadow-xs">
          {/* Left: Brand & Back to Dashboard */}
          <div className="flex items-center gap-3">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm" className="h-8 text-zinc-600 hover:text-zinc-900 px-2">
                <ArrowLeft className="w-4 h-4 mr-1" />
                Painel
              </Button>
            </Link>
            <div className="h-4 w-px bg-zinc-200" />
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-amber-50 border border-amber-300 flex items-center justify-center text-amber-700">
                <UtensilsCrossed className="w-4 h-4" />
              </div>
              <span className="font-black text-sm tracking-tight text-emerald-950 font-mono">
                TiConta • Restaurante & Bar
              </span>
            </div>
          </div>

          {/* Center: Module View Switcher */}
          <nav className="flex items-center gap-1 bg-zinc-100 p-1 rounded-xl border border-zinc-200">
            <button
              onClick={() => setActiveView("map")}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                activeView === "map"
                  ? "bg-white text-emerald-950 shadow-xs border border-zinc-200 font-bold"
                  : "text-zinc-600 hover:text-zinc-900"
              }`}
            >
              <UtensilsCrossed className="w-3.5 h-3.5 text-amber-600" />
              <span>Salão & Mesas</span>
            </button>

            <button
              onClick={() => setActiveView("kds")}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all relative ${
                activeView === "kds"
                  ? "bg-white text-emerald-950 shadow-xs border border-zinc-200 font-bold"
                  : "text-zinc-600 hover:text-zinc-900"
              }`}
            >
              <ChefHat className="w-3.5 h-3.5 text-amber-600" />
              <span>Cozinha (KDS)</span>
              {kdsStats.totalPending > 0 && (
                <span className="w-4 h-4 rounded-full bg-rose-600 text-white text-[10px] flex items-center justify-center font-mono font-bold">
                  {kdsStats.totalPending}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveView("reports")}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                activeView === "reports"
                  ? "bg-white text-emerald-950 shadow-xs border border-zinc-200 font-bold"
                  : "text-zinc-600 hover:text-zinc-900"
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5 text-blue-600" />
              <span>Relatórios & Pico</span>
            </button>
          </nav>

          {/* Right: Connection badges & Settings */}
          <div className="flex items-center gap-2.5">
            {/* Real-time WebSocket Status */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white border border-zinc-200 text-xs shadow-xs">
              <span
                className={`w-2 h-2 rounded-full ${
                  wsConnected ? "bg-emerald-600 shadow-[0_0_8px_#10b981]" : "bg-rose-500"
                }`}
              />
              <span className="text-[11px] font-mono text-zinc-600 hidden sm:inline">
                {wsConnected ? "KDS AO VIVO" : "OFFLINE"}
              </span>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsSettingsModalOpen(true)}
              className="h-8 w-8 p-0 text-zinc-500 hover:text-zinc-900"
            >
              <Settings className="w-4 h-4" />
            </Button>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-hidden p-3 sm:p-4">
          {/* VIEW 1: SALÃO & MESAS (2 Columns Layout) */}
          {activeView === "map" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 h-full overflow-hidden">
              {/* Left Column: Visual Table Map (7 cols) */}
              <div className="lg:col-span-7 xl:col-span-8 h-full overflow-hidden">
                <TableMap
                  tables={tables}
                  selectedTable={selectedTable}
                  filterLocation={filterLocation}
                  onSelectTable={selectTable}
                  onOpenReservationModal={handleOpenReservation}
                  onCleanTable={(tableId) => updateTableStatus(tableId, "available")}
                  onFilterLocationChange={setFilterLocation}
                />
              </div>

              {/* Right Column: Order Panel / Menu Drawer (5 cols) */}
              <div className="lg:col-span-5 xl:col-span-4 h-full overflow-hidden relative">
                {isAddOrderModalOpen ? (
                  <MenuSelector
                    menuItems={menuItems}
                    activeCategory={activeCategory}
                    onSelectCategory={setActiveCategory}
                    onAddItem={(menuItemId, quantity, special) => {
                      if (currentOrder) {
                        addItemToOrder(currentOrder.id, menuItemId, quantity, special);
                      }
                      setIsAddOrderModalOpen(false);
                    }}
                    onClose={() => setIsAddOrderModalOpen(false)}
                  />
                ) : (
                  <OrderPanel
                    selectedTable={selectedTable}
                    currentOrder={currentOrder}
                    onOpenMenu={() => setIsAddOrderModalOpen(true)}
                    onOpenBillModal={handleOpenBill}
                    onOpenSplitModal={handleOpenSplit}
                    onCreateOrderForTable={(tableId) => createOrder(tableId, 2)}
                    onUpdateItemStatus={updateItemStatus}
                  />
                )}
              </div>
            </div>
          )}

          {/* VIEW 2: KITCHEN DISPLAY SYSTEM (KDS) */}
          {activeView === "kds" && (
            <div className="h-full">
              <KitchenDisplaySystem
                items={kdsItems}
                stats={kdsStats}
                wsConnected={wsConnected}
                onUpdateStatus={(itemId, status) => updateItemStatus(itemId, status)}
                onRefresh={fetchKDS}
              />
            </div>
          )}

          {/* VIEW 3: REPORTS & ANALYTICS */}
          {activeView === "reports" && (
            <div className="h-full">
              <RestaurantReports
                reports={reports}
                onFetchReports={(start, end) => fetchReports(1, start, end)}
              />
            </div>
          )}
        </main>

        {/* MODAL 1: Table Bill & Payment */}
        {isBillModalOpen && billData && (
          <TableBill
            bill={billData}
            onCloseTable={(method, amt, notes, clean) =>
              currentOrder
                ? closeTable(currentOrder.id, method, amt, notes, clean)
                : Promise.resolve()
            }
            onClose={() => setIsBillModalOpen(false)}
          />
        )}

        {/* MODAL 2: Split Bill */}
        {isSplitModalOpen && currentOrder && (
          <BillSplitter
            order={currentOrder}
            onSplitBill={(num, custom) => splitBill(currentOrder.id, num, custom)}
            onClose={() => setIsSplitModalOpen(false)}
          />
        )}

        {/* MODAL 3: Table Reservation */}
        {isReservationModalOpen && tableForReservation && (
          <ReservationForm
            table={tableForReservation}
            onReserve={(tableId, customerName, phone, time, guests) => reserveTable(tableId, { customer_name: customerName, customer_phone: phone, reservation_time: time, guest_count: guests })}
            onClose={() => {
              setIsReservationModalOpen(false);
              setTableForReservation(null);
            }}
          />
        )}

        {/* MODAL 4: Settings */}
        {isSettingsModalOpen && (
          <RestaurantSettingsModal
            settings={settings}
            onUpdateSettings={updateSettings}
            onClose={() => setIsSettingsModalOpen(false)}
          />
        )}
      </div>
    </ProtectedRoute>
  );
}
