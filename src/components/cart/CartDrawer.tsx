import React from 'react';
import { useShop } from '../../context/ShopContext';
import {
  X,
  Plus,
  Minus,
  Trash2,
  ShoppingBag,
  ArrowRight,
  Truck,
  AlertTriangle,
  MapPin,
} from 'lucide-react';

export const CartDrawer: React.FC = () => {
  const {
    isCartOpen,
    setIsCartOpen,
    cart,
    removeFromCart,
    updateQuantity,
    cartSubtotal,
    deliveryLocation,
    setDeliveryLocation,
    currentDeliveryCharge,
    grandTotal,
    setIsCheckoutOpen,
  } = useShop();

  if (!isCartOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={() => setIsCartOpen(false)}
        className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-emerald-700" />
              <h2 className="text-base sm:text-lg font-black text-slate-900">
                শপিং কার্ট ({cart.length})
              </h2>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/50 transition-colors"
              aria-label="Close cart"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Content */}
          {cart.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
              <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mb-4 text-emerald-600">
                <ShoppingBag className="w-10 h-10" />
              </div>
              <h3 className="text-lg font-bold text-slate-800">আপনার কার্ট খালি</h3>
              <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-xs">
                আপনি এখনও কোনো পণ্য কার্টে যুক্ত করেননি। আমাদের আকর্ষণীয় গ্যাজেট কালেকশন দেখুন!
              </p>
              <button
                onClick={() => setIsCartOpen(false)}
                className="mt-6 px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-all shadow-md"
              >
                কেনাকাটা শুরু করুন
              </button>
            </div>
          ) : (
            <>
              {/* Item List */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
                {cart.map((item) => {
                  const price = item.product.discountPrice ?? item.product.regularPrice;
                  return (
                    <div
                      key={item.product.id}
                      className="flex gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-200/80 relative group"
                    >
                      {/* Thumbnail */}
                      <img
                        src={item.product.image}
                        alt={item.product.name}
                        className="w-18 h-18 sm:w-20 sm:h-20 object-cover rounded-xl bg-white border border-slate-200 flex-shrink-0"
                      />

                      {/* Info */}
                      <div className="flex-1 flex flex-col justify-between min-w-0 pr-6">
                        <div>
                          <h4 className="text-xs font-bold text-slate-800 line-clamp-2 leading-tight">
                            {item.product.name}
                          </h4>
                          <span className="text-[11px] text-emerald-700 font-medium">
                            ৳ {price.toLocaleString('bn-BD')} / প্রতি ইউনিট
                          </span>
                        </div>

                        {/* Quantity controls */}
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-2 py-0.5 shadow-2xs">
                            <button
                              onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                              className="p-1 text-slate-500 hover:text-slate-800"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="text-xs font-bold w-4 text-center">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                              className="p-1 text-slate-500 hover:text-slate-800"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>

                          <span className="text-xs sm:text-sm font-black text-slate-900">
                            ৳ {(price * item.quantity).toLocaleString('bn-BD')}
                          </span>
                        </div>
                      </div>

                      {/* Remove Button */}
                      <button
                        onClick={() => removeFromCart(item.product.id)}
                        className="absolute top-2 right-2 p-1.5 text-slate-400 hover:text-red-600 rounded-md transition-colors"
                        title="পণ্যটি মুছে ফেলুন"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* Delivery Location Selector in Cart */}
              <div className="p-4 sm:p-5 border-t border-slate-200 bg-slate-50 space-y-4">
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 mb-2">
                    <MapPin className="w-3.5 h-3.5 text-emerald-700" />
                    <span>ডেলিভারি এলাকা নির্বাচন করুন:</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <button
                      onClick={() => setDeliveryLocation('inside_cox')}
                      className={`p-2.5 rounded-xl border font-semibold flex flex-col items-center justify-center transition-all ${
                        deliveryLocation === 'inside_cox'
                          ? 'bg-emerald-700 text-white border-emerald-700 shadow-xs'
                          : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <span>কক্সবাজার সদর</span>
                      <span className="text-[11px] opacity-90">৳৭০</span>
                    </button>

                    <button
                      onClick={() => setDeliveryLocation('outside_cox')}
                      className={`p-2.5 rounded-xl border font-semibold flex flex-col items-center justify-center transition-all ${
                        deliveryLocation === 'outside_cox'
                          ? 'bg-emerald-700 text-white border-emerald-700 shadow-xs'
                          : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <span>কক্সবাজারের বাইরে</span>
                      <span className="text-[11px] opacity-90">৳১৩০</span>
                    </button>
                  </div>
                </div>

                {/* Prepayment Notice */}
                <div className="bg-amber-50 border border-amber-300/80 rounded-xl p-2.5 text-amber-900 text-[11px] leading-relaxed flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                  <span>
                    <strong>অগ্রিম ডেলিভারি চার্জ আবশ্যক:</strong> পরবর্তী ধাপে বিকাশ/নগদ এর মাধ্যমে
                    ডেলিভারি চার্জ পরিশোধ করে TrxID দিতে হবে।
                  </span>
                </div>

                {/* Pricing Summary */}
                <div className="space-y-1.5 text-xs pt-1">
                  <div className="flex justify-between text-slate-600">
                    <span>পণ্যের উপমোট:</span>
                    <span className="font-semibold text-slate-900">
                      ৳ {cartSubtotal.toLocaleString('bn-BD')}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span className="flex items-center gap-1">
                      <Truck className="w-3 h-3 text-emerald-600" />
                      ডেলিভারি চার্জ:
                    </span>
                    <span className="font-semibold text-slate-900">
                      ৳ {currentDeliveryCharge.toLocaleString('bn-BD')}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm sm:text-base font-black text-slate-900 pt-2 border-t border-slate-200">
                    <span>সর্বমোট টাকা:</span>
                    <span className="text-emerald-800">
                      ৳ {grandTotal.toLocaleString('bn-BD')}
                    </span>
                  </div>
                </div>

                {/* Checkout Button */}
                <button
                  onClick={() => {
                    setIsCartOpen(false);
                    setIsCheckoutOpen(true);
                  }}
                  className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all active:scale-98"
                >
                  <span>অর্ডার করতে এগিয়ে যান</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
