import React, { useState } from 'react';
import { useShop } from '../../context/ShopContext';
import {
  CheckCircle2,
  Copy,
  Check,
  Printer,
  ShoppingBag,
  PhoneCall,
  X,
  Package,
} from 'lucide-react';

export const OrderSuccessModal: React.FC = () => {
  const { isOrderSuccessOpen, setIsOrderSuccessOpen, lastCreatedOrder, settings, showToast } =
    useShop();

  const [copiedId, setCopiedId] = useState(false);

  if (!isOrderSuccessOpen || !lastCreatedOrder) return null;

  const handleCopyOrderId = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(lastCreatedOrder.orderId);
      setCopiedId(true);
      showToast('অর্ডার আইডি কপি করা হয়েছে!', 'info');
      setTimeout(() => setCopiedId(false), 2000);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-lg w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-200 relative p-6 sm:p-8 text-center">
        {/* Close */}
        <button
          onClick={() => setIsOrderSuccessOpen(false)}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Success Icon Animation */}
        <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4 text-emerald-600 shadow-inner">
          <CheckCircle2 className="w-12 h-12" />
        </div>

        <h2 className="text-xl sm:text-2xl font-black text-slate-900 leading-tight">
          অভিনন্দন! অর্ডার সফল হয়েছে
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-sm mx-auto">
          আপনার অর্ডারটি সফলভাবে গ্রহণ করা হয়েছে। শীঘ্রই আমাদের কাস্টমার সাপোর্ট থেকে আপনাকে কল করা হবে।
        </p>

        {/* Order ID Badge with copy */}
        <div className="mt-5 p-4 bg-emerald-50/80 rounded-2xl border border-emerald-200 inline-flex flex-col sm:flex-row items-center justify-between gap-3 w-full">
          <div className="text-left">
            <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider block">
              অর্ডার ট্র্যাকিং আইডি
            </span>
            <span className="text-lg sm:text-xl font-black text-emerald-950 font-mono">
              {lastCreatedOrder.orderId}
            </span>
          </div>

          <button
            onClick={handleCopyOrderId}
            className="flex items-center gap-1.5 px-3 py-2 bg-white text-emerald-900 hover:bg-emerald-100 rounded-xl text-xs font-bold border border-emerald-300 shadow-2xs transition-colors"
          >
            {copiedId ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-700" />
                <span>কপি হয়েছে</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>আইডি কপি</span>
              </>
            )}
          </button>
        </div>

        {/* Order Details Breakdown */}
        <div className="mt-6 text-left bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs space-y-2.5">
          <div className="flex justify-between border-b border-slate-200 pb-2">
            <span className="text-slate-500">গ্রাহকের নাম:</span>
            <span className="font-bold text-slate-800">{lastCreatedOrder.customerName}</span>
          </div>
          <div className="flex justify-between border-b border-slate-200 pb-2">
            <span className="text-slate-500">মোবাইল নম্বর:</span>
            <span className="font-bold text-slate-800">{lastCreatedOrder.phone}</span>
          </div>
          <div className="flex justify-between border-b border-slate-200 pb-2">
            <span className="text-slate-500">ডেলিভারি ঠিকানা:</span>
            <span className="font-bold text-slate-800 text-right max-w-[200px] truncate">
              {lastCreatedOrder.address}
            </span>
          </div>
          <div className="flex justify-between border-b border-slate-200 pb-2">
            <span className="text-slate-500">পেমেন্ট মেথড ও TrxID:</span>
            <span className="font-bold text-slate-800 uppercase">
              {lastCreatedOrder.paymentMethod} • {lastCreatedOrder.transactionId}
            </span>
          </div>
          <div className="flex justify-between border-b border-slate-200 pb-2">
            <span className="text-slate-500">অগ্রিম ডেলিভারি চার্জ:</span>
            <span className="font-bold text-emerald-700">
              ৳ {lastCreatedOrder.deliveryCharge.toLocaleString('bn-BD')} (পরিশোধিত)
            </span>
          </div>
          <div className="flex justify-between pt-1">
            <span className="text-slate-600 font-semibold">ক্যাশ অন ডেলিভারিতে প্রদেয়:</span>
            <span className="font-black text-slate-900 text-sm">
              ৳ {lastCreatedOrder.productTotal.toLocaleString('bn-BD')}
            </span>
          </div>
        </div>

        {/* Helper Notice */}
        <div className="mt-4 p-3 bg-amber-50 rounded-xl border border-amber-200 text-[11px] text-amber-900 text-left flex items-start gap-2">
          <PhoneCall className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
          <span>
            যেকোনো প্রয়োজনে আমাদের হটলাইনে কল করুন: <strong>{settings.contactNumber}</strong>। অর্ডার
            স্ট্যাটাস চেক করতে উপরে প্রদর্শিত আইডি ব্যবহার করুন।
          </span>
        </div>

        {/* Buttons */}
        <div className="grid grid-cols-2 gap-3 mt-6">
          <button
            onClick={handlePrint}
            className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs sm:text-sm font-bold transition-all"
          >
            <Printer className="w-4 h-4" />
            <span>প্রিন্ট রসিদ</span>
          </button>

          <button
            onClick={() => setIsOrderSuccessOpen(false)}
            className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs sm:text-sm font-bold transition-all shadow-md"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>আরও কেনাকাটা করুন</span>
          </button>
        </div>
      </div>
    </div>
  );
};
