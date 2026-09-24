import React, { useState, useMemo } from 'react';
import { useShop } from '../../context/ShopContext';
import { ProductCard } from './ProductCard';
import { Sparkles, SlidersHorizontal, Flame, Clock, Tag } from 'lucide-react';

export const ProductGrid: React.FC = () => {
  const {
    products,
    loading,
    searchQuery,
    setSearchQuery,
    activeCategory,
    setActiveCategory,
    sortBy,
    setSortBy,
    stockFilter,
    setStockFilter,
  } = useShop();

  const [activeTab, setActiveTab] = useState<'all' | 'featured' | 'discount' | 'latest'>('all');

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        // published check
        if (!p.isPublished) return false;

        // category filter
        if (activeCategory !== 'all' && p.category !== activeCategory) {
          return false;
        }

        // search query filter
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const matchName = p.name.toLowerCase().includes(q);
          const matchCategory = p.category.toLowerCase().includes(q);
          const matchDesc = p.description?.toLowerCase().includes(q);
          if (!matchName && !matchCategory && !matchDesc) return false;
        }

        // tab filter
        if (activeTab === 'discount') {
          return p.discountPrice && p.discountPrice < p.regularPrice;
        }
        if (activeTab === 'featured') {
          return p.featured === true;
        }

        // stock filter
        if (stockFilter === 'in_stock') {
          return p.stockStatus === 'in_stock' && p.stockQuantity > 0;
        }

        return true;
      })
      .sort((a, b) => {
        const priceA = a.discountPrice ?? a.regularPrice;
        const priceB = b.discountPrice ?? b.regularPrice;

        if (sortBy === 'price-low') {
          return priceA - priceB;
        }
        if (sortBy === 'price-high') {
          return priceB - priceA;
        }
        if (sortBy === 'discount') {
          const discA = a.discountPrice ? a.regularPrice - a.discountPrice : 0;
          const discB = b.discountPrice ? b.regularPrice - b.discountPrice : 0;
          return discB - discA;
        }
        // default newest
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  }, [products, activeCategory, searchQuery, activeTab, stockFilter, sortBy]);

  return (
    <section id="products-section" className="py-10 bg-slate-100/60 min-h-[600px]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
                আমাদের কালেকশন
              </span>
              <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                {filteredProducts.length} টি পণ্য
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
              {searchQuery ? `"${searchQuery}" এর ফলাফল` : 'জনপ্রিয় ও বাছাইকৃত পণ্য'}
            </h2>
          </div>

          {/* Controls: Tabs & Sort */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Filter Tabs */}
            <div className="inline-flex p-1 bg-white border border-slate-200 rounded-xl shadow-2xs text-xs font-semibold">
              <button
                onClick={() => setActiveTab('all')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  activeTab === 'all' ? 'bg-emerald-700 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                সব পণ্য
              </button>
              <button
                onClick={() => setActiveTab('featured')}
                className={`px-3 py-1.5 rounded-lg flex items-center gap-1 transition-all ${
                  activeTab === 'featured' ? 'bg-emerald-700 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Flame className="w-3.5 h-3.5 text-amber-400" />
                <span>ফিচার্ড</span>
              </button>
              <button
                onClick={() => setActiveTab('discount')}
                className={`px-3 py-1.5 rounded-lg flex items-center gap-1 transition-all ${
                  activeTab === 'discount' ? 'bg-emerald-700 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Tag className="w-3.5 h-3.5 text-rose-500" />
                <span>ডিসকাউন্ট অফার</span>
              </button>
              <button
                onClick={() => setActiveTab('latest')}
                className={`px-3 py-1.5 rounded-lg flex items-center gap-1 transition-all ${
                  activeTab === 'latest' ? 'bg-emerald-700 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Clock className="w-3.5 h-3.5 text-teal-400" />
                <span>নতুন</span>
              </button>
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-1.5 shadow-2xs text-xs">
              <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-transparent font-medium text-slate-700 focus:outline-none cursor-pointer"
              >
                <option value="featured">বাছাইকৃত (Default)</option>
                <option value="price-low">দাম: কম থেকে বেশি</option>
                <option value="price-high">দাম: বেশি থেকে কম</option>
                <option value="discount">সর্বোচ্চ ছাড়</option>
              </select>
            </div>

            {/* In stock only toggle */}
            <button
              onClick={() => setStockFilter(stockFilter === 'all' ? 'in_stock' : 'all')}
              className={`px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
                stockFilter === 'in_stock'
                  ? 'bg-emerald-50 border-emerald-500 text-emerald-800'
                  : 'bg-white border-slate-200 text-slate-600'
              }`}
            >
              {stockFilter === 'in_stock' ? '✓ ইন-স্টক ফিল্টার অন' : 'শুধু ইন-স্টক পণ্য'}
            </button>
          </div>
        </div>

        {/* Loading Skeleton */}
        {loading && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 mt-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="bg-white rounded-2xl p-4 border border-slate-200 animate-pulse space-y-3">
                <div className="aspect-square bg-slate-200 rounded-xl" />
                <div className="h-4 bg-slate-200 rounded-md w-3/4" />
                <div className="h-4 bg-slate-200 rounded-md w-1/2" />
                <div className="h-8 bg-slate-200 rounded-xl w-full" />
              </div>
            ))}
          </div>
        )}

        {/* Product Grid */}
        {!loading && filteredProducts.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6 mt-6">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredProducts.length === 0 && (
          <div className="text-center py-16 px-4 bg-white rounded-3xl border border-slate-200 mt-6 max-w-lg mx-auto shadow-xs">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-8 h-8 text-emerald-600" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-2">কোনো পণ্য পাওয়া যায়নি!</h3>
            <p className="text-slate-500 text-xs sm:text-sm mb-6">
              আপনার দেওয়া ফিল্টার বা সার্চ শব্দের সাথে কোনো পণ্য মিলছে না। ফিল্টার পরিবর্তন করে আবার চেষ্টা করুন।
            </p>
            <button
              onClick={() => {
                setActiveCategory('all');
                setSearchQuery('');
                setActiveTab('all');
                setStockFilter('all');
              }}
              className="px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold text-xs shadow-md transition-colors"
            >
              সব পণ্য রিসেট করুন
            </button>
          </div>
        )}
      </div>
    </section>
  );
};
