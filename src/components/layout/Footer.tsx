import React from 'react';
import { useShop } from '../../context/ShopContext';
import { Phone, MapPin, ShieldCheck, Truck, Sparkles, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  const { settings, setIsOrderTrackOpen } = useShop();

  return (
    <footer className="bg-slate-950 text-slate-300 pt-16 pb-24 md:pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 pb-12 border-b border-slate-800/80">
          {/* Brand Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-amber-500 flex items-center justify-center text-slate-950 font-black text-base shadow-md">
                M
              </div>
              <span className="text-xl font-black text-white tracking-tight">
                {settings.websiteName}
              </span>
            </div>

            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              {settings.footerText}
            </p>

            {/* Social Media Links */}
            <div className="space-y-2 pt-1">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                আমাদের সোশাল মিডিয়া:
              </span>
              <div className="flex items-center gap-3">
                {/* Facebook Button */}
                <a
                  href={settings.facebookUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-3.5 py-2 bg-blue-600/90 hover:bg-blue-600 text-white rounded-xl text-xs font-bold shadow-md hover:scale-105 transition-all"
                  aria-label="Facebook Page"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                  <span>Facebook</span>
                </a>

                {/* TikTok Button */}
                <a
                  href={settings.tiktokUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold border border-slate-700 shadow-md hover:scale-105 transition-all"
                  aria-label="TikTok Profile"
                >
                  <svg className="w-4 h-4 fill-current text-teal-400" viewBox="0 0 24 24">
                    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.24 1.07-.14 1.61.24 1.64 1.82 2.89 3.5 2.77 1.81-.04 3.37-1.41 3.58-3.22.06-.55.06-1.1.06-1.65.01-4.83-.01-9.66.02-14.49z" />
                  </svg>
                  <span>TikTok</span>
                </a>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">দ্রুত লিঙ্ক</h3>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <a href="#products-section" className="hover:text-emerald-400 transition-colors">
                  সব গ্যাজেট ও পণ্য
                </a>
              </li>
              <li>
                <a href="#categories-section" className="hover:text-emerald-400 transition-colors">
                  পণ্য ক্যাটাগরি সমূহ
                </a>
              </li>
              <li>
                <a href="#featured" className="hover:text-emerald-400 transition-colors">
                  ফিচার্ড কালেকশন
                </a>
              </li>
              <li>
                <button
                  onClick={() => setIsOrderTrackOpen(true)}
                  className="hover:text-emerald-400 text-left transition-colors"
                >
                  অর্ডার ট্র্যাকিং
                </button>
              </li>
            </ul>
          </div>

          {/* Delivery & Prepayment Policy */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              ডেলিভারি ও পেমেন্ট
            </h3>
            <div className="text-xs text-slate-400 space-y-2 leading-relaxed">
              <p className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                <Truck className="w-4 h-4" /> কক্সবাজার সদর: ৳{settings.defaultInsideDeliveryCharge || 70}
              </p>
              <p className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                <Truck className="w-4 h-4" /> সারা বাংলাদেশ: ৳{settings.defaultOutsideDeliveryCharge || 130}
              </p>
              <div className="p-3 bg-red-950/40 border border-red-800/60 rounded-xl text-red-200 text-[11px] leading-snug">
                ⚠️ <strong>অগ্রিম পেমেন্ট নিয়ম:</strong> অর্ডার নিশ্চিত করার জন্য ডেলিভারি চার্জ বিকাশ
                বা নগদে আগে পেমেন্ট করা বাধ্যতামূলক।
              </div>
            </div>
          </div>

          {/* Contact Support */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">যোগাযোগ</h3>
            <div className="space-y-2.5 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-amber-400 flex-shrink-0" />
                <a
                  href={`tel:${settings.contactNumber}`}
                  className="font-bold text-white hover:text-amber-300 text-sm"
                >
                  {settings.contactNumber}
                </a>
              </div>
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span>কক্সবাজার, বাংলাদেশ।</span>
              </div>
              <div className="pt-2">
                <span className="text-[11px] text-slate-500 block">
                  সাপোর্ট সময়: প্রতিদিন সকাল ১০টা - রাত ১০টা
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} {settings.websiteName}. সর্বস্বত্ব সংরক্ষিত।</p>
          <p className="flex items-center gap-1">
            Made with <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" /> for Bangladeshi Shoppers
          </p>
        </div>
      </div>
    </footer>
  );
};
