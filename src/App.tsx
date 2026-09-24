import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ShopProvider, useShop } from './context/ShopContext';
import { Navbar } from './components/layout/Navbar';
import { MobileBottomNav } from './components/layout/MobileBottomNav';
import { HeroBanner } from './components/home/HeroBanner';
import { CategoriesSection } from './components/home/CategoriesSection';
import { ProductGrid } from './components/product/ProductGrid';
import { AdvertisementSection } from './components/home/AdvertisementSection';
import { Footer } from './components/layout/Footer';
import { ProductDetailsModal } from './components/product/ProductDetailsModal';
import { CartDrawer } from './components/cart/CartDrawer';
import { CheckoutModal } from './components/checkout/CheckoutModal';
import { OrderSuccessModal } from './components/checkout/OrderSuccessModal';
import { OrderTrackModal } from './components/order/OrderTrackModal';
import { AdminLoginModal } from './components/admin/AdminLoginModal';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { ToastContainer } from './components/common/ToastContainer';
import { Phone, Loader2, ShieldCheck } from 'lucide-react';

const CustomerStoreLayout: React.FC = () => {
  const { settings } = useShop();

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans selection:bg-emerald-500 selection:text-white">
      {/* Toast notifications */}
      <ToastContainer />

      {/* Main Header (No public admin login link) */}
      <Navbar />

      {/* Hero Banner with Slides */}
      <main className="flex-1">
        <HeroBanner />

        {/* Categories Carousel/Bar */}
        <CategoriesSection />

        {/* Product Catalog with Tabs & Filters */}
        <ProductGrid />

        {/* Bottom Advertisement Banner Section */}
        <AdvertisementSection />
      </main>

      {/* Footer */}
      <Footer />

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav />

      {/* Modals & Overlays */}
      <ProductDetailsModal />
      <CartDrawer />
      <CheckoutModal />
      <OrderSuccessModal />
      <OrderTrackModal />
      <AdminLoginModal />
      <AdminDashboard />

      {/* Floating Quick Action Contacts on Desktop */}
      <div className="hidden lg:flex fixed bottom-6 left-6 z-30 flex-col gap-2.5">
        <a
          href={`tel:${settings.contactNumber}`}
          className="flex items-center gap-2 bg-emerald-700 hover:bg-emerald-800 text-white px-3.5 py-2 rounded-full shadow-lg text-xs font-bold transition-transform hover:scale-105"
          title="হটলাইনে সরাসরি কল করুন"
        >
          <Phone className="w-3.5 h-3.5" />
          <span>{settings.contactNumber}</span>
        </a>

        <a
          href={settings.facebookUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 bg-[#1877F2] hover:opacity-95 text-white px-3.5 py-2 rounded-full shadow-lg text-xs font-bold transition-transform hover:scale-105"
          title="ফেসবুক পেজ ভিজিট করুন"
        >
          <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
          </svg>
          <span>Facebook Page</span>
        </a>
      </div>
    </div>
  );
};

const AppRouter: React.FC = () => {
  const { isAdmin, loading: authLoading } = useAuth();

  const getRoute = (): 'customer' | 'admin' | 'admin-login' => {
    const path = window.location.pathname.toLowerCase();
    const hash = window.location.hash.toLowerCase().replace('#', '').replace(/^\//, '');

    if (path === '/admin/login' || hash === 'admin/login') return 'admin-login';
    if (path === '/admin' || hash === 'admin') return 'admin';
    return 'customer';
  };

  const [route, setRoute] = useState<'customer' | 'admin' | 'admin-login'>(getRoute);

  useEffect(() => {
    const handleUrlChange = () => {
      setRoute(getRoute());
    };

    window.addEventListener('popstate', handleUrlChange);
    window.addEventListener('hashchange', handleUrlChange);

    return () => {
      window.removeEventListener('popstate', handleUrlChange);
      window.removeEventListener('hashchange', handleUrlChange);
    };
  }, []);

  // Protected /admin Route
  if (route === 'admin') {
    if (authLoading) {
      return (
        <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
          <span className="text-xs font-semibold text-slate-300">অ্যাডমিন প্রমাণীকরণ যাচাই হচ্ছে...</span>
        </div>
      );
    }

    // Non-authenticated user accessing /admin is redirected to /admin/login
    if (!isAdmin) {
      return (
        <div className="min-h-screen bg-slate-900">
          <ToastContainer />
          <AdminLoginModal isPage={true} />
        </div>
      );
    }

    // Authenticated admin accessing /admin
    return (
      <div className="min-h-screen bg-slate-100">
        <ToastContainer />
        <AdminDashboard isPage={true} />
      </div>
    );
  }

  // /admin/login Route
  if (route === 'admin-login') {
    if (authLoading) {
      return (
        <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
          <span className="text-xs font-semibold text-slate-300">যাচাই হচ্ছে...</span>
        </div>
      );
    }

    if (isAdmin) {
      return (
        <div className="min-h-screen bg-slate-100">
          <ToastContainer />
          <AdminDashboard isPage={true} />
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-slate-900">
        <ToastContainer />
        <AdminLoginModal isPage={true} />
      </div>
    );
  }

  // Default: Public Customer Storefront
  return <CustomerStoreLayout />;
};

export default function App() {
  return (
    <AuthProvider>
      <ShopProvider>
        <AppRouter />
      </ShopProvider>
    </AuthProvider>
  );
}
