import React from 'react';
import { Product } from '../../types';
import { useShop } from '../../context/ShopContext';
import { ShoppingCart, Eye, Check, AlertCircle, Zap } from 'lucide-react';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart, buyNow, setSelectedProduct } = useShop();

  const hasDiscount =
    product.discountPrice !== undefined &&
    product.discountPrice > 0 &&
    product.discountPrice < product.regularPrice;

  const currentPrice = hasDiscount ? product.discountPrice! : product.regularPrice;

  const discountPercentage = hasDiscount
    ? Math.round(((product.regularPrice - product.discountPrice!) / product.regularPrice) * 100)
    : 0;

  const isOutOfStock =
    product.stockStatus === 'out_of_stock' || product.stockQuantity <= 0;

  return (
    <div className="group bg-white rounded-2xl border border-slate-200/80 hover:border-emerald-500/50 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden relative">
      {/* Top Badges */}
      <div className="absolute top-2.5 left-2.5 right-2.5 z-10 flex items-center justify-between pointer-events-none">
        {hasDiscount ? (
          <span className="bg-rose-500 text-white font-black text-[11px] px-2 py-0.5 rounded-full shadow-sm">
            -{discountPercentage}% ছাড়
          </span>
        ) : (
          <span />
        )}

        {isOutOfStock ? (
          <span className="bg-slate-800/90 text-red-200 font-semibold text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1 backdrop-blur-xs">
            <AlertCircle className="w-3 h-3" />
            স্টক শেষ
          </span>
        ) : (
          <span className="bg-emerald-600/90 text-white font-medium text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1 backdrop-blur-xs">
            <Check className="w-3 h-3" />
            স্টক আছে
          </span>
        )}
      </div>

      {/* Product Image with Hover Zoom */}
      <div
        onClick={() => setSelectedProduct(product)}
        className="relative aspect-square w-full overflow-hidden bg-slate-100 cursor-pointer"
      >
        <img
          src={
            product.image ||
            'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop&q=80'
          }
          alt={product.name}
          loading="lazy"
          className="w-full h-full object-cover object-center group-hover:scale-108 transition-transform duration-500"
        />

        {/* Quick View overlay on hover */}
        <div className="absolute inset-0 bg-black/25 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 pointer-events-none">
          <span className="px-3 py-1.5 rounded-full bg-white/90 text-slate-900 font-semibold text-xs flex items-center gap-1.5 shadow-md">
            <Eye className="w-3.5 h-3.5 text-emerald-600" />
            বিস্তারিত দেখুন
          </span>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-3.5 sm:p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Category Tag */}
          <span className="text-[11px] font-semibold text-emerald-700 uppercase tracking-wider block mb-1">
            {product.category}
          </span>

          {/* Product Title */}
          <h3
            onClick={() => setSelectedProduct(product)}
            className="text-xs sm:text-sm font-bold text-slate-800 hover:text-emerald-700 transition-colors line-clamp-2 cursor-pointer leading-snug"
            title={product.name}
          >
            {product.name}
          </h3>
        </div>

        {/* Pricing */}
        <div className="mt-3 pt-2 border-t border-slate-100">
          <div className="flex items-baseline gap-2">
            <span className="text-base sm:text-lg font-black text-slate-900">
              ৳ {currentPrice.toLocaleString('bn-BD')}
            </span>
            {hasDiscount && (
              <span className="text-xs text-slate-400 line-through">
                ৳ {product.regularPrice.toLocaleString('bn-BD')}
              </span>
            )}
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-2 mt-3">
            <button
              onClick={() => addToCart(product)}
              disabled={isOutOfStock}
              className={`flex items-center justify-center gap-1 py-2 px-2 rounded-xl text-xs font-bold transition-all ${
                isOutOfStock
                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                  : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300/80 active:scale-95'
              }`}
              title="কার্টে যোগ করুন"
            >
              <ShoppingCart className="w-3.5 h-3.5" />
              <span>কার্টে যোগ</span>
            </button>

            <button
              onClick={() => buyNow(product)}
              disabled={isOutOfStock}
              className={`flex items-center justify-center gap-1 py-2 px-2 rounded-xl text-xs font-bold transition-all shadow-xs ${
                isOutOfStock
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white active:scale-95'
              }`}
              title="এখনই কিনুন"
            >
              <Zap className="w-3.5 h-3.5 fill-amber-300 text-amber-300" />
              <span>অর্ডার করুন</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
