export interface Product {
  id: string;
  name: string;
  image: string;
  mainImage?: string;
  galleryImages: string[];
  gallery?: string[];
  category: string;
  regularPrice: number;
  discountPrice?: number;
  description: string;
  stockQuantity: number;
  stock?: number;
  stockStatus: 'in_stock' | 'out_of_stock';
  isPublished: boolean;
  published?: boolean;
  createdAt: string;
  updatedAt: string;
  featured?: boolean;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon?: string;
  createdAt: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export type DeliveryLocation = 'inside_cox' | 'outside_cox';
export type PaymentMethod = 'bkash' | 'nagad';
export type OrderStatus = 'Pending' | 'Confirmed' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
export type DeliveryPaymentStatus = 'paid_pending_verification' | 'verified' | 'rejected';

export interface Order {
  id?: string;
  orderId: string;
  customerName: string;
  phone: string;
  address: string;
  deliveryLocation: DeliveryLocation;
  products: {
    productId: string;
    productName: string;
    price: number;
    quantity: number;
    image: string;
  }[];
  quantity: number;
  productTotal: number;
  deliveryCharge: number;
  grandTotal: number;
  paymentMethod: PaymentMethod;
  transactionId: string;
  deliveryPaymentStatus: DeliveryPaymentStatus;
  orderStatus: OrderStatus;
  orderDate: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Banner {
  id: string;
  title: string;
  image: string;
  link?: string;
  isEnabled: boolean;
  order: number;
  createdAt: string;
}

export interface WebsiteSettings {
  websiteName: string;
  logo: string;
  favicon?: string;
  contactNumber: string;
  facebookUrl: string;
  tiktokUrl: string;
  defaultInsideDeliveryCharge: number;
  defaultOutsideDeliveryCharge: number;
  bkashNumber: string;
  nagadNumber: string;
  paymentInstructions: string;
  homepageBanner: string;
  footerText: string;
  updatedAt: string;
}

export type AdminTab =
  | 'overview'
  | 'products'
  | 'add-product'
  | 'edit-product'
  | 'categories'
  | 'orders'
  | 'customers'
  | 'banners'
  | 'payment-settings'
  | 'delivery-settings'
  | 'website-settings'
  | 'social-settings'
  | 'source-export'
  | 'admin-settings';
