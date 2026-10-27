/**
 * SokoNova — Live Notification API Route
 *
 * Called server-side whenever a new order or quote is submitted.
 * Sends:
 *   1. Email via Resend → ikimemia20@gmail.com
 *   2. WhatsApp via CallMeBot free API → +254 742 916132
 *
 * POST /api/notify
 * Body: { type: 'order' | 'quote', data: Order | QuoteRequest }
 */
import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

const NOTIFY_EMAIL = process.env.NOTIFY_EMAIL || 'ikimemia20@gmail.com';
const NOTIFY_WHATSAPP = process.env.NOTIFY_WHATSAPP || '254742916132';
// CallMeBot API key — user must register once at callmebot.com (free)
const CALLMEBOT_API_KEY = process.env.CALLMEBOT_API_KEY || '';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { type, data } = body as {
      type: 'order' | 'quote';
      data: Record<string, unknown>;
    };

    // ── Build message content ──────────────────────────────────────────────
    let emailSubject = '';
    let emailHtml = '';
    let whatsappMsg = '';

    if (type === 'order') {
      const order = data;
      const items = (order.items as Array<{
        name: string;
        quantity: number;
        unitPrice: number;
        tierApplied: string;
      }>)
        .map((i) => `• ${i.name} × ${i.quantity} @ $${i.unitPrice} (${i.tierApplied})`)
        .join('\n');

      emailSubject = `🛒 New Bulk Order #${order.id} — ${order.businessName}`;
      emailHtml = `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:24px;background:#f8fafc;border-radius:12px">
          <div style="background:#ea580c;color:#fff;padding:16px 24px;border-radius:8px;margin-bottom:24px">
            <h1 style="margin:0;font-size:22px">🛒 New Wholesale Order — SokoNova</h1>
          </div>
          <table style="width:100%;border-collapse:collapse;background:#fff;border-radius:8px;overflow:hidden;box-shadow:0 1px 4px rgba(0,0,0,0.08)">
            <tr style="background:#fff7ed"><td style="padding:12px 16px;font-weight:bold;color:#92400e">Order ID</td><td style="padding:12px 16px;font-size:18px;font-weight:900;color:#ea580c">#${order.id}</td></tr>
            <tr><td style="padding:12px 16px;color:#6b7280;font-weight:bold">Business</td><td style="padding:12px 16px">${order.businessName}</td></tr>
            <tr style="background:#f9fafb"><td style="padding:12px 16px;color:#6b7280;font-weight:bold">Customer</td><td style="padding:12px 16px">${order.customerName}</td></tr>
            <tr><td style="padding:12px 16px;color:#6b7280;font-weight:bold">Phone</td><td style="padding:12px 16px"><strong>${order.customerPhone}</strong></td></tr>
            <tr style="background:#f9fafb"><td style="padding:12px 16px;color:#6b7280;font-weight:bold">Payment</td><td style="padding:12px 16px">${order.paymentMethod} — Ref: <strong>${order.paymentReference || 'N/A'}</strong></td></tr>
            <tr><td style="padding:12px 16px;color:#6b7280;font-weight:bold">Grand Total</td><td style="padding:12px 16px;font-size:20px;font-weight:900;color:#16a34a">$${order.grandTotal}</td></tr>
            <tr style="background:#f9fafb"><td style="padding:12px 16px;color:#6b7280;font-weight:bold">Delivery</td><td style="padding:12px 16px">${order.deliveryTier}</td></tr>
            <tr><td style="padding:12px 16px;color:#6b7280;font-weight:bold">Status</td><td style="padding:12px 16px"><span style="background:#fef9c3;color:#854d0e;padding:4px 10px;border-radius:12px;font-size:12px;font-weight:bold">${order.status}</span></td></tr>
          </table>
          <div style="margin-top:20px;background:#fff;border-radius:8px;padding:16px;box-shadow:0 1px 4px rgba(0,0,0,0.08)">
            <p style="margin:0 0 12px;font-weight:bold;color:#374151">Items Ordered:</p>
            <pre style="font-size:13px;color:#374151;white-space:pre-wrap;margin:0">${items}</pre>
          </div>
          <p style="margin-top:20px;color:#6b7280;font-size:12px">Submitted: ${order.createdAt} — SokoNova B2B Wholesale Portal</p>
        </div>
      `;

      whatsappMsg = `🛒 *NEW ORDER — SokoNova*\n\nOrder ID: *#${order.id}*\nBusiness: ${order.businessName}\nCustomer: ${order.customerName}\nPhone: ${order.customerPhone}\nPayment: ${order.paymentMethod}\nRef: ${order.paymentReference || 'N/A'}\n💰 Total: *$${order.grandTotal}*\nStatus: ${order.status}\n\nLog in to your Admin Dashboard to confirm.`;
    } else {
      // type === 'quote'
      const quote = data;
      const items = (quote.items as Array<{
        name: string;
        quantity: number;
        requestedTargetPrice: number;
      }>)
        .map((i) => `• ${i.name} × ${i.quantity} @ target $${i.requestedTargetPrice}`)
        .join('\n');

      emailSubject = `📋 New Quote Request #${quote.id} — ${quote.businessName}`;
      emailHtml = `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:24px;background:#f8fafc;border-radius:12px">
          <div style="background:#7c3aed;color:#fff;padding:16px 24px;border-radius:8px;margin-bottom:24px">
            <h1 style="margin:0;font-size:22px">📋 New Quote Request — SokoNova</h1>
          </div>
          <table style="width:100%;border-collapse:collapse;background:#fff;border-radius:8px;overflow:hidden;box-shadow:0 1px 4px rgba(0,0,0,0.08)">
            <tr style="background:#f5f3ff"><td style="padding:12px 16px;font-weight:bold;color:#5b21b6">Quote ID</td><td style="padding:12px 16px;font-size:18px;font-weight:900;color:#7c3aed">#${quote.id}</td></tr>
            <tr><td style="padding:12px 16px;color:#6b7280;font-weight:bold">Business</td><td style="padding:12px 16px">${quote.businessName}</td></tr>
            <tr style="background:#f9fafb"><td style="padding:12px 16px;color:#6b7280;font-weight:bold">Contact</td><td style="padding:12px 16px">${quote.contactPerson}</td></tr>
            <tr><td style="padding:12px 16px;color:#6b7280;font-weight:bold">Phone</td><td style="padding:12px 16px"><strong>${quote.phone}</strong></td></tr>
            <tr style="background:#f9fafb"><td style="padding:12px 16px;color:#6b7280;font-weight:bold">Email</td><td style="padding:12px 16px">${quote.email}</td></tr>
            <tr><td style="padding:12px 16px;color:#6b7280;font-weight:bold">Notes</td><td style="padding:12px 16px">${quote.notes || '—'}</td></tr>
          </table>
          <div style="margin-top:20px;background:#fff;border-radius:8px;padding:16px;box-shadow:0 1px 4px rgba(0,0,0,0.08)">
            <p style="margin:0 0 12px;font-weight:bold;color:#374151">Items Requested:</p>
            <pre style="font-size:13px;color:#374151;white-space:pre-wrap;margin:0">${items}</pre>
          </div>
          <p style="margin-top:20px;color:#6b7280;font-size:12px">Submitted: ${quote.createdAt} — Review in Admin Dashboard</p>
        </div>
      `;

      whatsappMsg = `📋 *NEW QUOTE REQUEST — SokoNova*\n\nQuote ID: *#${quote.id}*\nBusiness: ${quote.businessName}\nContact: ${quote.contactPerson}\nPhone: ${quote.phone}\n\nReview and respond in your Admin Dashboard.`;
    }

    // ── Send Email via Resend ──────────────────────────────────────────────
    const emailResult = await resend.emails.send({
      from: 'SokoNova Alerts <onboarding@resend.dev>',
      to: [NOTIFY_EMAIL],
      subject: emailSubject,
      html: emailHtml,
    });

    // ── Send WhatsApp via CallMeBot (free, no account needed beyond setup) ─
    // One-time setup: user sends "I allow callmebot to send me messages" to
    // +34 644 59 38 01 on WhatsApp, then gets their API key.
    let whatsappOk = false;
    if (CALLMEBOT_API_KEY) {
      const waUrl = `https://api.callmebot.com/whatsapp.php?phone=${NOTIFY_WHATSAPP}&text=${encodeURIComponent(whatsappMsg)}&apikey=${CALLMEBOT_API_KEY}`;
      try {
        const waRes = await fetch(waUrl, { signal: AbortSignal.timeout(8000) });
        whatsappOk = waRes.ok;
      } catch (e) {
        console.warn('[SokoNova] WhatsApp notification failed:', e);
      }
    }

    return NextResponse.json({
      success: true,
      email: emailResult.data ? 'sent' : 'failed',
      whatsapp: whatsappOk ? 'sent' : CALLMEBOT_API_KEY ? 'failed' : 'no_api_key',
    });
  } catch (err) {
    console.error('[SokoNova] Notification error:', err);
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 });
  }
}
