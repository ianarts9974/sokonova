/**
 * SokoNova — Database helpers for Supabase cloud sync
 *
 * Provides real-time synchronization between client devices (phones)
 * and the central Admin Dashboard.
 */
import { supabase } from './supabase';
import type { Order, QuoteRequest, WarrantyClaim } from '@/types';

// ─── Row Mappers ─────────────────────────────────────────────────────────────

export function mapRowToOrder(row: any): Order {
  return {
    id: row.id,
    createdAt: row.created_at ? row.created_at.slice(0, 16).replace('T', ' ') : '',
    customerName: row.customer_name || '',
    businessName: row.business_name || '',
    customerEmail: row.customer_email || '',
    customerPhone: row.customer_phone || '',
    deliveryNotes: row.delivery_notes || '',
    deliveryTier: row.delivery_tier || 'Small Parcel Courier',
    shippingCost: Number(row.shipping_cost || 0),
    subtotal: Number(row.subtotal || 0),
    tierSavings: Number(row.tier_savings || 0),
    grandTotal: Number(row.grand_total || 0),
    paymentMethod: row.payment_method || 'Mobile Money',
    paymentReference: row.payment_reference || '',
    paymentVerified: Boolean(row.payment_verified),
    status: row.status || 'Pending',
    items: typeof row.items === 'string' ? JSON.parse(row.items) : (row.items || []),
  };
}

export function mapRowToQuote(row: any): QuoteRequest {
  return {
    id: row.id,
    createdAt: row.created_at ? row.created_at.slice(0, 16).replace('T', ' ') : '',
    businessName: row.business_name || '',
    contactPerson: row.contact_person || '',
    email: row.email || '',
    phone: row.phone || '',
    notes: row.notes || '',
    status: row.status || 'Pending Review',
    adminResponseNote: row.admin_response_note || undefined,
    items: typeof row.items === 'string' ? JSON.parse(row.items) : (row.items || []),
  };
}

// ─── Orders ─────────────────────────────────────────────────────────────────

export async function saveOrderToCloud(order: Order) {
  try {
    const { error } = await supabase.from('orders').upsert({
      id: order.id,
      created_at: new Date().toISOString(),
      customer_name: order.customerName,
      business_name: order.businessName,
      customer_email: order.customerEmail,
      customer_phone: order.customerPhone,
      delivery_notes: order.deliveryNotes,
      delivery_tier: order.deliveryTier,
      shipping_cost: order.shippingCost,
      subtotal: order.subtotal,
      tier_savings: order.tierSavings,
      grand_total: order.grandTotal,
      payment_method: order.paymentMethod,
      payment_reference: order.paymentReference,
      payment_verified: order.paymentVerified,
      status: order.status,
      items: order.items,
    });
    if (error) {
      console.warn('[SokoNova Cloud] Failed to save order:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('[SokoNova Cloud] Order cloud sync error:', err);
    return false;
  }
}

export async function updateOrderStatusInCloud(
  orderId: string,
  status: string,
  paymentVerified?: boolean
) {
  try {
    const updates: Record<string, unknown> = { status };
    if (paymentVerified !== undefined) updates.payment_verified = paymentVerified;
    const { error } = await supabase.from('orders').update(updates).eq('id', orderId);
    if (error) {
      console.warn('[SokoNova Cloud] Failed to update order status:', error.message);
    }
  } catch (err) {
    console.warn('[SokoNova Cloud] Update order error:', err);
  }
}

export async function fetchOrdersFromCloud(): Promise<Order[]> {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('[SokoNova Cloud] Failed to fetch orders:', error.message);
      return [];
    }
    return (data || []).map(mapRowToOrder);
  } catch (err) {
    console.warn('[SokoNova Cloud] Fetch orders error:', err);
    return [];
  }
}

// ─── Quote Requests ──────────────────────────────────────────────────────────

export async function saveQuoteToCloud(quote: QuoteRequest) {
  try {
    const { error } = await supabase.from('quote_requests').upsert({
      id: quote.id,
      created_at: new Date().toISOString(),
      business_name: quote.businessName,
      contact_person: quote.contactPerson,
      email: quote.email,
      phone: quote.phone,
      notes: quote.notes,
      status: quote.status,
      admin_response_note: quote.adminResponseNote || null,
      items: quote.items,
    });
    if (error) {
      console.warn('[SokoNova Cloud] Failed to save quote:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('[SokoNova Cloud] Quote sync error:', err);
    return false;
  }
}

export async function updateQuoteStatusInCloud(
  quoteId: string,
  status: string,
  adminNote?: string,
  items?: QuoteRequest['items']
) {
  try {
    const updates: Record<string, unknown> = { status };
    if (adminNote !== undefined) updates.admin_response_note = adminNote;
    if (items !== undefined) updates.items = items;
    const { error } = await supabase.from('quote_requests').update(updates).eq('id', quoteId);
    if (error) {
      console.warn('[SokoNova Cloud] Failed to update quote:', error.message);
    }
  } catch (err) {
    console.warn('[SokoNova Cloud] Quote update error:', err);
  }
}

export async function fetchQuotesFromCloud(): Promise<QuoteRequest[]> {
  try {
    const { data, error } = await supabase
      .from('quote_requests')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('[SokoNova Cloud] Failed to fetch quotes:', error.message);
      return [];
    }
    return (data || []).map(mapRowToQuote);
  } catch (err) {
    console.warn('[SokoNova Cloud] Fetch quotes error:', err);
    return [];
  }
}

// ─── Warranty Claims ─────────────────────────────────────────────────────────

export async function saveWarrantyClaimToCloud(claim: WarrantyClaim) {
  try {
    const { error } = await supabase.from('warranty_claims').upsert({
      id: claim.id,
      created_at: new Date().toISOString(),
      order_id: claim.orderId,
      product_sku: claim.productSku,
      product_name: claim.productName,
      business_name: claim.businessName,
      serial_or_imei: claim.serialOrImei,
      issue_description: claim.issueDescription,
      status: claim.status,
      admin_resolution_note: claim.adminResolutionNote,
    });
    if (error) {
      console.warn('[SokoNova Cloud] Failed to save warranty claim:', error.message);
    }
  } catch (err) {
    console.warn('[SokoNova Cloud] Warranty claim sync error:', err);
  }
}

// ─── Realtime Subscriptions ─────────────────────────────────────────────────

export function subscribeToCloudChanges(callbacks: {
  onOrderUpsert: (order: Order) => void;
  onQuoteUpsert: (quote: QuoteRequest) => void;
}) {
  const channel = supabase
    .channel('sokonova_realtime_changes')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'orders' },
      (payload) => {
        if (payload.new && (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE')) {
          callbacks.onOrderUpsert(mapRowToOrder(payload.new));
        }
      }
    )
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'quote_requests' },
      (payload) => {
        if (payload.new && (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE')) {
          callbacks.onQuoteUpsert(mapRowToQuote(payload.new));
        }
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
