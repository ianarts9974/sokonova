'use client';

import React, { useState } from 'react';
import {
  Building2,
  Package,
  FileText,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Truck,
  Printer,
  ArrowRight,
  PlusCircle,
} from 'lucide-react';
import { useSokoNova } from '@/context/SokoNovaContext';
import { Order, QuoteRequest } from '@/types';

interface AccountPortalProps {
  onSelectInvoiceOrder: (order: Order) => void;
  onSelectInvoiceQuote: (quote: QuoteRequest) => void;
}

export const AccountPortal: React.FC<AccountPortalProps> = ({
  onSelectInvoiceOrder,
  onSelectInvoiceQuote,
}) => {
  const {
    activeRetailer,
    updateRetailerProfile,
    orders,
    quotes,
    convertQuoteToOrder,
    warranties,
    submitWarrantyClaim,
    products,
    formatPrice,
  } = useSokoNova();

  const [activeTab, setActiveTab] = useState<
    'orders' | 'quotes' | 'warranty' | 'profile'
  >('orders');

  // Profile form state
  const [profileForm, setProfileForm] = useState(activeRetailer);
  const [profileSaved, setProfileSaved] = useState(false);

  // Warranty form state
  const [selectedOrderId, setSelectedOrderId] = useState(orders[0]?.id || 'ORD-8901');
  const [selectedSku, setSelectedSku] = useState(products[0]?.sku || 'GAME-CTRL-001');
  const [serialNumber, setSerialNumber] = useState('');
  const [issueText, setIssueText] = useState('');
  const [warrantySubmittedMsg, setWarrantySubmittedMsg] = useState('');

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateRetailerProfile(profileForm);
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 3000);
  };

  const handleWarrantySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!serialNumber.trim() || !issueText.trim()) return;
    const prod = products.find((p) => p.sku === selectedSku) || products[0];
    submitWarrantyClaim({
      orderId: selectedOrderId,
      productSku: prod.sku,
      productName: prod.name,
      businessName: activeRetailer.businessName,
      serialOrImei: serialNumber.trim(),
      issueDescription: issueText.trim(),
    });
    setSerialNumber('');
    setIssueText('');
    setWarrantySubmittedMsg('Warranty claim logged! Track its inspection status below.');
    setTimeout(() => setWarrantySubmittedMsg(''), 4000);
  };

  const statusSteps = [
    'Pending',
    'Payment Confirmed',
    'Packing',
    'Dispatched',
    'Delivered',
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Top Retailer Banner */}
      <div className="bg-zinc-900 text-white rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xl">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-orange-500 text-white">
              Verified Wholesale Partner
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              Tier: {activeRetailer.pricingTier}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            {activeRetailer.businessName}
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400">
            Account Representative: {activeRetailer.contactPerson} • Tax/PIN:{' '}
            <span className="font-mono text-zinc-200">{activeRetailer.taxIdPin}</span>
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-center">
          <div className="bg-zinc-800/90 border border-zinc-700 rounded-2xl p-3.5">
            <p className="text-[11px] text-zinc-400">Lifetime Volume</p>
            <p className="text-lg font-black text-orange-400 mt-0.5">
              {formatPrice(activeRetailer.lifetimeValue)}
            </p>
          </div>
          <div className="bg-zinc-800/90 border border-zinc-700 rounded-2xl p-3.5">
            <p className="text-[11px] text-zinc-400">Bulk Orders</p>
            <p className="text-lg font-black text-white mt-0.5">{orders.length}</p>
          </div>
          <div className="col-span-2 sm:col-span-1 bg-zinc-800/90 border border-zinc-700 rounded-2xl p-3.5">
            <p className="text-[11px] text-zinc-400">Active Quotes</p>
            <p className="text-lg font-black text-emerald-400 mt-0.5">{quotes.length}</p>
          </div>
        </div>
      </div>

      {/* Navigation Pills */}
      <div className="flex flex-wrap gap-2 border-b border-zinc-200 pb-4">
        {[
          { id: 'orders', label: 'Order History & Invoices', icon: Package },
          { id: 'quotes', label: 'Wholesale Quotations', icon: FileText },
          { id: 'warranty', label: 'Warranty Claims & IMEI Tracker', icon: ShieldCheck },
          { id: 'profile', label: 'Retailer Business Profile', icon: Building2 },
        ].map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition ${
                active
                  ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20'
                  : 'bg-white text-zinc-700 hover:bg-zinc-100 border border-zinc-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* TAB 1: ORDERS */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          {orders.map((order) => {
            const currentStepIdx = statusSteps.indexOf(order.status);
            return (
              <div
                key={order.id}
                className="bg-white rounded-3xl p-6 border border-zinc-200/90 shadow-sm space-y-5"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-100 pb-4">
                  <div>
                    <div className="flex items-center gap-2.5">
                      <span className="text-lg font-black text-zinc-900">
                        #{order.id}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-orange-50 text-orange-600 border border-orange-200">
                        {order.status}
                      </span>
                      <span className="text-xs text-zinc-400">{order.createdAt}</span>
                    </div>
                    <p className="text-xs text-zinc-500 mt-1 flex items-center gap-1.5">
                      <Truck className="w-3.5 h-3.5 text-orange-500" />
                      {order.deliveryTier} • Direct Warehouse-to-Doorstep Delivery
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-[11px] text-zinc-400">Grand Total</p>
                      <p className="text-lg font-black text-zinc-900">
                        {formatPrice(order.grandTotal)}
                      </p>
                    </div>
                    <button
                      onClick={() => onSelectInvoiceOrder(order)}
                      className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-bold transition"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      Invoice / Proforma
                    </button>
                  </div>
                </div>

                {/* Live Fulfillment Pipeline */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {statusSteps.map((step, idx) => {
                    const completed = idx <= currentStepIdx;
                    return (
                      <div
                        key={step}
                        className={`p-2.5 rounded-xl border text-center text-xs font-semibold flex items-center justify-center gap-1.5 ${
                          completed
                            ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                            : 'bg-zinc-50 border-zinc-200 text-zinc-400'
                        }`}
                      >
                        {completed ? (
                          <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                        ) : (
                          <Clock className="w-3.5 h-3.5 shrink-0" />
                        )}
                        <span className="truncate">{step}</span>
                      </div>
                    );
                  })}
                </div>

                {/* Order Items */}
                <div className="bg-zinc-50 rounded-2xl p-4 divide-y divide-zinc-200/70 text-xs">
                  {order.items.map((item, i) => (
                    <div
                      key={i}
                      className="py-2 first:pt-0 last:pb-0 flex items-center justify-between gap-4"
                    >
                      <div>
                        <span className="font-mono font-bold text-zinc-500 mr-2">
                          [{item.sku}]
                        </span>
                        <span className="font-semibold text-zinc-900">{item.name}</span>
                        <span className="ml-2 px-2 py-0.5 rounded bg-orange-100 text-orange-700 text-[10px] font-bold">
                          {item.tierApplied} Tier
                        </span>
                      </div>
                      <div className="font-bold text-zinc-800 shrink-0">
                        {item.quantity} units × {formatPrice(item.unitPrice)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* TAB 2: QUOTES */}
      {activeTab === 'quotes' && (
        <div className="space-y-4">
          {quotes.map((quote) => (
            <div
              key={quote.id}
              className="bg-white rounded-3xl p-6 border border-zinc-200 shadow-sm space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-100 pb-4">
                <div>
                  <div className="flex items-center gap-2.5">
                    <span className="text-lg font-black text-zinc-900">
                      Quote #{quote.id}
                    </span>
                    <span
                      className={`px-3 py-0.5 rounded-full text-xs font-bold ${
                        quote.status === 'Approved'
                          ? 'bg-emerald-100 text-emerald-700'
                          : quote.status === 'Converted to Order'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-amber-100 text-amber-700'
                      }`}
                    >
                      {quote.status}
                    </span>
                    <span className="text-xs text-zinc-400">{quote.createdAt}</span>
                  </div>
                  <p className="text-xs text-zinc-600 mt-1">{quote.notes}</p>
                  {quote.adminResponseNote && (
                    <p className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl mt-2 inline-block">
                      Wholesale Desk Note: {quote.adminResponseNote}
                    </p>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-2.5">
                  <button
                    onClick={() => onSelectInvoiceQuote(quote)}
                    className="px-4 py-2 rounded-xl border border-zinc-300 hover:bg-zinc-100 text-xs font-bold text-zinc-700 flex items-center gap-1.5"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    Print Quote
                  </button>
                  {quote.status === 'Approved' && (
                    <button
                      onClick={() => {
                        convertQuoteToOrder(quote.id);
                        setActiveTab('orders');
                      }}
                      className="px-4 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-orange-500/20"
                    >
                      Accept Quote & Convert to Order
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {quote.items.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-2xl bg-zinc-50 border border-zinc-200/80 flex items-center justify-between text-xs"
                  >
                    <div>
                      <p className="font-mono text-[11px] text-zinc-400">{item.sku}</p>
                      <p className="font-bold text-zinc-900">{item.name}</p>
                      <p className="text-zinc-500 mt-0.5">
                        Requested Qty: <strong>{item.quantity} units</strong>
                      </p>
                    </div>
                    <div className="text-right space-y-0.5">
                      <p className="text-zinc-400 line-through">
                        Std: {formatPrice(item.standardTierPrice)}
                      </p>
                      <p className="text-zinc-600">
                        Target: {formatPrice(item.requestedTargetPrice)}
                      </p>
                      {item.approvedUnitPrice && (
                        <p className="font-black text-emerald-600 text-sm">
                          Approved: {formatPrice(item.approvedUnitPrice)}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 3: WARRANTY CLAIMS */}
      {activeTab === 'warranty' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Submit New Claim */}
          <form
            onSubmit={handleWarrantySubmit}
            className="bg-white rounded-3xl p-6 border border-zinc-200 shadow-sm space-y-4 h-fit"
          >
            <div className="flex items-center gap-2">
              <PlusCircle className="w-5 h-5 text-orange-500" />
              <h3 className="text-base font-black text-zinc-900">
                Submit Official Warranty Claim
              </h3>
            </div>
            <p className="text-xs text-zinc-500">
              Enter the unit Serial or IMEI number from your wholesale batch for
              automated verification.
            </p>

            {warrantySubmittedMsg && (
              <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold">
                {warrantySubmittedMsg}
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-zinc-700 mb-1">
                Select Wholesale Order
              </label>
              <select
                value={selectedOrderId}
                onChange={(e) => setSelectedOrderId(e.target.value)}
                className="w-full rounded-xl border border-zinc-300 px-3 py-2 text-xs bg-white"
              >
                {orders.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.id} ({o.createdAt})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-700 mb-1">
                Product SKU
              </label>
              <select
                value={selectedSku}
                onChange={(e) => setSelectedSku(e.target.value)}
                className="w-full rounded-xl border border-zinc-300 px-3 py-2 text-xs bg-white"
              >
                {products.map((p) => (
                  <option key={p.id} value={p.sku}>
                    [{p.sku}] {p.name} ({p.warrantyPeriod})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-700 mb-1">
                Unit Serial Number / IMEI
              </label>
              <input
                type="text"
                required
                placeholder="e.g. SN-NP500-2026A-0089"
                value={serialNumber}
                onChange={(e) => setSerialNumber(e.target.value)}
                className="w-full rounded-xl border border-zinc-300 px-3 py-2 text-xs font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-700 mb-1">
                Fault / Issue Description
              </label>
              <textarea
                rows={3}
                required
                placeholder="Describe the hardware symptom observed..."
                value={issueText}
                onChange={(e) => setIssueText(e.target.value)}
                className="w-full rounded-xl border border-zinc-300 px-3 py-2 text-xs"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs shadow-md shadow-orange-500/20 transition"
            >
              Submit Claim for Technical Inspection
            </button>
          </form>

          {/* Claims History & Live Status */}
          <div className="lg:col-span-2 space-y-4">
            {warranties.map((claim) => (
              <div
                key={claim.id}
                className="bg-white rounded-3xl p-6 border border-zinc-200 shadow-sm space-y-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-black text-zinc-900 text-sm">
                      #{claim.id}
                    </span>
                    <span className="text-xs font-mono bg-zinc-100 px-2.5 py-0.5 rounded-lg text-zinc-700">
                      Order: {claim.orderId}
                    </span>
                    <span className="text-xs font-mono bg-orange-50 text-orange-700 px-2.5 py-0.5 rounded-lg">
                      S/N: {claim.serialOrImei}
                    </span>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Status: {claim.status}
                  </span>
                </div>

                <div>
                  <p className="text-sm font-bold text-zinc-900">
                    [{claim.productSku}] {claim.productName}
                  </p>
                  <p className="text-xs text-zinc-600 mt-1">{claim.issueDescription}</p>
                </div>

                <div className="bg-zinc-50 p-3.5 rounded-2xl border border-zinc-200/80 text-xs text-zinc-700">
                  <span className="font-bold text-zinc-900">
                    Warranty Desk Resolution Log:{' '}
                  </span>
                  {claim.adminResolutionNote}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: RETAILER BUSINESS PROFILE */}
      {activeTab === 'profile' && (
        <form
          onSubmit={handleSaveProfile}
          className="bg-white rounded-3xl p-6 sm:p-8 border border-zinc-200 shadow-sm max-w-3xl space-y-5"
        >
          <div>
            <h3 className="text-lg font-black text-zinc-900">
              Wholesale Partner Onboarding & KYC Profile
            </h3>
            <p className="text-xs text-zinc-500 mt-0.5">
              Keep your business details updated for instant Proforma Invoices and
              tiered distributor discounts.
            </p>
          </div>

          {profileSaved && (
            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold">
              Business profile updated!
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-bold text-zinc-700 mb-1">
                Registered Business Name
              </label>
              <input
                type="text"
                value={profileForm.businessName}
                onChange={(e) =>
                  setProfileForm({ ...profileForm, businessName: e.target.value })
                }
                className="w-full rounded-xl border border-zinc-300 px-3.5 py-2.5"
              />
            </div>
            <div>
              <label className="block font-bold text-zinc-700 mb-1">
                Primary Contact Person
              </label>
              <input
                type="text"
                value={profileForm.contactPerson}
                onChange={(e) =>
                  setProfileForm({ ...profileForm, contactPerson: e.target.value })
                }
                className="w-full rounded-xl border border-zinc-300 px-3.5 py-2.5"
              />
            </div>
            <div>
              <label className="block font-bold text-zinc-700 mb-1">
                Official Procurement Email
              </label>
              <input
                type="email"
                value={profileForm.email}
                onChange={(e) =>
                  setProfileForm({ ...profileForm, email: e.target.value })
                }
                className="w-full rounded-xl border border-zinc-300 px-3.5 py-2.5"
              />
            </div>
            <div>
              <label className="block font-bold text-zinc-700 mb-1">
                Direct Phone / WhatsApp Line
              </label>
              <input
                type="text"
                value={profileForm.phone}
                onChange={(e) =>
                  setProfileForm({ ...profileForm, phone: e.target.value })
                }
                className="w-full rounded-xl border border-zinc-300 px-3.5 py-2.5"
              />
            </div>
            <div>
              <label className="block font-bold text-zinc-700 mb-1">
                Tax ID / Business Registration PIN
              </label>
              <input
                type="text"
                value={profileForm.taxIdPin}
                onChange={(e) =>
                  setProfileForm({ ...profileForm, taxIdPin: e.target.value })
                }
                className="w-full rounded-xl border border-zinc-300 px-3.5 py-2.5 font-mono"
              />
            </div>
            <div>
              <label className="block font-bold text-zinc-700 mb-1">
                Expected Monthly Purchase Volume
              </label>
              <select
                value={profileForm.expectedMonthlyVolume}
                onChange={(e) =>
                  setProfileForm({
                    ...profileForm,
                    expectedMonthlyVolume: e.target.value,
                  })
                }
                className="w-full rounded-xl border border-zinc-300 px-3.5 py-2.5 bg-white"
              >
                <option value="$1,000 - $2,500">$1,000 - $2,500</option>
                <option value="$2,500 - $5,000">$2,500 - $5,000</option>
                <option value="$5,000 - $10,000">$5,000 - $10,000</option>
                <option value="$10,000 - $25,000">$10,000 - $25,000</option>
                <option value="$25,000+">$25,000+</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            className="px-6 py-3 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs shadow-md shadow-orange-500/20 transition"
          >
            Save Wholesale Partner Profile
          </button>
        </form>
      )}
    </div>
  );
};