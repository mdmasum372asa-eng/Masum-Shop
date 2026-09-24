import React, { useState } from 'react';
import { useShop } from '../../context/ShopContext';
import { useAuth } from '../../context/AuthContext';
import {
  Search,
  ShoppingCart,
  Phone,
  ShieldCheck,
  Truck,
  Sparkles,
  PackageSearch,
  X,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const {
    settings,
    categories,
    activeCategory,
    setActiveCategory,
    searchQuery,
    setSearchQuery,
    cartCount,
    setIsCartOpen,
    setIsOrderTrackOpen,
    setIsAdminLoginOpen,
    setIsAdminDashboardOpen,
  } = useShop();

  const { isAdmin } = useAuth();
  const [isSearchMobileOpen, setIsSearchMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-emerald-100/60 shadow-xs">
      {/* Top Banner Ribbon */}
      <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-emerald-950 text-white text-xs py-1.5 px-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2 font-medium">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
            </span>
            <span className="hidden sm:inline">স্বাগতম {settings.websiteName}-এ!</span>
            <span className="flex items-center gap-1 text-emerald-200">
              <Truck className="w-3.5 h-3.5" /> কক্সবাজার সহ সারাদেশে নির্ভরযোগ্য হোম ডেলিভারি
            </span>
          </div>

          <div className="flex items-center gap-4">
            <a
              href={`tel:${settings.contactNumber}`}
              className="flex items-center gap-1 text-amber-300 hover:text-amber-200 font-semibold transition-colors"
            >
              <Phone className="w-3 h-3" />
              <span>{settings.contactNumber}</span>
            </a>

            {/* Social Media Buttons in Header */}
            <div className="flex items-center gap-2 border-l border-emerald-700/60 pl-3">
              <a
                href={settings.facebookUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:scale-110 text-emerald-200 hover:text-white transition-all"
                title="ফেসবুক পেজ"
                aria-label="Facebook Page"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </a>
              <a
                href={settings.tiktokUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:scale-110 text-emerald-200 hover:text-white transition-all"
                title="টিকটক প্রোফাইল"
                aria-label="TikTok Profile"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.24 1.07-.14 1.61.24 1.64 1.82 2.89 3.5 2.77 1.81-.04 3.37-1.41 3.58-3.22.06-.55.06-1.1.06-1.65.01-4.83-.01-9.66.02-14.49z" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Main Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
        <div className="flex items-center justify-between gap-4">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setActiveCategory('all');
                setSearchQuery('');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="flex items-center gap-2 group text-left focus:outline-none"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 via-teal-600 to-amber-500 p-0.5 shadow-md group-hover:scale-105 transition-transform flex items-center justify-center">
                <div className="w-full h-full bg-emerald-950 rounded-[10px] flex items-center justify-center text-white font-extrabold text-lg tracking-wider">
                  M
                </div>
              </div>
              <div>
                <div className="flex items-center gap-1">
                  <span className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 group-hover:text-emerald-700 transition-colors">
                    {settings.websiteName}
                  </span>
                  <Sparkles className="w-4 h-4 text-amber-500 fill-amber-400" />
                </div>
                <p className="text-[10px] text-emerald-700 font-semibold tracking-wider uppercase -mt-1 hidden sm:block">
                  Premium Gadget & Lifestyle
                </p>
              </div>
            </button>
          </div>

          {/* Desktop Search Bar */}
          <div className="hidden md:flex flex-1 max-w-md mx-4">
            <div className="relative w-full">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="পণ্য বা মডেল সার্চ করুন (যেমন: Speaker, Watch...)"
                className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:bg-white rounded-full py-2 pl-10 pr-10 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Mobile Search Toggle */}
            <button
              onClick={() => setIsSearchMobileOpen(!isSearchMobileOpen)}
              className="md:hidden p-2 text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-xl transition-colors"
              aria-label="Search"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Track Order Button */}
            <button
              onClick={() => setIsOrderTrackOpen(true)}
              className="hidden lg:flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 hover:text-emerald-700 hover:bg-emerald-50/70 rounded-xl border border-slate-200 transition-colors"
            >
              <PackageSearch className="w-4 h-4 text-emerald-600" />
              <span>অর্ডার ট্র্যাক</span>
            </button>

            {/* Admin Portal Button - Only visible if authenticated as Admin */}
            {isAdmin && (
              <button
                onClick={() => {
                  window.location.hash = 'admin';
                  setIsAdminDashboardOpen(true);
                }}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-emerald-800 bg-emerald-100/80 hover:bg-emerald-200 rounded-xl border border-emerald-300 transition-all shadow-xs"
              >
                <ShieldCheck className="w-4 h-4 text-emerald-700" />
                <span className="hidden sm:inline">ড্যাশবোর্ড</span>
              </button>
            )}

            {/* Cart Button */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white px-3.5 py-2 rounded-xl font-semibold text-sm shadow-md hover:shadow-lg transition-all active:scale-95"
              aria-label="View Cart"
            >
              <ShoppingCart className="w-4 h-4" />
              <span className="hidden sm:inline">কার্ট</span>
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-amber-500 text-slate-950 text-xs font-black w-5 h-5 rounded-full flex items-center justify-center shadow-sm animate-pulse">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Search Bar Expandable */}
        {isSearchMobileOpen && (
          <div className="mt-3 md:hidden">
            <div className="relative w-full">
              <input
                type="text"
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="পণ্য সার্চ করুন..."
                className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:bg-white rounded-xl py-2.5 pl-10 pr-10 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* Category Navigation Ribbon */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pt-3 pb-1 border-t border-slate-100 mt-2 text-xs font-medium">
          <button
            onClick={() => setActiveCategory('all')}
            className={`px-3 py-1.5 rounded-full whitespace-nowrap transition-all ${
              activeCategory === 'all'
                ? 'bg-emerald-700 text-white font-bold shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            সব পণ্য
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.slug)}
              className={`px-3 py-1.5 rounded-full whitespace-nowrap transition-all ${
                activeCategory === cat.slug
                  ? 'bg-emerald-700 text-white font-bold shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>
    </header>
  );
};
