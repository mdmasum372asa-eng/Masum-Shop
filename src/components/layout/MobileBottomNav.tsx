import React from 'react';
import { useShop } from '../../context/ShopContext';
import { useAuth } from '../../context/AuthContext';
import { Home, Grid, ShoppingBag, PackageSearch, ShieldCheck, Phone } from 'lucide-react';

export const MobileBottomNav: React.FC = () => {
  const {
    cartCount,
    setIsCartOpen,
    setIsOrderTrackOpen,
    setActiveCategory,
    setIsAdminLoginOpen,
    setIsAdminDashboardOpen,
  } = useShop();
  const { isAdmin } = useAuth();

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg border-t border-slate-200 px-2 py-2 shadow-2xl">
      <div className="flex items-center justify-around">
        {/* Home */}
        <button
          onClick={() => {
            setActiveCategory('all');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="flex flex-col items-center gap-0.5 text-slate-600 hover:text-emerald-700 active:scale-95 transition-transform"
        >
          <Home className="w-5 h-5" />
          <span className="text-[10px] font-medium">হোম</span>
        </button>

        {/* Categories */}
        <button
          onClick={() => {
            const el = document.getElementById('categories-section');
            if (el) {
              el.scrollIntoView({ behavior: 'smooth' });
            } else {
              window.scrollTo({ top: 350, behavior: 'smooth' });
            }
          }}
          className="flex flex-col items-center gap-0.5 text-slate-600 hover:text-emerald-700 active:scale-95 transition-transform"
        >
          <Grid className="w-5 h-5" />
          <span className="text-[10px] font-medium">ক্যাটাগরি</span>
        </button>

        {/* Cart in center with prominent badge */}
        <button
          onClick={() => setIsCartOpen(true)}
          className="relative flex flex-col items-center justify-center -mt-5 bg-gradient-to-tr from-emerald-600 to-teal-700 text-white w-12 h-12 rounded-full shadow-lg active:scale-90 transition-transform"
          aria-label="Cart"
        >
          <ShoppingBag className="w-5 h-5" />
          {cartCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-amber-500 text-slate-950 font-black text-[10px] w-5 h-5 rounded-full flex items-center justify-center border-2 border-white shadow-xs">
              {cartCount}
            </span>
          )}
        </button>

        {/* Track Order */}
        <button
          onClick={() => setIsOrderTrackOpen(true)}
          className="flex flex-col items-center gap-0.5 text-slate-600 hover:text-emerald-700 active:scale-95 transition-transform"
        >
          <PackageSearch className="w-5 h-5" />
          <span className="text-[10px] font-medium">ট্র্যাক</span>
        </button>

        {/* Hotline or Admin if authenticated */}
        {isAdmin ? (
          <button
            onClick={() => {
              window.location.hash = 'admin';
              setIsAdminDashboardOpen(true);
            }}
            className="flex flex-col items-center gap-0.5 text-emerald-700 active:scale-95 transition-transform font-bold"
          >
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            <span className="text-[10px]">অ্যাডমিন</span>
          </button>
        ) : (
          <a
            href="tel:01740370546"
            className="flex flex-col items-center gap-0.5 text-slate-600 hover:text-emerald-700 active:scale-95 transition-transform"
          >
            <Phone className="w-5 h-5" />
            <span className="text-[10px] font-medium">হেল্পলাইন</span>
          </a>
        )}
      </div>
    </div>
  );
};
