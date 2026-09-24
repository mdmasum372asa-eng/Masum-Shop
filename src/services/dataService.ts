import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  deleteDoc,
  updateDoc,
  onSnapshot,
  query,
  orderBy,
  Unsubscribe,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { Product, Category, Banner, WebsiteSettings, Order, OrderStatus, DeliveryPaymentStatus } from '../types';

export const DEFAULT_SETTINGS: WebsiteSettings = {
  websiteName: 'MASUM SHOP',
  logo: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=180&auto=format&fit=crop&q=80',
  contactNumber: '01740370546',
  facebookUrl: 'https://www.facebook.com/MasumShop01?mibextid=ZbWKwL',
  tiktokUrl: 'https://www.tiktok.com/@masumshop1',
  defaultInsideDeliveryCharge: 70,
  defaultOutsideDeliveryCharge: 130,
  bkashNumber: '01740370546',
  nagadNumber: '01740370546',
  paymentInstructions:
    'বিকাশ বা নগদ সেন্ড মানি (Send Money) অপশন ব্যবহার করে নির্দিষ্ট নম্বরে ডেলিভারি চার্জ পাঠিয়ে TrxID প্রদান করুন। ভেরিফিকেশন এর পর আপনার অর্ডারটি কনফার্ম করা হবে।',
  homepageBanner:
    'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1200&auto=format&fit=crop&q=80',
  footerText:
    'MASUM SHOP – কক্সবাজার সহ সারা বাংলাদেশে প্রিমিয়াম গ্যাজেট, ইলেকট্রনিক্স ও আধুনিক লাইফস্টাইল পণ্যের বিশ্বস্ত প্রতিষ্ঠান।',
  updatedAt: new Date().toISOString(),
};

export const INITIAL_CATEGORIES: Category[] = [
  { id: 'smart-gadgets', name: 'স্মার্ট গ্যাজেট', slug: 'smart-gadgets', icon: 'Smartphone', createdAt: new Date().toISOString() },
  { id: 'earbuds-audio', name: 'ইয়ারবাডস ও হেডফোন', slug: 'earbuds-audio', icon: 'Headphones', createdAt: new Date().toISOString() },
  { id: 'smart-watch', name: 'স্মার্ট ওয়াচ', slug: 'smart-watch', icon: 'Watch', createdAt: new Date().toISOString() },
  { id: 'speakers', name: 'ব্লুটুথ স্পিকার', slug: 'speakers', icon: 'Volume2', createdAt: new Date().toISOString() },
  { id: 'power-chargers', name: 'চার্জার ও পাওয়ার ব্যাংক', slug: 'power-chargers', icon: 'BatteryCharging', createdAt: new Date().toISOString() },
  { id: 'accessories', name: 'লাইফস্টাইল এক্সেসরিজ', slug: 'accessories', icon: 'Package', createdAt: new Date().toISOString() },
];

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-speaker-01',
    name: 'Premium Bluetooth Speaker with Deep Bass & RGB Lighting',
    image: 'https://images.unsplash.com/photo-1545454675-3531b543be5d?w=800&auto=format&fit=crop&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1545454675-3531b543be5d?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=800&auto=format&fit=crop&q=80',
    ],
    category: 'speakers',
    regularPrice: 2450,
    discountPrice: 1850,
    description:
      'উচ্চমানের স্টুডিও গ্রেড সাউন্ড এবং ডিপ ব্যাস যুক্ত পোর্টেবল ওয়্যারলেস ব্লুটুথ স্পিকার। ১২ ঘণ্টা একটানা প্লেব্যাক ব্যাকআপ, আইপিএক্স৫ ওয়াটারপ্রুফ রেটিং ও অ্যাম্বিয়েন্ট আরজিবি লাইটিং। ইনডোর এবং আউটডোর আড্ডা বা ভ্রমণের জন্য পারফেক্ট।',
    stockQuantity: 28,
    stockStatus: 'in_stock',
    isPublished: true,
    featured: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'prod-watch-02',
    name: 'Ultra AMOLED Smart Watch with Bluetooth Calling & Health Tracker',
    image: 'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=800&auto=format&fit=crop&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=800&auto=format&fit=crop&q=80',
    ],
    category: 'smart-watch',
    regularPrice: 3200,
    discountPrice: 2490,
    description:
      '১.৯৬ ইঞ্চি আল্ট্রা এইচডি অ্যামোলেড ডিসপ্লে। সরাসরি ঘড়ি থেকে কল রিসিভ ও ডায়াল করার সুবিধা। হার্ট রেট, এসপিও২ (রক্তে অক্সিজেনের মাত্রা) ও ১০০+ স্পোর্টস মোড ট্র্যাকার। দীর্ঘস্থায়ী ব্যাটারি লাইফ।',
    stockQuantity: 15,
    stockStatus: 'in_stock',
    isPublished: true,
    featured: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'prod-earbuds-03',
    name: 'True Wireless ANC Earbuds with Spatial Audio & Fast Charging',
    image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800&auto=format&fit=crop&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1572536147248-ac59a8abfa4b?w=800&auto=format&fit=crop&q=80',
    ],
    category: 'earbuds-audio',
    regularPrice: 2200,
    discountPrice: 1550,
    description:
      'অ্যাক্টিভ নয়েজ ক্যান্সেলেশন (ANC) সহ প্রিমিয়াম বাড্স। ক্রিস্টাল ক্লিয়ার কলিং এর জন্য কোয়াড-মাইক এনভায়রনমেন্টাল নয়েজ ক্যান্সেলেশন। গেমিং এর জন্য আল্ট্রা লো-লেটেন্সি মোড এবং ৪০ ঘণ্টা মোট প্লে-টাইম।',
    stockQuantity: 40,
    stockStatus: 'in_stock',
    isPublished: true,
    featured: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'prod-charger-04',
    name: '65W GaN Fast Charger Multi-Port (Type-C PD & USB QC 3.0)',
    image: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=800&auto=format&fit=crop&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=800&auto=format&fit=crop&q=80',
    ],
    category: 'power-chargers',
    regularPrice: 1800,
    discountPrice: 1290,
    description:
      'উন্নত GaN প্রযুক্তির ফাস্ট চার্জার। ল্যাপটপ, আইফোন, স্যামসাং এবং অ্যান্ড্রয়েড ফোন নিমিষেই ফুল চার্জ করার ক্ষমতা রাখে। ওভার-হিটিং ও ওভার-ভোল্টেজ প্রটেকশন সহ নিরাপদ চার্জিং।',
    stockQuantity: 20,
    stockStatus: 'in_stock',
    isPublished: true,
    featured: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'prod-powerbank-05',
    name: '20000mAh 22.5W Two-Way Fast Charging Slim Power Bank',
    image: 'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=800&auto=format&fit=crop&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=800&auto=format&fit=crop&q=80',
    ],
    category: 'power-chargers',
    regularPrice: 2800,
    discountPrice: 2190,
    description:
      'বিশাল ২০,০০০ এমএএইচ সক্ষমতার পাতলা এবং আকর্ষণীয় ডিজাইনের পাওয়ার ব্যাংক। একসাথে ৩টি ডিভাইস দ্রুত চার্জ করা যায়। ডিজিটাল এলইডি ডিসপ্লেতে ব্যাটারি শতকরা ভাগ দেখা যায়।',
    stockQuantity: 12,
    stockStatus: 'in_stock',
    isPublished: true,
    featured: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'prod-headset-06',
    name: 'Over-Ear Wireless Gaming & Studio Headphone with Detachable Mic',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=800&auto=format&fit=crop&q=80',
    ],
    category: 'earbuds-audio',
    regularPrice: 3500,
    discountPrice: 2650,
    description:
      '৫০ মিমি নিউওডাইমিয়াম ড্রাইভারের সাথে থিয়েটার লেভেল ৭.১ ভার্চুয়াল সারাউন্ড সাউন্ড। প্রিমিয়াম মেমোরি ফোম কানের প্যাড দীর্ঘক্ষণ ব্যবহারে আরাম দেয়। ৫০ ঘণ্টার ব্যাকআপ।',
    stockQuantity: 8,
    stockStatus: 'in_stock',
    isPublished: true,
    featured: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export const INITIAL_BANNERS: Banner[] = [
  {
    id: 'banner-01',
    title: 'মাসুম শপে প্রিমিয়াম গ্যাজেটে বিশেষ ছাড়!',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1200&auto=format&fit=crop&q=80',
    link: '#featured',
    isEnabled: true,
    order: 1,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'banner-02',
    title: 'কক্সবাজার সদর সহ সারা বাংলাদেশে দ্রুত হোম ডেলিভারি',
    image: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=1200&auto=format&fit=crop&q=80',
    link: '#products',
    isEnabled: true,
    order: 2,
    createdAt: new Date().toISOString(),
  },
];

// Subscribe to Products
export function subscribeProducts(
  onUpdate: (products: Product[]) => void,
  onError?: (err: Error) => void
): Unsubscribe {
  const path = 'products';
  try {
    const q = query(collection(db, path));
    return onSnapshot(
      q,
      (snapshot) => {
        const products: Product[] = [];
        snapshot.forEach((docSnap) => {
          const d = docSnap.data();
          const img = d.image || d.mainImage || '';
          const gal = d.galleryImages || d.gallery || [];
          const isPub = d.isPublished !== undefined ? d.isPublished : (d.published !== undefined ? d.published : true);
          const stQty = d.stockQuantity !== undefined ? d.stockQuantity : (d.stock !== undefined ? d.stock : 0);
          products.push({
            ...(d as Product),
            id: docSnap.id,
            image: img,
            mainImage: img,
            galleryImages: gal,
            gallery: gal,
            isPublished: isPub,
            published: isPub,
            stockQuantity: stQty,
            stock: stQty,
          });
        });
        onUpdate(products);
      },
      (error) => {
        if (onError) {
          onError(error instanceof Error ? error : new Error(String(error)));
        }
        handleFirestoreError(error, OperationType.LIST, path);
      }
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

// Subscribe to Categories
export function subscribeCategories(
  onUpdate: (categories: Category[]) => void,
  onError?: (err: Error) => void
): Unsubscribe {
  const path = 'categories';
  try {
    const q = query(collection(db, path));
    return onSnapshot(
      q,
      (snapshot) => {
        const categories: Category[] = [];
        snapshot.forEach((docSnap) => {
          categories.push({ ...(docSnap.data() as Category), id: docSnap.id });
        });
        onUpdate(categories);
      },
      (error) => {
        if (onError) {
          onError(error instanceof Error ? error : new Error(String(error)));
        }
        handleFirestoreError(error, OperationType.LIST, path);
      }
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

// Subscribe to Banners
export function subscribeBanners(
  onUpdate: (banners: Banner[]) => void,
  onError?: (err: Error) => void
): Unsubscribe {
  const path = 'banners';
  try {
    const q = query(collection(db, path));
    return onSnapshot(
      q,
      (snapshot) => {
        const banners: Banner[] = [];
        snapshot.forEach((docSnap) => {
          banners.push({ ...(docSnap.data() as Banner), id: docSnap.id });
        });
        banners.sort((a, b) => a.order - b.order);
        onUpdate(banners);
      },
      (error) => {
        if (onError) {
          onError(error instanceof Error ? error : new Error(String(error)));
        }
        handleFirestoreError(error, OperationType.LIST, path);
      }
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

// Subscribe to Settings
export function subscribeSettings(
  onUpdate: (settings: WebsiteSettings) => void,
  onError?: (err: Error) => void
): Unsubscribe {
  const path = 'settings/website';
  try {
    const docRef = doc(db, 'settings', 'website');
    return onSnapshot(
      docRef,
      (docSnap) => {
        if (docSnap.exists()) {
          onUpdate({ ...DEFAULT_SETTINGS, ...(docSnap.data() as WebsiteSettings) });
        } else {
          onUpdate(DEFAULT_SETTINGS);
        }
      },
      (error) => {
        if (onError) {
          onError(error instanceof Error ? error : new Error(String(error)));
        }
        handleFirestoreError(error, OperationType.GET, path);
      }
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

// Subscribe to Orders (Admin view)
export function subscribeOrders(
  onUpdate: (orders: Order[]) => void,
  onError?: (err: Error) => void
): Unsubscribe {
  const path = 'orders';
  try {
    const q = query(collection(db, path));
    return onSnapshot(
      q,
      (snapshot) => {
        const orders: Order[] = [];
        snapshot.forEach((docSnap) => {
          orders.push({ ...(docSnap.data() as Order), id: docSnap.id });
        });
        orders.sort((a, b) => new Date(b.createdAt || b.orderDate).getTime() - new Date(a.createdAt || a.orderDate).getTime());
        onUpdate(orders);
      },
      (error) => {
        if (onError) {
          onError(error instanceof Error ? error : new Error(String(error)));
        }
        handleFirestoreError(error, OperationType.LIST, path);
      }
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

// Save or update Product
export async function saveProduct(product: Product): Promise<void> {
  const path = `products/${product.id}`;
  try {
    const docRef = doc(db, 'products', product.id);
    const mainImg = product.image || product.mainImage || '';
    const gal = product.galleryImages || product.gallery || [];
    const isPub = product.isPublished !== undefined ? product.isPublished : (product.published !== undefined ? product.published : true);
    const stQty = product.stockQuantity !== undefined ? product.stockQuantity : (product.stock !== undefined ? product.stock : 0);

    const cleanData = {
      ...product,
      image: mainImg,
      mainImage: mainImg,
      galleryImages: gal,
      gallery: gal,
      isPublished: isPub,
      published: isPub,
      stockQuantity: stQty,
      stock: stQty,
      updatedAt: new Date().toISOString(),
    };
    await setDoc(docRef, cleanData, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// Delete Product
export async function deleteProduct(productId: string): Promise<void> {
  const path = `products/${productId}`;
  try {
    await deleteDoc(doc(db, 'products', productId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// Create Order (Customer checkout)
export async function createOrder(order: Order): Promise<string> {
  const path = `orders/${order.orderId}`;
  try {
    const docRef = doc(db, 'orders', order.orderId);
    const orderData: Order = {
      ...order,
      orderStatus: 'Pending',
      deliveryPaymentStatus: 'paid_pending_verification',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await setDoc(docRef, orderData);
    return order.orderId;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

// Update Order Status (Admin)
export async function updateOrderStatus(
  orderId: string,
  status: OrderStatus,
  deliveryPaymentStatus?: DeliveryPaymentStatus
): Promise<void> {
  const path = `orders/${orderId}`;
  try {
    const docRef = doc(db, 'orders', orderId);
    const updates: Partial<Order> = {
      orderStatus: status,
      updatedAt: new Date().toISOString(),
    };
    if (deliveryPaymentStatus) {
      updates.deliveryPaymentStatus = deliveryPaymentStatus;
    }
    await updateDoc(docRef, updates);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

// Delete Order (Admin)
export async function deleteOrder(orderId: string): Promise<void> {
  const path = `orders/${orderId}`;
  try {
    await deleteDoc(doc(db, 'orders', orderId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// Save Settings (Admin)
export async function saveSettings(settings: Partial<WebsiteSettings>): Promise<void> {
  const path = 'settings/website';
  try {
    const docRef = doc(db, 'settings', 'website');
    await setDoc(
      docRef,
      {
        ...settings,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// Save Banner (Admin)
export async function saveBanner(banner: Banner): Promise<void> {
  const path = `banners/${banner.id}`;
  try {
    const docRef = doc(db, 'banners', banner.id);
    await setDoc(docRef, banner, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// Delete Banner (Admin)
export async function deleteBanner(bannerId: string): Promise<void> {
  const path = `banners/${bannerId}`;
  try {
    await deleteDoc(doc(db, 'banners', bannerId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// Save Category (Admin)
export async function saveCategory(category: Category): Promise<void> {
  const path = `categories/${category.id}`;
  try {
    const docRef = doc(db, 'categories', category.id);
    await setDoc(docRef, category, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// Delete Category (Admin)
export async function deleteCategory(categoryId: string): Promise<void> {
  const path = `categories/${categoryId}`;
  try {
    await deleteDoc(doc(db, 'categories', categoryId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// Seed initial database items if Firestore is empty
export async function seedInitialDataIfEmpty(): Promise<void> {
  try {
    // Check if settings exist
    const settingsRef = doc(db, 'settings', 'website');
    const settingsSnap = await getDoc(settingsRef);
    if (!settingsSnap.exists()) {
      await setDoc(settingsRef, DEFAULT_SETTINGS);
    }

    // Check if categories exist
    const catSnap = await getDocs(collection(db, 'categories'));
    if (catSnap.empty) {
      for (const cat of INITIAL_CATEGORIES) {
        await setDoc(doc(db, 'categories', cat.id), cat);
      }
    }

    // Check if products exist
    const prodSnap = await getDocs(collection(db, 'products'));
    if (prodSnap.empty) {
      for (const prod of INITIAL_PRODUCTS) {
        await setDoc(doc(db, 'products', prod.id), prod);
      }
    }

    // Check if banners exist
    const banSnap = await getDocs(collection(db, 'banners'));
    if (banSnap.empty) {
      for (const ban of INITIAL_BANNERS) {
        await setDoc(doc(db, 'banners', ban.id), ban);
      }
    }
  } catch (err) {
    // Non-fatal if user is unauthenticated customer and write is blocked
    console.warn('Seed initial data check completed or restricted by rules:', err);
  }
}
