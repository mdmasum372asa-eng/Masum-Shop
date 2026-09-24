import React, { useState } from 'react';
import { useShop } from '../../context/ShopContext';
import { createOrder } from '../../services/dataService';
import { Order, PaymentMethod, DeliveryLocation } from '../../types';
import {
  X,
  AlertTriangle,
  Copy,
  Check,
  ShieldCheck,
  CreditCard,
  Loader2,
  Lock,
  ArrowRight,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const CheckoutModal: React.FC = () => {
  const {
    isCheckoutOpen,
    setIsCheckoutOpen,
    cart,
    cartSubtotal,
    deliveryLocation,
    setDeliveryLocation,
    currentDeliveryCharge,
    grandTotal,
    clearCart,
    setLastCreatedOrder,
    setIsOrderSuccessOpen,
    settings,
    showToast,
  } = useShop();

  // Form Fields
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('bkash');
  const [transactionId, setTransactionId] = useState('');
  const [notes, setNotes] = useState('');
  const [hasPaidDelivery, setHasPaidDelivery] = useState(false);

  // States
  const [submitting, setSubmitting] = useState(false);
  const [copiedNumber, setCopiedNumber] = useState(false);
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});

  if (!isCheckoutOpen) return null;

  const currentPaymentNumber =
    paymentMethod === 'bkash' ? settings.bkashNumber : settings.nagadNumber;

  const handleCopyNumber = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(currentPaymentNumber);
      setCopiedNumber(true);
      showToast(`${paymentMethod.toUpperCase()} নম্বর কপি করা হয়েছে!`, 'info');
      setTimeout(() => setCopiedNumber(false), 2000);
    }
  };

  const validateForm = (): boolean => {
    const errors: { [key: string]: string } = {};

    if (!customerName.trim() || customerName.trim().length < 2) {
      errors.customerName = 'অনুগ্রহ করে আপনার পুরো নাম লিখুন';
    }

    const cleanPhone = phone.replace(/[\s-]/g, '');
    if (!cleanPhone || !/^(01[3-9]\d{8})$/.test(cleanPhone)) {
      errors.phone = 'সঠিক ১১ ডিজিটের মোবাইল নম্বর লিখুন (যেমন: 017XXXXXXXX)';
    }

    if (!address.trim() || address.trim().length < 5) {
      errors.address = 'অনুগ্রহ করে বিস্তারিত ডেলিভারি ঠিকানা দিন (রোড, বাড়ি, এলাকা)';
    }

    if (!transactionId.trim() || transactionId.trim().length < 4) {
      errors.transactionId = 'সঠিক ট্রানজেকশন আইডি (TrxID) প্রদান করুন';
    }

    if (!hasPaidDelivery) {
      errors.hasPaidDelivery = 'অর্ডার করতে ডেলিভারি চার্জ পরিশোধের নিশ্চিতকরণ প্রয়োজন';
    }

    if (cart.length === 0) {
      errors.cart = 'আপনার কার্টে কোনো পণ্য নেই';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;

    if (!validateForm()) {
      showToast('অনুগ্রহ করে ফরমের সকল লাল চিহ্নিত তথ্য সঠিকভাবে পূরণ করুন।', 'error');
      return;
    }

    setSubmitting(true);

    try {
      const randomSuffix = Math.floor(100000 + Math.random() * 900000);
      const generatedOrderId = `MS-${randomSuffix}`;

      const newOrder: Order = {
        orderId: generatedOrderId,
        customerName: customerName.trim(),
        phone: phone.trim(),
        address: address.trim(),
        deliveryLocation,
        products: cart.map((item) => ({
          productId: item.product.id,
          productName: item.product.name,
          price: item.product.discountPrice ?? item.product.regularPrice,
          quantity: item.quantity,
          image: item.product.image,
        })),
        quantity: cart.reduce((acc, i) => acc + i.quantity, 0),
        productTotal: cartSubtotal,
        deliveryCharge: currentDeliveryCharge,
        grandTotal,
        paymentMethod,
        transactionId: transactionId.trim().toUpperCase(),
        deliveryPaymentStatus: 'paid_pending_verification',
        orderStatus: 'Pending',
        orderDate: new Date().toISOString(),
        notes: notes.trim() || undefined,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await createOrder(newOrder);

      // Trigger Confetti
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
      });

      // Update state
      setLastCreatedOrder(newOrder);
      clearCart();
      setIsCheckoutOpen(false);
      setIsOrderSuccessOpen(true);
      showToast('আপনার অর্ডারটি সফলভাবে সাবমিট হয়েছে!', 'success');
    } catch (err: unknown) {
      console.error('Order submission error:', err);
      showToast('অর্ডার সাবমিট করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[94vh] overflow-y-auto shadow-2xl border border-slate-200 relative">
        {/* Header */}
        <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-md px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-black">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-900 leading-none">
                চেকআউট ও ডেলিভারি তথ্য
              </h2>
              <span className="text-[11px] text-slate-500 font-medium">
                নিরাপদ ও দ্রুত অর্ডার নিশ্চিতকরণ
              </span>
            </div>
          </div>
          <button
            onClick={() => setIsCheckoutOpen(false)}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmitOrder} className="p-4 sm:p-6 space-y-6">
          {/* CRITICAL MANDATORY NOTICE BANNER */}
          <div className="bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 rounded-2xl p-4 text-white shadow-md">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-6 h-6 text-amber-200 flex-shrink-0 animate-bounce" />
              <div>
                <h4 className="text-sm font-black tracking-wide text-white uppercase">
                  জরুরি নোটিশ / ডেলিভারি চার্জ অগ্রিম পেমেন্ট
                </h4>
                <p className="text-xs sm:text-sm font-bold text-amber-100 mt-1 leading-snug">
                  &ldquo;ডেলিভারি চার্জ আগে অগ্রিম পেমেন্ট করতে হবে। ডেলিভারি চার্জ পেমেন্ট না করলে অর্ডার করা যাবে না।&rdquo;
                </p>
                <p className="text-[11px] text-white/80 mt-1">
                  বাকি পণ্যের মোট মূল্য (৳{cartSubtotal.toLocaleString('bn-BD')}) ডেলিভারি ম্যানের কাছে পণ্য বুঝে পাওয়ার পর ক্যাশ অন ডেলিভারিতে পরিশোধ করবেন।
                </p>
              </div>
            </div>
          </div>

          {/* Section 1: Customer Details */}
          <div className="bg-slate-50 p-4 sm:p-5 rounded-2xl border border-slate-200 space-y-4">
            <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-emerald-700 text-white flex items-center justify-center text-[11px]">
                ১
              </span>
              গ্রাহকের তথ্য ও ডেলিভারি ঠিকানা
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  আপনার পুরো নাম <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="যেমন: মোঃ মাসুম"
                  className={`w-full bg-white border rounded-xl px-3.5 py-2.5 text-xs sm:text-sm focus:outline-none transition-all ${
                    formErrors.customerName
                      ? 'border-red-500 ring-2 ring-red-100'
                      : 'border-slate-300 focus:border-emerald-600'
                  }`}
                />
                {formErrors.customerName && (
                  <span className="text-[11px] text-red-600 font-semibold mt-1 block">
                    {formErrors.customerName}
                  </span>
                )}
              </div>

              {/* Phone */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  মোবাইল নম্বর <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="01XXXXXXXXX"
                  className={`w-full bg-white border rounded-xl px-3.5 py-2.5 text-xs sm:text-sm focus:outline-none transition-all ${
                    formErrors.phone
                      ? 'border-red-500 ring-2 ring-red-100'
                      : 'border-slate-300 focus:border-emerald-600'
                  }`}
                />
                {formErrors.phone && (
                  <span className="text-[11px] text-red-600 font-semibold mt-1 block">
                    {formErrors.phone}
                  </span>
                )}
              </div>
            </div>

            {/* Delivery Location Picker */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                ডেলিভারি লোকেশন নির্বাচন করুন <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setDeliveryLocation('inside_cox')}
                  className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all ${
                    deliveryLocation === 'inside_cox'
                      ? 'bg-emerald-800 text-white border-emerald-800 shadow-sm'
                      : 'bg-white text-slate-700 border-slate-300 hover:border-slate-400'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="text-xs sm:text-sm font-bold">কক্সবাজার সদর</span>
                    {deliveryLocation === 'inside_cox' && <Check className="w-4 h-4 text-emerald-300" />}
                  </div>
                  <span className="text-xs font-semibold mt-1 opacity-90">
                    ডেলিভারি চার্জ: ৳{settings.defaultInsideDeliveryCharge || 70}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setDeliveryLocation('outside_cox')}
                  className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all ${
                    deliveryLocation === 'outside_cox'
                      ? 'bg-emerald-800 text-white border-emerald-800 shadow-sm'
                      : 'bg-white text-slate-700 border-slate-300 hover:border-slate-400'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="text-xs sm:text-sm font-bold">কক্সবাজারের বাইরে</span>
                    {deliveryLocation === 'outside_cox' && <Check className="w-4 h-4 text-emerald-300" />}
                  </div>
                  <span className="text-xs font-semibold mt-1 opacity-90">
                    ডেলিভারি চার্জ: ৳{settings.defaultOutsideDeliveryCharge || 130}
                  </span>
                </button>
              </div>
            </div>

            {/* Full Address */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                পূর্ণ ঠিকানা (রোড, বাড়ি, পোস্ট কোড, থানা/উপজেলা, জেলা){' '}
                <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={2}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="যেমন: বাড়ি নং ১২, রোড ৩, ঝাউতলা, কক্সবাজার সদর"
                className={`w-full bg-white border rounded-xl px-3.5 py-2.5 text-xs sm:text-sm focus:outline-none transition-all ${
                  formErrors.address
                    ? 'border-red-500 ring-2 ring-red-100'
                    : 'border-slate-300 focus:border-emerald-600'
                }`}
              />
              {formErrors.address && (
                <span className="text-[11px] text-red-600 font-semibold mt-1 block">
                  {formErrors.address}
                </span>
              )}
            </div>

            {/* Optional Notes */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                অতিরিক্ত বিশেষ নির্দেশনা (ঐচ্ছিক):
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="যেমন: অফিস টাইমে ডেলিভারি দিলে ভালো হয়"
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-600"
              />
            </div>
          </div>

          {/* Section 2: Advance Delivery Payment */}
          <div className="bg-amber-50/60 p-4 sm:p-5 rounded-2xl border border-amber-300 space-y-4">
            <h3 className="text-xs font-black text-amber-950 uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-amber-600 text-white flex items-center justify-center text-[11px]">
                ২
              </span>
              ডেলিভারি চার্জ অগ্রিম পেমেন্ট অপশন
            </h3>

            {/* Payment Method Selector (bKash or Nagad) */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1.5">
                পেমেন্ট মেথড নির্বাচন করুন:
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('bkash')}
                  className={`p-3 rounded-xl border flex items-center justify-center gap-2 font-bold text-xs sm:text-sm transition-all ${
                    paymentMethod === 'bkash'
                      ? 'bg-rose-600 text-white border-rose-600 shadow-sm'
                      : 'bg-white text-slate-700 border-slate-300 hover:border-slate-400'
                  }`}
                >
                  <span className="w-3 h-3 rounded-full bg-white inline-block"></span>
                  <span>bKash (বিকাশ)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('nagad')}
                  className={`p-3 rounded-xl border flex items-center justify-center gap-2 font-bold text-xs sm:text-sm transition-all ${
                    paymentMethod === 'nagad'
                      ? 'bg-orange-600 text-white border-orange-600 shadow-sm'
                      : 'bg-white text-slate-700 border-slate-300 hover:border-slate-400'
                  }`}
                >
                  <span className="w-3 h-3 rounded-full bg-white inline-block"></span>
                  <span>Nagad (নগদ)</span>
                </button>
              </div>
            </div>

            {/* Number Box with Copy */}
            <div className="bg-white p-3.5 rounded-xl border border-amber-300 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                  {paymentMethod.toUpperCase()} সেন্ড মানি (Send Money) নম্বর:
                </span>
                <span className="text-lg sm:text-xl font-black text-slate-900 tracking-wider">
                  {currentPaymentNumber}
                </span>
                <span className="block text-[11px] text-emerald-700 font-medium mt-0.5">
                  পাঠানোর পরিমাণ: ৳{currentDeliveryCharge} (ডেলিভারি চার্জ)
                </span>
              </div>

              <button
                type="button"
                onClick={handleCopyNumber}
                className="flex items-center gap-1 px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-xl text-xs font-bold border border-emerald-300 transition-colors"
              >
                {copiedNumber ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-700" />
                    <span>কপি হয়েছে</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>নম্বর কপি</span>
                  </>
                )}
              </button>
            </div>

            {/* Step-by-step instructions */}
            <div className="text-[11px] text-slate-600 bg-amber-100/50 p-3 rounded-xl space-y-1">
              <p className="font-bold text-slate-800">পেমেন্ট করার নিয়ম:</p>
              <p>১. আপনার {paymentMethod.toUpperCase()} অ্যাপে গিয়ে &ldquo;Send Money&rdquo; নির্বাচন করুন।</p>
              <p>২. উপরে প্রদর্শিত নম্বরে ({currentPaymentNumber}) ৳{currentDeliveryCharge} টাকা পাঠান।</p>
              <p>৩. টাকা পাঠানো সম্পন্ন হলে প্রাপ্ত Transaction ID (TrxID) নিচে লিখে নিশ্চিত করুন।</p>
            </div>

            {/* Transaction ID Input */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Transaction ID (TrxID) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={transactionId}
                onChange={(e) => setTransactionId(e.target.value)}
                placeholder="যেমন: BLK893XZP2"
                className={`w-full bg-white border rounded-xl px-3.5 py-2.5 text-xs sm:text-sm uppercase font-mono tracking-wider focus:outline-none transition-all ${
                  formErrors.transactionId
                    ? 'border-red-500 ring-2 ring-red-100'
                    : 'border-slate-300 focus:border-emerald-600'
                }`}
              />
              {formErrors.transactionId && (
                <span className="text-[11px] text-red-600 font-semibold mt-1 block">
                  {formErrors.transactionId}
                </span>
              )}
            </div>

            {/* Paid Confirmation Checkbox */}
            <div className="pt-1">
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasPaidDelivery}
                  onChange={(e) => setHasPaidDelivery(e.target.checked)}
                  className="mt-0.5 w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500 cursor-pointer"
                />
                <span className="text-xs text-slate-700 font-semibold leading-relaxed">
                  আমি নিশ্চিত করছি যে আমি নির্ধারিত নম্বরে ৳{currentDeliveryCharge} ডেলিভারি চার্জ
                  সফলভাবে পাঠিয়েছি এবং আমার দেওয়া TrxID সঠিক। (এডমিন ভেরিফিকেশন সাপেক্ষে অর্ডার কনফার্ম হবে)
                </span>
              </label>
              {formErrors.hasPaidDelivery && (
                <span className="text-[11px] text-red-600 font-semibold mt-1 block">
                  {formErrors.hasPaidDelivery}
                </span>
              )}
            </div>
          </div>

          {/* Section 3: Order Summary & Pricing */}
          <div className="bg-slate-50 p-4 sm:p-5 rounded-2xl border border-slate-200 space-y-3">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              অর্ডার সারাংশ ({cart.length} টি পণ্য)
            </h4>

            <div className="max-h-36 overflow-y-auto space-y-2 pr-1">
              {cart.map((item) => {
                const price = item.product.discountPrice ?? item.product.regularPrice;
                return (
                  <div key={item.product.id} className="flex justify-between items-center text-xs">
                    <span className="truncate max-w-[280px] text-slate-700">
                      {item.product.name} × {item.quantity}
                    </span>
                    <span className="font-bold text-slate-900 flex-shrink-0">
                      ৳ {(price * item.quantity).toLocaleString('bn-BD')}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="pt-3 border-t border-slate-200 space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>পণ্যের উপমোট মূল্য (ক্যাশ অন ডেলিভারি):</span>
                <span className="font-semibold text-slate-900">
                  ৳ {cartSubtotal.toLocaleString('bn-BD')}
                </span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>অগ্রিম পরিশোধিত ডেলিভারি চার্জ ({deliveryLocation === 'inside_cox' ? 'কক্সবাজার সদর' : 'বাইরে'}):</span>
                <span className="font-bold text-emerald-700">
                  ৳ {currentDeliveryCharge.toLocaleString('bn-BD')}
                </span>
              </div>
              <div className="flex justify-between text-sm sm:text-base font-black text-slate-900 pt-2 border-t border-slate-200">
                <span>সর্বমোট অর্ডার মূল্য:</span>
                <span className="text-emerald-800">
                  ৳ {grandTotal.toLocaleString('bn-BD')}
                </span>
              </div>
            </div>
          </div>

          {/* Submit Order Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={submitting || !hasPaidDelivery || !transactionId.trim()}
              className={`w-full py-4 px-6 rounded-2xl font-black text-sm sm:text-base flex items-center justify-center gap-2 transition-all shadow-lg ${
                submitting || !hasPaidDelivery || !transactionId.trim()
                  ? 'bg-slate-300 text-slate-500 cursor-not-allowed shadow-none'
                  : 'bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-700 hover:to-teal-800 text-white shadow-emerald-600/30 active:scale-98'
              }`}
            >
              {submitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>অর্ডার প্রসেস হচ্ছে...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-5 h-5" />
                  <span>অর্ডার নিশ্চিত করুন (Confirm Order)</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
            <p className="text-[11px] text-center text-slate-400 mt-2">
              🔒 নিরাপদ চেকআউট • আপনার তথ্য সুরক্ষিত রয়েছে
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};
