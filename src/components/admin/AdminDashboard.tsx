import React, { useState } from 'react';
import { useShop } from '../../context/ShopContext';
import { useAuth } from '../../context/AuthContext';
import {
  Product,
  Category,
  Banner,
  Order,
  OrderStatus,
  AdminTab,
  DeliveryPaymentStatus,
} from '../../types';
import {
  saveProduct,
  deleteProduct,
  updateOrderStatus,
  deleteOrder,
  saveSettings,
  saveBanner,
  deleteBanner,
  saveCategory,
  deleteCategory,
} from '../../services/dataService';
import { uploadProductImage, deleteStorageImage } from '../../services/storageService';
import { generateProjectZip } from '../../services/exportService';
import {
  LayoutDashboard,
  Package,
  PlusCircle,
  FolderTree,
  ShoppingBag,
  Users,
  Image as ImageIcon,
  CreditCard,
  Truck,
  Globe,
  Share2,
  Download,
  ShieldCheck,
  LogOut,
  X,
  Search,
  Check,
  Trash2,
  Edit,
  ExternalLink,
  Eye,
  EyeOff,
  AlertTriangle,
  Upload,
  RefreshCw,
  Plus,
  Loader2,
  Star,
  Printer,
  Clock,
  CheckCircle,
  XCircle,
  DollarSign,
} from 'lucide-react';

interface AdminDashboardProps {
  isPage?: boolean;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ isPage = false }) => {
  const {
    isAdminDashboardOpen,
    setIsAdminDashboardOpen,
    products,
    categories,
    banners,
    settings,
    orders,
    showToast,
  } = useShop();

  const { logout } = useAuth();

  const [activeTab, setActiveTab] = useState<AdminTab>('products');

  // Product Form State
  const [isEditing, setIsEditing] = useState(false);
  const [productForm, setProductForm] = useState<{
    id: string;
    name: string;
    category: string;
    regularPrice: number | '';
    discountPrice: number | '';
    stockQuantity: number | '';
    stockStatus: 'in_stock' | 'out_of_stock';
    description: string;
    mainImage: string;
    gallery: string[];
    published: boolean;
  }>({
    id: '',
    name: '',
    category: categories[0]?.slug || 'smart-gadgets',
    regularPrice: '',
    discountPrice: '',
    stockQuantity: 10,
    stockStatus: 'in_stock',
    description: '',
    mainImage: '',
    gallery: [],
    published: true,
  });

  // Image Uploading States
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Delete Product Confirmation Dialog
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [isDeletingProduct, setIsDeletingProduct] = useState(false);

  // Order Details Modal State
  const [selectedOrderDetails, setSelectedOrderDetails] = useState<Order | null>(null);
  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('all');

  // Banner Form State
  const [bannerForm, setBannerForm] = useState<Partial<Banner>>({
    title: '',
    image: '',
    link: '',
    isEnabled: true,
    order: 1,
  });

  // Category Form State
  const [newCatName, setNewCatName] = useState('');
  const [newCatSlug, setNewCatSlug] = useState('');

  // Export State
  const [exporting, setExporting] = useState(false);

  // Settings State Form
  const [settingsForm, setSettingsForm] = useState(settings);

  if (!isPage && !isAdminDashboardOpen) return null;

  // Overview Statistics
  const totalProducts = products.length;
  const activeProducts = products.filter((p) => p.isPublished && p.stockStatus === 'in_stock').length;
  const outOfStockProducts = products.filter(
    (p) => p.stockStatus === 'out_of_stock' || (p.stockQuantity ?? 0) <= 0
  ).length;

  const totalOrders = orders.length;
  const pendingOrders = orders.filter((o) => o.orderStatus === 'Pending').length;
  const confirmedOrders = orders.filter((o) => o.orderStatus === 'Confirmed').length;
  const deliveredOrders = orders.filter((o) => o.orderStatus === 'Delivered').length;
  const cancelledOrders = orders.filter((o) => o.orderStatus === 'Cancelled').length;
  const totalSales = orders
    .filter((o) => o.orderStatus !== 'Cancelled')
    .reduce((acc, o) => acc + (o.grandTotal || 0), 0);

  // Customers
  const uniqueCustomerMap = new Map<string, { name: string; phone: string; totalOrders: number; totalSpent: number; lastOrder: string }>();
  orders.forEach((o) => {
    const key = o.phone.trim();
    const existing = uniqueCustomerMap.get(key);
    if (existing) {
      existing.totalOrders += 1;
      existing.totalSpent += o.grandTotal;
    } else {
      uniqueCustomerMap.set(key, {
        name: o.customerName,
        phone: o.phone,
        totalOrders: 1,
        totalSpent: o.grandTotal,
        lastOrder: o.orderDate,
      });
    }
  });
  const customersList = Array.from(uniqueCustomerMap.values());

  // Reset Add Product Form
  const handleOpenAddProduct = () => {
    const randomId = `prod-${Date.now().toString(36)}-${Math.floor(100 + Math.random() * 900)}`;
    setIsEditing(false);
    setProductForm({
      id: randomId,
      name: '',
      category: categories[0]?.slug || 'smart-gadgets',
      regularPrice: '',
      discountPrice: '',
      stockQuantity: 10,
      stockStatus: 'in_stock',
      description: '',
      mainImage: '',
      gallery: [],
      published: true,
    });
    setActiveTab('add-product');
  };

  // Open Edit Product
  const handleOpenEditProduct = (prod: Product) => {
    setIsEditing(true);
    const mainImg = prod.mainImage || prod.image || '';
    const gal = prod.gallery || prod.galleryImages || [];
    setProductForm({
      id: prod.id,
      name: prod.name,
      category: prod.category,
      regularPrice: prod.regularPrice,
      discountPrice: prod.discountPrice || '',
      stockQuantity: prod.stockQuantity ?? prod.stock ?? 0,
      stockStatus: prod.stockStatus,
      description: prod.description || '',
      mainImage: mainImg,
      gallery: gal.length > 0 ? gal : (mainImg ? [mainImg] : []),
      published: prod.published !== undefined ? prod.published : (prod.isPublished !== undefined ? prod.isPublished : true),
    });
    setActiveTab('add-product');
  };

  // Device Gallery Selection and Firebase Storage Upload
  const handleGalleryFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingImage(true);
    setUploadProgress(10);

    const uploadedUrls: string[] = [];
    const prodId = productForm.id || 'new-product';

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const progressPerFile = Math.round(((i + 1) / files.length) * 100);
        const url = await uploadProductImage(file, prodId, (p) => {
          const overall = Math.round((i * 100 + p) / files.length);
          setUploadProgress(overall);
        });
        uploadedUrls.push(url);
      }

      setProductForm((prev) => {
        const newGallery = [...prev.gallery, ...uploadedUrls];
        const newMain = prev.mainImage || uploadedUrls[0] || '';
        return {
          ...prev,
          mainImage: newMain,
          gallery: newGallery,
        };
      });

      showToast(`${files.length} টি ছবি সফলভাবে আপলোড হয়েছে!`, 'success');
    } catch (err) {
      console.error('Gallery upload error:', err);
      showToast('ছবি আপলোড করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।', 'error');
    } finally {
      setUploadingImage(false);
      setUploadProgress(null);
      e.target.value = '';
    }
  };

  // Save Product to Firestore
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!productForm.name.trim()) {
      showToast('পণ্যের নাম লিখুন', 'error');
      return;
    }

    if (productForm.regularPrice === '' || Number(productForm.regularPrice) <= 0) {
      showToast('সঠিক রেগুলার মূল্য প্রদান করুন', 'error');
      return;
    }

    const regPrice = Number(productForm.regularPrice);
    const discPrice = productForm.discountPrice !== '' ? Number(productForm.discountPrice) : undefined;
    const stockQty = productForm.stockQuantity !== '' ? Number(productForm.stockQuantity) : 0;
    const stockStat = stockQty > 0 ? productForm.stockStatus : 'out_of_stock';
    const mainImg =
      productForm.mainImage ||
      productForm.gallery[0] ||
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80';

    try {
      const productPayload: Product = {
        id: productForm.id.trim(),
        name: productForm.name.trim(),
        category: productForm.category,
        regularPrice: regPrice,
        discountPrice: discPrice,
        stockQuantity: stockQty,
        stock: stockQty,
        stockStatus: stockStat,
        description: productForm.description.trim(),
        image: mainImg,
        mainImage: mainImg,
        galleryImages: productForm.gallery,
        gallery: productForm.gallery,
        isPublished: productForm.published,
        published: productForm.published,
        createdAt: isEditing ? (products.find((p) => p.id === productForm.id)?.createdAt || new Date().toISOString()) : new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await saveProduct(productPayload);
      showToast(isEditing ? 'প্রোডাক্ট সফলভাবে আপডেট হয়েছে!' : 'নতুন প্রোডাক্ট সফলভাবে যুক্ত হয়েছে!', 'success');
      setActiveTab('products');
    } catch (err) {
      console.error('Error saving product:', err);
      showToast('প্রোডাক্ট সেভ করা যায়নি। ফায়ারবেস পারমিশন চেক করুন।', 'error');
    }
  };

  // Confirm Delete Product
  const handleExecuteDeleteProduct = async () => {
    if (!productToDelete) return;
    setIsDeletingProduct(true);
    try {
      await deleteProduct(productToDelete.id);
      // Clean up storage if safe
      if (productToDelete.mainImage) {
        deleteStorageImage(productToDelete.mainImage).catch(() => {});
      }
      showToast('প্রোডাক্টটি সফলভাবে ডিলিট করা হয়েছে।', 'success');
      setProductToDelete(null);
    } catch (err) {
      console.error('Delete error:', err);
      showToast('প্রোডাক্ট ডিলিট করা সম্ভব হয়নি।', 'error');
    } finally {
      setIsDeletingProduct(false);
    }
  };

  // Toggle Publish / Unpublish
  const handleTogglePublish = async (prod: Product) => {
    const currentPub = prod.published !== undefined ? prod.published : (prod.isPublished !== undefined ? prod.isPublished : true);
    const newPub = !currentPub;

    try {
      await saveProduct({
        ...prod,
        published: newPub,
        isPublished: newPub,
      });
      showToast(newPub ? 'প্রোডাক্টটি পাবলিশ করা হয়েছে।' : 'প্রোডাক্টটি আনপাবলিশ করা হয়েছে।', 'info');
    } catch {
      showToast('স্ট্যাটাস পরিবর্তন ব্যর্থ হয়েছে।', 'error');
    }
  };

  // Save Settings
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await saveSettings(settingsForm);
      showToast('সেটিংস সফলভাবে সংরক্ষিত হয়েছে!');
    } catch {
      showToast('সেটিংস সংরক্ষণ ব্যর্থ হয়েছে।', 'error');
    }
  };

  // Source Export ZIP
  const handleExportSource = async () => {
    setExporting(true);
    try {
      const blob = await generateProjectZip();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `masum-shop-source-${new Date().toISOString().slice(0, 10)}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast('প্রজেক্ট সোর্স কোড ZIP সফলভাবে ডাউনলোড হয়েছে!', 'success');
    } catch (err) {
      console.error(err);
      showToast('এক্সপোর্ট করতে সমস্যা হয়েছে।', 'error');
    } finally {
      setExporting(false);
    }
  };

  const handleCloseDashboard = () => {
    setIsAdminDashboardOpen(false);
    window.location.hash = '';
    window.history.pushState(null, '', '/');
  };

  return (
    <div className={`${isPage ? 'min-h-screen' : 'fixed inset-0 z-50'} overflow-hidden bg-slate-900/80 backdrop-blur-xs flex`}>
      <div className="w-full h-full bg-slate-100 flex flex-col md:flex-row overflow-hidden">
        {/* Sidebar */}
        <aside className="w-full md:w-64 bg-slate-950 text-slate-300 flex flex-col border-r border-slate-800 flex-shrink-0">
          {/* Header */}
          <div className="p-4 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-600 flex items-center justify-center text-white font-black text-base shadow-md">
                MS
              </div>
              <div>
                <h1 className="text-sm font-black text-white leading-tight">MASUM SHOP</h1>
                <span className="text-[10px] text-emerald-400 font-bold tracking-wider uppercase">
                  অ্যাডমিন ড্যাশবোর্ড
                </span>
              </div>
            </div>
            {!isPage && (
              <button
                onClick={handleCloseDashboard}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg md:hidden"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Masked Administrator Badge */}
          <div className="px-4 py-2.5 bg-slate-900/80 border-b border-slate-800/80 text-xs text-slate-300 flex items-center gap-2 font-semibold">
            <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>Administrator</span>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 overflow-y-auto p-3 space-y-1 text-xs font-semibold">
            <button
              onClick={() => setActiveTab('overview')}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl transition-all ${
                activeTab === 'overview'
                  ? 'bg-emerald-600 text-white font-bold shadow-md'
                  : 'hover:bg-slate-900 text-slate-400 hover:text-white'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Dashboard (ওভারভিউ)</span>
            </button>

            <button
              onClick={() => setActiveTab('products')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all ${
                activeTab === 'products'
                  ? 'bg-emerald-600 text-white font-bold shadow-md'
                  : 'hover:bg-slate-900 text-slate-400 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Package className="w-4 h-4" />
                <span>Products (প্রোডাক্টস)</span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-bold">
                {products.length}
              </span>
            </button>

            {/* Prominent + Add Product inside Navigation */}
            <button
              onClick={handleOpenAddProduct}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl transition-all ${
                activeTab === 'add-product' && !isEditing
                  ? 'bg-emerald-600 text-white font-bold shadow-md'
                  : 'text-emerald-400 hover:bg-emerald-950/40 hover:text-emerald-300 font-bold'
              }`}
            >
              <PlusCircle className="w-4 h-4 text-emerald-400" />
              <span>+ Add Product (নতুন প্রোডাক্ট যোগ)</span>
            </button>

            <button
              onClick={() => setActiveTab('categories')}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl transition-all ${
                activeTab === 'categories'
                  ? 'bg-emerald-600 text-white font-bold shadow-md'
                  : 'hover:bg-slate-900 text-slate-400 hover:text-white'
              }`}
            >
              <FolderTree className="w-4 h-4" />
              <span>Categories (ক্যাটাগরি)</span>
            </button>

            <button
              onClick={() => setActiveTab('orders')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all ${
                activeTab === 'orders'
                  ? 'bg-emerald-600 text-white font-bold shadow-md'
                  : 'hover:bg-slate-900 text-slate-400 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <ShoppingBag className="w-4 h-4" />
                <span>Orders (অর্ডার)</span>
              </div>
              {pendingOrders > 0 && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 font-black">
                  {pendingOrders}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('customers')}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl transition-all ${
                activeTab === 'customers'
                  ? 'bg-emerald-600 text-white font-bold shadow-md'
                  : 'hover:bg-slate-900 text-slate-400 hover:text-white'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Customers (কাস্টমারস)</span>
            </button>

            <button
              onClick={() => setActiveTab('banners')}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl transition-all ${
                activeTab === 'banners'
                  ? 'bg-emerald-600 text-white font-bold shadow-md'
                  : 'hover:bg-slate-900 text-slate-400 hover:text-white'
              }`}
            >
              <ImageIcon className="w-4 h-4" />
              <span>Banner Ads (বিজ্ঞাপন ব্যানার)</span>
            </button>

            <div className="pt-2 pb-1 text-[10px] font-bold text-slate-500 uppercase tracking-wider px-3">
              সেটিংস ও এক্সপোর্ট
            </div>

            <button
              onClick={() => setActiveTab('payment-settings')}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl transition-all ${
                activeTab === 'payment-settings'
                  ? 'bg-emerald-600 text-white font-bold shadow-md'
                  : 'hover:bg-slate-900 text-slate-400 hover:text-white'
              }`}
            >
              <CreditCard className="w-4 h-4" />
              <span>Payment Settings (পেমেন্ট সেটিংস)</span>
            </button>

            <button
              onClick={() => setActiveTab('delivery-settings')}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl transition-all ${
                activeTab === 'delivery-settings'
                  ? 'bg-emerald-600 text-white font-bold shadow-md'
                  : 'hover:bg-slate-900 text-slate-400 hover:text-white'
              }`}
            >
              <Truck className="w-4 h-4" />
              <span>Delivery Settings (ডেলিভারি চার্জ)</span>
            </button>

            <button
              onClick={() => setActiveTab('website-settings')}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl transition-all ${
                activeTab === 'website-settings'
                  ? 'bg-emerald-600 text-white font-bold shadow-md'
                  : 'hover:bg-slate-900 text-slate-400 hover:text-white'
              }`}
            >
              <Globe className="w-4 h-4" />
              <span>Website Settings (ওয়েবসাইট)</span>
            </button>

            <button
              onClick={() => setActiveTab('social-settings')}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl transition-all ${
                activeTab === 'social-settings'
                  ? 'bg-emerald-600 text-white font-bold shadow-md'
                  : 'hover:bg-slate-900 text-slate-400 hover:text-white'
              }`}
            >
              <Share2 className="w-4 h-4" />
              <span>Social Media (সোশাল মিডিয়া)</span>
            </button>

            <button
              onClick={() => setActiveTab('source-export')}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl transition-all ${
                activeTab === 'source-export'
                  ? 'bg-amber-600 text-white font-bold shadow-md'
                  : 'hover:bg-slate-900 text-amber-400 hover:text-amber-300'
              }`}
            >
              <Download className="w-4 h-4" />
              <span>Source Export (সোর্স কোড ZIP)</span>
            </button>
          </nav>

          {/* Footer Actions */}
          <div className="p-3 border-t border-slate-800 space-y-2">
            <button
              onClick={handleCloseDashboard}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>গ্রাহক ওয়েবসাইট দেখুন</span>
            </button>

            <button
              onClick={async () => {
                await logout();
                handleCloseDashboard();
                showToast('লগআউট সম্পন্ন হয়েছে।', 'info');
              }}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-red-950/60 hover:bg-red-900 text-red-300 text-xs font-semibold transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout (লগআউট)</span>
            </button>
          </div>
        </aside>

        {/* Main Workspace Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {/* Top Bar inside dashboard */}
          <div className="flex items-center justify-between pb-5 border-b border-slate-200 mb-6">
            <div>
              <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
                MASUM SHOP Admin
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 capitalize">
                {activeTab === 'products'
                  ? 'প্রোডাক্ট ম্যানেজমেন্ট (Products)'
                  : activeTab === 'add-product'
                  ? isEditing
                    ? 'প্রোডাক্ট এডিট করুন (Edit Product)'
                    : 'নতুন প্রোডাক্ট যোগ করুন (Add Product)'
                  : activeTab.replace('-', ' ')}
              </h2>
            </div>

            <div className="flex items-center gap-3">
              {/* Prominent Quick Add Product button always accessible on top bar */}
              {activeTab !== 'add-product' && (
                <button
                  onClick={handleOpenAddProduct}
                  className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-md transition-all active:scale-95"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ নতুন প্রোডাক্ট যোগ করুন</span>
                </button>
              )}

              {!isPage && (
                <button
                  onClick={handleCloseDashboard}
                  className="hidden md:flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold shadow-2xs transition-colors"
                >
                  <X className="w-4 h-4" />
                  <span>বন্ধ করুন</span>
                </button>
              )}
            </div>
          </div>

          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                  <div className="flex items-center justify-between text-slate-500 mb-2">
                    <span className="text-xs font-bold">মোট প্রোডাক্ট</span>
                    <Package className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div className="text-2xl font-black text-slate-900">{totalProducts}</div>
                  <span className="text-[11px] text-emerald-600 font-semibold mt-1 block">
                    {activeProducts} টি লাইভ স্টকে
                  </span>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                  <div className="flex items-center justify-between text-slate-500 mb-2">
                    <span className="text-xs font-bold">আউট অফ স্টক</span>
                    <AlertTriangle className="w-4 h-4 text-amber-500" />
                  </div>
                  <div className="text-2xl font-black text-slate-900">{outOfStockProducts}</div>
                  <span className="text-[11px] text-slate-500 font-medium mt-1 block">
                    স্টক আপডেট প্রয়োজন
                  </span>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                  <div className="flex items-center justify-between text-slate-500 mb-2">
                    <span className="text-xs font-bold">মোট অর্ডার</span>
                    <ShoppingBag className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="text-2xl font-black text-slate-900">{totalOrders}</div>
                  <span className="text-[11px] text-amber-600 font-bold mt-1 block">
                    {pendingOrders} টি পেন্ডিং অর্ডার
                  </span>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                  <div className="flex items-center justify-between text-slate-500 mb-2">
                    <span className="text-xs font-bold">কনফার্মড অর্ডার</span>
                    <CheckCircle className="w-4 h-4 text-teal-600" />
                  </div>
                  <div className="text-2xl font-black text-slate-900">{confirmedOrders}</div>
                  <span className="text-[11px] text-teal-600 font-semibold mt-1 block">
                    প্রসেসিং এ রয়েছে
                  </span>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                  <div className="flex items-center justify-between text-slate-500 mb-2">
                    <span className="text-xs font-bold">ডেলিভার্ড অর্ডার</span>
                    <Truck className="w-4 h-4 text-emerald-700" />
                  </div>
                  <div className="text-2xl font-black text-slate-900">{deliveredOrders}</div>
                  <span className="text-[11px] text-emerald-700 font-semibold mt-1 block">
                    সম্পূর্ণ সম্পন্ন
                  </span>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                  <div className="flex items-center justify-between text-slate-500 mb-2">
                    <span className="text-xs font-bold">বাতিল অর্ডার</span>
                    <XCircle className="w-4 h-4 text-rose-500" />
                  </div>
                  <div className="text-2xl font-black text-slate-900">{cancelledOrders}</div>
                  <span className="text-[11px] text-rose-500 font-medium mt-1 block">
                    ক্যান্সেলড অর্ডার
                  </span>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs sm:col-span-2">
                  <div className="flex items-center justify-between text-slate-500 mb-2">
                    <span className="text-xs font-bold">সর্বমোট বিক্রি (Total Sales)</span>
                    <DollarSign className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div className="text-2xl sm:text-3xl font-black text-emerald-800">
                    ৳ {totalSales.toLocaleString('bn-BD')}
                  </div>
                  <span className="text-[11px] text-slate-500 font-medium mt-1 block">
                    গ্রাহকের মোট অর্ডারের পরিমাণ
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PRODUCTS LIST (SECTION 4 & 8) */}
          {activeTab === 'products' && (
            <div className="space-y-4">
              {/* Action Toolbar */}
              <div className="flex flex-col sm:flex-row justify-between items-center gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                <div className="relative w-full sm:w-80">
                  <input
                    type="text"
                    placeholder="প্রোডাক্টের নাম বা ক্যাটাগরি খুঁজুন..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 pl-9 pr-4 text-xs focus:outline-none focus:border-emerald-600"
                  />
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>

                {/* Prominently visible Add Product Button */}
                <button
                  onClick={handleOpenAddProduct}
                  className="w-full sm:w-auto px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-md transition-all active:scale-95"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ নতুন প্রোডাক্ট যোগ করুন (+ Add Product)</span>
                </button>
              </div>

              {/* Empty Product State (Section 14) */}
              {products.length === 0 ? (
                <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center shadow-xs">
                  <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4 text-emerald-600">
                    <Package className="w-10 h-10" />
                  </div>
                  <h3 className="text-lg font-black text-slate-900 mb-1">
                    এখনো কোনো প্রোডাক্ট যোগ করা হয়নি।
                  </h3>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto mb-6">
                    আপনার স্টোরে বিক্রির জন্য প্রথম প্রোডাক্টটি যুক্ত করতে নিচের বাটনে ক্লিক করুন।
                  </p>
                  <button
                    onClick={handleOpenAddProduct}
                    className="px-6 py-3.5 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white rounded-2xl text-sm font-bold shadow-lg shadow-emerald-700/20 flex items-center gap-2 mx-auto active:scale-95 transition-all"
                  >
                    <Plus className="w-5 h-5" />
                    <span>+ নতুন প্রোডাক্ট যোগ করুন</span>
                  </button>
                </div>
              ) : (
                /* Product Table (Section 8) */
                <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                        <tr>
                          <th className="p-4">ছবি ও নাম</th>
                          <th className="p-4">ক্যাটাগরি</th>
                          <th className="p-4">মূল্য (Price)</th>
                          <th className="p-4">স্টক (Stock)</th>
                          <th className="p-4">স্ট্যাটাস (Status)</th>
                          <th className="p-4 text-right">অ্যাকশন (Actions)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {products.map((prod) => {
                          const isPub =
                            prod.published !== undefined
                              ? prod.published
                              : (prod.isPublished !== undefined ? prod.isPublished : true);
                          const stQty = prod.stockQuantity ?? prod.stock ?? 0;
                          const img = prod.mainImage || prod.image;

                          return (
                            <tr key={prod.id} className="hover:bg-slate-50/80 transition-colors">
                              <td className="p-4">
                                <div className="flex items-center gap-3">
                                  <img
                                    src={img}
                                    alt={prod.name}
                                    className="w-12 h-12 object-cover rounded-xl bg-slate-100 border border-slate-200 flex-shrink-0"
                                  />
                                  <div className="max-w-xs">
                                    <span className="font-bold text-slate-900 block truncate leading-tight">
                                      {prod.name}
                                    </span>
                                    <span className="text-[10px] text-slate-400 font-mono">
                                      ID: {prod.id}
                                    </span>
                                  </div>
                                </div>
                              </td>
                              <td className="p-4 font-semibold text-slate-700">{prod.category}</td>
                              <td className="p-4">
                                <div className="font-bold text-slate-900">
                                  ৳ {(prod.discountPrice ?? prod.regularPrice).toLocaleString('bn-BD')}
                                </div>
                                {prod.discountPrice && (
                                  <div className="text-[10px] text-slate-400 line-through">
                                    ৳ {prod.regularPrice.toLocaleString('bn-BD')}
                                  </div>
                                )}
                              </td>
                              <td className="p-4">
                                <span
                                  className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                                    prod.stockStatus === 'in_stock' && stQty > 0
                                      ? 'bg-emerald-100 text-emerald-800'
                                      : 'bg-red-100 text-red-800'
                                  }`}
                                >
                                  {prod.stockStatus === 'in_stock' && stQty > 0
                                    ? `স্টক আছে (${stQty})`
                                    : 'স্টক শেষ'}
                                </span>
                              </td>
                              <td className="p-4">
                                <button
                                  onClick={() => handleTogglePublish(prod)}
                                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-colors ${
                                    isPub
                                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-300'
                                      : 'bg-slate-100 text-slate-500 border border-slate-200'
                                  }`}
                                  title={isPub ? 'ক্লিক করে আনপাবলিশ করুন' : 'ক্লিক করে পাবলিশ করুন'}
                                >
                                  {isPub ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                                  <span>{isPub ? 'Publish (পাবলিশ)' : 'Unpublish (আনপাবলিশ)'}</span>
                                </button>
                              </td>
                              <td className="p-4 text-right">
                                <div className="flex items-center justify-end gap-2">
                                  <button
                                    onClick={() => handleOpenEditProduct(prod)}
                                    className="px-2.5 py-1.5 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-700 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors border border-slate-200"
                                  >
                                    <Edit className="w-3.5 h-3.5" />
                                    <span>Edit</span>
                                  </button>

                                  <button
                                    onClick={() => setProductToDelete(prod)}
                                    className="px-2.5 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors border border-red-200"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                    <span>Delete</span>
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: ADD / EDIT PRODUCT PAGE (SECTION 5, 6, 7, 9) */}
          {activeTab === 'add-product' && (
            <div className="max-w-3xl bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div>
                  <h3 className="text-base font-black text-slate-900">
                    {isEditing ? 'প্রোডাক্ট এডিট করুন (Edit Product)' : 'নতুন প্রোডাক্ট যুক্ত করুন (Add Product)'}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    প্রোডাক্টের যাবতীয় তথ্য ও ডিভাইস গ্যালারি থেকে ছবি সিলেক্ট করে সেভ করুন।
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('products')}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold"
                >
                  Cancel (বাতিল)
                </button>
              </div>

              <form onSubmit={handleSaveProduct} className="space-y-5 text-xs">
                {/* Product Name */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Product Name (প্রোডাক্টের নাম) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={productForm.name}
                    onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                    placeholder="যেমন: Wireless RGB Gaming Headphone"
                    className="w-full bg-slate-50 border border-slate-300 focus:border-emerald-600 rounded-xl p-3 text-xs sm:text-sm focus:outline-none"
                  />
                </div>

                {/* Product ID & Category */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Product ID</label>
                    <input
                      type="text"
                      required
                      value={productForm.id}
                      onChange={(e) => setProductForm({ ...productForm, id: e.target.value })}
                      className="w-full bg-slate-100 border border-slate-300 rounded-xl p-2.5 font-mono text-xs focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Category (ক্যাটাগরি)</label>
                    <select
                      value={productForm.category}
                      onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs sm:text-sm focus:outline-none"
                    >
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.slug}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Regular Price & Discount Price */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Regular Price (রেগুলার মূল্য - টাকা) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      required
                      min={1}
                      value={productForm.regularPrice}
                      onChange={(e) =>
                        setProductForm({
                          ...productForm,
                          regularPrice: e.target.value === '' ? '' : Number(e.target.value),
                        })
                      }
                      placeholder="2500"
                      className="w-full bg-slate-50 border border-slate-300 focus:border-emerald-600 rounded-xl p-2.5 text-xs sm:text-sm focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Discount Price (ডিসকাউন্ট মূল্য - ঐচ্ছিক)
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={productForm.discountPrice}
                      onChange={(e) =>
                        setProductForm({
                          ...productForm,
                          discountPrice: e.target.value === '' ? '' : Number(e.target.value),
                        })
                      }
                      placeholder="1950"
                      className="w-full bg-slate-50 border border-slate-300 focus:border-emerald-600 rounded-xl p-2.5 text-xs sm:text-sm focus:outline-none"
                    />
                  </div>
                </div>

                {/* Stock Quantity & Status */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Stock Quantity (স্টক পরিমাণ)
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={productForm.stockQuantity}
                      onChange={(e) =>
                        setProductForm({
                          ...productForm,
                          stockQuantity: e.target.value === '' ? '' : Number(e.target.value),
                          stockStatus: Number(e.target.value) > 0 ? 'in_stock' : 'out_of_stock',
                        })
                      }
                      className="w-full bg-slate-50 border border-slate-300 focus:border-emerald-600 rounded-xl p-2.5 text-xs sm:text-sm focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Stock Status (স্টক স্ট্যাটাস)
                    </label>
                    <select
                      value={productForm.stockStatus}
                      onChange={(e) =>
                        setProductForm({
                          ...productForm,
                          stockStatus: e.target.value as 'in_stock' | 'out_of_stock',
                        })
                      }
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs sm:text-sm focus:outline-none"
                    >
                      <option value="in_stock">স্টক আছে (In Stock)</option>
                      <option value="out_of_stock">স্টক শেষ (Out of Stock)</option>
                    </select>
                  </div>
                </div>

                {/* Gallery Image Upload (Section 6) */}
                <div className="bg-slate-50 p-4 sm:p-5 rounded-2xl border border-slate-200 space-y-4">
                  <div>
                    <span className="block font-bold text-slate-800 text-xs sm:text-sm">
                      Product Images & Gallery (ডিভাইস গ্যালারি থেকে ছবি আপলোড)
                    </span>
                    <span className="text-[11px] text-slate-500">
                      আপনার ফোন (Android/iPhone) বা কম্পিউটার থেকে এক বা একাধিক ছবি নির্বাচন করুন।
                    </span>
                  </div>

                  {/* Buttons for Gallery Upload */}
                  <div className="flex flex-wrap items-center gap-3">
                    <label className="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold text-xs flex items-center gap-2 cursor-pointer shadow-sm transition-all active:scale-95">
                      <Upload className="w-4 h-4" />
                      <span>Gallery থেকে ছবি নির্বাচন করুন</span>
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleGalleryFileSelect}
                        className="hidden"
                      />
                    </label>

                    <label className="px-4 py-2.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-xl font-bold text-xs flex items-center gap-2 cursor-pointer shadow-2xs">
                      <span>Upload Image</span>
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleGalleryFileSelect}
                        className="hidden"
                      />
                    </label>

                    {uploadingImage && (
                      <div className="flex items-center gap-2 text-emerald-800 font-semibold text-xs">
                        <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
                        <span>ছবি আপলোড হচ্ছে... {uploadProgress !== null ? `${uploadProgress}%` : ''}</span>
                      </div>
                    )}
                  </div>

                  {/* Upload Progress Bar */}
                  {uploadProgress !== null && (
                    <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-emerald-600 h-full transition-all duration-300 rounded-full"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  )}

                  {/* Image Previews & Main Image Selector */}
                  {productForm.gallery.length > 0 ? (
                    <div>
                      <span className="text-[11px] font-bold text-slate-600 block mb-2">
                        আপলোডকৃত ছবিসমূহ (ক্লিক করে প্রধান ছবি সিলেক্ট করুন):
                      </span>
                      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                        {productForm.gallery.map((imgUrl, idx) => {
                          const isMain = productForm.mainImage === imgUrl;
                          return (
                            <div
                              key={idx}
                              className={`relative group rounded-xl overflow-hidden border-2 aspect-square bg-white shadow-2xs ${
                                isMain ? 'border-emerald-600 ring-2 ring-emerald-500/30' : 'border-slate-200'
                              }`}
                            >
                              <img src={imgUrl} alt="gallery-item" className="w-full h-full object-cover" />

                              {/* Main image tag */}
                              {isMain && (
                                <div className="absolute top-1 left-1 bg-emerald-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded shadow-xs flex items-center gap-0.5">
                                  <Star className="w-2.5 h-2.5 fill-current" />
                                  <span>মেইন</span>
                                </div>
                              )}

                              {/* Action Overlay */}
                              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1 p-1">
                                {!isMain && (
                                  <button
                                    type="button"
                                    onClick={() => setProductForm({ ...productForm, mainImage: imgUrl })}
                                    className="px-1.5 py-1 bg-emerald-600 text-white text-[10px] font-bold rounded shadow-xs w-full text-center"
                                  >
                                    মেইন ছবি
                                  </button>
                                )}
                                <button
                                  type="button"
                                  onClick={() => {
                                    const filtered = productForm.gallery.filter((_, i) => i !== idx);
                                    const nextMain =
                                      productForm.mainImage === imgUrl ? filtered[0] || '' : productForm.mainImage;
                                    setProductForm({
                                      ...productForm,
                                      gallery: filtered,
                                      mainImage: nextMain,
                                    });
                                  }}
                                  className="p-1 bg-red-600 text-white rounded text-xs hover:bg-red-700"
                                  title="মুছে ফেলুন"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 bg-white rounded-xl border border-dashed border-slate-300 text-center text-slate-400">
                      কোনো ছবি সিলেক্ট করা নেই। উপরের বাটনে ক্লিক করে ডিভাইস গ্যালারি থেকে ছবি যোগ করুন।
                    </div>
                  )}
                </div>

                {/* Product Description */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Product Description (প্রোডাক্ট বিবরণ)
                  </label>
                  <textarea
                    rows={4}
                    value={productForm.description}
                    onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                    placeholder="প্রোডাক্টের গুণগত মান, বিশেষ ফিচার, সাইজ, ওয়ারেন্টি বা স্পেসিফিকেশন বিস্তারিত লিখুন..."
                    className="w-full bg-slate-50 border border-slate-300 focus:border-emerald-600 rounded-xl p-3 text-xs sm:text-sm focus:outline-none"
                  />
                </div>

                {/* Published Checkbox (Section 11) */}
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-800 text-xs">
                    <input
                      type="checkbox"
                      checked={productForm.published}
                      onChange={(e) => setProductForm({ ...productForm, published: e.target.checked })}
                      className="w-4 h-4 text-emerald-600 rounded"
                    />
                    <span>গ্রাহক ওয়েবসাইটে সাথে সাথে প্রদর্শন করুন (Publish on customer website)</span>
                  </label>
                </div>

                {/* Form Buttons */}
                <div className="flex items-center gap-3 pt-3 border-t border-slate-100">
                  <button
                    type="submit"
                    className="px-7 py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl shadow-md transition-all active:scale-95 text-xs sm:text-sm"
                  >
                    {isEditing ? 'Save Changes (সংরক্ষণ করুন)' : 'Add Product (প্রোডাক্ট যুক্ত করুন)'}
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab('products')}
                    className="px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs sm:text-sm"
                  >
                    Cancel (বাতিল)
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 4: CATEGORIES */}
          {activeTab === 'categories' && (
            <div className="space-y-6 max-w-2xl">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-3 shadow-xs">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  নতুন ক্যাটাগরি যোগ করুন
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <input
                    type="text"
                    placeholder="ক্যাটাগরির নাম"
                    value={newCatName}
                    onChange={(e) => {
                      setNewCatName(e.target.value);
                      setNewCatSlug(e.target.value.toLowerCase().replace(/[\s_]+/g, '-'));
                    }}
                    className="bg-slate-50 border border-slate-300 rounded-xl p-2.5"
                  />
                  <input
                    type="text"
                    placeholder="স্লাগ (Slug)"
                    value={newCatSlug}
                    onChange={(e) => setNewCatSlug(e.target.value)}
                    className="bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-mono"
                  />
                </div>
                <button
                  onClick={async () => {
                    if (!newCatName.trim()) return;
                    const catId = newCatSlug.trim() || `cat-${Date.now()}`;
                    await saveCategory({
                      id: catId,
                      name: newCatName.trim(),
                      slug: newCatSlug.trim() || catId,
                      createdAt: new Date().toISOString(),
                    });
                    setNewCatName('');
                    setNewCatSlug('');
                    showToast('ক্যাটাগরি যুক্ত হয়েছে!');
                  }}
                  className="px-4 py-2 bg-emerald-700 text-white rounded-xl text-xs font-bold"
                >
                  ক্যাটাগরি সেভ করুন
                </button>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 text-slate-600 font-bold border-b">
                    <tr>
                      <th className="p-3.5">ক্যাটাগরি নাম</th>
                      <th className="p-3.5">স্লাগ</th>
                      <th className="p-3.5 text-right">মুছুন</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {categories.map((cat) => (
                      <tr key={cat.id}>
                        <td className="p-3.5 font-bold text-slate-800">{cat.name}</td>
                        <td className="p-3.5 font-mono text-slate-500">{cat.slug}</td>
                        <td className="p-3.5 text-right">
                          <button
                            onClick={async () => {
                              if (window.confirm('ক্যাটাগরি ডিলিট করবেন?')) {
                                await deleteCategory(cat.id);
                                showToast('ক্যাটাগরি মোছা হয়েছে।');
                              }
                            }}
                            className="p-1 text-red-500 hover:text-red-700"
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

          {/* TAB 5: ORDERS */}
          {activeTab === 'orders' && (
            <div className="space-y-4">
              <div className="bg-white p-4 rounded-2xl border border-slate-200 flex flex-col sm:flex-row gap-3 justify-between items-center text-xs shadow-xs">
                <div className="relative w-full sm:w-72">
                  <input
                    type="text"
                    value={orderSearch}
                    onChange={(e) => setOrderSearch(e.target.value)}
                    placeholder="অর্ডার আইডি বা ফোন দিয়ে খুঁজুন..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 pl-9 pr-3"
                  />
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <span className="font-semibold text-slate-600">স্ট্যাটাস:</span>
                  <select
                    value={orderStatusFilter}
                    onChange={(e) => setOrderStatusFilter(e.target.value)}
                    className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 font-semibold"
                  >
                    <option value="all">সকল অর্ডার</option>
                    <option value="Pending">Pending</option>
                    <option value="Confirmed">Confirmed</option>
                    <option value="Processing">Processing</option>
                    <option value="Shipped">Shipped</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-50 text-slate-600 font-bold border-b">
                      <tr>
                        <th className="p-3.5">অর্ডার আইডি</th>
                        <th className="p-3.5">গ্রাহকের নাম ও ফোন</th>
                        <th className="p-3.5">লোকেশন</th>
                        <th className="p-3.5">মূল্য</th>
                        <th className="p-3.5">পেমেন্ট TrxID</th>
                        <th className="p-3.5">ডেলিভারি চার্জ</th>
                        <th className="p-3.5">স্ট্যাটাস</th>
                        <th className="p-3.5 text-right">অ্যাকশন</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {orders
                        .filter((ord) => {
                          if (orderStatusFilter !== 'all' && ord.orderStatus !== orderStatusFilter) {
                            return false;
                          }
                          if (orderSearch.trim()) {
                            const q = orderSearch.toLowerCase().trim();
                            return (
                              ord.orderId.toLowerCase().includes(q) ||
                              ord.customerName.toLowerCase().includes(q) ||
                              ord.phone.includes(q) ||
                              ord.transactionId.toLowerCase().includes(q)
                            );
                          }
                          return true;
                        })
                        .map((order) => (
                          <tr key={order.orderId} className="hover:bg-slate-50">
                            <td className="p-3.5 font-mono font-bold text-slate-900">
                              {order.orderId}
                            </td>
                            <td className="p-3.5">
                              <span className="font-bold text-slate-800 block">
                                {order.customerName}
                              </span>
                              <span className="text-[11px] text-slate-500 font-mono">
                                {order.phone}
                              </span>
                            </td>
                            <td className="p-3.5 text-slate-700">
                              {order.deliveryLocation === 'inside_cox' ? 'কক্সবাজার সদর' : 'বাইরে'}
                            </td>
                            <td className="p-3.5 font-bold text-slate-900">
                              ৳ {order.grandTotal.toLocaleString('bn-BD')}
                            </td>
                            <td className="p-3.5">
                              <span className="font-bold uppercase text-slate-700 block">
                                {order.paymentMethod}
                              </span>
                              <span className="font-mono text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                                {order.transactionId}
                              </span>
                            </td>
                            <td className="p-3.5">
                              <button
                                onClick={async () => {
                                  const nextStatus: DeliveryPaymentStatus =
                                    order.deliveryPaymentStatus === 'verified'
                                      ? 'paid_pending_verification'
                                      : 'verified';
                                  await updateOrderStatus(order.orderId, order.orderStatus, nextStatus);
                                  showToast(
                                    nextStatus === 'verified'
                                      ? 'ডেলিভারি চার্জ ভেরিফাইড!'
                                      : 'পেন্ডিং এ ফেরানো হয়েছে।'
                                  );
                                }}
                                className={`px-2 py-0.5 rounded-md font-bold text-[10px] flex items-center gap-1 ${
                                  order.deliveryPaymentStatus === 'verified'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : 'bg-amber-100 text-amber-900'
                                }`}
                              >
                                {order.deliveryPaymentStatus === 'verified' ? (
                                  <Check className="w-3 h-3" />
                                ) : (
                                  <Clock className="w-3 h-3" />
                                )}
                                <span>
                                  {order.deliveryPaymentStatus === 'verified' ? 'ভেরিফাইড' : 'পেন্ডিং'}
                                </span>
                              </button>
                            </td>
                            <td className="p-3.5">
                              <select
                                value={order.orderStatus}
                                onChange={async (e) => {
                                  const newStat = e.target.value as OrderStatus;
                                  await updateOrderStatus(order.orderId, newStat);
                                  showToast(`স্ট্যাটাস ${newStat} করা হয়েছে!`);
                                }}
                                className="bg-slate-100 border border-slate-300 rounded-lg px-2 py-1 text-xs font-bold"
                              >
                                <option value="Pending">Pending</option>
                                <option value="Confirmed">Confirmed</option>
                                <option value="Processing">Processing</option>
                                <option value="Shipped">Shipped</option>
                                <option value="Delivered">Delivered</option>
                                <option value="Cancelled">Cancelled</option>
                              </select>
                            </td>
                            <td className="p-3.5 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() => setSelectedOrderDetails(order)}
                                  className="p-1.5 text-slate-600 hover:text-emerald-700 rounded-lg hover:bg-emerald-50"
                                >
                                  <Eye className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={async () => {
                                    if (window.confirm('এই অর্ডারটি মুছে ফেলবেন?')) {
                                      await deleteOrder(order.orderId);
                                      showToast('অর্ডার ডিলিট হয়েছে।');
                                    }
                                  }}
                                  className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: CUSTOMERS */}
          {activeTab === 'customers' && (
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
              <h3 className="text-sm font-black text-slate-900 mb-4">
                কাস্টমার ডিরেক্টরি ({customersList.length} জন গ্রাহক)
              </h3>
              <div className="overflow-x-auto text-xs">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 text-slate-500 font-bold border-b">
                    <tr>
                      <th className="p-3">নাম</th>
                      <th className="p-3">মোবাইল</th>
                      <th className="p-3">মোট অর্ডার</th>
                      <th className="p-3">মোট কেনাকাটা</th>
                      <th className="p-3">সর্বশেষ অর্ডার</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {customersList.map((c, idx) => (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="p-3 font-bold text-slate-800">{c.name}</td>
                        <td className="p-3 font-mono text-slate-600">{c.phone}</td>
                        <td className="p-3 font-semibold text-slate-800">{c.totalOrders} টি</td>
                        <td className="p-3 font-bold text-emerald-800">
                          ৳ {c.totalSpent.toLocaleString('bn-BD')}
                        </td>
                        <td className="p-3 text-slate-500">
                          {new Date(c.lastOrder).toLocaleDateString('bn-BD')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 7: BANNERS */}
          {activeTab === 'banners' && (
            <div className="space-y-6 max-w-2xl">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-3 shadow-xs">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  বিজ্ঞাপন ব্যানার যোগ করুন
                </h3>
                <div className="space-y-3 text-xs">
                  <input
                    type="text"
                    value={bannerForm.title || ''}
                    onChange={(e) => setBannerForm({ ...bannerForm, title: e.target.value })}
                    placeholder="ব্যানার শিরোনাম"
                    className="w-full bg-slate-50 border rounded-xl p-2.5"
                  />
                  <input
                    type="text"
                    value={bannerForm.image || ''}
                    onChange={(e) => setBannerForm({ ...bannerForm, image: e.target.value })}
                    placeholder="ছবির URL"
                    className="w-full bg-slate-50 border rounded-xl p-2.5"
                  />
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={bannerForm.isEnabled ?? true}
                      onChange={(e) => setBannerForm({ ...bannerForm, isEnabled: e.target.checked })}
                      className="w-4 h-4 text-emerald-600 rounded"
                    />
                    <span className="font-semibold text-slate-700">সক্রিয় বিজ্ঞাপন</span>
                  </div>
                  <button
                    onClick={async () => {
                      if (!bannerForm.title || !bannerForm.image) return;
                      const bId = `banner-${Date.now()}`;
                      await saveBanner({
                        id: bId,
                        title: bannerForm.title.trim(),
                        image: bannerForm.image.trim(),
                        isEnabled: bannerForm.isEnabled ?? true,
                        order: banners.length + 1,
                        createdAt: new Date().toISOString(),
                      });
                      setBannerForm({ title: '', image: '', link: '', isEnabled: true, order: 1 });
                      showToast('ব্যানার যুক্ত হয়েছে!');
                    }}
                    className="px-4 py-2 bg-emerald-700 text-white rounded-xl text-xs font-bold"
                  >
                    ব্যানার সেভ করুন
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                {banners.map((b) => (
                  <div
                    key={b.id}
                    className="bg-white p-4 rounded-2xl border border-slate-200 flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3">
                      <img src={b.image} alt={b.title} className="w-16 h-10 object-cover rounded-lg" />
                      <div>
                        <span className="text-xs font-bold text-slate-800 block">{b.title}</span>
                        <span className="text-[10px] text-slate-400">
                          {b.isEnabled ? 'সক্রিয়' : 'নিষ্ক্রিয়'}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={async () => {
                        if (window.confirm('ব্যানারটি মুছবেন?')) {
                          await deleteBanner(b.id);
                          showToast('ব্যানার ডিলিট হয়েছে।');
                        }
                      }}
                      className="p-1 text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 8: PAYMENT SETTINGS */}
          {activeTab === 'payment-settings' && (
            <div className="max-w-xl bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4 text-xs">
              <h3 className="text-sm font-black text-slate-900 pb-2 border-b">
                পেমেন্ট নম্বর সেটিংস
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">bKash নম্বর:</label>
                  <input
                    type="text"
                    value={settingsForm.bkashNumber}
                    onChange={(e) => setSettingsForm({ ...settingsForm, bkashNumber: e.target.value })}
                    className="w-full bg-slate-50 border rounded-xl p-2.5 font-mono text-sm"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Nagad নম্বর:</label>
                  <input
                    type="text"
                    value={settingsForm.nagadNumber}
                    onChange={(e) => setSettingsForm({ ...settingsForm, nagadNumber: e.target.value })}
                    className="w-full bg-slate-50 border rounded-xl p-2.5 font-mono text-sm"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">পেমেন্ট নির্দেশাবলী:</label>
                  <textarea
                    rows={3}
                    value={settingsForm.paymentInstructions}
                    onChange={(e) => setSettingsForm({ ...settingsForm, paymentInstructions: e.target.value })}
                    className="w-full bg-slate-50 border rounded-xl p-2.5"
                  />
                </div>
                <button
                  onClick={handleSaveSettings}
                  className="px-6 py-2.5 bg-emerald-700 text-white rounded-xl font-bold shadow-md hover:bg-emerald-800"
                >
                  পেমেন্ট সেটিংস সংরক্ষণ করুন
                </button>
              </div>
            </div>
          )}

          {/* TAB 9: DELIVERY SETTINGS */}
          {activeTab === 'delivery-settings' && (
            <div className="max-w-xl bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4 text-xs">
              <h3 className="text-sm font-black text-slate-900 pb-2 border-b">
                ডেলিভারি চার্জ রেট সেটিংস
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    কক্সবাজার সদর এর ভিতরে ডেলিভারি চার্জ (টাকা):
                  </label>
                  <input
                    type="number"
                    value={settingsForm.defaultInsideDeliveryCharge}
                    onChange={(e) =>
                      setSettingsForm({
                        ...settingsForm,
                        defaultInsideDeliveryCharge: Number(e.target.value),
                      })
                    }
                    className="w-full bg-slate-50 border rounded-xl p-2.5 font-bold text-sm"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    কক্সবাজারের বাইরে ডেলিভারি চার্জ (টাকা):
                  </label>
                  <input
                    type="number"
                    value={settingsForm.defaultOutsideDeliveryCharge}
                    onChange={(e) =>
                      setSettingsForm({
                        ...settingsForm,
                        defaultOutsideDeliveryCharge: Number(e.target.value),
                      })
                    }
                    className="w-full bg-slate-50 border rounded-xl p-2.5 font-bold text-sm"
                  />
                </div>
                <button
                  onClick={handleSaveSettings}
                  className="px-6 py-2.5 bg-emerald-700 text-white rounded-xl font-bold shadow-md hover:bg-emerald-800"
                >
                  ডেলিভারি সেটিংস সংরক্ষণ করুন
                </button>
              </div>
            </div>
          )}

          {/* TAB 10: WEBSITE SETTINGS */}
          {activeTab === 'website-settings' && (
            <div className="max-w-xl bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4 text-xs">
              <h3 className="text-sm font-black text-slate-900 pb-2 border-b">
                ওয়েবসাইট তথ্য ও ব্রান্ডিং
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">ওয়েবসাইটের নাম</label>
                  <input
                    type="text"
                    value={settingsForm.websiteName}
                    onChange={(e) => setSettingsForm({ ...settingsForm, websiteName: e.target.value })}
                    className="w-full bg-slate-50 border rounded-xl p-2.5 text-sm font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">হটলাইন নম্বর</label>
                  <input
                    type="text"
                    value={settingsForm.contactNumber}
                    onChange={(e) => setSettingsForm({ ...settingsForm, contactNumber: e.target.value })}
                    className="w-full bg-slate-50 border rounded-xl p-2.5"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">হোমপেজ ব্যানার ইমেজ URL</label>
                  <input
                    type="text"
                    value={settingsForm.homepageBanner}
                    onChange={(e) => setSettingsForm({ ...settingsForm, homepageBanner: e.target.value })}
                    className="w-full bg-slate-50 border rounded-xl p-2.5"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">ফুটার বিবরণী</label>
                  <textarea
                    rows={2}
                    value={settingsForm.footerText}
                    onChange={(e) => setSettingsForm({ ...settingsForm, footerText: e.target.value })}
                    className="w-full bg-slate-50 border rounded-xl p-2.5"
                  />
                </div>
                <button
                  onClick={handleSaveSettings}
                  className="px-6 py-2.5 bg-emerald-700 text-white rounded-xl font-bold shadow-md hover:bg-emerald-800"
                >
                  ওয়েবসাইট সেটিংস সেভ করুন
                </button>
              </div>
            </div>
          )}

          {/* TAB 11: SOCIAL MEDIA */}
          {activeTab === 'social-settings' && (
            <div className="max-w-xl bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4 text-xs">
              <h3 className="text-sm font-black text-slate-900 pb-2 border-b">
                সোশাল মিডিয়া লিঙ্ক সমূহ
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Facebook URL:</label>
                  <input
                    type="text"
                    value={settingsForm.facebookUrl}
                    onChange={(e) => setSettingsForm({ ...settingsForm, facebookUrl: e.target.value })}
                    className="w-full bg-slate-50 border rounded-xl p-2.5"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">TikTok URL:</label>
                  <input
                    type="text"
                    value={settingsForm.tiktokUrl}
                    onChange={(e) => setSettingsForm({ ...settingsForm, tiktokUrl: e.target.value })}
                    className="w-full bg-slate-50 border rounded-xl p-2.5"
                  />
                </div>
                <button
                  onClick={handleSaveSettings}
                  className="px-6 py-2.5 bg-emerald-700 text-white rounded-xl font-bold shadow-md hover:bg-emerald-800"
                >
                  সোশাল লিঙ্ক সেভ করুন
                </button>
              </div>
            </div>
          )}

          {/* TAB 12: SOURCE EXPORT */}
          {activeTab === 'source-export' && (
            <div className="max-w-2xl bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-900 flex items-center justify-center flex-shrink-0">
                  <Download className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900">
                    Source & Export System (সোর্স কোড ডাউনলোড)
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    সম্পূর্ণ ওয়েবসাইটের লেটেস্ট সোর্স কোড ও ডকুমেন্টেশন সহ ZIP প্যাকেজ ডাউনলোড করুন।
                  </p>
                </div>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs text-slate-600 space-y-2">
                <p>🔒 <strong>নিরাপত্তা গ্যারান্টি:</strong> পাবলিক এক্সপোর্ট প্যাকেজে কোনো প্রাইভেট পাসওয়ার্ড বা সিক্রেট কি রাখা হয় না।</p>
              </div>

              <button
                onClick={handleExportSource}
                disabled={exporting}
                className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white font-bold text-xs sm:text-sm rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-amber-600/25 transition-all disabled:opacity-50"
              >
                {exporting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>ZIP প্যাকেজ তৈরি হচ্ছে...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    <span>সম্পূর্ণ প্রজেক্ট ZIP ডাউনলোড করুন</span>
                  </>
                )}
              </button>
            </div>
          )}
        </main>
      </div>

      {/* Delete Product Confirmation Modal (Section 10) */}
      {productToDelete && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 text-center space-y-4 shadow-2xl border border-slate-200">
            <div className="w-14 h-14 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-7 h-7" />
            </div>

            <div>
              <h4 className="text-base font-black text-slate-900">
                আপনি কি এই প্রোডাক্টটি ডিলিট করতে চান?
              </h4>
              <p className="text-xs text-slate-500 mt-1">
                &ldquo;{productToDelete.name}&rdquo; ডিলিট করলে এটি সাথে সাথে ওয়েবসাইট এবং ডেটাবেস থেকে মুছে যাবে।
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => setProductToDelete(null)}
                disabled={isDeletingProduct}
                className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl"
              >
                Cancel (বাতিল)
              </button>

              <button
                type="button"
                onClick={handleExecuteDeleteProduct}
                disabled={isDeletingProduct}
                className="py-2.5 px-4 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-md shadow-red-600/20"
              >
                {isDeletingProduct ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
                <span>Delete (ডিলিট)</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Order Details Inspector Modal */}
      {selectedOrderDetails && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b pb-3">
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase">
                  অর্ডার বিস্তারিত
                </span>
                <h4 className="text-base font-black text-slate-900 font-mono">
                  {selectedOrderDetails.orderId}
                </h4>
              </div>
              <button
                onClick={() => setSelectedOrderDetails(null)}
                className="p-1 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <p><strong>গ্রাহক:</strong> {selectedOrderDetails.customerName}</p>
              <p><strong>ফোন:</strong> {selectedOrderDetails.phone}</p>
              <p><strong>ঠিকানা:</strong> {selectedOrderDetails.address}</p>
              <p><strong>পেমেন্ট মেথড:</strong> {selectedOrderDetails.paymentMethod.toUpperCase()}</p>
              <p><strong>Transaction ID:</strong> <span className="font-mono font-bold bg-amber-50 px-2 py-0.5 rounded border border-amber-200">{selectedOrderDetails.transactionId}</span></p>
              <p><strong>ডেলিভারি চার্জ:</strong> ৳{selectedOrderDetails.deliveryCharge}</p>
              <p><strong>ক্যাশ অন ডেলিভারিতে প্রদেয়:</strong> ৳{selectedOrderDetails.productTotal}</p>
              <p><strong>সর্বমোট মূল্য:</strong> ৳{selectedOrderDetails.grandTotal}</p>
            </div>

            <div className="border-t pt-3 space-y-2">
              <span className="text-xs font-bold text-slate-700 block">অর্ডারকৃত পণ্য:</span>
              {selectedOrderDetails.products?.map((item, i) => (
                <div key={i} className="flex justify-between items-center text-xs bg-slate-50 p-2 rounded-xl">
                  <span className="truncate max-w-[240px]">{item.productName} × {item.quantity}</span>
                  <span className="font-bold">৳{(item.price * item.quantity).toLocaleString('bn-BD')}</span>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t flex justify-end">
              <button
                onClick={() => window.print()}
                className="flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>প্রিন্ট চালান</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
