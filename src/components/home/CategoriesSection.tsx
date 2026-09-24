import React from 'react';
import { useShop } from '../../context/ShopContext';
import {
  Smartphone,
  Headphones,
  Watch,
  Volume2,
  BatteryCharging,
  Package,
  Layers,
} from 'lucide-react';

export const CategoriesSection: React.FC = () => {
  const { categories, activeCategory, setActiveCategory } = useShop();

  const getIcon = (slug: string) => {
    switch (slug) {
      case 'smart-gadgets':
        return <Smartphone className="w-6 h-6 text-emerald-600" />;
      case 'earbuds-audio':
        return <Headphones className="w-6 h-6 text-indigo-600" />;
      case 'smart-watch':
        return <Watch className="w-6 h-6 text-amber-600" />;
      case 'speakers':
        return <Volume2 className="w-6 h-6 text-rose-600" />;
      case 'power-chargers':
        return <BatteryCharging className="w-6 h-6 text-teal-600" />;
      default:
        return <Package className="w-6 h-6 text-slate-600" />;
    }
  };

  return (
    <section id="categories-section" className="py-8 bg-slate-50 border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
              ক্যাটাগরি সমূহ
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900">
              আপনার পছন্দের পণ্য খুঁজুন
            </h2>
          </div>
          {activeCategory !== 'all' && (
            <button
              onClick={() => setActiveCategory('all')}
              className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 underline"
            >
              সব ক্যাটাগরি রিসেট করুন
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3 sm:gap-4">
          {/* All Categories card */}
          <button
            onClick={() => {
              setActiveCategory('all');
              const el = document.getElementById('products-section');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            className={`p-4 rounded-2xl border transition-all text-center flex flex-col items-center justify-center gap-2 group ${
              activeCategory === 'all'
                ? 'bg-emerald-700 text-white border-emerald-700 shadow-md scale-102'
                : 'bg-white hover:bg-emerald-50/50 border-slate-200 hover:border-emerald-300 text-slate-800 shadow-xs'
            }`}
          >
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 ${
                activeCategory === 'all' ? 'bg-white/20' : 'bg-emerald-100/70'
              }`}
            >
              <Layers
                className={`w-6 h-6 ${activeCategory === 'all' ? 'text-white' : 'text-emerald-700'}`}
              />
            </div>
            <span className="text-xs font-bold leading-tight">সব পণ্য</span>
          </button>

          {categories.map((cat) => {
            const isSelected = activeCategory === cat.slug;
            return (
              <button
                key={cat.id}
                onClick={() => {
                  setActiveCategory(cat.slug);
                  const el = document.getElementById('products-section');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className={`p-4 rounded-2xl border transition-all text-center flex flex-col items-center justify-center gap-2 group ${
                  isSelected
                    ? 'bg-emerald-700 text-white border-emerald-700 shadow-md scale-102'
                    : 'bg-white hover:bg-emerald-50/50 border-slate-200 hover:border-emerald-300 text-slate-800 shadow-xs'
                }`}
              >
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 ${
                    isSelected ? 'bg-white/20' : 'bg-slate-100'
                  }`}
                >
                  {getIcon(cat.slug)}
                </div>
                <span className="text-xs font-bold leading-tight line-clamp-1">{cat.name}</span>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
};
