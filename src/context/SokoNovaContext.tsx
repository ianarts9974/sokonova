'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Product,
  CartItem,
  Order,
  QuoteRequest,
  RetailerProfile,
  WarrantyClaim,
  StoreSettings,
  UserRole,
  OrderStatus,
  WarrantyStatus,
} from '@/types';
import {
  INITIAL_PRODUCTS,
  INITIAL_ORDERS,
  INITIAL_QUOTES,
  INITIAL_RETAILERS,
  INITIAL_WARRANTIES,
  INITIAL_SETTINGS,
} from '@/data/seed';
import {
  saveOrderToCloud,
  saveQuoteToCloud,
  updateOrderStatusInCloud,
  updateQuoteStatusInCloud,
  saveWarrantyClaimToCloud,
  fetchOrdersFromCloud,
  fetchQuotesFromCloud,
  subscribeToCloudChanges,
} from '@/lib/db';

// Fire-and-forget notification helper (never blocks the UI)
async function sendNotification(type: 'order' | 'quote', data: Order | QuoteRequest) {
  try {
    await fetch('/api/notify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, data }),
    });
  } catch (e) {
    console.warn('[SokoNova Notifications] Notification dispatch failed:', e);
  }
}

interface SokoNovaContextType {
  products: Product[];
  cart: CartItem[];
  wishlist: string[];
  orders: Order[];
  quotes: QuoteRequest[];
  retailers: RetailerProfile[];
  warranties: WarrantyClaim[];
  settings: StoreSettings;
  role: UserRole;
  activeRetailer: RetailerProfile;
  setRole: (role: UserRole) => void;
  formatPrice: (usdAmount: number) => string;
  getTierInfo: (product: Product, qty: number) => {
    tier: 'Bronze' | 'Silver' | 'Gold';
    unitPrice: number;
    savingsPerUnit: number;
    totalSavings: number;
    estimatedResaleProfit: number;
  };
  addToCart: (productId: string, quantity: number) => void;
  updateCartQty: (productId: string, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  toggleWishlist: (productId: string) => void;
  placeOrder: (orderData: Omit<Order, 'id' | 'createdAt' | 'status' | 'paymentVerified'>) => Order;
  submitQuoteRequest: (quoteData: Omit<QuoteRequest, 'id' | 'createdAt' | 'status'>) => QuoteRequest;
  approveAndAdjustQuote: (
    quoteId: string,
    updatedItems: QuoteRequest['items'],
    adminNote: string,
    status: QuoteRequest['status']
  ) => void;
  convertQuoteToOrder: (quoteId: string) => Order | null;
  saveProduct: (product: Product) => void;
  deleteProduct: (productId: string) => void;
  adjustInventory: (productId: string, physicalDelta: number, reservedDelta: number, binCode?: string) => void;
  updateOrderStatus: (orderId: string, status: OrderStatus, paymentVerified?: boolean) => void;
  submitWarrantyClaim: (claim: Omit<WarrantyClaim, 'id' | 'createdAt' | 'status' | 'adminResolutionNote'>) => void;
  updateWarrantyStatus: (claimId: string, status: WarrantyStatus, resolutionNote: string) => void;
  updateRetailerProfile: (profile: RetailerProfile) => void;
  registerRetailer: (profile: Omit<RetailerProfile, 'id' | 'joinedAt' | 'lifetimeValue' | 'approved'>) => void;
  updateSettings: (newSettings: StoreSettings) => void;
  resetDemoData: () => void;
}

const SokoNovaContext = createContext<SokoNovaContextType | undefined>(undefined);

const STORAGE_KEY = 'sokonova_b2b_state_v1';

export const SokoNovaProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [cart, setCart] = useState<CartItem[]>([
    { productId: 'prod-1', quantity: 10 },
    { productId: 'prod-3', quantity: 20 },
  ]);
  const [wishlist, setWishlist] = useState<string[]>(['prod-2', 'prod-5']);
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);
  const [quotes, setQuotes] = useState<QuoteRequest[]>(INITIAL_QUOTES);
  const [retailers, setRetailers] = useState<RetailerProfile[]>(INITIAL_RETAILERS);
  const [warranties, setWarranties] = useState<WarrantyClaim[]>(INITIAL_WARRANTIES);
  const [settings, setSettings] = useState<StoreSettings>(INITIAL_SETTINGS);
  const [role, setRole] = useState<UserRole>('retailer');
  const [isHydrated, setIsHydrated] = useState(false);

  // Hydrate from localStorage on client mount, then sync with Supabase Cloud
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.products?.length) setProducts(parsed.products);
        if (parsed.cart) setCart(parsed.cart);
        if (parsed.wishlist) setWishlist(parsed.wishlist);
        if (parsed.orders) setOrders(parsed.orders);
        if (parsed.quotes) setQuotes(parsed.quotes);
        if (parsed.retailers) setRetailers(parsed.retailers);
        if (parsed.warranties) setWarranties(parsed.warranties);
        if (parsed.settings) setSettings(parsed.settings);
      }
    } catch (e) {
      console.warn('Failed to load local state, using seed data:', e);
    }
    setIsHydrated(true);

    // Initial sync from Supabase Cloud Database
    fetchOrdersFromCloud().then((cloudOrders) => {
      if (cloudOrders && cloudOrders.length > 0) {
        setOrders((prev) => {
          const ids = new Set(cloudOrders.map((o) => o.id));
          const localRemaining = prev.filter((o) => !ids.has(o.id));
          return [...cloudOrders, ...localRemaining];
        });
      }
    });

    fetchQuotesFromCloud().then((cloudQuotes) => {
      if (cloudQuotes && cloudQuotes.length > 0) {
        setQuotes((prev) => {
          const ids = new Set(cloudQuotes.map((q) => q.id));
          const localRemaining = prev.filter((q) => !ids.has(q.id));
          return [...cloudQuotes, ...localRemaining];
        });
      }
    });

    // Realtime Cloud Subscription: instant push whenever an order or quote is submitted on any phone
    const unsubscribe = subscribeToCloudChanges({
      onOrderUpsert: (incomingOrder) => {
        setOrders((prev) => {
          const exists = prev.some((o) => o.id === incomingOrder.id);
          if (exists) {
            return prev.map((o) => (o.id === incomingOrder.id ? incomingOrder : o));
          }
          return [incomingOrder, ...prev];
        });
      },
      onQuoteUpsert: (incomingQuote) => {
        setQuotes((prev) => {
          const exists = prev.some((q) => q.id === incomingQuote.id);
          if (exists) {
            return prev.map((q) => (q.id === incomingQuote.id ? incomingQuote : q));
          }
          return [incomingQuote, ...prev];
        });
      },
    });

    return () => {
      unsubscribe();
    };
  }, []);

  // Persist changes to localStorage
  useEffect(() => {
    if (!isHydrated) return;
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          products,
          cart,
          wishlist,
          orders,
          quotes,
          retailers,
          warranties,
          settings,
        })
      );
    } catch (e) {
      console.warn('Failed to persist state:', e);
    }
  }, [products, cart, wishlist, orders, quotes, retailers, warranties, settings, isHydrated]);

  const formatPrice = (usdAmount: number) => {
    const converted = usdAmount * (settings.currencySymbol === 'KSh' ? 130 : 1);
    return `${settings.currencySymbol} ${converted.toLocaleString(undefined, {
      minimumFractionDigits: settings.currencySymbol === '$' ? 2 : 0,
      maximumFractionDigits: settings.currencySymbol === '$' ? 2 : 0,
    })}`;
  };

  const getTierInfo = (product: Product, qty: number) => {
    let tier: 'Bronze' | 'Silver' | 'Gold' = 'Bronze';
    let unitPrice = product.bronzePrice;

    if (qty >= 50) {
      tier = 'Gold';
      unitPrice = product.goldPrice;
    } else if (qty >= 10) {
      tier = 'Silver';
      unitPrice = product.silverPrice;
    }

    const savingsPerUnit = Math.max(0, product.bronzePrice - unitPrice);
    const totalSavings = savingsPerUnit * qty;
    const estimatedResaleProfit = Math.max(0, (product.retailPrice - unitPrice) * qty);

    return {
      tier,
      unitPrice,
      savingsPerUnit,
      totalSavings,
      estimatedResaleProfit,
    };
  };

  const addToCart = (productId: string, quantity: number) => {
    const prod = products.find((p) => p.id === productId);
    if (!prod) return;
    const validQty = Math.max(prod.moq, quantity);

    setCart((prev) => {
      const existing = prev.find((item) => item.productId === productId);
      if (existing) {
        return prev.map((item) =>
          item.productId === productId
            ? { ...item, quantity: item.quantity + validQty }
            : item
        );
      }
      return [...prev, { productId, quantity: validQty }];
    });
  };

  const updateCartQty = (productId: string, quantity: number) => {
    const prod = products.find((p) => p.id === productId);
    if (!prod) return;
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    const enforcedQty = Math.max(prod.moq, quantity);
    setCart((prev) =>
      prev.map((item) =>
        item.productId === productId ? { ...item, quantity: enforcedQty } : item
      )
    );
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.productId !== productId));
  };

  const clearCart = () => setCart([]);

  const toggleWishlist = (productId: string) => {
    setWishlist((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );
  };

  const placeOrder = (
    orderData: Omit<Order, 'id' | 'createdAt' | 'status' | 'paymentVerified'>
  ): Order => {
    const newOrder: Order = {
      ...orderData,
      id: `ORD-${Math.floor(1000 + Math.random() * 9000)}`,
      createdAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
      paymentVerified: orderData.paymentMethod === 'Card Payment',
      status: orderData.paymentMethod === 'Card Payment' ? 'Payment Confirmed' : 'Pending',
    };

    // Reserve stock for each ordered SKU
    setProducts((prev) =>
      prev.map((p) => {
        const orderedItem = orderData.items.find((i) => i.productId === p.id);
        if (!orderedItem) return p;
        return {
          ...p,
          reservedStock: p.reservedStock + orderedItem.quantity,
        };
      })
    );

    setOrders((prev) => [newOrder, ...prev]);
    clearCart();

    // 1. Central Cloud DB Sync (fire-and-forget)
    saveOrderToCloud(newOrder).catch(() => {});

    // 2. Instant Alerts (Email & WhatsApp via /api/notify)
    sendNotification('order', newOrder).catch(() => {});

    return newOrder;
  };

  const submitQuoteRequest = (
    quoteData: Omit<QuoteRequest, 'id' | 'createdAt' | 'status'>
  ): QuoteRequest => {
    const newQuote: QuoteRequest = {
      ...quoteData,
      id: `Q-${Math.floor(1050 + Math.random() * 900)}`,
      createdAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
      status: 'Pending Review',
    };

    setQuotes((prev) => [newQuote, ...prev]);

    // 1. Central Cloud DB Sync (fire-and-forget)
    saveQuoteToCloud(newQuote).catch(() => {});

    // 2. Instant Alerts (Email & WhatsApp via /api/notify)
    sendNotification('quote', newQuote).catch(() => {});

    return newQuote;
  };

  const approveAndAdjustQuote = (
    quoteId: string,
    updatedItems: QuoteRequest['items'],
    adminNote: string,
    status: QuoteRequest['status']
  ) => {
    setQuotes((prev) =>
      prev.map((q) =>
        q.id === quoteId
          ? {
              ...q,
              items: updatedItems,
              adminResponseNote: adminNote,
              status,
            }
          : q
      )
    );

    // Sync status change to Supabase Cloud
    updateQuoteStatusInCloud(quoteId, status, adminNote, updatedItems).catch(() => {});
  };

  const convertQuoteToOrder = (quoteId: string): Order | null => {
    const quote = quotes.find((q) => q.id === quoteId);
    if (!quote) return null;

    const orderItems = quote.items.map((item) => ({
      productId: item.productId,
      sku: item.sku,
      name: item.name,
      quantity: item.quantity,
      unitPrice: item.approvedUnitPrice ?? item.requestedTargetPrice,
      tierApplied: 'Gold' as const,
    }));

    const subtotal = orderItems.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);
    const standardTotal = quote.items.reduce(
      (sum, i) => sum + i.standardTierPrice * i.quantity,
      0
    );
    const tierSavings = Math.max(0, standardTotal - subtotal);

    const createdOrder = placeOrder({
      customerName: quote.contactPerson,
      businessName: quote.businessName,
      customerEmail: quote.email,
      customerPhone: quote.phone,
      deliveryNotes: `Converted from Approved Wholesale Quote #${quote.id}. ${quote.notes}`,
      deliveryTier: 'Medium Van / Carton Freight',
      shippingCost: 45,
      subtotal,
      tierSavings,
      grandTotal: subtotal + 45,
      paymentMethod: 'Proforma Invoice',
      paymentReference: `QUOTE-${quote.id}`,
      items: orderItems,
    });

    setQuotes((prev) =>
      prev.map((q) => (q.id === quoteId ? { ...q, status: 'Converted to Order' } : q))
    );

    updateQuoteStatusInCloud(quoteId, 'Converted to Order').catch(() => {});

    return createdOrder;
  };

  const saveProduct = (product: Product) => {
    setProducts((prev) => {
      const exists = prev.some((p) => p.id === product.id);
      if (exists) {
        return prev.map((p) => (p.id === product.id ? product : p));
      }
      return [product, ...prev];
    });
  };

  const deleteProduct = (productId: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== productId));
  };

  const adjustInventory = (
    productId: string,
    physicalDelta: number,
    reservedDelta: number,
    binCode?: string
  ) => {
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id !== productId) return p;
        return {
          ...p,
          physicalStock: Math.max(0, p.physicalStock + physicalDelta),
          reservedStock: Math.max(0, p.reservedStock + reservedDelta),
          binCode: binCode !== undefined ? binCode : p.binCode,
        };
      })
    );
  };

  const updateOrderStatus = (
    orderId: string,
    status: OrderStatus,
    paymentVerified?: boolean
  ) => {
    setOrders((prev) =>
      prev.map((o) => {
        if (o.id !== orderId) return o;
        // If transitioning to Dispatched for the first time, deduct physical & reserved stock
        if (status === 'Dispatched' && o.status !== 'Dispatched') {
          setProducts((prods) =>
            prods.map((p) => {
              const item = o.items.find((i) => i.productId === p.id);
              if (!item) return p;
              return {
                ...p,
                physicalStock: Math.max(0, p.physicalStock - item.quantity),
                reservedStock: Math.max(0, p.reservedStock - item.quantity),
              };
            })
          );
        }
        return {
          ...o,
          status,
          paymentVerified:
            paymentVerified !== undefined ? paymentVerified : o.paymentVerified,
        };
      })
    );

    // Sync status change to Supabase Cloud
    updateOrderStatusInCloud(orderId, status, paymentVerified).catch(() => {});
  };

  const submitWarrantyClaim = (
    claim: Omit<WarrantyClaim, 'id' | 'createdAt' | 'status' | 'adminResolutionNote'>
  ) => {
    const newClaim: WarrantyClaim = {
      ...claim,
      id: `WRN-${Math.floor(305 + Math.random() * 600)}`,
      createdAt: new Date().toISOString().slice(0, 10),
      status: 'Submitted',
      adminResolutionNote: 'Awaiting initial technical inspection by warranty desk.',
    };
    setWarranties((prev) => [newClaim, ...prev]);

    // Sync to Supabase Cloud
    saveWarrantyClaimToCloud(newClaim).catch(() => {});
  };

  const updateWarrantyStatus = (
    claimId: string,
    status: WarrantyStatus,
    resolutionNote: string
  ) => {
    setWarranties((prev) =>
      prev.map((w) =>
        w.id === claimId
          ? { ...w, status, adminResolutionNote: resolutionNote }
          : w
      )
    );
  };

  const updateRetailerProfile = (profile: RetailerProfile) => {
    setRetailers((prev) =>
      prev.map((r) => (r.id === profile.id ? profile : r))
    );
  };

  const registerRetailer = (
    profile: Omit<RetailerProfile, 'id' | 'joinedAt' | 'lifetimeValue' | 'approved'>
  ) => {
    const newRetailer: RetailerProfile = {
      ...profile,
      id: `ret-${Date.now()}`,
      joinedAt: new Date().toISOString().slice(0, 10),
      lifetimeValue: 0,
      approved: true,
    };
    setRetailers((prev) => [newRetailer, ...prev]);
  };

  const updateSettings = (newSettings: StoreSettings) => {
    setSettings(newSettings);
  };

  const resetDemoData = () => {
    localStorage.removeItem(STORAGE_KEY);
    setProducts(INITIAL_PRODUCTS);
    setOrders(INITIAL_ORDERS);
    setQuotes(INITIAL_QUOTES);
    setRetailers(INITIAL_RETAILERS);
    setWarranties(INITIAL_WARRANTIES);
    setSettings(INITIAL_SETTINGS);
  };

  const activeRetailer = retailers[0];

  return (
    <SokoNovaContext.Provider
      value={{
        products,
        cart,
        wishlist,
        orders,
        quotes,
        retailers,
        warranties,
        settings,
        role,
        activeRetailer,
        setRole,
        formatPrice,
        getTierInfo,
        addToCart,
        updateCartQty,
        removeFromCart,
        clearCart,
        toggleWishlist,
        placeOrder,
        submitQuoteRequest,
        approveAndAdjustQuote,
        convertQuoteToOrder,
        saveProduct,
        deleteProduct,
        adjustInventory,
        updateOrderStatus,
        submitWarrantyClaim,
        updateWarrantyStatus,
        updateRetailerProfile,
        registerRetailer,
        updateSettings,
        resetDemoData,
      }}
    >
      {children}
    </SokoNovaContext.Provider>
  );
};

export const useSokoNova = () => {
  const context = useContext(SokoNovaContext);
  if (!context) {
    throw new Error('useSokoNova must be used within a SokoNovaProvider');
  }
  return context;
};
