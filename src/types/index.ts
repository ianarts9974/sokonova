export type CategoryName =
  | 'Mobile & Personal Electronics'
  | 'Gaming & Accessories'
  | 'Audio & Sound'
  | 'Lighting & Smart Home'
  | 'Home Appliances';

export type UserRole = 'guest' | 'retailer' | 'admin';

export interface LandedCostBreakdown {
  supplierUnitCost: number;
  internationalShipping: number;
  insurance: number;
  importDutiesTaxes: number;
  regulatoryComplianceFees: number;
  clearingCharges: number;
  localTransport: number;
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  category: CategoryName;
  brand: string;
  model: string;
  color: string;
  specs: string[];
  warrantyPeriod: '6 Months' | '12 Months' | '24 Months';
  weightKg: number;
  dimensionsCm: string;
  moq: number;
  retailPrice: number; // Suggested MSRP for margin preview
  bronzePrice: number; // 1 - 9 units
  silverPrice: number; // 10 - 49 units
  goldPrice: number;   // 50+ units
  physicalStock: number;
  reservedStock: number;
  lowStockThreshold: number;
  binCode: string; // Internal Admin-only warehouse rack/bin code e.g. A01-R02-S04
  serialBatch: string;
  images: string[];
  status: 'Active' | 'Draft';
  isFeatured?: boolean;
  isNewArrival?: boolean;
  landedCost: LandedCostBreakdown;
}

export interface CartItem {
  productId: string;
  quantity: number;
}

export type OrderStatus =
  | 'Pending'
  | 'Payment Confirmed'
  | 'Packing'
  | 'Dispatched'
  | 'Delivered';

export type PaymentMethod =
  | 'Mobile Money'
  | 'Card Payment'
  | 'Direct Bank Transfer'
  | 'Proforma Invoice';

export interface OrderItem {
  productId: string;
  sku: string;
  name: string;
  quantity: number;
  unitPrice: number;
  tierApplied: 'Bronze' | 'Silver' | 'Gold';
}

export interface Order {
  id: string;
  createdAt: string;
  customerName: string;
  businessName: string;
  customerEmail: string;
  customerPhone: string;
  deliveryNotes: string;
  deliveryTier: 'Small Parcel Courier' | 'Medium Van / Carton Freight' | 'Large Dedicated Freight Truck';
  shippingCost: number;
  subtotal: number;
  tierSavings: number;
  grandTotal: number;
  paymentMethod: PaymentMethod;
  paymentReference: string;
  paymentVerified: boolean;
  status: OrderStatus;
  items: OrderItem[];
}

export interface QuoteItem {
  productId: string;
  sku: string;
  name: string;
  quantity: number;
  standardTierPrice: number;
  requestedTargetPrice: number;
  approvedUnitPrice?: number;
}

export interface QuoteRequest {
  id: string;
  createdAt: string;
  businessName: string;
  contactPerson: string;
  email: string;
  phone: string;
  notes: string;
  status: 'Pending Review' | 'Approved' | 'Converted to Order' | 'Rejected';
  adminResponseNote?: string;
  items: QuoteItem[];
}

export interface RetailerProfile {
  id: string;
  businessName: string;
  contactPerson: string;
  email: string;
  phone: string;
  businessCategory: string;
  taxIdPin: string;
  expectedMonthlyVolume: string;
  pricingTier: 'Standard Retailer' | 'Large Retailer' | 'Distributor';
  approved: boolean;
  lifetimeValue: number;
  joinedAt: string;
}

export type WarrantyStatus =
  | 'Submitted'
  | 'Inspection'
  | 'Approved'
  | 'Replacement Sent'
  | 'Rejected'
  | 'Closed';

export interface WarrantyClaim {
  id: string;
  createdAt: string;
  orderId: string;
  productSku: string;
  productName: string;
  businessName: string;
  serialOrImei: string;
  issueDescription: string;
  status: WarrantyStatus;
  adminResolutionNote: string;
}

export interface StoreSettings {
  brandName: string;
  tagline: string;
  supportEmail: string;
  whatsappNumber: string;
  businessHours: string;
  currencySymbol: '$' | 'KSh';
  exchangeRateMultiplier: number; // 1 for $, e.g. 130 for KSh
}