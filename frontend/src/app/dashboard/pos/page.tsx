'use client';

import React, { useState } from 'react';
import { 
  Search, 
  Trash2, 
  Plus, 
  Minus, 
  CreditCard, 
  Smartphone, 
  Banknote, 
  ArrowRight, 
  CheckCircle, 
  FileText, 
  User, 
  Phone, 
  Hash,
  AlertCircle
} from 'lucide-react';
import { usePosStore, Product } from '@/store/posStore';
import { useAuthStore } from '@/store/authStore';
import { formatMZN, calculateIVA16 } from '@/lib/currency';
import { isValidNUIT, formatNUIT } from '@/lib/fiscalMoz';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { DigitalReceiptModal } from '@/components/digital-receipt/DigitalReceiptModal';

export default function PosPage() {
  const { company } = useAuthStore();
  const {
    products,
    cart,
    selectedCategory,
    searchQuery,
    activeClientName,
    activeClientPhone,
    activeClientNUIT,
    paymentMethod,
    paymentReference,
    amountTendered,
    lastIssuedDoc,
    isCheckoutModalOpen,
    isReceiptModalOpen,
    addToCart,
    removeFromCart,
    updateQty,
    clearCart,
    setCategory,
    setSearchQuery,
    setClientDetails,
    setPaymentMethod,
    setPaymentReference,
    setAmountTendered,
    openCheckoutModal,
    closeCheckoutModal,
    closeReceiptModal,
    completeSale,
  } = usePosStore();

  const [nuitError, setNuitError] = useState('');

  const categories = ['Todos', 'Bar/Bebidas', 'Mercearia', 'Ferragens', 'Oficina', 'Restaurante'];

  const filteredProducts = products.filter((p) => {
    const matchesCat = selectedCategory === 'Todos' || p.category === selectedCategory;
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.code.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const rawSubtotal = cart.reduce((acc, item) => acc + item.product.price * item.qty, 0);
  const { net, tax, total } = calculateIVA16(rawSubtotal, true);

  const handleKeypadPress = (val: string) => {
    if (val === 'C') {
      setAmountTendered(0);
      return;
    }
    const current = amountTendered ? amountTendered.toString() : '';
    const updated = Number(current + val);
    setAmountTendered(updated);
  };

  const handleFinishSale = () => {
    if (activeClientNUIT && activeClientNUIT !== '999999999' && !isValidNUIT(activeClientNUIT)) {
      setNuitError('O NUIT de Moçambique deve conter exatamente 9 dígitos.');
      return;
    }
    setNuitError('');
    completeSale(company);
  };

  return (
    <div className="h-full flex flex-col lg:flex-row gap-4">
      {/* Left Area: Products Grid & Search */}
      <div className="flex-1 flex flex-col space-y-3 min-w-0">
        {/* Search & Category Filter Bar */}
        <div className="panel-bevel p-3 rounded-lg flex flex-col sm:flex-row gap-3 items-center justify-between bg-white">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-2.5 text-slate-400" size={15} />
            <input
              type="text"
              placeholder="Pesquisar produto ou código..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-9 pl-9 pr-3 text-xs rounded-md border border-slate-300 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30 font-mono"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition ${
                  selectedCategory === cat
                    ? 'bg-slate-900 text-white font-semibold shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Products Grid */}
        <div className="flex-1 grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3 overflow-y-auto pr-1">
          {filteredProducts.map((p) => (
            <button
              key={p.id}
              onClick={() => addToCart(p)}
              className="panel-bevel p-3 rounded-lg text-left hover:border-emerald-500 hover:shadow-sm transition flex flex-col justify-between bg-white group active:scale-[0.98]"
            >
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                  <span>{p.code}</span>
                  <span className="text-emerald-700 font-semibold">{p.stock} un</span>
                </div>
                <h4 className="text-xs font-bold text-slate-900 group-hover:text-emerald-700 transition line-clamp-2">
                  {p.name}
                </h4>
              </div>

              <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-slate-900">
                  {formatMZN(p.price)}
                </span>
                <span className="w-6 h-6 rounded bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-xs group-hover:bg-emerald-600 group-hover:text-white transition">
                  +
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Right Area: Industrial Order Panel & Cart */}
      <div className="w-full lg:w-96 panel-bevel rounded-lg flex flex-col bg-white overflow-hidden shadow-xs">
        {/* Cart Header */}
        <div className="brushed-steel-header p-3 border-b border-slate-300 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-slate-900 uppercase">
              Carrinho ({cart.reduce((a, b) => a + b.qty, 0)})
            </span>
            <span className="text-[10px] font-mono px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded">
              IVA 16% INC.
            </span>
          </div>
          {cart.length > 0 && (
            <button
              onClick={clearCart}
              className="text-[11px] font-mono text-red-600 hover:text-red-800 flex items-center gap-1"
            >
              <Trash2 size={12} />
              <span>Limpar</span>
            </button>
          )}
        </div>

        {/* Cart Items List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2 max-h-[300px] lg:max-h-none">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 py-8 space-y-2 font-mono text-xs">
              <FileText size={28} className="text-slate-300" />
              <span>Nenhum item adicionado</span>
              <span className="text-[10px] text-slate-400">Clique nos produtos à esquerda</span>
            </div>
          ) : (
            cart.map((item) => (
              <div
                key={item.product.id}
                className="p-2.5 rounded border border-slate-200 bg-slate-50 flex items-center justify-between text-xs"
              >
                <div className="space-y-0.5 flex-1 min-w-0 pr-2">
                  <div className="font-semibold text-slate-800 truncate">{item.product.name}</div>
                  <div className="text-[10px] font-mono text-slate-500">
                    {formatMZN(item.product.price)} x {item.qty}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex items-center border border-slate-300 rounded bg-white font-mono">
                    <button
                      onClick={() => updateQty(item.product.id, item.qty - 1)}
                      className="px-2 py-0.5 text-slate-600 hover:bg-slate-100"
                    >
                      -
                    </button>
                    <span className="px-2 py-0.5 text-xs font-bold text-slate-800">
                      {item.qty}
                    </span>
                    <button
                      onClick={() => updateQty(item.product.id, item.qty + 1)}
                      className="px-2 py-0.5 text-slate-600 hover:bg-slate-100"
                    >
                      +
                    </button>
                  </div>

                  <span className="font-mono font-bold text-slate-900 text-xs w-16 text-right">
                    {formatMZN(item.product.price * item.qty)}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Calculation Summary Sheet */}
        <div className="p-3 bg-slate-100 border-t border-slate-300 space-y-1.5 font-mono text-xs">
          <div className="flex justify-between text-slate-600">
            <span>Base Tributável (Líquido):</span>
            <span>{formatMZN(net)}</span>
          </div>
          <div className="flex justify-between text-slate-600">
            <span>IVA (16% Moçambique):</span>
            <span className="text-emerald-700 font-semibold">{formatMZN(tax)}</span>
          </div>
          <div className="flex justify-between text-sm font-bold text-slate-900 pt-1.5 border-t border-slate-300">
            <span>TOTAL A PAGAR:</span>
            <span className="text-emerald-700 font-mono text-base">{formatMZN(total)}</span>
          </div>
        </div>

        {/* Action Button */}
        <div className="p-3 bg-white border-t border-slate-200">
          <Button
            variant="primary"
            disabled={cart.length === 0}
            onClick={openCheckoutModal}
            className="w-full py-3 text-sm flex items-center justify-center gap-2 shadow-md"
          >
            <span>Concluir Venda 100% Digital</span>
            <ArrowRight size={16} />
          </Button>
        </div>
      </div>

      {/* Modal de Checkout Digital */}
      <Modal
        isOpen={isCheckoutModalOpen}
        onClose={closeCheckoutModal}
        title="CHECKOUT & FATURAÇÃO DIGITAL"
        size="lg"
        footer={
          <div className="flex items-center justify-between w-full">
            <Button variant="outline" size="sm" onClick={closeCheckoutModal}>
              Cancelar
            </Button>
            <Button
              variant="primary"
              size="md"
              onClick={handleFinishSale}
              className="flex items-center gap-2"
            >
              <CheckCircle size={16} />
              <span>Emitir Factura Digital ({formatMZN(total)})</span>
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          {/* Payment Method Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase font-mono">
              Método de Pagamento
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {(['M-Pesa', 'e-Mola', 'POS/Cartão', 'Numerário'] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setPaymentMethod(m)}
                  className={`py-2 px-3 rounded-md border text-xs font-mono font-bold flex flex-col items-center gap-1 transition ${
                    paymentMethod === m
                      ? 'bg-emerald-600 text-white border-emerald-700 shadow-sm'
                      : 'bg-slate-50 border-slate-300 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {m === 'M-Pesa' && <Smartphone size={16} />}
                  {m === 'e-Mola' && <Smartphone size={16} />}
                  {m === 'POS/Cartão' && <CreditCard size={16} />}
                  {m === 'Numerário' && <Banknote size={16} />}
                  <span>{m}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Client Details (WhatsApp / SMS destination) */}
          <div className="panel-inset p-3 rounded-lg space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 font-mono flex items-center gap-1.5">
                <User size={14} className="text-emerald-700" />
                <span>Destinatário do Documento Fiscal (Zero Papel)</span>
              </span>
              <span className="text-[10px] font-mono text-slate-500">
                Disparo instantâneo por WhatsApp/SMS
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <Input
                label="Nome do Cliente"
                value={activeClientName}
                onChange={(e) => setClientDetails(e.target.value, activeClientPhone, activeClientNUIT)}
                placeholder="Ex: Armando Cossa"
                className="text-xs"
              />
              <Input
                label="Telemóvel (WhatsApp / SMS)"
                value={activeClientPhone}
                onChange={(e) => setClientDetails(activeClientName, e.target.value, activeClientNUIT)}
                placeholder="+258 84 000 0000"
                className="text-xs font-mono"
              />
              <div>
                <Input
                  label="NUIT (9 Dígitos AT)"
                  value={activeClientNUIT}
                  onChange={(e) => {
                    setClientDetails(activeClientName, activeClientPhone, e.target.value);
                    if (nuitError) setNuitError('');
                  }}
                  placeholder="100829143"
                  className="text-xs font-mono"
                />
                {nuitError && (
                  <p className="text-[10px] text-red-600 mt-1 flex items-center gap-1">
                    <AlertCircle size={10} />
                    <span>{nuitError}</span>
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Payment Details & Cash Calculator */}
          {paymentMethod === 'Numerário' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
              <div>
                <Input
                  label="Valor Entregue pelo Cliente (MT)"
                  type="number"
                  value={amountTendered || ''}
                  onChange={(e) => setAmountTendered(Number(e.target.value))}
                  placeholder="0.00"
                  className="text-sm font-mono font-bold"
                />
                <div className="text-[11px] font-mono text-slate-600 mt-1 flex justify-between">
                  <span>Troco a Devolver:</span>
                  <span className="font-bold text-emerald-700">
                    {formatMZN(Math.max(0, (amountTendered || 0) - total))}
                  </span>
                </div>
              </div>

              {/* Mini Industrial Keypad */}
              <div className="grid grid-cols-3 gap-1">
                {['100', '200', '500', '1000', '2000', 'C'].map((btn) => (
                  <button
                    key={btn}
                    type="button"
                    onClick={() => {
                      if (btn === 'C') setAmountTendered(0);
                      else setAmountTendered(Number(btn));
                    }}
                    className="tactile-keypad-btn py-1 text-xs font-mono font-bold text-slate-800 rounded"
                  >
                    {btn === 'C' ? 'Limpar' : `${btn} MT`}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <Input
              label={`Referência / Código da Transação (${paymentMethod})`}
              value={paymentReference}
              onChange={(e) => setPaymentReference(e.target.value)}
              placeholder="Ex: MP-843928190 ou TID-009182"
              className="text-xs font-mono"
            />
          )}
        </div>
      </Modal>

      {/* Modal de Conclusão e Envio Digital */}
      <DigitalReceiptModal
        isOpen={isReceiptModalOpen}
        onClose={closeReceiptModal}
        document={lastIssuedDoc}
      />
    </div>
  );
}
