import React from 'react';
import { useShop } from '../../context/ShopContext';
import { Sparkles, ArrowRight } from 'lucide-react';

export const AdvertisementSection: React.FC = () => {
  const { banners, setActiveCategory } = useShop();

  const activeBanners = banners.filter((b) => b.isEnabled);

  if (activeBanners.length === 0) return null;

  return (
    <section className="py-12 bg-white border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center gap-2 mb-6">
          <Sparkles className="w-5 h-5 text-amber-500 fill-amber-400" />
          <h2 className="text-xl sm:text-2xl font-black text-slate-900">
            বিশেষ অফার ও বিজ্ঞাপনী আয়োজন
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {activeBanners.map((banner) => (
            <div
              key={banner.id}
              className="group relative rounded-3xl overflow-hidden shadow-lg border border-slate-200 aspect-16/9 bg-slate-900"
            >
              <img
                src={banner.image}
                alt={banner.title}
                loading="lazy"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-80"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent p-6 sm:p-8 flex flex-col justify-end">
                <span className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-1">
                  মাসুম শপ প্রমোশন
                </span>
                <h3 className="text-lg sm:text-xl md:text-2xl font-black text-white leading-snug max-w-md">
                  {banner.title}
                </h3>
                <div className="mt-4">
                  <a
                    href="#products-section"
                    onClick={() => setActiveCategory('all')}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white text-slate-900 hover:bg-emerald-500 hover:text-white font-bold text-xs transition-colors shadow-md"
                  >
                    <span>অফার উপভোগ করুন</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
