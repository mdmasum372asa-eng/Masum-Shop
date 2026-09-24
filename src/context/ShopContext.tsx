import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Product,
  Category,
  Banner,
  WebsiteSettings,
  CartItem,
  Order,
  DeliveryLocation,
} from '../types';
import {
  subscribeProducts,
  subscribeCategories,
  subscribeBanners,
  subscribeSettings,
  subscribeOrders,
  DEFAULT_SETTINGS,
  INITIAL_PRODUCTS,
  INITIAL_CATEGORIES,
  INITIAL_BANNERS,
  seedInitialDataIfEmpty,
} from '../services/dataService';
import { useAuth } from './AuthContext';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface ShopContextType {
  products: Product[];
  categories: Category[];
  banners: Banner[];
  settings: WebsiteSettings;
  orders: Order[];
  loading: boolean;
  cart: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  buyNow: (product: Product) => void;
  cartSubtotal: number;
  cartCount: number;
  deliveryLocation: DeliveryLocation;
  setDeliveryLocation: (location: DeliveryLocation) => void;
  currentDeliveryCharge: number;
  grandTotal: number;
  activeCategory: string;
  setActiveCategory: (category: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  sortBy: string;
  setSortBy: (sort: string) => void;
  stockFilter: 'all' | 'in_stock';
  setStockFilter: (filter: 'all' | 'in_stock') => void;
  selectedProduct: Product | null;
  setSelectedProduct: (product: Product | null) => void;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  isCheckoutOpen: boolean;
  setIsCheckoutOpen: (open: boolean) => void;
  isOrderSuccessOpen: boolean;
  setIsOrderSuccessOpen: (open: boolean) => void;
  lastCreatedOrder: Order | null;
  setLastCreatedOrder: (order: Order | null) => void;
  isOrderTrackOpen: boolean;
  setIsOrderTrackOpen: (open: boolean) => void;
  isAdminLoginOpen: boolean;
  setIsAdminLoginOpen: (open: boolean) => void;
  isAdminDashboardOpen: boolean;
  setIsAdminDashboardOpen: (open: boolean) => void;
  toasts: Toast[];
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  removeToast: (id: string) => void;
}

const ShopContext = createContext<ShopContextType | undefined>(undefined);

export const ShopProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAdmin } = useAuth();
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [categories, setCategories] = useState<Category[]>(INITIAL_CATEGORIES);
  const [banners, setBanners] = useState<Banner[]>(INITIAL_BANNERS);
  const [settings, setSettings] = useState<WebsiteSettings>(DEFAULT_SETTINGS);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Cart state persisted in localStorage
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('masum_shop_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [deliveryLocation, setDeliveryLocation] = useState<DeliveryLocation>('inside_cox');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('featured');
  const [stockFilter, setStockFilter] = useState<'all' | 'in_stock'>('all');

  // Modals & Drawers
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState<boolean>(false);
  const [isOrderSuccessOpen, setIsOrderSuccessOpen] = useState<boolean>(false);
  const [lastCreatedOrder, setLastCreatedOrder] = useState<Order | null>(null);
  const [isOrderTrackOpen, setIsOrderTrackOpen] = useState<boolean>(false);
  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState<boolean>(false);
  const [isAdminDashboardOpen, setIsAdminDashboardOpen] = useState<boolean>(false);

  // Toast notifications
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = Date.now().toString() + Math.random().toString().slice(2, 6);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Sync cart to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('masum_shop_cart', JSON.stringify(cart));
    } catch (err) {
      console.warn('Could not save cart to localStorage:', err);
    }
  }, [cart]);

  // Realtime subscriptions
  useEffect(() => {
    // Check initial seed
    seedInitialDataIfEmpty().catch(() => {});

    const unsubSettings = subscribeSettings((newSettings) => {
      setSettings(newSettings);
    });

    const unsubProducts = subscribeProducts(
      (newProducts) => {
        if (newProducts.length > 0) {
          setProducts(newProducts);
        }
        setLoading(false);
      },
      () => {
        // Fallback to initial demo products if rules restrict or loading
        setLoading(false);
      }
    );

    const unsubCategories = subscribeCategories((newCategories) => {
      if (newCategories.length > 0) {
        setCategories(newCategories);
      }
    });

    const unsubBanners = subscribeBanners((newBanners) => {
      if (newBanners.length > 0) {
        setBanners(newBanners);
      }
    });

    return () => {
      unsubSettings?.();
      unsubProducts?.();
      unsubCategories?.();
      unsubBanners?.();
    };
  }, []);

  // Subscribe to Orders only when user has Admin rights
  useEffect(() => {
    if (!isAdmin) {
      setOrders([]);
      return;
    }
    const unsubOrders = subscribeOrders((newOrders) => {
      setOrders(newOrders);
    });
    return () => {
      unsubOrders?.();
    };
  }, [isAdmin]);

  // Cart operations
  const addToCart = (product: Product, quantity = 1) => {
    if (product.stockStatus === 'out_of_stock' || product.stockQuantity <= 0) {
      showToast('দুঃখিত, পণ্যটি বর্তমানে স্টকে নেই।', 'error');
      return;
    }

    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        const newQty = existing.quantity + quantity;
        if (newQty > product.stockQuantity) {
          showToast(`সর্বোচ্চ ${product.stockQuantity} টি পণ্য কার্টে নেওয়া সম্ভব`, 'info');
          return prev.map((item) =>
            item.product.id === product.id ? { ...item, quantity: product.stockQuantity } : item
          );
        }
        showToast(`"${product.name.slice(0, 22)}..." এর পরিমাণ বাড়ানো হয়েছে!`);
        return prev.map((item) =>
          item.product.id === product.id ? { ...item, quantity: newQty } : item
        );
      }
      showToast(`"${product.name.slice(0, 22)}..." কার্টে যোগ হয়েছে!`);
      return [...prev, { product, quantity }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
    showToast('পণ্যটি কার্ট থেকে সরানো হয়েছে।', 'info');
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart((prev) =>
      prev.map((item) => {
        if (item.product.id === productId) {
          const maxQty = item.product.stockQuantity || 99;
          const finalQty = Math.min(quantity, maxQty);
          return { ...item, quantity: finalQty };
        }
        return item;
      })
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const buyNow = (product: Product) => {
    if (product.stockStatus === 'out_of_stock' || product.stockQuantity <= 0) {
      showToast('দুঃখিত, পণ্যটি বর্তমানে স্টকে নেই।', 'error');
      return;
    }
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev;
      }
      return [...prev, { product, quantity: 1 }];
    });
    setSelectedProduct(null);
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  // Pricing calculations
  const cartSubtotal = cart.reduce((acc, item) => {
    const price = item.product.discountPrice ?? item.product.regularPrice;
    return acc + price * item.quantity;
  }, 0);

  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  const currentDeliveryCharge =
    deliveryLocation === 'inside_cox'
      ? settings.defaultInsideDeliveryCharge || 70
      : settings.defaultOutsideDeliveryCharge || 130;

  const grandTotal = cartSubtotal > 0 ? cartSubtotal + currentDeliveryCharge : 0;

  return (
    <ShopContext.Provider
      value={{
        products,
        categories,
        banners,
        settings,
        orders,
        loading,
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        buyNow,
        cartSubtotal,
        cartCount,
        deliveryLocation,
        setDeliveryLocation,
        currentDeliveryCharge,
        grandTotal,
        activeCategory,
        setActiveCategory,
        searchQuery,
        setSearchQuery,
        sortBy,
        setSortBy,
        stockFilter,
        setStockFilter,
        selectedProduct,
        setSelectedProduct,
        isCartOpen,
        setIsCartOpen,
        isCheckoutOpen,
        setIsCheckoutOpen,
        isOrderSuccessOpen,
        setIsOrderSuccessOpen,
        lastCreatedOrder,
        setLastCreatedOrder,
        isOrderTrackOpen,
        setIsOrderTrackOpen,
        isAdminLoginOpen,
        setIsAdminLoginOpen,
        isAdminDashboardOpen,
        setIsAdminDashboardOpen,
        toasts,
        showToast,
        removeToast,
      }}
    >
      {children}
    </ShopContext.Provider>
  );
};

export const useShop = (): ShopContextType => {
  const context = useContext(ShopContext);
  if (!context) {
    throw new Error('useShop must be used within a ShopProvider');
  }
  return context;
};
