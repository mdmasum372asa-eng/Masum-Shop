import React, { useState } from 'react';
import { useShop } from '../../context/ShopContext';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Order, OrderStatus } from '../../types';
import {
  X,
  PackageSearch,
  CheckCircle2,
  Clock,
  Truck,
  Package,
  AlertCircle,
  Loader2,
  Phone,
} from 'lucide-react';

export const OrderTrackModal: React.FC = () => {
  const { isOrderTrackOpen, setIsOrderTrackOpen, settings } = useShop();

  const [trackQuery, setTrackQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchedOrder, setSearchedOrder] = useState<Order | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOrderTrackOpen) return null;

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    const query = trackQuery.trim().toUpperCase();
    if (!query) return;

    setLoading(true);
    setErrorMsg('');
    setSearchedOrder(null);

    try {
      // Look up by Order ID in Firestore
      const docRef = doc(db, 'orders', query);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setSearchedOrder({ ...(docSnap.data() as Order), orderId: docSnap.id });
      } else {
        setErrorMsg('এই অর্ডার আইডির কোনো তথ্য পাওয়া যায়নি। অনুগ্রহ করে সঠিক আইডি লিখুন।');
      }
    } catch (err) {
      console.error('Track error:', err);
      setErrorMsg('সার্ভারের সাথে সংযোগ স্থাপন করা যায়নি। কিছুক্ষণ পর আবার চেষ্টা করুন।');
    } finally {
      setLoading(false);
    }
  };

  const getStatusStep = (status: OrderStatus): number => {
    switch (status) {
      case 'Pending':
        return 1;
      case 'Confirmed':
        return 2;
      case 'Processing':
        return 3;
      case 'Shipped':
        return 4;
      case 'Delivered':
        return 5;
      case 'Cancelled':
        return -1;
      default:
        return 1;
    }
  };

  const steps = [
    { label: 'অর্ডার প্রাপ্ত', step: 1 },
    { label: 'কনফার্মড', step: 2 },
    { label: 'প্রসেসিং', step: 3 },
    { label: 'শিপড', step: 4 },
    { label: 'ডেলিভার্ড', step: 5 },
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 relative p-5 sm:p-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <PackageSearch className="w-5 h-5 text-emerald-700" />
            <h3 className="text-base font-black text-slate-900">অর্ডার ট্র্যাক করুন</h3>
          </div>
          <button
            onClick={() => setIsOrderTrackOpen(false)}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Input Form */}
        <form onSubmit={handleTrack} className="mt-4">
          <label className="block text-xs font-bold text-slate-700 mb-1.5">
            আপনার অর্ডার ট্র্যাকিং আইডি লিখুন:
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={trackQuery}
              onChange={(e) => setTrackQuery(e.target.value)}
              placeholder="যেমন: MS-948271"
              className="flex-1 bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm uppercase font-mono tracking-wider focus:outline-none focus:border-emerald-600 focus:bg-white transition-all"
            />
            <button
              type="submit"
              disabled={loading || !trackQuery.trim()}
              className="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>খুঁজুন</span>}
            </button>
          </div>
        </form>

        {/* Error */}
        {errorMsg && (
          <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-xl text-xs flex items-center gap-2 border border-red-200">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Order Result */}
        {searchedOrder && (
          <div className="mt-5 space-y-4 text-left">
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
              <div className="flex justify-between items-center">
                <div>
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">
                    অর্ডার নম্বর
                  </span>
                  <span className="text-sm font-black text-slate-900 font-mono">
                    {searchedOrder.orderId}
                  </span>
                </div>

                <span
                  className={`text-xs font-bold px-3 py-1 rounded-full ${
                    searchedOrder.orderStatus === 'Delivered'
                      ? 'bg-emerald-100 text-emerald-800'
                      : searchedOrder.orderStatus === 'Cancelled'
                      ? 'bg-rose-100 text-rose-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {searchedOrder.orderStatus}
                </span>
              </div>

              {/* Progress Steps Visualizer */}
              {searchedOrder.orderStatus !== 'Cancelled' ? (
                <div className="py-2">
                  <div className="flex items-center justify-between text-[10px] font-semibold text-slate-600 mb-1">
                    {steps.map((st) => (
                      <span
                        key={st.step}
                        className={
                          getStatusStep(searchedOrder.orderStatus) >= st.step
                            ? 'text-emerald-700 font-bold'
                            : 'text-slate-400'
                        }
                      >
                        {st.label}
                      </span>
                    ))}
                  </div>
                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden flex">
                    <div
                      className="bg-emerald-600 h-full transition-all duration-500 rounded-full"
                      style={{
                        width: `${(getStatusStep(searchedOrder.orderStatus) / 5) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              ) : (
                <div className="p-2 bg-red-100/70 text-red-800 rounded-lg text-xs font-semibold">
                  এই অর্ডারটি বাতিল করা হয়েছে। তথ্যের জন্য সাপোর্টে যোগাযোগ করুন।
                </div>
              )}

              <div className="text-xs space-y-1.5 pt-2 border-t border-slate-200">
                <div className="flex justify-between">
                  <span className="text-slate-500">গ্রাহকের নাম:</span>
                  <span className="font-semibold text-slate-800">{searchedOrder.customerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">ডেলিভারি এলাকা:</span>
                  <span className="font-semibold text-slate-800">
                    {searchedOrder.deliveryLocation === 'inside_cox' ? "কক্সবাজার সদর" : "কক্সবাজারের বাইরে"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">মোট টাকা:</span>
                  <span className="font-bold text-emerald-800">
                    ৳ {searchedOrder.grandTotal.toLocaleString('bn-BD')}
                  </span>
                </div>
              </div>
            </div>

            {/* Support hotline */}
            <div className="text-center pt-2">
              <a
                href={`tel:${settings.contactNumber}`}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-800"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>সাপোর্ট নম্বরে কল করুন: {settings.contactNumber}</span>
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
