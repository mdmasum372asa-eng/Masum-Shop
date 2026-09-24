import React, { useState, useEffect } from 'react';
import { useShop } from '../../context/ShopContext';
import {
  X,
  ShoppingCart,
  Zap,
  Check,
  AlertCircle,
  Truck,
  ShieldCheck,
  Share2,
  Plus,
  Minus,
} from 'lucide-react';

export const ProductDetailsModal: React.FC = () => {
  const { selectedProduct, setSelectedProduct, addToCart, buyNow, showToast } = useShop();

  const [activeImage, setActiveImage] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);

  useEffect(() => {
    if (selectedProduct) {
      setActiveImage(selectedProduct.image);
      setQuantity(1);
    }
  }, [selectedProduct]);

  if (!selectedProduct) return null;

  const gallery = [
    selectedProduct.image,
    ...(selectedProduct.galleryImages || []).filter((img) => img !== selectedProduct.image),
  ];

  const hasDiscount =
    selectedProduct.discountPrice !== undefined &&
    selectedProduct.discountPrice > 0 &&
    selectedProduct.discountPrice < selectedProduct.regularPrice;

  const currentPrice = hasDiscount
    ? selectedProduct.discountPrice!
    : selectedProduct.regularPrice;

  const discountPercentage = hasDiscount
    ? Math.round(
        ((selectedProduct.regularPrice - selectedProduct.discountPrice!) /
          selectedProduct.regularPrice) *
          100
      )
    : 0;

  const isOutOfStock =
    selectedProduct.stockStatus === 'out_of_stock' || selectedProduct.stockQuantity <= 0;

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      showToast('পণ্যের লিঙ্ক কপি করা হয়েছে!', 'info');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-200 relative flex flex-col">
        {/* Close Button */}
        <button
          onClick={() => setSelectedProduct(null)}
          className="absolute top-4 right-4 z-20 p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full transition-colors"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-4 sm:p-6 md:p-8 grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Left: Product Images & Gallery */}
          <div className="md:col-span-6 space-y-4">
            {/* Main Active Image */}
            <div className="aspect-square rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 relative group">
              <img
                src={activeImage || selectedProduct.image}
                alt={selectedProduct.name}
                className="w-full h-full object-cover object-center transition-transform duration-300 group-hover:scale-105"
              />
              {hasDiscount && (
                <div className="absolute top-3 left-3 bg-rose-600 text-white text-xs font-black px-2.5 py-1 rounded-full shadow-md">
                  -{discountPercentage}% ছাড়
                </div>
              )}
            </div>

            {/* Thumbnail Gallery */}
            {gallery.length > 1 && (
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {gallery.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveImage(img)}
                    className={`w-16 h-16 rounded-xl overflow-hidden border-2 flex-shrink-0 transition-all ${
                      activeImage === img
                        ? 'border-emerald-600 ring-2 ring-emerald-500/30'
                        : 'border-slate-200 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="thumbnail" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right: Product Information & Purchase */}
          <div className="md:col-span-6 flex flex-col justify-between space-y-4">
            <div>
              {/* Category & Share */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                  {selectedProduct.category}
                </span>
                <button
                  onClick={handleShare}
                  className="p-1.5 text-slate-500 hover:text-emerald-700 hover:bg-slate-100 rounded-lg text-xs flex items-center gap-1 transition-colors"
                >
                  <Share2 className="w-4 h-4" />
                  <span>শেয়ার</span>
                </button>
              </div>

              {/* Title */}
              <h2 className="text-lg sm:text-xl font-black text-slate-900 mt-2 leading-snug">
                {selectedProduct.name}
              </h2>

              {/* Price and Savings */}
              <div className="mt-3 p-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
                <div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-black text-slate-900">
                      ৳ {currentPrice.toLocaleString('bn-BD')}
                    </span>
                    {hasDiscount && (
                      <span className="text-sm text-slate-400 line-through">
                        ৳ {selectedProduct.regularPrice.toLocaleString('bn-BD')}
                      </span>
                    )}
                  </div>
                  {hasDiscount && (
                    <span className="text-xs font-semibold text-emerald-700">
                      আপনি সাশ্রয় করছেন ৳{' '}
                      {(selectedProduct.regularPrice - selectedProduct.discountPrice!).toLocaleString(
                        'bn-BD'
                      )}
                    </span>
                  )}
                </div>

                {/* Stock Tag */}
                {isOutOfStock ? (
                  <span className="px-3 py-1 bg-red-100 text-red-700 text-xs font-bold rounded-lg flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    স্টক শেষ
                  </span>
                ) : (
                  <span className="px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-lg flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" />
                    স্টক আছে ({selectedProduct.stockQuantity} টি)
                  </span>
                )}
              </div>

              {/* Description */}
              <div className="mt-4">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  পণ্যের বিবরণ:
                </h4>
                <p className="text-slate-600 text-xs sm:text-sm leading-relaxed whitespace-pre-line max-h-36 overflow-y-auto pr-1">
                  {selectedProduct.description || 'এই পণ্যের জন্য বিস্তারিত বিবরণ শীঘ্রই আপডেট করা হবে।'}
                </p>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="space-y-3 pt-2 border-t border-slate-100">
              {/* Quantity Selector */}
              {!isOutOfStock && (
                <div className="flex items-center justify-between bg-slate-50 p-2.5 rounded-xl">
                  <span className="text-xs font-semibold text-slate-700">পরিমাণ:</span>
                  <div className="flex items-center gap-3 bg-white border border-slate-200 rounded-lg px-2 py-1">
                    <button
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      disabled={quantity <= 1}
                      className="p-1 text-slate-600 hover:text-slate-900 disabled:opacity-30"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-sm font-bold w-6 text-center">{quantity}</span>
                    <button
                      onClick={() =>
                        setQuantity((q) => Math.min(selectedProduct.stockQuantity, q + 1))
                      }
                      disabled={quantity >= selectedProduct.stockQuantity}
                      className="p-1 text-slate-600 hover:text-slate-900 disabled:opacity-30"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => {
                    addToCart(selectedProduct, quantity);
                    setSelectedProduct(null);
                  }}
                  disabled={isOutOfStock}
                  className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                    isOutOfStock
                      ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                      : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300'
                  }`}
                >
                  <ShoppingCart className="w-4 h-4" />
                  <span>কার্টে যোগ করুন</span>
                </button>

                <button
                  onClick={() => {
                    buyNow(selectedProduct);
                  }}
                  disabled={isOutOfStock}
                  className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all shadow-md ${
                    isOutOfStock
                      ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white'
                  }`}
                >
                  <Zap className="w-4 h-4 fill-amber-300 text-amber-300" />
                  <span>এখনই কিনুন</span>
                </button>
              </div>

              {/* Delivery info notice */}
              <div className="bg-emerald-50/70 border border-emerald-200/60 rounded-xl p-2.5 text-[11px] text-emerald-900 flex items-start gap-2">
                <Truck className="w-4 h-4 text-emerald-700 flex-shrink-0 mt-0.5" />
                <span>
                  কক্সবাজার সদর সহ সারাদেশে দ্রুত হোম ডেলিভারি। ডেলিভারি চার্জ অগ্রিম পরিশোধ করে অর্ডার
                  নিশ্চিত করুন।
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
