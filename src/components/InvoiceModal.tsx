'use client';

import React from 'react';
import { X, Printer, CheckCircle2, ShieldCheck, Truck } from 'lucide-react';
import { Order, QuoteRequest } from '@/types';
import { useSokoNova } from '@/context/SokoNovaContext';

interface InvoiceModalProps {
  order?: Order | null;
  quote?: QuoteRequest | null;
  onClose: () => void;
}

export const InvoiceModal: React.FC<InvoiceModalProps> = ({
  order,
  quote,
  onClose,
}) => {
  const { settings, formatPrice } = useSokoNova();

  if (!order && !quote) return null;

  const isOrder = Boolean(order);
  const docTitle = isOrder
    ? order?.paymentVerified
      ? 'COMMERCIAL WHOLESALE INVOICE'
      : 'PROFORMA WHOLESALE INVOICE'
    : 'FORMAL WHOLESALE QUOTATION';

  const docNumber = isOrder ? order!.id : quote!.id;
  const docDate = isOrder ? order!.createdAt : quote!.createdAt;
  const clientBusiness = isOrder ? order!.businessName : quote!.businessName;
  const clientPerson = isOrder ? order!.customerName : quote!.contactPerson;
  const clientEmail = isOrder ? order!.customerEmail : quote!.email;
  const clientPhone = isOrder ? order!.customerPhone : quote!.phone;

  return (
    <div className="fixed inset-0 z-50 bg-zinc-900/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-3xl w-full shadow-2xl border border-zinc-200 overflow-hidden my-8">
        {/* Top Action Bar */}
        <div className="bg-zinc-900 text-white px-6 py-4 flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-orange-500 text-white">
              {docNumber}
            </span>
            <span className="text-sm text-zinc-300">{docTitle}</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => window.print()}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold transition"
            >
              <Printer className="w-4 h-4" />
              Print / Save PDF
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Document Content */}
        <div className="p-6 sm:p-10 space-y-8 text-zinc-900" id="printable-invoice">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 border-b border-zinc-200 pb-6">
            <div>
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-orange-500 flex items-center justify-center text-white font-black text-xl">
                  S
                </div>
                <div>
                  <h2 className="text-2xl font-black tracking-tight text-zinc-900">
                    {settings.brandName}
                  </h2>
                  <p className="text-xs text-zinc-500">{settings.tagline}</p>
                </div>
              </div>
              <div className="mt-4 text-xs text-zinc-600 space-y-1">
                <p>Official Support Desk: {settings.supportEmail}</p>
                <p>Live Wholesale Inquiry: {settings.whatsappNumber}</p>
                <p>Logistics Mode: Direct Warehouse-to-Doorstep Delivery</p>
              </div>
            </div>

            <div className="sm:text-right">
              <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-orange-50 text-orange-600 border border-orange-200">
                {docTitle}
              </span>
              <p className="text-xl font-black text-zinc-900 mt-2">#{docNumber}</p>
              <p className="text-xs text-zinc-500 mt-1">Issued: {docDate}</p>
              {isOrder && (
                <p className="text-xs font-semibold mt-2 text-emerald-600 flex items-center sm:justify-end gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Status: {order!.status} ({order!.paymentMethod})
                </p>
              )}
            </div>
          </div>

          {/* Client & Fulfillment Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-zinc-50 p-5 rounded-2xl border border-zinc-200/80 text-xs">
            <div>
              <p className="font-bold text-zinc-400 uppercase tracking-wider mb-1.5">
                Billed Wholesale Partner
              </p>
              <p className="text-sm font-bold text-zinc-900">{clientBusiness}</p>
              <p className="text-zinc-700 mt-0.5">Attn: {clientPerson}</p>
              <p className="text-zinc-600">{clientEmail}</p>
              <p className="text-zinc-600">{clientPhone}</p>
            </div>
            <div>
              <p className="font-bold text-zinc-400 uppercase tracking-wider mb-1.5">
                Dispatch & Fulfillment Protocol
              </p>
              <p className="font-semibold text-zinc-900 flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-orange-500" />
                {isOrder
                  ? order!.deliveryTier
                  : 'Standard & Freight Doorstep Delivery'}
              </p>
              <p className="text-zinc-600 mt-1">
                {isOrder ? order!.deliveryNotes : quote!.notes}
              </p>
              {isOrder && (
                <p className="text-zinc-500 mt-1">
                  Payment Ref: <span className="font-mono">{order!.paymentReference}</span>
                </p>
              )}
            </div>
          </div>

          {/* Line Items Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b-2 border-zinc-200 text-[11px] font-bold uppercase text-zinc-500">
                  <th className="py-3 pr-4">SKU</th>
                  <th className="py-3 px-4">Product Description</th>
                  <th className="py-3 px-4 text-center">Qty</th>
                  <th className="py-3 px-4 text-right">Unit Price</th>
                  <th className="py-3 pl-4 text-right">Line Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 text-xs">
                {isOrder
                  ? order!.items.map((item, idx) => (
                      <tr key={idx}>
                        <td className="py-3.5 pr-4 font-mono font-semibold text-zinc-700">
                          {item.sku}
                        </td>
                        <td className="py-3.5 px-4">
                          <p className="font-semibold text-zinc-900">{item.name}</p>
                          <span className="text-[10px] text-orange-600 font-medium">
                            {item.tierApplied} Wholesale Tier
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-center font-bold">
                          {item.quantity}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          {formatPrice(item.unitPrice)}
                        </td>
                        <td className="py-3.5 pl-4 text-right font-bold text-zinc-900">
                          {formatPrice(item.unitPrice * item.quantity)}
                        </td>
                      </tr>
                    ))
                  : quote!.items.map((item, idx) => {
                      const activeRate =
                        item.approvedUnitPrice ?? item.requestedTargetPrice;
                      return (
                        <tr key={idx}>
                          <td className="py-3.5 pr-4 font-mono font-semibold text-zinc-700">
                            {item.sku}
                          </td>
                          <td className="py-3.5 px-4">
                            <p className="font-semibold text-zinc-900">{item.name}</p>
                            <span className="text-[10px] text-zinc-500">
                              Standard Rate: {formatPrice(item.standardTierPrice)}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-center font-bold">
                            {item.quantity}
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            {formatPrice(activeRate)}
                          </td>
                          <td className="py-3.5 pl-4 text-right font-bold text-zinc-900">
                            {formatPrice(activeRate * item.quantity)}
                          </td>
                        </tr>
                      );
                    })}
              </tbody>
            </table>
          </div>

          {/* Totals Summary */}
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-6 pt-4 border-t border-zinc-200">
            <div className="text-xs text-zinc-500 max-w-sm space-y-1.5">
              <p className="font-semibold text-zinc-800 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                Official Wholesale Warranty & Quality Guarantee
              </p>
              <p>
                All electronics are serial/IMEI logged prior to dispatch and covered by
                our direct manufacturer-backed wholesale warranty policy.
              </p>
            </div>

            {isOrder ? (
              <div className="w-full sm:w-72 space-y-2 text-xs bg-zinc-50 p-4 rounded-2xl border border-zinc-200">
                <div className="flex justify-between text-zinc-600">
                  <span>Wholesale Subtotal:</span>
                  <span className="font-semibold">{formatPrice(order!.subtotal)}</span>
                </div>
                <div className="flex justify-between text-emerald-600">
                  <span>Volume Tier Savings:</span>
                  <span className="font-semibold">
                    -{formatPrice(order!.tierSavings)}
                  </span>
                </div>
                <div className="flex justify-between text-zinc-600">
                  <span>Doorstep Freight Charge:</span>
                  <span className="font-semibold">
                    {formatPrice(order!.shippingCost)}
                  </span>
                </div>
                <div className="border-t border-zinc-200 pt-2 flex justify-between text-sm font-black text-zinc-900">
                  <span>Grand Total:</span>
                  <span className="text-orange-600">
                    {formatPrice(order!.grandTotal)}
                  </span>
                </div>
              </div>
            ) : (
              <div className="w-full sm:w-72 space-y-2 text-xs bg-zinc-50 p-4 rounded-2xl border border-zinc-200">
                <div className="flex justify-between text-sm font-black text-zinc-900">
                  <span>Quoted Total:</span>
                  <span className="text-orange-600">
                    {formatPrice(
                      quote!.items.reduce(
                        (s, i) =>
                          s +
                          (i.approvedUnitPrice ?? i.requestedTargetPrice) *
                            i.quantity,
                        0
                      )
                    )}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};