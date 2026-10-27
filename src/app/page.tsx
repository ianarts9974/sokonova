'use client';

import React, { useState, useMemo } from 'react';
import {
  Search,
  ShoppingCart,
  Heart,
  ShieldCheck,
  Truck,
  Zap,
  FileText,
  UserCheck,
  Lock,
  ChevronRight,
  SlidersHorizontal,
  PackageCheck,
  X,
  Plus,
  Minus,
  CheckCircle2,
  MessageSquare,
  Mail,
  Clock,
  Sparkles,
  Home,
  Grid,
  Award,
} from 'lucide-react';
import { useSokoNova } from '@/context/SokoNovaContext';
import { Product, CategoryName, Order, QuoteRequest, PaymentMethod } from '@/types';
import { ProductImage } from '@/components/ProductImage';
import { AccountPortal } from '@/components/AccountPortal';
import { AdminDashboard } from '@/components/AdminDashboard';
import { InvoiceModal } from '@/components/InvoiceModal';
import { AdminLoginModal } from '@/components/AdminLoginModal';

type ActiveView =
  | 'home'
  | 'catalog'
  | 'bulk-deals'
  | 'new-arrivals'
  | 'how-to-order'
  | 'delivery'
  | 'warranty-policy'
  | 'about'
  | 'contact'
  | 'account'
  | 'admin';

const CATEGORY_CARDS: {
  name: CategoryName;
  subtitle: string;
  image: string;
}[] = [
  {
    name: 'Mobile & Personal Electronics',
    subtitle: 'GaN Fast Chargers, 100W Power Banks, Smartwatches',
    image:
      'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=600&q=80',
  },
  {
    name: 'Gaming & Accessories',
    subtitle: 'Hall-Effect Controllers, Hot-Swap Keyboards, 26K Mice',
    image:
      'https://images.unsplash.com/photo-1600080972464-8e5f35f63d08?auto=format&fit=crop&w=600&q=80',
  },
  {
    name: 'Audio & Sound',
    subtitle: 'Hybrid ANC Headphones, 80W Party Speakers, ENC Earbuds',
    image:
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80',
  },
  {
    name: 'Lighting & Smart Home',
    subtitle: 'Qi-Charging LED Desk Lamps, Smart Ambience & Emergency Lamps',
    image:
      'https://images.unsplash.com/photo-1534281369186-596111339993?auto=format&fit=crop&w=600&q=80',
  },
  {
    name: 'Home Appliances',
    subtitle: 'Digital Panorama Air Fryers, Smart Inverter Microwaves',
    image:
      'https://images.unsplash.com/photo-1585515320310-259814833e62?auto=format&fit=crop&w=600&q=80',
  },
];

export default function SokoNovaApp() {
  const {
    products,
    cart,
    wishlist,
    settings,
    role,
    setRole,
    activeRetailer,
    formatPrice,
    getTierInfo,
    addToCart,
    updateCartQty,
    removeFromCart,
    toggleWishlist,
    placeOrder,
    submitQuoteRequest,
    updateSettings,
  } = useSokoNova();

  const [activeView, setActiveView] = useState<ActiveView>('home');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedBrand, setSelectedBrand] = useState<string>('All');
  const [maxMoqFilter, setMaxMoqFilter] = useState<number>(50);
  const [sortBy, setSortBy] = useState<
    'featured' | 'lowest-moq' | 'price-asc' | 'newest'
  >('featured');

  // Product Detail Modal & Interactive Tier Selector
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [detailQty, setDetailQty] = useState<number>(10);

  // Cart & Checkout Drawer
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Mobile Money');
  const [paymentRef, setPaymentRef] = useState('MM-8472910B');
  const [deliveryNotes, setDeliveryNotes] = useState(
    'Direct Warehouse-to-Doorstep Delivery — Call procurement contact on arrival.'
  );

  // Custom Quote Builder Modal
  const [quoteModalProduct, setQuoteModalProduct] = useState<Product | null>(null);
  const [quoteQty, setQuoteQty] = useState<number>(50);
  const [quoteTargetPrice, setQuoteTargetPrice] = useState<number>(20);
  const [quoteNotes, setQuoteNotes] = useState('');

  // Printable Invoice / Quote Modal
  const [invoiceOrder, setInvoiceOrder] = useState<Order | null>(null);
  const [invoiceQuote, setInvoiceQuote] = useState<QuoteRequest | null>(null);

  // Admin Login Modal
  const [showAdminLogin, setShowAdminLogin] = useState(false);

  // Toast Notification
  const [toast, setToast] = useState<string | null>(null);
  const triggerToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  const openProductModal = (product: Product) => {
    setSelectedProduct(product);
    setActiveImageIdx(0);
    setDetailQty(Math.max(product.moq, 10));
  };

  const openQuoteModal = (product: Product, initialQty?: number) => {
    setQuoteModalProduct(product);
    const q = Math.max(product.moq, initialQty || 50);
    setQuoteQty(q);
    setQuoteTargetPrice(Number((product.goldPrice * 0.94).toFixed(1)));
    setQuoteNotes(
      `Requesting custom volume pricing on ${q} units of [${product.sku}] ${product.name}.`
    );
  };

  const brands = useMemo(
    () => ['All', ...Array.from(new Set(products.map((p) => p.brand)))],
    [products]
  );

  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => p.status === 'Active')
      .filter((p) => {
        if (activeView === 'new-arrivals' && !p.isNewArrival) return false;
        if (selectedCategory !== 'All' && p.category !== selectedCategory)
          return false;
        if (selectedBrand !== 'All' && p.brand !== selectedBrand) return false;
        if (p.moq > maxMoqFilter) return false;
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          return (
            p.name.toLowerCase().includes(q) ||
            p.sku.toLowerCase().includes(q) ||
            p.brand.toLowerCase().includes(q) ||
            p.category.toLowerCase().includes(q)
          );
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'lowest-moq') return a.moq - b.moq;
        if (sortBy === 'price-asc') return a.goldPrice - b.goldPrice;
        if (sortBy === 'newest')
          return (b.isNewArrival ? 1 : 0) - (a.isNewArrival ? 1 : 0);
        return (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0);
      });
  }, [
    products,
    activeView,
    selectedCategory,
    selectedBrand,
    maxMoqFilter,
    searchQuery,
    sortBy,
  ]);

  // Cart calculations
  const cartDetails = useMemo(() => {
    let subtotal = 0;
    let tierSavings = 0;
    let totalWeightKg = 0;

    const enriched = cart
      .map((item) => {
        const product = products.find((p) => p.id === item.productId);
        if (!product) return null;
        const tierInfo = getTierInfo(product, item.quantity);
        subtotal += tierInfo.unitPrice * item.quantity;
        tierSavings += tierInfo.totalSavings;
        totalWeightKg += product.weightKg * item.quantity;
        return {
          product,
          quantity: item.quantity,
          tierInfo,
        };
      })
      .filter(Boolean) as {
      product: Product;
      quantity: number;
      tierInfo: ReturnType<typeof getTierInfo>;
    }[];

    let deliveryTier: Order['deliveryTier'] = 'Small Parcel Courier';
    let shippingCost = 20;
    if (totalWeightKg > 40) {
      deliveryTier = 'Large Dedicated Freight Truck';
      shippingCost = 95;
    } else if (totalWeightKg > 10) {
      deliveryTier = 'Medium Van / Carton Freight';
      shippingCost = 45;
    }

    return {
      enriched,
      subtotal,
      tierSavings,
      totalWeightKg,
      deliveryTier,
      shippingCost,
      grandTotal: subtotal + (enriched.length ? shippingCost : 0),
    };
  }, [cart, products, getTierInfo]);

  const handleCheckoutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cartDetails.enriched.length) return;
    const createdOrder = placeOrder({
      customerName: activeRetailer.contactPerson,
      businessName: activeRetailer.businessName,
      customerEmail: activeRetailer.email,
      customerPhone: activeRetailer.phone,
      deliveryNotes,
      deliveryTier: cartDetails.deliveryTier,
      shippingCost: cartDetails.shippingCost,
      subtotal: cartDetails.subtotal,
      tierSavings: cartDetails.tierSavings,
      grandTotal: cartDetails.grandTotal,
      paymentMethod,
      paymentReference: paymentRef || `REF-${Date.now()}`,
      items: cartDetails.enriched.map((item) => ({
        productId: item.product.id,
        sku: item.product.sku,
        name: item.product.name,
        quantity: item.quantity,
        unitPrice: item.tierInfo.unitPrice,
        tierApplied: item.tierInfo.tier,
      })),
    });

    setIsCartOpen(false);
    setInvoiceOrder(createdOrder);
    triggerToast(`Wholesale Order #${createdOrder.id} Confirmed!`);
  };

  const handleCustomQuoteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quoteModalProduct) return;
    const tierInfo = getTierInfo(quoteModalProduct, quoteQty);
    const createdQuote = submitQuoteRequest({
      businessName: activeRetailer.businessName,
      contactPerson: activeRetailer.contactPerson,
      email: activeRetailer.email,
      phone: activeRetailer.phone,
      notes: quoteNotes,
      items: [
        {
          productId: quoteModalProduct.id,
          sku: quoteModalProduct.sku,
          name: quoteModalProduct.name,
          quantity: quoteQty,
          standardTierPrice: tierInfo.unitPrice,
          requestedTargetPrice: quoteTargetPrice,
        },
      ],
    });
    setQuoteModalProduct(null);
    setInvoiceQuote(createdQuote);
    triggerToast(`Wholesale Quote #${createdQuote.id} Submitted!`);
  };

  return (
    <div className="min-h-screen flex flex-col pb-16 lg:pb-0">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-20 lg:bottom-6 right-6 z-50 bg-zinc-900 text-white px-5 py-3.5 rounded-2xl shadow-2xl border border-orange-500 flex items-center gap-2.5 text-xs font-bold animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-orange-500 shrink-0" />
          <span>{toast}</span>
        </div>
      )}

      {/* Admin Login Modal */}
      {showAdminLogin && (
        <AdminLoginModal
          onSuccess={() => {
            setShowAdminLogin(false);
            setRole('admin');
            setActiveView('admin');
          }}
          onCancel={() => setShowAdminLogin(false)}
        />
      )}

      {/* 1. TOP UTILITY BAR */}
      <div className="bg-zinc-900 text-zinc-300 text-[11px] py-2 px-4 border-b border-zinc-800">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 font-semibold text-white">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Account: {activeRetailer.pricingTier}
            </span>
            <span className="hidden md:inline text-zinc-500">|</span>
            <span className="hidden sm:inline text-orange-400 font-semibold">
              Bulk Tiers: Bronze 1–9 • Silver 10–49 • Gold 50+ Units
            </span>
          </div>

          <div className="flex items-center gap-3 ml-auto">
            {/* Currency Switcher */}
            <button
              onClick={() =>
                updateSettings({
                  ...settings,
                  currencySymbol: settings.currencySymbol === '$' ? 'KSh' : '$',
                })
              }
              className="px-2.5 py-0.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold transition"
            >
              Currency: {settings.currencySymbol}
            </button>

            <button
              onClick={() => setActiveView('account')}
              className="hover:text-white font-semibold transition"
            >
              Track Order & Warranty
            </button>

            {/* 1-Click Owner Admin Toggle */}
            <button
              onClick={() => {
                if (activeView === 'admin') {
                  setRole('retailer');
                  setActiveView('home');
                } else {
                  setRole('admin');
                  setActiveView('admin');
                }
              }}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full font-bold transition ${
                activeView === 'admin'
                  ? 'bg-orange-500 text-white'
                  : 'bg-orange-500/20 text-orange-400 border border-orange-500/40 hover:bg-orange-500 hover:text-white'
              }`}
            >
              <Lock className="w-3 h-3" />
              {activeView === 'admin' ? 'Exit Owner Admin' : 'Owner Admin Portal'}
            </button>
          </div>
        </div>
      </div>

      {/* 2. MAIN HEADER (Kilimall-inspired vibrant B2B header) */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-zinc-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between gap-3 sm:gap-6">
          {/* Brand Logo */}
          <button
            onClick={() => {
              setSelectedCategory('All');
              setActiveView('home');
            }}
            className="flex items-center gap-2.5 text-left shrink-0 group"
          >
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center text-white font-black text-xl shadow-md shadow-orange-500/25 group-hover:scale-105 transition">
              S
            </div>
            <div>
              <span className="text-xl sm:text-2xl font-black tracking-tight text-zinc-900 block leading-none">
                {settings.brandName}
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-orange-600 block mt-0.5">
                B2B Wholesale
              </span>
            </div>
          </button>

          {/* Global Instant SKU / Product Search Bar */}
          <div className="flex-1 max-w-2xl">
            <div className="relative flex items-center">
              <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  if (activeView !== 'catalog' && activeView !== 'home') {
                    setActiveView('catalog');
                  }
                }}
                placeholder="Search by SKU (e.g. GAME-CTRL-001), product, or brand..."
                className="w-full pl-10 pr-24 py-2.5 rounded-2xl border-2 border-orange-500/80 focus:border-orange-600 focus:outline-none text-xs sm:text-sm bg-zinc-50/70"
              />
              <button
                onClick={() => setActiveView('catalog')}
                className="absolute right-1.5 px-3.5 py-1.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold transition"
              >
                Search
              </button>
            </div>
          </div>

          {/* Right Quick Actions */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <button
              onClick={() => setActiveView('account')}
              className="hidden sm:flex items-center gap-2 px-3.5 py-2 rounded-2xl hover:bg-zinc-100 text-xs font-bold text-zinc-700 transition"
            >
              <UserCheck className="w-4 h-4 text-orange-500" />
              <div className="text-left">
                <p className="text-[10px] text-zinc-400 leading-none">Partner Portal</p>
                <p className="text-xs font-bold text-zinc-900">My Account</p>
              </div>
            </button>

            <button
              onClick={() => setActiveView('catalog')}
              className="relative p-2.5 rounded-2xl bg-zinc-100 hover:bg-zinc-200 text-zinc-700 transition"
              title="Saved SKUs"
            >
              <Heart className="w-5 h-5" />
              {wishlist.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-zinc-900 text-white text-[10px] font-bold flex items-center justify-center">
                  {wishlist.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setIsCartOpen(true)}
              className="flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold shadow-md shadow-orange-500/20 transition"
            >
              <ShoppingCart className="w-4 h-4" />
              <span className="hidden sm:inline">Bulk Order</span>
              <span className="px-2 py-0.5 rounded-full bg-white text-orange-600 font-black">
                {cart.reduce((s, i) => s + i.quantity, 0)}
              </span>
            </button>
          </div>
        </div>

        {/* Navigation Links Bar */}
        <div className="border-t border-zinc-100 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center gap-1 overflow-x-auto no-scrollbar py-2 text-xs font-bold text-zinc-600">
            {[
              { id: 'home', label: 'Home' },
              { id: 'catalog', label: 'Shop Catalog' },
              { id: 'bulk-deals', label: 'Wholesale / Bulk Deals' },
              { id: 'new-arrivals', label: 'New Arrivals' },
              { id: 'how-to-order', label: 'How to Order' },
              { id: 'delivery', label: 'Delivery & Logistics' },
              { id: 'warranty-policy', label: 'Warranty Policy' },
              { id: 'about', label: 'About Us' },
              { id: 'contact', label: 'Contact Sales' },
            ].map((nav) => (
              <button
                key={nav.id}
                onClick={() => setActiveView(nav.id as ActiveView)}
                className={`px-3.5 py-1.5 rounded-xl whitespace-nowrap transition ${
                  activeView === nav.id
                    ? 'bg-orange-50 text-orange-600 font-black'
                    : 'hover:bg-zinc-100 hover:text-zinc-900'
                }`}
              >
                {nav.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* MAIN VIEW SWITCHER */}
      <main className="flex-1">
        {activeView === 'admin' && (
          <AdminDashboard onPrintOrder={(o) => setInvoiceOrder(o)} />
        )}

        {activeView === 'account' && (
          <AccountPortal
            onSelectInvoiceOrder={(o) => setInvoiceOrder(o)}
            onSelectInvoiceQuote={(q) => setInvoiceQuote(q)}
          />
        )}

        {/* HOME VIEW */}
        {activeView === 'home' && (
          <div className="space-y-12 pb-16">
            {/* Hero Banner */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-6">
              <div className="relative rounded-3xl overflow-hidden bg-zinc-900 text-white p-6 sm:p-12 lg:p-14 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center shadow-xl">
                <div className="lg:col-span-7 space-y-5 z-10">
                  <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-500/20 border border-orange-500/40 text-orange-300 text-xs font-bold">
                    <Sparkles className="w-3.5 h-3.5" />
                    Direct Factory Import • Live Warehouse Stock
                  </div>
                  <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
                    Quality Electronics at Wholesale Prices —{' '}
                    <span className="text-orange-500">
                      Direct Import & Bulk Distribution
                    </span>
                  </h1>
                  <p className="text-sm sm:text-base text-zinc-300 max-w-2xl leading-relaxed">
                    Empowering retailers and corporate buyers with verified Grade-A
                    electronics, automated Bronze/Silver/Gold bulk tier pricing,
                    instant Proforma Invoices, and Direct Warehouse-to-Doorstep
                    Delivery.
                  </p>
                  <div className="flex flex-wrap items-center gap-3 pt-2">
                    <button
                      onClick={() => setActiveView('catalog')}
                      className="px-6 py-3.5 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-black text-xs sm:text-sm shadow-lg shadow-orange-500/30 flex items-center gap-2 transition"
                    >
                      Shop Wholesale Catalog
                      <ChevronRight className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setActiveView('account')}
                      className="px-6 py-3.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs sm:text-sm border border-white/15 transition"
                    >
                      Become a Wholesale Partner
                    </button>
                  </div>
                </div>

                <div className="lg:col-span-5 grid grid-cols-2 gap-3 z-10">
                  {products.slice(0, 4).map((p) => (
                    <div
                      key={p.id}
                      onClick={() => openProductModal(p)}
                      className="bg-zinc-800/90 border border-zinc-700/80 rounded-2xl p-3 cursor-pointer hover:border-orange-500 transition group"
                    >
                      <div className="h-28 rounded-xl overflow-hidden mb-2.5">
                        <ProductImage src={p.images[0]} alt={p.name} />
                      </div>
                      <p className="text-xs font-bold text-white line-clamp-1">
                        {p.name}
                      </p>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-[11px] text-orange-400 font-black">
                          Gold: {formatPrice(p.goldPrice)}
                        </span>
                        <span className="text-[10px] bg-zinc-700 px-2 py-0.5 rounded text-zinc-300">
                          MOQ {p.moq}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* Live Wholesale Advantage Banner */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  {
                    icon: PackageCheck,
                    title: 'Real-Time Stock Visibility',
                    desc: 'Exact available warehouse units shown live on every SKU.',
                  },
                  {
                    icon: Zap,
                    title: 'Automated Tier Pricing',
                    desc: 'Instant Bronze (1–9), Silver (10–49) & Gold (50+) discounts.',
                  },
                  {
                    icon: ShieldCheck,
                    title: 'Official Warranty Coverage',
                    desc: '6 to 24 Months serial/IMEI-tracked wholesale warranty.',
                  },
                  {
                    icon: FileText,
                    title: 'Instant Proforma Invoices',
                    desc: 'Download commercial invoices & custom bulk quotes in 1 click.',
                  },
                ].map((adv, i) => {
                  const Icon = adv.icon;
                  return (
                    <div
                      key={i}
                      className="bg-white rounded-2xl p-5 border border-zinc-200/80 shadow-sm flex items-start gap-3.5"
                    >
                      <div className="w-10 h-10 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center shrink-0">
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-xs sm:text-sm font-black text-zinc-900">
                          {adv.title}
                        </h3>
                        <p className="text-xs text-zinc-500 mt-0.5">{adv.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* 5-Category Interactive Strip */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-zinc-900">
                    Wholesale Electronics Categories
                  </h2>
                  <p className="text-xs text-zinc-500">
                    Direct import distribution across 5 core high-margin retail
                    departments
                  </p>
                </div>
                <button
                  onClick={() => {
                    setSelectedCategory('All');
                    setActiveView('catalog');
                  }}
                  className="text-xs font-bold text-orange-600 hover:underline"
                >
                  View All 12+ SKUs →
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                {CATEGORY_CARDS.map((cat) => (
                  <div
                    key={cat.name}
                    onClick={() => {
                      setSelectedCategory(cat.name);
                      setActiveView('catalog');
                    }}
                    className="bg-white rounded-2xl overflow-hidden border border-zinc-200/90 shadow-sm hover:shadow-md hover:border-orange-400 transition cursor-pointer group flex flex-col"
                  >
                    <div className="h-36 overflow-hidden">
                      <ProductImage src={cat.image} alt={cat.name} />
                    </div>
                    <div className="p-4 flex-1 flex flex-col justify-between">
                      <div>
                        <h3 className="text-sm font-black text-zinc-900 group-hover:text-orange-600 transition">
                          {cat.name}
                        </h3>
                        <p className="text-[11px] text-zinc-500 mt-1 line-clamp-2">
                          {cat.subtitle}
                        </p>
                      </div>
                      <span className="text-[11px] font-bold text-orange-600 mt-3 inline-flex items-center gap-1">
                        Browse Bulk Stock <ChevronRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Featured Bulk Deals Grid */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
                <div>
                  <span className="px-3 py-1 rounded-full text-[11px] font-black bg-orange-100 text-orange-700">
                    HIGH-MARGIN RETAILER PICKS
                  </span>
                  <h2 className="text-xl sm:text-2xl font-black text-zinc-900 mt-2">
                    Featured Bulk Deals & Tiered Pricing Preview
                  </h2>
                </div>
                <button
                  onClick={() => setActiveView('catalog')}
                  className="text-xs font-bold text-orange-600 hover:underline"
                >
                  Explore Full Wholesale Catalog →
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {products.slice(0, 8).map((product) => {
                  const available = product.physicalStock - product.reservedStock;
                  const estMarginPct = Math.round(
                    ((product.retailPrice - product.goldPrice) /
                      product.retailPrice) *
                      100
                  );
                  return (
                    <div
                      key={product.id}
                      className="bg-white rounded-2xl border border-zinc-200/90 shadow-sm hover:shadow-xl hover:border-orange-300 transition flex flex-col overflow-hidden"
                    >
                      <div
                        onClick={() => openProductModal(product)}
                        className="relative h-52 cursor-pointer"
                      >
                        <ProductImage src={product.images[0]} alt={product.name} />
                        <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-black bg-zinc-900/90 text-white">
                          MOQ: {product.moq} Units
                        </span>
                        <span className="absolute top-3 right-3 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {available} In Stock
                        </span>
                        <span className="absolute bottom-2.5 left-3 px-2 py-0.5 rounded-lg text-[10px] font-bold bg-orange-500 text-white">
                          Up to {estMarginPct}% Resale Margin
                        </span>
                      </div>

                      <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
                        <div>
                          <div className="flex items-center justify-between text-[10px] font-mono text-zinc-400">
                            <span>{product.sku}</span>
                            <span>{product.warrantyPeriod} Warranty</span>
                          </div>
                          <h3
                            onClick={() => openProductModal(product)}
                            className="text-sm font-black text-zinc-900 mt-1 line-clamp-2 hover:text-orange-600 cursor-pointer"
                          >
                            {product.name}
                          </h3>
                        </div>

                        {/* 3-Tier Wholesale Price Strip */}
                        <div className="grid grid-cols-3 gap-1.5 bg-zinc-50 p-2 rounded-xl border border-zinc-200/70 text-center">
                          <div>
                            <p className="text-[9px] font-bold text-zinc-400 uppercase">
                              1–9 Bronze
                            </p>
                            <p className="text-xs font-bold text-zinc-800">
                              {formatPrice(product.bronzePrice)}
                            </p>
                          </div>
                          <div className="border-x border-zinc-200">
                            <p className="text-[9px] font-bold text-blue-600 uppercase">
                              10–49 Silver
                            </p>
                            <p className="text-xs font-bold text-blue-600">
                              {formatPrice(product.silverPrice)}
                            </p>
                          </div>
                          <div>
                            <p className="text-[9px] font-bold text-emerald-600 uppercase">
                              50+ Gold
                            </p>
                            <p className="text-xs font-black text-emerald-600">
                              {formatPrice(product.goldPrice)}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              addToCart(product.id, product.moq);
                              triggerToast(
                                `Added ${product.moq}x ${product.name} (MOQ) to Bulk Order`
                              );
                            }}
                            className="flex-1 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold transition shadow-sm"
                          >
                            Add MOQ ({product.moq})
                          </button>
                          <button
                            onClick={() => openProductModal(product)}
                            className="px-3 py-2.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-xs font-bold transition"
                          >
                            Tiers
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          </div>
        )}

        {/* CATALOG / BULK DEALS / NEW ARRIVALS VIEW */}
        {(activeView === 'catalog' ||
          activeView === 'bulk-deals' ||
          activeView === 'new-arrivals') && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
            {/* Filter & Sort Control Bar */}
            <div className="bg-white rounded-3xl p-5 border border-zinc-200 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-1.5 text-xs font-black text-zinc-900 mr-1">
                  <SlidersHorizontal className="w-4 h-4 text-orange-500" />
                  <span>Filter Catalog:</span>
                </div>

                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="rounded-xl border border-zinc-300 px-3 py-2 text-xs font-semibold bg-white"
                >
                  <option value="All">All 5 Categories</option>
                  {CATEGORY_CARDS.map((c) => (
                    <option key={c.name} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </select>

                <select
                  value={selectedBrand}
                  onChange={(e) => setSelectedBrand(e.target.value)}
                  className="rounded-xl border border-zinc-300 px-3 py-2 text-xs font-semibold bg-white"
                >
                  {brands.map((b) => (
                    <option key={b} value={b}>
                      {b === 'All' ? 'All Brands' : b}
                    </option>
                  ))}
                </select>

                <select
                  value={maxMoqFilter}
                  onChange={(e) => setMaxMoqFilter(Number(e.target.value))}
                  className="rounded-xl border border-zinc-300 px-3 py-2 text-xs font-semibold bg-white"
                >
                  <option value={50}>Any MOQ</option>
                  <option value={5}>MOQ ≤ 5 Units</option>
                  <option value={10}>MOQ ≤ 10 Units</option>
                </select>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-xs text-zinc-500 font-semibold">
                  Showing <strong>{filteredProducts.length}</strong> Wholesale SKUs
                </span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                  className="rounded-xl border border-zinc-300 px-3 py-2 text-xs font-bold bg-zinc-50"
                >
                  <option value="featured">Sort: Best Selling</option>
                  <option value="lowest-moq">Sort: Lowest MOQ</option>
                  <option value="price-asc">Sort: Price Low to High</option>
                  <option value="newest">Sort: Newest Arrivals</option>
                </select>
              </div>
            </div>

            {/* Product Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {filteredProducts.map((product) => {
                const available = product.physicalStock - product.reservedStock;
                const isSaved = wishlist.includes(product.id);
                return (
                  <div
                    key={product.id}
                    className="bg-white rounded-2xl border border-zinc-200/90 shadow-sm hover:shadow-xl transition flex flex-col overflow-hidden"
                  >
                    <div className="relative h-52">
                      <div
                        onClick={() => openProductModal(product)}
                        className="w-full h-full cursor-pointer"
                      >
                        <ProductImage src={product.images[0]} alt={product.name} />
                      </div>
                      <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-black bg-zinc-900/90 text-white">
                        MOQ: {product.moq} Units
                      </span>
                      <button
                        onClick={() => toggleWishlist(product.id)}
                        className={`absolute top-3 right-3 p-2 rounded-full transition ${
                          isSaved
                            ? 'bg-orange-500 text-white'
                            : 'bg-white/90 text-zinc-700 hover:bg-white'
                        }`}
                      >
                        <Heart className="w-3.5 h-3.5" />
                      </button>
                      <span className="absolute bottom-2.5 right-3 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {available} Available
                      </span>
                    </div>

                    <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
                      <div>
                        <p className="text-[10px] font-mono text-zinc-400">
                          {product.sku} • {product.brand}
                        </p>
                        <h3
                          onClick={() => openProductModal(product)}
                          className="text-sm font-black text-zinc-900 mt-1 line-clamp-2 hover:text-orange-600 cursor-pointer"
                        >
                          {product.name}
                        </h3>
                        <p className="text-[11px] text-zinc-500 mt-1 line-clamp-1">
                          {product.specs[0]}
                        </p>
                      </div>

                      <div className="grid grid-cols-3 gap-1 bg-zinc-50 p-2 rounded-xl border border-zinc-200/70 text-center">
                        <div>
                          <p className="text-[9px] font-bold text-zinc-400">1–9</p>
                          <p className="text-xs font-bold text-zinc-800">
                            {formatPrice(product.bronzePrice)}
                          </p>
                        </div>
                        <div className="border-x border-zinc-200">
                          <p className="text-[9px] font-bold text-blue-600">10–49</p>
                          <p className="text-xs font-bold text-blue-600">
                            {formatPrice(product.silverPrice)}
                          </p>
                        </div>
                        <div>
                          <p className="text-[9px] font-bold text-emerald-600">50+</p>
                          <p className="text-xs font-black text-emerald-600">
                            {formatPrice(product.goldPrice)}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => openProductModal(product)}
                          className="py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold transition"
                        >
                          Bulk Calculator
                        </button>
                        <button
                          onClick={() => openQuoteModal(product)}
                          className="py-2.5 rounded-xl border border-zinc-300 hover:bg-zinc-100 text-zinc-800 text-xs font-bold transition"
                        >
                          Custom Quote
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* INFORMATIONAL B2B PAGES (STRICTLY LOCATION-ANONYMOUS) */}
        {(activeView === 'how-to-order' ||
          activeView === 'delivery' ||
          activeView === 'warranty-policy' ||
          activeView === 'about' ||
          activeView === 'contact') && (
          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 space-y-8">
            <div className="bg-white rounded-3xl p-6 sm:p-10 border border-zinc-200 shadow-sm space-y-6">
              {activeView === 'how-to-order' && (
                <>
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-orange-100 text-orange-700">
                    WHOLESALE PROCUREMENT GUIDE
                  </span>
                  <h1 className="text-2xl sm:text-3xl font-black text-zinc-900">
                    How to Place Bulk Orders & Request Custom Quotes
                  </h1>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-2">
                    {[
                      {
                        step: '01',
                        title: 'Select SKUs & Meet MOQ',
                        desc: 'Browse our live catalog. Adjust quantities above the Minimum Order Quantity (MOQ) to unlock automated Bronze (1–9), Silver (10–49), or Gold (50+) tier pricing.',
                      },
                      {
                        step: '02',
                        title: 'Add to Bulk Order or Request Quote',
                        desc: 'Checkout directly at the tier price or open the Quotation Builder for custom high-volume negotiation (#Q-1048).',
                      },
                      {
                        step: '03',
                        title: 'Instant Invoice & Doorstep Dispatch',
                        desc: 'Pay via Mobile Money, Card, Direct Bank Transfer, or Proforma Invoice. Every batch is serial-logged and dispatched via Direct Warehouse-to-Doorstep Delivery.',
                      },
                    ].map((s) => (
                      <div
                        key={s.step}
                        className="p-5 rounded-2xl bg-zinc-50 border border-zinc-200 space-y-2"
                      >
                        <span className="text-2xl font-black text-orange-500">
                          {s.step}
                        </span>
                        <h3 className="text-sm font-black text-zinc-900">{s.title}</h3>
                        <p className="text-xs text-zinc-600 leading-relaxed">
                          {s.desc}
                        </p>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {activeView === 'delivery' && (
                <>
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-orange-100 text-orange-700">
                    LOGISTICS & FREIGHT PROTOCOL
                  </span>
                  <h1 className="text-2xl sm:text-3xl font-black text-zinc-900">
                    Direct Warehouse-to-Doorstep Delivery & Standard Freight
                  </h1>
                  <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed">
                    All wholesale orders are picked, QC-inspected, and shrink-wrapped
                    directly from our central distribution fulfillment racks and
                    dispatched straight to your designated retail doorstep or
                    receiving bay.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                    <div className="p-5 rounded-2xl bg-zinc-50 border border-zinc-200 space-y-1.5">
                      <p className="font-black text-zinc-900 text-sm">
                        Small Parcel Courier (0–10 kg)
                      </p>
                      <p className="text-zinc-600">
                        Ideal for restocking smartwatches, GaN chargers, earbuds, and
                        controllers. Tamper-evident security seals included.
                      </p>
                    </div>
                    <div className="p-5 rounded-2xl bg-zinc-50 border border-zinc-200 space-y-1.5">
                      <p className="font-black text-zinc-900 text-sm">
                        Medium Van / Carton Freight (10–40 kg)
                      </p>
                      <p className="text-zinc-600">
                        Multi-carton protective shipping for audio speakers, keyboards,
                        and mixed retail electronics bundles.
                      </p>
                    </div>
                    <div className="p-5 rounded-2xl bg-zinc-50 border border-zinc-200 space-y-1.5">
                      <p className="font-black text-zinc-900 text-sm">
                        Large Dedicated Freight Truck (40+ kg)
                      </p>
                      <p className="text-zinc-600">
                        Palletized, high-volume transport for home appliances,
                        microwaves, air fryers, and distributor orders.
                      </p>
                    </div>
                  </div>
                </>
              )}

              {activeView === 'warranty-policy' && (
                <>
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700">
                    SERIAL / IMEI VERIFIED PROTECTION
                  </span>
                  <h1 className="text-2xl sm:text-3xl font-black text-zinc-900">
                    Official Wholesale Warranty Policy (6 to 24 Months)
                  </h1>
                  <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed">
                    Every electronic unit shipped by {settings.brandName} has its batch
                    Serial Number or IMEI recorded against your commercial invoice.
                    Retailers can lodge warranty claims directly inside the Partner
                    Portal and track status from{' '}
                    <strong>
                      Submitted → Inspection → Approved → Replacement Sent → Closed
                    </strong>
                    .
                  </p>
                </>
              )}

              {activeView === 'about' && (
                <>
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-orange-100 text-orange-700">
                    ABOUT {settings.brandName.toUpperCase()}
                  </span>
                  <h1 className="text-2xl sm:text-3xl font-black text-zinc-900">
                    Built for Modern Electronics Retailers & Bulk Buyers
                  </h1>
                  <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed">
                    {settings.brandName} eliminates middlemen by importing high-demand
                    consumer electronics, gaming peripherals, audio gear, smart
                    lighting, and home appliances directly from vetted factories. Our
                    transparent Bronze, Silver, and Gold volume tiers protect your
                    retail resale margins while giving you real-time visibility into
                    available inventory.
                  </p>
                </>
              )}

              {activeView === 'contact' && (
                <>
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-orange-100 text-orange-700">
                    DIGITAL WHOLESALE DESK
                  </span>
                  <h1 className="text-2xl sm:text-3xl font-black text-zinc-900">
                    Contact Wholesale Sales & Support
                  </h1>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                    <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200 flex items-center gap-3">
                      <Mail className="w-5 h-5 text-orange-500 shrink-0" />
                      <div>
                        <p className="text-zinc-400 font-bold">Official Support Email</p>
                        <p className="font-black text-zinc-900">
                          {settings.supportEmail}
                        </p>
                      </div>
                    </div>
                    <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200 flex items-center gap-3">
                      <MessageSquare className="w-5 h-5 text-emerald-600 shrink-0" />
                      <div>
                        <p className="text-zinc-400 font-bold">
                          WhatsApp / Live Chat Inquiry
                        </p>
                        <p className="font-black text-zinc-900">
                          {settings.whatsappNumber}
                        </p>
                      </div>
                    </div>
                    <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200 flex items-center gap-3">
                      <Clock className="w-5 h-5 text-blue-600 shrink-0" />
                      <div>
                        <p className="text-zinc-400 font-bold">Business Hours</p>
                        <p className="font-black text-zinc-900">
                          {settings.businessHours}
                        </p>
                      </div>
                    </div>
                  </div>

                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      triggerToast(
                        'Wholesale inquiry received! Our digital desk will respond shortly.'
                      );
                    }}
                    className="space-y-4 pt-4 border-t border-zinc-200 text-xs"
                  >
                    <h3 className="text-sm font-black text-zinc-900">
                      Send Direct Wholesale / Custom Volume Inquiry
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <input
                        type="text"
                        required
                        placeholder="Business / Retail Store Name"
                        className="rounded-xl border border-zinc-300 px-3.5 py-2.5"
                      />
                      <input
                        type="email"
                        required
                        placeholder="Official Email Address"
                        className="rounded-xl border border-zinc-300 px-3.5 py-2.5"
                      />
                    </div>
                    <textarea
                      rows={3}
                      required
                      placeholder="Specify SKUs, target quantities, or partnership questions..."
                      className="w-full rounded-xl border border-zinc-300 p-3.5"
                    />
                    <button
                      type="submit"
                      className="px-6 py-3 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-bold"
                    >
                      Send Digital Wholesale Inquiry
                    </button>
                  </form>
                </>
              )}
            </div>
          </div>
        )}
      </main>

      {/* B2B DETAILED PRODUCT MODAL WITH INTERACTIVE TIER PRICING TABLE */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 bg-zinc-900/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-4xl w-full shadow-2xl border border-zinc-200 overflow-hidden my-8">
            <div className="flex items-center justify-between px-6 py-4 bg-zinc-900 text-white">
              <div className="flex items-center gap-2 text-xs">
                <span className="font-mono px-2.5 py-0.5 rounded bg-orange-500 font-bold">
                  {selectedProduct.sku}
                </span>
                <span className="text-zinc-300">{selectedProduct.category}</span>
              </div>
              <button
                onClick={() => setSelectedProduct(null)}
                className="p-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 sm:p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Left: High-Res Gallery & Multi-Angle Thumbnails */}
              <div className="space-y-3">
                <div className="h-72 sm:h-80 rounded-2xl overflow-hidden border border-zinc-200">
                  <ProductImage
                    src={selectedProduct.images[activeImageIdx]}
                    alt={selectedProduct.name}
                  />
                </div>
                {selectedProduct.images.length > 1 && (
                  <div className="flex gap-2.5">
                    {selectedProduct.images.map((img, i) => (
                      <button
                        key={i}
                        onClick={() => setActiveImageIdx(i)}
                        className={`w-16 h-16 rounded-xl overflow-hidden border-2 ${
                          activeImageIdx === i
                            ? 'border-orange-500'
                            : 'border-zinc-200'
                        }`}
                      >
                        <ProductImage src={img} alt="Thumb" enableZoom={false} />
                      </button>
                    ))}
                  </div>
                )}

                <div className="bg-zinc-50 p-4 rounded-2xl border border-zinc-200 text-xs space-y-1.5">
                  <p className="font-bold text-zinc-900">Technical Specifications:</p>
                  <ul className="list-disc list-inside text-zinc-600 space-y-1">
                    {selectedProduct.specs.map((s, idx) => (
                      <li key={idx}>{s}</li>
                    ))}
                  </ul>
                  <p className="text-[11px] text-zinc-500 pt-1">
                    Brand: <strong>{selectedProduct.brand}</strong> • Model:{' '}
                    <strong>{selectedProduct.model}</strong> • Colour:{' '}
                    <strong>{selectedProduct.color}</strong> • Official Warranty:{' '}
                    <strong>{selectedProduct.warrantyPeriod}</strong>
                  </p>
                </div>
              </div>

              {/* Right: Live Stock, MOQ Enforcement & Interactive Tier Table */}
              {(() => {
                const available =
                  selectedProduct.physicalStock - selectedProduct.reservedStock;
                const activeCalc = getTierInfo(selectedProduct, detailQty);

                return (
                  <div className="space-y-5 flex flex-col justify-between">
                    <div className="space-y-4">
                      <div>
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            {available} units available for immediate dispatch
                          </span>
                          <span className="px-3 py-1 rounded-full text-xs font-bold bg-zinc-900 text-white">
                            MOQ: {selectedProduct.moq} units
                          </span>
                        </div>
                        <h2 className="text-xl sm:text-2xl font-black text-zinc-900">
                          {selectedProduct.name}
                        </h2>
                        <p className="text-xs text-zinc-500 mt-1">
                          Suggested Retail MSRP:{' '}
                          <strong className="text-zinc-800">
                            {formatPrice(selectedProduct.retailPrice)}
                          </strong>
                        </p>
                      </div>

                      {/* Interactive Wholesale Tier Pricing Table */}
                      <div className="space-y-2">
                        <p className="text-xs font-black uppercase tracking-wider text-zinc-400">
                          Interactive Wholesale Volume Tiers
                        </p>
                        <div className="grid grid-cols-3 gap-2.5">
                          {[
                            {
                              tier: 'Bronze' as const,
                              range: '1–9 Units',
                              price: selectedProduct.bronzePrice,
                              tag: 'Base Wholesale',
                            },
                            {
                              tier: 'Silver' as const,
                              range: '10–49 Units',
                              price: selectedProduct.silverPrice,
                              tag: '~8% Volume Off',
                            },
                            {
                              tier: 'Gold' as const,
                              range: '50+ Units',
                              price: selectedProduct.goldPrice,
                              tag: 'Max Bulk Discount',
                            },
                          ].map((t) => {
                            const isActive = activeCalc.tier === t.tier;
                            return (
                              <div
                                key={t.tier}
                                onClick={() =>
                                  setDetailQty(
                                    t.tier === 'Gold'
                                      ? 50
                                      : t.tier === 'Silver'
                                      ? Math.max(selectedProduct.moq, 10)
                                      : selectedProduct.moq
                                  )
                                }
                                className={`p-3 rounded-2xl border-2 cursor-pointer transition text-center ${
                                  isActive
                                    ? 'border-orange-500 bg-orange-50/70 shadow-sm'
                                    : 'border-zinc-200 bg-white hover:border-zinc-300'
                                }`}
                              >
                                <p className="text-[10px] font-black uppercase text-zinc-500">
                                  {t.tier} ({t.range})
                                </p>
                                <p className="text-base font-black text-zinc-900 mt-1">
                                  {formatPrice(t.price)}
                                </p>
                                <p className="text-[10px] font-semibold text-orange-600 mt-0.5">
                                  {t.tag}
                                </p>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Quantity Selector with MOQ Enforcement */}
                      <div className="bg-zinc-50 p-4 rounded-2xl border border-zinc-200 space-y-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <label className="block text-xs font-bold text-zinc-800">
                              Order Quantity (Min MOQ: {selectedProduct.moq})
                            </label>
                            <span className="text-[11px] text-orange-600 font-semibold">
                              Active Tier: {activeCalc.tier} Wholesale Rate
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() =>
                                setDetailQty(
                                  Math.max(selectedProduct.moq, detailQty - 5)
                                )
                              }
                              className="p-2 rounded-xl bg-white border border-zinc-300 hover:bg-zinc-100"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <input
                              type="number"
                              min={selectedProduct.moq}
                              max={available}
                              value={detailQty}
                              onChange={(e) =>
                                setDetailQty(
                                  Math.max(
                                    selectedProduct.moq,
                                    Number(e.target.value) || selectedProduct.moq
                                  )
                                )
                              }
                              className="w-20 text-center font-black text-sm py-1.5 rounded-xl border border-zinc-300 bg-white"
                            />
                            <button
                              type="button"
                              onClick={() =>
                                setDetailQty(Math.min(available, detailQty + 5))
                              }
                              className="p-2 rounded-xl bg-white border border-zinc-300 hover:bg-zinc-100"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        <div className="border-t border-zinc-200 pt-3 grid grid-cols-3 gap-2 text-xs">
                          <div>
                            <p className="text-zinc-400">Calculated Total</p>
                            <p className="text-base font-black text-zinc-900">
                              {formatPrice(activeCalc.unitPrice * detailQty)}
                            </p>
                          </div>
                          <div>
                            <p className="text-zinc-400">Tier Savings</p>
                            <p className="text-sm font-bold text-emerald-600">
                              {formatPrice(activeCalc.totalSavings)}
                            </p>
                          </div>
                          <div>
                            <p className="text-zinc-400">Est. Resale Profit</p>
                            <p className="text-sm font-black text-orange-600">
                              +{formatPrice(activeCalc.estimatedResaleProfit)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Dual Action Buttons */}
                    <div className="space-y-2.5 pt-2">
                      <button
                        onClick={() => {
                          addToCart(selectedProduct.id, detailQty);
                          setSelectedProduct(null);
                          setIsCartOpen(true);
                        }}
                        className="w-full py-3.5 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-black text-xs sm:text-sm shadow-lg shadow-orange-500/25 transition"
                      >
                        Add to Bulk Order ({detailQty} Units @{' '}
                        {formatPrice(activeCalc.unitPrice)})
                      </button>
                      <button
                        onClick={() => {
                          const prod = selectedProduct;
                          setSelectedProduct(null);
                          openQuoteModal(prod, detailQty);
                        }}
                        className="w-full py-3 rounded-2xl bg-zinc-900 hover:bg-zinc-800 text-white font-bold text-xs transition"
                      >
                        Request Custom Wholesale Quote
                      </button>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}

      {/* BULK CART & CHECKOUT DRAWER */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 bg-zinc-900/70 backdrop-blur-sm flex justify-end">
          <div className="bg-white w-full max-w-lg h-full flex flex-col justify-between shadow-2xl overflow-y-auto">
            <div className="p-6 border-b border-zinc-200 flex items-center justify-between bg-zinc-900 text-white">
              <div>
                <h3 className="text-base font-black">
                  Bulk Wholesale Cart & Checkout
                </h3>
                <p className="text-xs text-zinc-400">
                  Automated Bronze / Silver / Gold Tier Calculation
                </p>
              </div>
              <button
                onClick={() => setIsCartOpen(false)}
                className="p-2 rounded-xl bg-zinc-800 text-zinc-300"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {cartDetails.enriched.length === 0 ? (
              <div className="p-10 text-center space-y-3">
                <ShoppingCart className="w-10 h-10 text-zinc-300 mx-auto" />
                <p className="text-sm font-bold text-zinc-700">
                  Your wholesale bulk cart is empty
                </p>
                <button
                  onClick={() => {
                    setIsCartOpen(false);
                    setActiveView('catalog');
                  }}
                  className="px-5 py-2.5 rounded-xl bg-orange-500 text-white text-xs font-bold"
                >
                  Browse Wholesale Catalog
                </button>
              </div>
            ) : (
              <form
                onSubmit={handleCheckoutSubmit}
                className="p-6 space-y-6 flex-1 overflow-y-auto text-xs"
              >
                {/* Cart Items */}
                <div className="space-y-3">
                  {cartDetails.enriched.map(({ product, quantity, tierInfo }) => (
                    <div
                      key={product.id}
                      className="p-3.5 rounded-2xl bg-zinc-50 border border-zinc-200 flex items-center justify-between gap-3"
                    >
                      <div className="flex-1">
                        <p className="font-bold text-zinc-900 line-clamp-1">
                          {product.name}
                        </p>
                        <p className="text-[11px] text-zinc-500">
                          MOQ: {product.moq} •{' '}
                          <span className="text-orange-600 font-bold">
                            {tierInfo.tier} Tier ({formatPrice(tierInfo.unitPrice)}/u)
                          </span>
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <input
                          type="number"
                          min={product.moq}
                          value={quantity}
                          onChange={(e) =>
                            updateCartQty(product.id, Number(e.target.value))
                          }
                          className="w-16 rounded-lg border border-zinc-300 px-2 py-1 text-center font-bold bg-white"
                        />
                        <button
                          type="button"
                          onClick={() => removeFromCart(product.id)}
                          className="p-1.5 text-zinc-400 hover:text-red-600"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Delivery Tier & Payment Selection */}
                <div className="space-y-3 pt-2 border-t border-zinc-200">
                  <div className="p-3.5 rounded-2xl bg-orange-50/70 border border-orange-200">
                    <p className="font-bold text-zinc-900 flex items-center gap-1.5">
                      <Truck className="w-4 h-4 text-orange-500" />
                      Assigned Logistics: {cartDetails.deliveryTier}
                    </p>
                    <p className="text-[11px] text-zinc-600 mt-0.5">
                      Total Batch Weight: {cartDetails.totalWeightKg.toFixed(1)} kg •
                      Direct Warehouse-to-Doorstep Delivery
                    </p>
                  </div>

                  <div>
                    <label className="block font-bold text-zinc-700 mb-1">
                      Wholesale Payment Method
                    </label>
                    <select
                      value={paymentMethod}
                      onChange={(e) =>
                        setPaymentMethod(e.target.value as PaymentMethod)
                      }
                      className="w-full rounded-xl border border-zinc-300 px-3 py-2.5 font-bold bg-white"
                    >
                      <option value="Mobile Money">
                        Mobile Money (Instant Prompt + Reference Code)
                      </option>
                      <option value="Card Payment">
                        Corporate Card Payment (Instant Confirmation)
                      </option>
                      <option value="Direct Bank Transfer">
                        Direct Bank Transfer (EFT / RTGS)
                      </option>
                      <option value="Proforma Invoice">
                        Request Proforma Invoice / Pay on Invoice
                      </option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-zinc-700 mb-1">
                      Transaction / Proforma Reference Code
                    </label>
                    <input
                      type="text"
                      required
                      value={paymentRef}
                      onChange={(e) => setPaymentRef(e.target.value)}
                      className="w-full rounded-xl border border-zinc-300 px-3 py-2 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-zinc-700 mb-1">
                      Doorstep Receiving Instructions
                    </label>
                    <input
                      type="text"
                      value={deliveryNotes}
                      onChange={(e) => setDeliveryNotes(e.target.value)}
                      className="w-full rounded-xl border border-zinc-300 px-3 py-2"
                    />
                  </div>
                </div>

                {/* Totals */}
                <div className="bg-zinc-900 text-white p-5 rounded-2xl space-y-2">
                  <div className="flex justify-between text-zinc-300">
                    <span>Wholesale Subtotal:</span>
                    <span>{formatPrice(cartDetails.subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-emerald-400">
                    <span>Volume Tier Savings:</span>
                    <span>-{formatPrice(cartDetails.tierSavings)}</span>
                  </div>
                  <div className="flex justify-between text-zinc-300">
                    <span>Freight ({cartDetails.deliveryTier}):</span>
                    <span>{formatPrice(cartDetails.shippingCost)}</span>
                  </div>
                  <div className="border-t border-zinc-700 pt-2 flex justify-between text-base font-black">
                    <span>Grand Total:</span>
                    <span className="text-orange-400">
                      {formatPrice(cartDetails.grandTotal)}
                    </span>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-black text-sm shadow-lg shadow-orange-500/25 transition"
                >
                  Confirm Wholesale Order & Generate Invoice
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* CUSTOM WHOLESALE QUOTE BUILDER MODAL */}
      {quoteModalProduct && (
        <div className="fixed inset-0 z-50 bg-zinc-900/70 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleCustomQuoteSubmit}
            className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 border border-zinc-200 shadow-2xl space-y-4 text-xs"
          >
            <div className="flex items-center justify-between border-b border-zinc-200 pb-3">
              <h3 className="text-base font-black text-zinc-900">
                Request Custom Wholesale Quote
              </h3>
              <button
                type="button"
                onClick={() => setQuoteModalProduct(null)}
                className="p-1.5 rounded-xl bg-zinc-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3.5 rounded-2xl bg-zinc-50 border border-zinc-200">
              <p className="font-mono text-zinc-400">{quoteModalProduct.sku}</p>
              <p className="font-bold text-zinc-900 text-sm">
                {quoteModalProduct.name}
              </p>
              <p className="text-zinc-500 mt-0.5">
                Standard Gold Rate (50+):{' '}
                <strong>{formatPrice(quoteModalProduct.goldPrice)}</strong>
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-zinc-700 mb-1">
                  Target Bulk Quantity (MOQ {quoteModalProduct.moq})
                </label>
                <input
                  type="number"
                  min={quoteModalProduct.moq}
                  required
                  value={quoteQty}
                  onChange={(e) => setQuoteQty(Number(e.target.value))}
                  className="w-full rounded-xl border border-zinc-300 px-3 py-2 font-bold"
                />
              </div>
              <div>
                <label className="block font-bold text-zinc-700 mb-1">
                  Target Unit Price ($)
                </label>
                <input
                  type="number"
                  step="0.5"
                  required
                  value={quoteTargetPrice}
                  onChange={(e) => setQuoteTargetPrice(Number(e.target.value))}
                  className="w-full rounded-xl border border-zinc-300 px-3 py-2 font-bold"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-zinc-700 mb-1">
                Negotiation Notes / Restock Schedule
              </label>
              <textarea
                rows={3}
                value={quoteNotes}
                onChange={(e) => setQuoteNotes(e.target.value)}
                className="w-full rounded-xl border border-zinc-300 p-3"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3.5 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-black text-xs shadow-lg shadow-orange-500/25"
            >
              Submit Formal Wholesale Quote Request
            </button>
          </form>
        </div>
      )}

      {/* PRINTABLE COMMERCIAL INVOICE / PROFORMA QUOTE MODAL */}
      {(invoiceOrder || invoiceQuote) && (
        <InvoiceModal
          order={invoiceOrder}
          quote={invoiceQuote}
          onClose={() => {
            setInvoiceOrder(null);
            setInvoiceQuote(null);
          }}
        />
      )}

      {/* FOOTER (STRICTLY DIGITAL CHANNELS ONLY — NO PHYSICAL ADDRESS) */}
      <footer className="bg-zinc-900 text-zinc-400 text-xs mt-auto border-t border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-orange-500 flex items-center justify-center text-white font-black text-base">
                S
              </div>
              <span className="text-lg font-black text-white">
                {settings.brandName}
              </span>
            </div>
            <p className="text-zinc-400 leading-relaxed">
              Direct Import & Bulk Electronics Distribution. Live inventory
              visibility, automated volume tier discounts, and Direct
              Warehouse-to-Doorstep Delivery.
            </p>
          </div>

          <div>
            <p className="font-bold text-white uppercase tracking-wider mb-3">
              Wholesale Departments
            </p>
            <ul className="space-y-2">
              {CATEGORY_CARDS.map((c) => (
                <li key={c.name}>
                  <button
                    onClick={() => {
                      setSelectedCategory(c.name);
                      setActiveView('catalog');
                    }}
                    className="hover:text-orange-400 transition"
                  >
                    {c.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="font-bold text-white uppercase tracking-wider mb-3">
              Partner Resources
            </p>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => setActiveView('account')}
                  className="hover:text-orange-400"
                >
                  Retailer Account Portal
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveView('how-to-order')}
                  className="hover:text-orange-400"
                >
                  How to Order & Tier Guide
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveView('delivery')}
                  className="hover:text-orange-400"
                >
                  Direct Warehouse-to-Doorstep Delivery
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveView('warranty-policy')}
                  className="hover:text-orange-400"
                >
                  Official Warranty Policy & IMEI Tracker
                </button>
              </li>
            </ul>
          </div>

          <div className="space-y-2">
            <p className="font-bold text-white uppercase tracking-wider mb-3">
              Digital Wholesale Desk
            </p>
            <p>Support Email: {settings.supportEmail}</p>
            <p>WhatsApp / Live Chat: {settings.whatsappNumber}</p>
            <p>Hours: {settings.businessHours}</p>
            <button
              onClick={() => setActiveView('contact')}
              className="mt-2 px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold inline-block transition"
            >
              Open Wholesale Inquiry Form
            </button>
          </div>
        </div>
        <div className="border-t border-zinc-800 py-4 text-center text-[11px] text-zinc-500">
          © {new Date().getFullYear()} {settings.brandName} Wholesale Distribution.
          All rights reserved.
        </div>
      </footer>

      {/* MOBILE BOTTOM NAVIGATION BAR (Responsive Phone Ergonomics) */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-white border-t border-zinc-200 px-2 py-1.5 grid grid-cols-5 text-[10px] font-bold text-zinc-600 shadow-lg">
        {[
          { id: 'home', label: 'Home', icon: Home },
          { id: 'catalog', label: 'Catalog', icon: Grid },
          { id: 'bulk-deals', label: 'Bulk Deals', icon: Award },
          { id: 'account', label: 'Partner', icon: UserCheck },
          { id: 'admin', label: 'Admin', icon: Lock },
        ].map((item) => {
          const Icon = item.icon;
          const active = activeView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                if (item.id === 'admin') {
                  if (activeView === 'admin') { setRole('retailer'); setActiveView('home'); sessionStorage.removeItem('sokonova_admin_token'); }
                  else { setShowAdminLogin(true); }
                } else { setActiveView(item.id as ActiveView); }
              }}
              className={`flex flex-col items-center justify-center py-1 rounded-xl ${
                active ? 'text-orange-600 font-black' : 'text-zinc-500'
              }`}
            >
              <Icon className="w-4 h-4 mb-0.5" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}