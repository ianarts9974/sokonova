'use client';

import React, { useState } from 'react';
import {
  BarChart3,
  Package,
  Calculator,
  Boxes,
  ShoppingBag,
  FileSpreadsheet,
  Users,
  ShieldAlert,
  Settings,
  Plus,
  Trash2,
  Edit3,
  Upload,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Printer,
} from 'lucide-react';
import { useSokoNova } from '@/context/SokoNovaContext';
import {
  Product,
  CategoryName,
  OrderStatus,
  WarrantyStatus,
  Order,
} from '@/types';
import { ProductImage } from './ProductImage';

interface AdminDashboardProps {
  onPrintOrder: (order: Order) => void;
}

const CATEGORIES: CategoryName[] = [
  'Mobile & Personal Electronics',
  'Gaming & Accessories',
  'Audio & Sound',
  'Lighting & Smart Home',
  'Home Appliances',
];

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onPrintOrder }) => {
  const {
    products,
    orders,
    quotes,
    retailers,
    warranties,
    settings,
    formatPrice,
    saveProduct,
    deleteProduct,
    adjustInventory,
    updateOrderStatus,
    approveAndAdjustQuote,
    updateWarrantyStatus,
    updateRetailerProfile,
    updateSettings,
    resetDemoData,
  } = useSokoNova();

  const [activeTab, setActiveTab] = useState<
    | 'kpi'
    | 'products'
    | 'landed'
    | 'inventory'
    | 'orders'
    | 'quotes'
    | 'crm'
    | 'warranty'
    | 'settings'
  >('kpi');

  // Product Editor Modal / Form state
  const emptyProduct: Product = {
    id: `prod-${Date.now()}`,
    sku: 'NEW-SKU-001',
    name: '',
    category: 'Mobile & Personal Electronics',
    brand: 'SokoNova Pro',
    model: 'SN-2026',
    color: 'Charcoal Black',
    specs: ['High-Grade Wholesale Spec 1', 'Fast Charging / Multi-Protection IC'],
    warrantyPeriod: '12 Months',
    weightKg: 0.5,
    dimensionsCm: '15 x 10 x 5 cm',
    moq: 5,
    retailPrice: 50,
    bronzePrice: 35,
    silverPrice: 31,
    goldPrice: 27,
    physicalStock: 100,
    reservedStock: 0,
    lowStockThreshold: 20,
    binCode: 'A01-R01-S01',
    serialBatch: 'SN-BATCH-2026',
    images: [
      'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?auto=format&fit=crop&w=900&q=80',
    ],
    status: 'Active',
    isFeatured: true,
    landedCost: {
      supplierUnitCost: 15,
      internationalShipping: 2,
      insurance: 0.5,
      importDutiesTaxes: 2,
      regulatoryComplianceFees: 0.5,
      clearingCharges: 0.5,
      localTransport: 0.5,
    },
  };

  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [specsInput, setSpecsInput] = useState('');

  // Landed cost calculator selected product
  const [selectedLandedProdId, setSelectedLandedProdId] = useState(
    products[0]?.id || 'prod-1'
  );

  // Store settings local state
  const [settingsForm, setSettingsForm] = useState(settings);
  const [settingsSaved, setSettingsSaved] = useState(false);

  // KPI computations
  const totalWholesaleRevenue = orders.reduce((s, o) => s + o.grandTotal, 0);
  const lowStockProducts = products.filter(
    (p) => p.physicalStock - p.reservedStock <= p.lowStockThreshold
  );
  const pendingDeliveries = orders.filter((o) => o.status !== 'Delivered').length;
  const pendingPayments = orders.filter((o) => !o.paymentVerified).length;
  const openQuotesCount = quotes.filter((q) => q.status === 'Pending Review').length;

  const openEditorForProduct = (prod?: Product) => {
    const target = prod ? { ...prod } : { ...emptyProduct, id: `prod-${Date.now()}` };
    setEditingProduct(target);
    setSpecsInput(target.specs.join('\n'));
  };

  const handleImageFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editingProduct) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setEditingProduct({
          ...editingProduct,
          images: [reader.result, ...editingProduct.images],
        });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleAddExternalImageUrl = () => {
    if (!newImageUrl.trim() || !editingProduct) return;
    setEditingProduct({
      ...editingProduct,
      images: [...editingProduct.images, newImageUrl.trim()],
    });
    setNewImageUrl('');
  };

  const handleSaveProductSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    const cleanedSpecs = specsInput
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);
    saveProduct({
      ...editingProduct,
      specs: cleanedSpecs.length ? cleanedSpecs : ['Verified Wholesale Unit'],
    });
    setEditingProduct(null);
  };

  const selectedLandedProduct =
    products.find((p) => p.id === selectedLandedProdId) || products[0];

  const calculateTrueLandedCost = (p: Product) => {
    const lc = p.landedCost;
    return (
      lc.supplierUnitCost +
      lc.internationalShipping +
      lc.insurance +
      lc.importDutiesTaxes +
      lc.regulatoryComplianceFees +
      lc.clearingCharges +
      lc.localTransport
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Admin Top Header */}
      <div className="bg-zinc-900 text-white rounded-3xl p-6 sm:p-8 flex flex-col lg:flex-row lg:items-center justify-between gap-6 shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-orange-500 text-white">
              OWNER ADMIN CONTROL CENTER
            </span>
            <span className="text-xs text-zinc-400 font-mono">/admin</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black mt-2">
            {settings.brandName} Executive Operations
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Full CRUD over catalog, tiered pricing, landed cost margins, warehouse bin
            locations, quotes, and B2B fulfillment.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => {
              setActiveTab('products');
              openEditorForProduct();
            }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold shadow-lg shadow-orange-500/25 transition"
          >
            <Plus className="w-4 h-4" />
            Add New Wholesale Product
          </button>
          <button
            onClick={resetDemoData}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-2xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold border border-zinc-700 transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset Seed Data
          </button>
        </div>
      </div>

      {/* Admin Module Navigation */}
      <div className="flex flex-wrap gap-2 border-b border-zinc-200 pb-4">
        {[
          { id: 'kpi', label: '1. Executive KPIs', icon: BarChart3 },
          { id: 'products', label: '2. Products & Images CRUD', icon: Package },
          { id: 'landed', label: '3. Landed Cost & Margins', icon: Calculator },
          { id: 'inventory', label: '4. Warehouse Bins & Stock', icon: Boxes },
          { id: 'orders', label: '5. Orders & Payments', icon: ShoppingBag },
          { id: 'quotes', label: '6. Quote Negotiation Desk', icon: FileSpreadsheet },
          { id: 'crm', label: '7. Retailer CRM', icon: Users },
          { id: 'warranty', label: '8. Warranty Desk', icon: ShieldAlert },
          { id: 'settings', label: '9. Storefront Settings', icon: Settings },
        ].map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`flex items-center gap-2 px-3.5 py-2.5 rounded-2xl text-xs font-bold transition ${
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

      {/* MODULE 1: EXECUTIVE KPI OVERVIEW */}
      {activeTab === 'kpi' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="bg-white p-5 rounded-3xl border border-zinc-200 shadow-sm">
              <p className="text-[11px] font-bold text-zinc-400 uppercase">
                Wholesale Revenue
              </p>
              <p className="text-xl font-black text-zinc-900 mt-1">
                {formatPrice(totalWholesaleRevenue)}
              </p>
              <span className="text-[10px] font-semibold text-emerald-600">
                +18.4% vs last week
              </span>
            </div>
            <div className="bg-white p-5 rounded-3xl border border-zinc-200 shadow-sm">
              <p className="text-[11px] font-bold text-zinc-400 uppercase">
                Active Orders
              </p>
              <p className="text-xl font-black text-zinc-900 mt-1">{orders.length}</p>
              <span className="text-[10px] text-zinc-500">Bulk dispatches</span>
            </div>
            <div className="bg-white p-5 rounded-3xl border border-zinc-200 shadow-sm">
              <p className="text-[11px] font-bold text-zinc-400 uppercase">
                Low-Stock Alerts
              </p>
              <p className="text-xl font-black text-orange-600 mt-1">
                {lowStockProducts.length} SKUs
              </p>
              <span className="text-[10px] text-orange-600 font-semibold">
                Requires restock
              </span>
            </div>
            <div className="bg-white p-5 rounded-3xl border border-zinc-200 shadow-sm">
              <p className="text-[11px] font-bold text-zinc-400 uppercase">
                Pending Deliveries
              </p>
              <p className="text-xl font-black text-zinc-900 mt-1">
                {pendingDeliveries}
              </p>
              <span className="text-[10px] text-zinc-500">In transit / packing</span>
            </div>
            <div className="bg-white p-5 rounded-3xl border border-zinc-200 shadow-sm">
              <p className="text-[11px] font-bold text-zinc-400 uppercase">
                Pending Payments
              </p>
              <p className="text-xl font-black text-amber-600 mt-1">
                {pendingPayments}
              </p>
              <span className="text-[10px] text-zinc-500">Awaiting verification</span>
            </div>
            <div className="bg-white p-5 rounded-3xl border border-zinc-200 shadow-sm">
              <p className="text-[11px] font-bold text-zinc-400 uppercase">
                Open Quote Requests
              </p>
              <p className="text-xl font-black text-blue-600 mt-1">
                {openQuotesCount}
              </p>
              <span className="text-[10px] text-zinc-500">Custom volume deals</span>
            </div>
          </div>

          {/* Category Performance Visual Chart & Low Stock Table */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-3xl p-6 border border-zinc-200 shadow-sm space-y-4">
              <h3 className="text-base font-black text-zinc-900">
                Category Inventory Value & Wholesale Share
              </h3>
              <div className="space-y-3">
                {CATEGORIES.map((cat) => {
                  const catProds = products.filter((p) => p.category === cat);
                  const totalUnits = catProds.reduce(
                    (s, p) => s + p.physicalStock,
                    0
                  );
                  const catValue = catProds.reduce(
                    (s, p) => s + p.physicalStock * p.silverPrice,
                    0
                  );
                  const pct = Math.min(100, Math.round((totalUnits / 900) * 100));
                  return (
                    <div key={cat} className="space-y-1 text-xs">
                      <div className="flex justify-between font-bold text-zinc-800">
                        <span>{cat}</span>
                        <span>
                          {totalUnits} units ({formatPrice(catValue)})
                        </span>
                      </div>
                      <div className="w-full h-2.5 bg-zinc-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-orange-500 rounded-full"
                          style={{ width: `${Math.max(12, pct)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-white rounded-3xl p-6 border border-zinc-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-black text-zinc-900 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-orange-500" />
                  Low-Stock Threshold Watchlist
                </h3>
                <button
                  onClick={() => setActiveTab('inventory')}
                  className="text-xs font-bold text-orange-600 hover:underline"
                >
                  Manage Warehouse Bins →
                </button>
              </div>
              {lowStockProducts.length === 0 ? (
                <p className="text-xs text-emerald-600 font-semibold">
                  All SKUs are currently stocked above minimum thresholds.
                </p>
              ) : (
                <div className="space-y-2.5">
                  {lowStockProducts.map((p) => (
                    <div
                      key={p.id}
                      className="p-3.5 rounded-2xl bg-orange-50/70 border border-orange-200 flex items-center justify-between text-xs"
                    >
                      <div>
                        <p className="font-bold text-zinc-900">
                          [{p.sku}] {p.name}
                        </p>
                        <p className="text-zinc-500">
                          Internal Bin: <strong className="font-mono">{p.binCode}</strong>{' '}
                          • Threshold: {p.lowStockThreshold} units
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="px-2.5 py-1 rounded-full font-black bg-orange-500 text-white">
                          {p.physicalStock - p.reservedStock} Avail
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODULE 2: PRODUCTS & IMAGES CRUD */}
      {activeTab === 'products' && (
        <div className="space-y-6">
          {editingProduct && (
            <form
              onSubmit={handleSaveProductSubmit}
              className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-orange-500 shadow-xl space-y-6"
            >
              <div className="flex items-center justify-between border-b border-zinc-200 pb-4">
                <h3 className="text-lg font-black text-zinc-900">
                  {products.some((p) => p.id === editingProduct.id)
                    ? `Edit Product: ${editingProduct.name}`
                    : 'Create New Wholesale Product'}
                </h3>
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="text-xs font-bold text-zinc-500 hover:text-zinc-800"
                >
                  Cancel
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                <div className="sm:col-span-2">
                  <label className="block font-bold text-zinc-700 mb-1">
                    Product Title
                  </label>
                  <input
                    type="text"
                    required
                    value={editingProduct.name}
                    onChange={(e) =>
                      setEditingProduct({ ...editingProduct, name: e.target.value })
                    }
                    className="w-full rounded-xl border border-zinc-300 px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block font-bold text-zinc-700 mb-1">
                    Internal SKU Code
                  </label>
                  <input
                    type="text"
                    required
                    value={editingProduct.sku}
                    onChange={(e) =>
                      setEditingProduct({ ...editingProduct, sku: e.target.value })
                    }
                    className="w-full rounded-xl border border-zinc-300 px-3 py-2 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-zinc-700 mb-1">
                    Category
                  </label>
                  <select
                    value={editingProduct.category}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        category: e.target.value as CategoryName,
                      })
                    }
                    className="w-full rounded-xl border border-zinc-300 px-3 py-2 bg-white"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-zinc-700 mb-1">Brand</label>
                  <input
                    type="text"
                    value={editingProduct.brand}
                    onChange={(e) =>
                      setEditingProduct({ ...editingProduct, brand: e.target.value })
                    }
                    className="w-full rounded-xl border border-zinc-300 px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block font-bold text-zinc-700 mb-1">Model</label>
                  <input
                    type="text"
                    value={editingProduct.model}
                    onChange={(e) =>
                      setEditingProduct({ ...editingProduct, model: e.target.value })
                    }
                    className="w-full rounded-xl border border-zinc-300 px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block font-bold text-zinc-700 mb-1">
                    Minimum Order Qty (MOQ)
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={editingProduct.moq}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        moq: Number(e.target.value),
                      })
                    }
                    className="w-full rounded-xl border border-zinc-300 px-3 py-2 font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-zinc-700 mb-1">
                    Warranty Period
                  </label>
                  <select
                    value={editingProduct.warrantyPeriod}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        warrantyPeriod: e.target.value as Product['warrantyPeriod'],
                      })
                    }
                    className="w-full rounded-xl border border-zinc-300 px-3 py-2 bg-white"
                  >
                    <option value="6 Months">6 Months</option>
                    <option value="12 Months">12 Months</option>
                    <option value="24 Months">24 Months</option>
                  </select>
                </div>

                {/* Tiered Pricing Configuration */}
                <div className="bg-zinc-50 p-3 rounded-2xl border border-zinc-200">
                  <label className="block font-bold text-zinc-700 mb-1">
                    Illustrative Retail MSRP ($)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={editingProduct.retailPrice}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        retailPrice: Number(e.target.value),
                      })
                    }
                    className="w-full rounded-xl border border-zinc-300 px-3 py-1.5 bg-white font-bold"
                  />
                </div>
                <div className="bg-orange-50/60 p-3 rounded-2xl border border-orange-200">
                  <label className="block font-bold text-orange-800 mb-1">
                    Bronze Tier (1–9 Units) ($)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={editingProduct.bronzePrice}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        bronzePrice: Number(e.target.value),
                      })
                    }
                    className="w-full rounded-xl border border-orange-300 px-3 py-1.5 bg-white font-bold"
                  />
                </div>
                <div className="bg-blue-50/60 p-3 rounded-2xl border border-blue-200">
                  <label className="block font-bold text-blue-800 mb-1">
                    Silver Tier (10–49 Units) ($)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={editingProduct.silverPrice}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        silverPrice: Number(e.target.value),
                      })
                    }
                    className="w-full rounded-xl border border-blue-300 px-3 py-1.5 bg-white font-bold"
                  />
                </div>
                <div className="bg-emerald-50/60 p-3 rounded-2xl border border-emerald-200">
                  <label className="block font-bold text-emerald-800 mb-1">
                    Gold Tier (50+ Units) ($)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={editingProduct.goldPrice}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        goldPrice: Number(e.target.value),
                      })
                    }
                    className="w-full rounded-xl border border-emerald-300 px-3 py-1.5 bg-white font-bold"
                  />
                </div>
              </div>

              {/* Technical Specs */}
              <div className="text-xs">
                <label className="block font-bold text-zinc-700 mb-1">
                  Technical Specifications (One bullet per line)
                </label>
                <textarea
                  rows={3}
                  value={specsInput}
                  onChange={(e) => setSpecsInput(e.target.value)}
                  className="w-full rounded-xl border border-zinc-300 p-3"
                />
              </div>

              {/* Admin Image Uploader (Drag & Drop Local File + External URL) */}
              <div className="bg-zinc-50 p-4 rounded-2xl border border-zinc-200 space-y-3 text-xs">
                <p className="font-bold text-zinc-900">
                  Product Image Manager (Upload Local File or Paste Image URL)
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <label className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white border-2 border-dashed border-orange-400 text-orange-600 font-bold cursor-pointer hover:bg-orange-50 transition">
                    <Upload className="w-4 h-4" />
                    <span>Upload Image File</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageFileUpload}
                      className="hidden"
                    />
                  </label>
                  <div className="flex-1 flex gap-2">
                    <input
                      type="url"
                      placeholder="Or paste high-res image URL (https://...)"
                      value={newImageUrl}
                      onChange={(e) => setNewImageUrl(e.target.value)}
                      className="flex-1 rounded-xl border border-zinc-300 px-3 py-2 bg-white"
                    />
                    <button
                      type="button"
                      onClick={handleAddExternalImageUrl}
                      className="px-4 py-2 rounded-xl bg-zinc-900 text-white font-bold"
                    >
                      Add URL
                    </button>
                  </div>
                </div>

                {/* Thumbnails Preview */}
                <div className="flex flex-wrap gap-3 pt-2">
                  {editingProduct.images.map((imgUrl, idx) => (
                    <div
                      key={idx}
                      className="relative w-24 h-24 rounded-2xl overflow-hidden border border-zinc-300 bg-white group"
                    >
                      <ProductImage src={imgUrl} alt="Preview" enableZoom={false} />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex flex-col items-center justify-center gap-1 p-1">
                        {idx !== 0 && (
                          <button
                            type="button"
                            onClick={() => {
                              const imgs = [...editingProduct.images];
                              const [picked] = imgs.splice(idx, 1);
                              imgs.unshift(picked);
                              setEditingProduct({ ...editingProduct, images: imgs });
                            }}
                            className="text-[10px] bg-orange-500 text-white px-2 py-0.5 rounded font-bold"
                          >
                            Set Cover
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() =>
                            setEditingProduct({
                              ...editingProduct,
                              images: editingProduct.images.filter((_, i) => i !== idx),
                            })
                          }
                          className="text-[10px] bg-red-600 text-white px-2 py-0.5 rounded font-bold"
                        >
                          Remove
                        </button>
                      </div>
                      {idx === 0 && (
                        <span className="absolute bottom-1 left-1 bg-orange-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                          Primary
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="px-5 py-2.5 rounded-xl border border-zinc-300 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold shadow-md shadow-orange-500/20"
                >
                  Save Wholesale Product
                </button>
              </div>
            </form>
          )}

          {/* Product Catalog Table */}
          <div className="bg-white rounded-3xl border border-zinc-200 shadow-sm overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-zinc-50 border-b border-zinc-200 text-[11px] font-bold uppercase text-zinc-500">
                  <th className="py-3.5 px-4">Product / SKU</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">MOQ</th>
                  <th className="py-3.5 px-4">Bronze / Silver / Gold</th>
                  <th className="py-3.5 px-4">Available Stock</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200">
                {products.map((p) => (
                  <tr key={p.id} className="hover:bg-zinc-50/80">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 border border-zinc-200">
                          <ProductImage src={p.images[0]} alt={p.name} />
                        </div>
                        <div>
                          <p className="font-bold text-zinc-900 line-clamp-1">
                            {p.name}
                          </p>
                          <p className="font-mono text-[11px] text-zinc-500">
                            {p.sku} • {p.brand}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-zinc-600">{p.category}</td>
                    <td className="py-3 px-4 font-bold">{p.moq} units</td>
                    <td className="py-3 px-4 font-semibold">
                      <span className="text-zinc-700">{formatPrice(p.bronzePrice)}</span>{' '}
                      / <span className="text-blue-600">{formatPrice(p.silverPrice)}</span>{' '}
                      /{' '}
                      <span className="text-emerald-600 font-bold">
                        {formatPrice(p.goldPrice)}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2.5 py-1 rounded-full font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {p.physicalStock - p.reservedStock} units
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right space-x-2">
                      <button
                        onClick={() => openEditorForProduct(p)}
                        className="p-2 rounded-xl bg-zinc-100 hover:bg-orange-100 text-zinc-700 hover:text-orange-600 transition"
                        title="Edit Product"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteProduct(p.id)}
                        className="p-2 rounded-xl bg-zinc-100 hover:bg-red-100 text-zinc-700 hover:text-red-600 transition"
                        title="Delete Product"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODULE 3: LANDED COST & MARGIN CALCULATOR */}
      {activeTab === 'landed' && selectedLandedProduct && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-3xl p-6 border border-zinc-200 shadow-sm space-y-4">
            <h3 className="text-base font-black text-zinc-900">
              Select SKU to Audit Landed Cost
            </h3>
            <select
              value={selectedLandedProduct.id}
              onChange={(e) => setSelectedLandedProdId(e.target.value)}
              className="w-full rounded-xl border border-zinc-300 px-3 py-2.5 text-xs font-bold bg-white"
            >
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  [{p.sku}] {p.name}
                </option>
              ))}
            </select>

            <div className="space-y-3 pt-2 text-xs">
              {(
                [
                  ['supplierUnitCost', 'Supplier Unit Cost (Ex-Factory)'],
                  ['internationalShipping', 'International Freight / Unit'],
                  ['insurance', 'Marine & Transit Insurance'],
                  ['importDutiesTaxes', 'Import Duties & Customs Taxes'],
                  ['regulatoryComplianceFees', 'Regulatory & Standards Compliance'],
                  ['clearingCharges', 'Port Handling & Clearing Charges'],
                  ['localTransport', 'Warehouse Inbound Transport'],
                ] as const
              ).map(([field, label]) => (
                <div key={field} className="flex items-center justify-between gap-3">
                  <label className="text-zinc-600 font-medium">{label}</label>
                  <input
                    type="number"
                    step="0.1"
                    value={selectedLandedProduct.landedCost[field]}
                    onChange={(e) => {
                      const updated: Product = {
                        ...selectedLandedProduct,
                        landedCost: {
                          ...selectedLandedProduct.landedCost,
                          [field]: Number(e.target.value),
                        },
                      };
                      saveProduct(updated);
                    }}
                    className="w-24 rounded-xl border border-zinc-300 px-2.5 py-1.5 text-right font-bold"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-2 bg-white rounded-3xl p-6 sm:p-8 border border-zinc-200 shadow-sm space-y-6">
            {(() => {
              const trueCost = calculateTrueLandedCost(selectedLandedProduct);
              const tiers = [
                {
                  name: 'Bronze Tier (1–9 Units)',
                  price: selectedLandedProduct.bronzePrice,
                  badge: 'bg-orange-100 text-orange-800',
                },
                {
                  name: 'Silver Tier (10–49 Units)',
                  price: selectedLandedProduct.silverPrice,
                  badge: 'bg-blue-100 text-blue-800',
                },
                {
                  name: 'Gold Tier (50+ Units)',
                  price: selectedLandedProduct.goldPrice,
                  badge: 'bg-emerald-100 text-emerald-800',
                },
              ];

              return (
                <>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-zinc-900 text-white p-6 rounded-2xl">
                    <div>
                      <p className="text-xs text-zinc-400 uppercase font-bold">
                        True Landed Cost Per Unit
                      </p>
                      <p className="text-xs text-zinc-300 mt-0.5">
                        [{selectedLandedProduct.sku}] {selectedLandedProduct.name}
                      </p>
                    </div>
                    <div className="text-3xl font-black text-orange-400">
                      {formatPrice(trueCost)}
                    </div>
                  </div>

                  <h4 className="text-sm font-black text-zinc-900">
                    Wholesale Tier Net Profit & Margin Protection Analysis
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {tiers.map((t) => {
                      const netProfit = t.price - trueCost;
                      const marginPct =
                        t.price > 0 ? ((netProfit / t.price) * 100).toFixed(1) : '0';
                      const healthy = netProfit > 0;
                      return (
                        <div
                          key={t.name}
                          className="p-5 rounded-2xl border border-zinc-200 bg-zinc-50 space-y-2"
                        >
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${t.badge}`}
                          >
                            {t.name}
                          </span>
                          <p className="text-lg font-black text-zinc-900 pt-1">
                            Sell: {formatPrice(t.price)}
                          </p>
                          <p
                            className={`text-xs font-bold ${
                              healthy ? 'text-emerald-600' : 'text-red-600'
                            }`}
                          >
                            Net Profit: {formatPrice(netProfit)} / unit
                          </p>
                          <p className="text-xs text-zinc-600">
                            Gross Margin: <strong>{marginPct}%</strong>
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      )}

      {/* MODULE 4: ADVANCED INVENTORY & WAREHOUSE BIN CONTROL */}
      {activeTab === 'inventory' && (
        <div className="bg-white rounded-3xl border border-zinc-200 shadow-sm overflow-x-auto">
          <div className="p-5 border-b border-zinc-200 flex items-center justify-between">
            <div>
              <h3 className="text-base font-black text-zinc-900">
                Warehouse Bin Locations & Three-State Stock Control
              </h3>
              <p className="text-xs text-zinc-500">
                Internal Bin Location Codes (Area-Rack-Shelf) are strictly visible only
                to Admin for picking & packing.
              </p>
            </div>
          </div>
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-zinc-50 border-b border-zinc-200 text-[11px] font-bold uppercase text-zinc-500">
                <th className="py-3.5 px-4">SKU & Product</th>
                <th className="py-3.5 px-4">Internal Bin Code</th>
                <th className="py-3.5 px-4">Serial / IMEI Batch</th>
                <th className="py-3.5 px-4 text-center">Physical Stock</th>
                <th className="py-3.5 px-4 text-center">Reserved</th>
                <th className="py-3.5 px-4 text-center">Available</th>
                <th className="py-3.5 px-4 text-right">Quick Restock</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200">
              {products.map((p) => {
                const available = p.physicalStock - p.reservedStock;
                const isLow = available <= p.lowStockThreshold;
                return (
                  <tr key={p.id}>
                    <td className="py-3.5 px-4">
                      <p className="font-bold text-zinc-900">{p.name}</p>
                      <p className="font-mono text-zinc-400">{p.sku}</p>
                    </td>
                    <td className="py-3.5 px-4">
                      <input
                        type="text"
                        value={p.binCode}
                        onChange={(e) =>
                          adjustInventory(p.id, 0, 0, e.target.value)
                        }
                        className="w-28 rounded-lg border border-zinc-300 px-2 py-1 font-mono font-bold text-zinc-800 bg-zinc-50"
                      />
                    </td>
                    <td className="py-3.5 px-4 font-mono text-zinc-600">
                      {p.serialBatch}
                    </td>
                    <td className="py-3.5 px-4 text-center font-bold">
                      {p.physicalStock}
                    </td>
                    <td className="py-3.5 px-4 text-center font-semibold text-amber-600">
                      {p.reservedStock}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`px-2.5 py-1 rounded-full font-black ${
                          isLow
                            ? 'bg-red-100 text-red-700'
                            : 'bg-emerald-50 text-emerald-700'
                        }`}
                      >
                        {available}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-1.5">
                      <button
                        onClick={() => adjustInventory(p.id, -5, 0)}
                        className="px-2.5 py-1 rounded-lg bg-zinc-100 hover:bg-zinc-200 font-bold"
                      >
                        -5
                      </button>
                      <button
                        onClick={() => adjustInventory(p.id, 10, 0)}
                        className="px-2.5 py-1 rounded-lg bg-orange-500 hover:bg-orange-600 text-white font-bold"
                      >
                        +10
                      </button>
                      <button
                        onClick={() => adjustInventory(p.id, 50, 0)}
                        className="px-2.5 py-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white font-bold"
                      >
                        +50
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* MODULE 5: ORDERS & PAYMENT MANAGER */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          {orders.map((o) => (
            <div
              key={o.id}
              className="bg-white rounded-3xl p-6 border border-zinc-200 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-6"
            >
              <div className="space-y-1.5 text-xs">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-base font-black text-zinc-900">#{o.id}</span>
                  <span className="font-bold text-orange-600">{o.businessName}</span>
                  <span className="text-zinc-400">• {o.createdAt}</span>
                </div>
                <p className="text-zinc-600">
                  Contact: {o.customerName} ({o.customerPhone}) • Mode:{' '}
                  <strong>{o.deliveryTier}</strong>
                </p>
                <p className="text-zinc-500">
                  Payment: <strong>{o.paymentMethod}</strong> (Ref:{' '}
                  <span className="font-mono">{o.paymentReference}</span>) —{' '}
                  <span
                    className={
                      o.paymentVerified
                        ? 'text-emerald-600 font-bold'
                        : 'text-amber-600 font-bold'
                    }
                  >
                    {o.paymentVerified ? 'Verified' : 'Pending Verification'}
                  </span>
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <div className="text-right mr-2">
                  <p className="text-[11px] text-zinc-400">Order Total</p>
                  <p className="text-base font-black text-zinc-900">
                    {formatPrice(o.grandTotal)}
                  </p>
                </div>

                {!o.paymentVerified && (
                  <button
                    onClick={() => updateOrderStatus(o.id, 'Payment Confirmed', true)}
                    className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Verify Payment
                  </button>
                )}

                <select
                  value={o.status}
                  onChange={(e) =>
                    updateOrderStatus(o.id, e.target.value as OrderStatus)
                  }
                  className="rounded-xl border border-zinc-300 px-3 py-2 text-xs font-bold bg-zinc-50"
                >
                  <option value="Pending">Pending</option>
                  <option value="Payment Confirmed">Payment Confirmed</option>
                  <option value="Packing">Packing</option>
                  <option value="Dispatched">Dispatched</option>
                  <option value="Delivered">Delivered</option>
                </select>

                <button
                  onClick={() => onPrintOrder(o)}
                  className="p-2.5 rounded-xl bg-zinc-900 text-white hover:bg-zinc-800"
                  title="Print Packing Slip / Invoice"
                >
                  <Printer className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODULE 6: QUOTATION NEGOTIATION DESK */}
      {activeTab === 'quotes' && (
        <div className="space-y-4">
          {quotes.map((q) => (
            <div
              key={q.id}
              className="bg-white rounded-3xl p-6 border border-zinc-200 shadow-sm space-y-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-100 pb-4">
                <div>
                  <span className="text-base font-black text-zinc-900">
                    Quote #{q.id} — {q.businessName}
                  </span>
                  <p className="text-xs text-zinc-500">
                    {q.contactPerson} ({q.email} / {q.phone})
                  </p>
                  <p className="text-xs text-zinc-700 mt-1 italic">&ldquo;{q.notes}&rdquo;</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      const approvedItems = q.items.map((item) => ({
                        ...item,
                        approvedUnitPrice:
                          item.approvedUnitPrice ?? item.requestedTargetPrice,
                      }));
                      approveAndAdjustQuote(
                        q.id,
                        approvedItems,
                        'Approved custom wholesale rates. Ready for instant order conversion.',
                        'Approved'
                      );
                    }}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold"
                  >
                    Approve & Send to Retailer Portal
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                {q.items.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-2xl bg-zinc-50 border border-zinc-200 flex items-center justify-between gap-3"
                  >
                    <div>
                      <p className="font-bold text-zinc-900">
                        [{item.sku}] {item.name}
                      </p>
                      <p className="text-zinc-500">
                        Qty: <strong>{item.quantity}</strong> • Std Tier:{' '}
                        {formatPrice(item.standardTierPrice)} • Client Target:{' '}
                        {formatPrice(item.requestedTargetPrice)}
                      </p>
                    </div>
                    <div className="text-right">
                      <label className="block text-[10px] font-bold text-zinc-500">
                        Approved Unit Price ($)
                      </label>
                      <input
                        type="number"
                        step="0.5"
                        value={item.approvedUnitPrice ?? item.requestedTargetPrice}
                        onChange={(e) => {
                          const updated = q.items.map((it, i) =>
                            i === idx
                              ? { ...it, approvedUnitPrice: Number(e.target.value) }
                              : it
                          );
                          approveAndAdjustQuote(
                            q.id,
                            updated,
                            q.adminResponseNote || 'Custom rate updated by Admin.',
                            q.status
                          );
                        }}
                        className="w-24 rounded-lg border border-zinc-300 px-2 py-1 text-right font-bold bg-white mt-0.5"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODULE 7: RETAILER CRM */}
      {activeTab === 'crm' && (
        <div className="bg-white rounded-3xl border border-zinc-200 shadow-sm overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-zinc-50 border-b border-zinc-200 text-[11px] font-bold uppercase text-zinc-500">
                <th className="py-3.5 px-4">Business Name & Contact</th>
                <th className="py-3.5 px-4">Tax ID / PIN</th>
                <th className="py-3.5 px-4">Expected Monthly Vol</th>
                <th className="py-3.5 px-4">Lifetime Purchases</th>
                <th className="py-3.5 px-4">Assigned Tier</th>
                <th className="py-3.5 px-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200">
              {retailers.map((r) => (
                <tr key={r.id}>
                  <td className="py-3.5 px-4">
                    <p className="font-bold text-zinc-900">{r.businessName}</p>
                    <p className="text-zinc-500">
                      {r.contactPerson} • {r.email}
                    </p>
                  </td>
                  <td className="py-3.5 px-4 font-mono">{r.taxIdPin}</td>
                  <td className="py-3.5 px-4">{r.expectedMonthlyVolume}</td>
                  <td className="py-3.5 px-4 font-black text-zinc-900">
                    {formatPrice(r.lifetimeValue)}
                  </td>
                  <td className="py-3.5 px-4">
                    <select
                      value={r.pricingTier}
                      onChange={(e) =>
                        updateRetailerProfile({
                          ...r,
                          pricingTier: e.target.value as typeof r.pricingTier,
                        })
                      }
                      className="rounded-lg border border-zinc-300 px-2.5 py-1 font-bold bg-white"
                    >
                      <option value="Standard Retailer">Standard Retailer</option>
                      <option value="Large Retailer">Large Retailer</option>
                      <option value="Distributor">Distributor</option>
                    </select>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() =>
                        updateRetailerProfile({ ...r, approved: !r.approved })
                      }
                      className={`px-3 py-1 rounded-full font-bold ${
                        r.approved
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-amber-100 text-amber-700'
                      }`}
                    >
                      {r.approved ? 'Verified Partner' : 'Approve Account'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* MODULE 8: WARRANTY CLAIMS DESK */}
      {activeTab === 'warranty' && (
        <div className="space-y-4">
          {warranties.map((w) => (
            <div
              key={w.id}
              className="bg-white rounded-3xl p-6 border border-zinc-200 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-6 text-xs"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-black text-sm text-zinc-900">#{w.id}</span>
                  <span className="font-mono bg-orange-50 text-orange-700 px-2 py-0.5 rounded font-bold">
                    S/N: {w.serialOrImei}
                  </span>
                  <span className="text-zinc-400">Order: {w.orderId}</span>
                </div>
                <p className="font-bold text-zinc-800">
                  [{w.productSku}] {w.productName} — {w.businessName}
                </p>
                <p className="text-zinc-600">{w.issueDescription}</p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <select
                  value={w.status}
                  onChange={(e) =>
                    updateWarrantyStatus(
                      w.id,
                      e.target.value as WarrantyStatus,
                      `Updated lifecycle status to ${e.target.value}.`
                    )
                  }
                  className="rounded-xl border border-zinc-300 px-3 py-2 font-bold bg-zinc-50"
                >
                  <option value="Submitted">Submitted</option>
                  <option value="Inspection">Inspection</option>
                  <option value="Approved">Approved</option>
                  <option value="Replacement Sent">Replacement Sent</option>
                  <option value="Rejected">Rejected</option>
                  <option value="Closed">Closed</option>
                </select>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODULE 9: STOREFRONT SETTINGS */}
      {activeTab === 'settings' && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            updateSettings(settingsForm);
            setSettingsSaved(true);
            setTimeout(() => setSettingsSaved(false), 3000);
          }}
          className="bg-white rounded-3xl p-6 sm:p-8 border border-zinc-200 shadow-sm max-w-2xl space-y-5 text-xs"
        >
          <h3 className="text-lg font-black text-zinc-900">
            Storefront Brand, Currency & Digital Channels Configuration
          </h3>

          {settingsSaved && (
            <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 font-bold">
              Storefront settings updated live!
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-zinc-700 mb-1">Brand Name</label>
              <input
                type="text"
                value={settingsForm.brandName}
                onChange={(e) =>
                  setSettingsForm({ ...settingsForm, brandName: e.target.value })
                }
                className="w-full rounded-xl border border-zinc-300 px-3.5 py-2.5 font-bold"
              />
            </div>
            <div>
              <label className="block font-bold text-zinc-700 mb-1">
                Active Storefront Currency Symbol
              </label>
              <select
                value={settingsForm.currencySymbol}
                onChange={(e) =>
                  setSettingsForm({
                    ...settingsForm,
                    currencySymbol: e.target.value as '$' | 'KSh',
                  })
                }
                className="w-full rounded-xl border border-zinc-300 px-3.5 py-2.5 font-bold bg-white"
              >
                <option value="$">USD ($)</option>
                <option value="KSh">KSh (Wholesale Local Multiplier)</option>
              </select>
            </div>
            <div>
              <label className="block font-bold text-zinc-700 mb-1">
                Official Support Email
              </label>
              <input
                type="email"
                value={settingsForm.supportEmail}
                onChange={(e) =>
                  setSettingsForm({ ...settingsForm, supportEmail: e.target.value })
                }
                className="w-full rounded-xl border border-zinc-300 px-3.5 py-2.5"
              />
            </div>
            <div>
              <label className="block font-bold text-zinc-700 mb-1">
                WhatsApp / Live Chat Inquiry Number
              </label>
              <input
                type="text"
                value={settingsForm.whatsappNumber}
                onChange={(e) =>
                  setSettingsForm({ ...settingsForm, whatsappNumber: e.target.value })
                }
                className="w-full rounded-xl border border-zinc-300 px-3.5 py-2.5"
              />
            </div>
          </div>

          <button
            type="submit"
            className="px-6 py-3 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-bold shadow-md shadow-orange-500/20"
          >
            Save Storefront Configuration
          </button>
        </form>
      )}
    </div>
  );
};