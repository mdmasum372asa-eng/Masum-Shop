import React, { useState, useEffect } from 'react';
import { useShop } from '../../context/ShopContext';
import { Sparkles, ArrowRight, ShieldCheck, Truck, Zap, ChevronLeft, ChevronRight } from 'lucide-react';

export const HeroBanner: React.FC = () => {
  const { settings, banners, setActiveCategory } = useShop();
  const activeBanners = banners.filter((b) => b.isEnabled);

  const [currentSlide, setCurrentSlide] = useState(0);

  // Auto rotate hero slides every 5 seconds if multiple banners exist
  useEffect(() => {
    if (activeBanners.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % activeBanners.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [activeBanners.length]);

  const activeBanner = activeBanners[currentSlide] || null;

  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-emerald-950 via-slate-900 to-slate-950 text-white py-12 md:py-16 px-4 sm:px-6">
      {/* Subtle background glow & mesh */}
      <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-emerald-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-teal-600/20 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Text Content */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-semibold backdrop-blur-sm animate-pulse">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>১০০% অথেনটিক গ্যাজেট ও প্রিমিয়াম কোয়ালিটি</span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tight leading-tight">
              {activeBanner ? activeBanner.title : 'প্রিমিয়াম গ্যাজেটে সেরা ডিসকাউন্ট ও দ্রুত ডেলিভারি'}
            </h1>

            <p className="text-slate-300 text-sm sm:text-base md:text-lg max-w-xl mx-auto lg:mx-0 leading-relaxed">
              কক্সবাজার সদর সহ সমগ্র বাংলাদেশে হোম ডেলিভারি। আসল ও টেকসই গ্যাজেট, ব্লুটুথ স্পিকার, স্মার্টওয়াচ এবং ইয়ারবাডস বেছে নিন নিশ্চিন্তে।
            </p>

            {/* Feature Badges */}
            <div className="flex flex-wrap justify-center lg:justify-start gap-4 text-xs font-medium text-slate-300">
              <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 px-3 py-1.5 rounded-lg">
                <Truck className="w-4 h-4 text-emerald-400" />
                <span>দ্রুত ডেলিভারি</span>
              </div>
              <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 px-3 py-1.5 rounded-lg">
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                <span>কোয়ালিটি চেকড</span>
              </div>
              <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 px-3 py-1.5 rounded-lg">
                <Zap className="w-4 h-4 text-teal-400" />
                <span>অগ্রিম ডেলিভারি সুবিধায় অর্ডার</span>
              </div>
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
              <a
                href="#products-section"
                onClick={() => setActiveCategory('all')}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-600 hover:to-teal-700 text-slate-950 font-bold text-sm sm:text-base shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
              >
                <span>পণ্য কালেকশন দেখুন</span>
                <ArrowRight className="w-4 h-4" />
              </a>

              <a
                href="#featured"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/20 text-white font-semibold text-sm transition-all"
              >
                <span>ধামাকা অফার সমূহ</span>
              </a>
            </div>
          </div>

          {/* Banner Graphic / Slider */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md lg:max-w-none group">
              <div className="aspect-4/3 sm:aspect-16/10 rounded-2xl overflow-hidden border border-emerald-500/30 shadow-2xl bg-slate-900 relative">
                <img
                  src={
                    activeBanner?.image ||
                    settings.homepageBanner ||
                    'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80'
                  }
                  alt={activeBanner?.title || 'Featured Product'}
                  className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
                  loading="eager"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />

                {/* Floating Tag */}
                <div className="absolute bottom-4 left-4 right-4 p-3 bg-slate-900/90 backdrop-blur-md rounded-xl border border-white/10 flex items-center justify-between">
                  <div>
                    <span className="text-emerald-400 text-xs font-bold uppercase tracking-wider block">
                      হট ডিল কালেকশন
                    </span>
                    <span className="text-white text-sm font-semibold truncate block">
                      {settings.websiteName} বিশেষ আয়োজন
                    </span>
                  </div>
                  <span className="px-2.5 py-1 bg-amber-500 text-slate-950 text-xs font-extrabold rounded-lg">
                    HOT
                  </span>
                </div>
              </div>

              {/* Slider controls if multiple banners */}
              {activeBanners.length > 1 && (
                <>
                  <button
                    onClick={() =>
                      setCurrentSlide((prev) => (prev - 1 + activeBanners.length) % activeBanners.length)
                    }
                    className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-black/50 hover:bg-black/80 text-white rounded-full backdrop-blur-xs transition-colors"
                    aria-label="Previous slide"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setCurrentSlide((prev) => (prev + 1) % activeBanners.length)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-black/50 hover:bg-black/80 text-white rounded-full backdrop-blur-xs transition-colors"
                    aria-label="Next slide"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>

                  <div className="flex justify-center gap-1.5 mt-3">
                    {activeBanners.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => setCurrentSlide(idx)}
                        className={`h-1.5 rounded-full transition-all ${
                          idx === currentSlide ? 'w-6 bg-emerald-400' : 'w-2 bg-white/30'
                        }`}
                        aria-label={`Slide ${idx + 1}`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
