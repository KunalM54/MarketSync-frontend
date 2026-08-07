/* ------------------------------------------------------------------ */
/* Mock data for the dashboard shells — swap with real API calls later */
/* ------------------------------------------------------------------ */

export type OrderStatus =
  | "PENDING"
  | "PAID"
  | "PROCESSING"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED"
  | "REFUNDED";

export interface MockOrder {
  id: string;
  customer: string;
  items: number;
  total: number;
  status: OrderStatus;
  date: string;
  payment: string;
}

export interface MockProduct {
  name: string;
  sku: string;
  category: string;
  sold: number;
  revenue: number;
  stock: number;
  reserved: number;
  threshold: number;
  rating: number;
}

export interface MockCustomer {
  name: string;
  email: string;
  orders: number;
  spent: number;
  joined: string;
}

export interface MockReview {
  customer: string;
  product: string;
  rating: number;
  text: string;
  date: string;
}

export interface MockAddress {
  label: string;
  line1: string;
  line2: string;
  city: string;
  phone: string;
  isDefault: boolean;
}

export interface MockRecommended {
  name: string;
  category: string;
  price: number;
  oldPrice?: number;
  rating: number;
  sold: number;
}

export interface MockActivity {
  text: string;
  time: string;
  tone?: "success" | "warning" | "danger";
}

export const formatINR = (n: number) => "₹" + n.toLocaleString("en-IN");

export const monthLabels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export const adminRevenue = [182, 214, 198, 246, 231, 274, 262, 308, 296, 342, 328, 386];
export const adminOrdersSeries = [92, 104, 98, 118, 112, 136, 128, 152, 144, 168, 158, 184];
export const sellerRevenue = [38, 52, 46, 61, 57, 72, 66, 84, 78, 95, 88, 104];

export const orderStatusSegments = [
  { label: "Delivered", value: 742, color: "var(--success)" },
  { label: "Processing", value: 214, color: "var(--info)" },
  { label: "Pending", value: 132, color: "var(--warning)" },
  { label: "Cancelled", value: 64, color: "var(--danger)" },
  { label: "Refunded", value: 52, color: "var(--text-faint)" },
];

export const sellerStatusSegments = [
  { label: "Delivered", value: 214, color: "var(--success)" },
  { label: "Processing", value: 68, color: "var(--info)" },
  { label: "Pending", value: 41, color: "var(--warning)" },
  { label: "Cancelled", value: 19, color: "var(--danger)" },
];

export const adminOrders: MockOrder[] = [
  { id: "ORD-1048", customer: "Aarav Mehta", items: 3, total: 12499, status: "DELIVERED", date: "Aug 6, 2026", payment: "UPI" },
  { id: "ORD-1047", customer: "Sana Kapoor", items: 1, total: 899, status: "SHIPPED", date: "Aug 6, 2026", payment: "Card" },
  { id: "ORD-1046", customer: "Rohan Iyer", items: 5, total: 21840, status: "PROCESSING", date: "Aug 5, 2026", payment: "Razorpay" },
  { id: "ORD-1045", customer: "Meera Nair", items: 2, total: 4598, status: "PAID", date: "Aug 5, 2026", payment: "UPI" },
  { id: "ORD-1044", customer: "Kabir Singh", items: 1, total: 24999, status: "PENDING", date: "Aug 4, 2026", payment: "COD" },
  { id: "ORD-1043", customer: "Ananya Das", items: 4, total: 7630, status: "CANCELLED", date: "Aug 4, 2026", payment: "Card" },
];

export const sellerOrders: MockOrder[] = [
  { id: "ORD-0904", customer: "Divya R.", items: 2, total: 4498, status: "DELIVERED", date: "Aug 6, 2026", payment: "UPI" },
  { id: "ORD-0903", customer: "Kunal P.", items: 1, total: 6499, status: "SHIPPED", date: "Aug 6, 2026", payment: "Card" },
  { id: "ORD-0902", customer: "Ishita V.", items: 3, total: 5210, status: "PROCESSING", date: "Aug 5, 2026", payment: "Razorpay" },
  { id: "ORD-0901", customer: "Rahul T.", items: 1, total: 1299, status: "PENDING", date: "Aug 5, 2026", payment: "COD" },
  { id: "ORD-0900", customer: "Nisha K.", items: 2, total: 3840, status: "REFUNDED", date: "Aug 4, 2026", payment: "Card" },
];

export const customerOrders: MockOrder[] = [
  { id: "ORD-1042", customer: "You", items: 1, total: 2499, status: "SHIPPED", date: "Aug 5, 2026", payment: "UPI" },
  { id: "ORD-1038", customer: "You", items: 2, total: 8998, status: "DELIVERED", date: "Jul 28, 2026", payment: "Card" },
  { id: "ORD-1029", customer: "You", items: 4, total: 12450, status: "DELIVERED", date: "Jul 14, 2026", payment: "Razorpay" },
  { id: "ORD-1017", customer: "You", items: 1, total: 699, status: "CANCELLED", date: "Jun 30, 2026", payment: "UPI" },
];

export const adminTopProducts: MockProduct[] = [
  { name: "Wireless Noise-Cancel Headphones", sku: "SKU-8841", category: "Audio", sold: 1240, revenue: 1238000, stock: 86, reserved: 12, threshold: 40, rating: 4.8 },
  { name: "Mechanical Keyboard TKL", sku: "SKU-2210", category: "Accessories", sold: 986, revenue: 893400, stock: 64, reserved: 9, threshold: 35, rating: 4.7 },
  { name: "Ceramic Pour-Over Dripper", sku: "SKU-1193", category: "Home", sold: 742, revenue: 428150, stock: 118, reserved: 6, threshold: 40, rating: 4.7 },
  { name: "Linen Shirt — Sage", sku: "SKU-4457", category: "Fashion", sold: 689, revenue: 531920, stock: 23, reserved: 11, threshold: 30, rating: 4.5 },
  { name: "Stainless Bottle 750ml", sku: "SKU-5524", category: "Lifestyle", sold: 512, revenue: 167340, stock: 152, reserved: 4, threshold: 35, rating: 4.9 },
];

export const sellerTopProducts: MockProduct[] = [
  { name: "Wireless Noise-Cancel Headphones", sku: "SKU-8841", category: "Audio", sold: 418, revenue: 418000, stock: 34, reserved: 6, threshold: 20, rating: 4.8 },
  { name: "Mechanical Keyboard TKL", sku: "SKU-2210", category: "Accessories", sold: 302, revenue: 271800, stock: 22, reserved: 4, threshold: 15, rating: 4.7 },
  { name: "USB-C Hub 7-in-1", sku: "SKU-3312", category: "Accessories", sold: 186, revenue: 83700, stock: 8, reserved: 5, threshold: 20, rating: 4.6 },
  { name: "Laptop Stand — Aluminum", sku: "SKU-4417", category: "Accessories", sold: 154, revenue: 107800, stock: 46, reserved: 2, threshold: 15, rating: 4.9 },
];

export const lowStock: MockProduct[] = [
  { name: "Organic Green Tea, 250g", sku: "SKU-2210", category: "Groceries", sold: 312, revenue: 84840, stock: 6, reserved: 4, threshold: 25, rating: 4.6 },
  { name: "Ceramic Pour-Over Dripper", sku: "SKU-1193", category: "Home", sold: 148, revenue: 64120, stock: 9, reserved: 2, threshold: 20, rating: 4.7 },
  { name: "Linen Shirt — Sage", sku: "SKU-4457", category: "Fashion", sold: 203, revenue: 192850, stock: 12, reserved: 8, threshold: 30, rating: 4.5 },
  { name: "Stainless Bottle 750ml", sku: "SKU-5524", category: "Lifestyle", sold: 274, revenue: 89560, stock: 15, reserved: 3, threshold: 35, rating: 4.9 },
];

export const recentCustomers: MockCustomer[] = [
  { name: "Aarav Mehta", email: "aarav@example.com", orders: 14, spent: 124890, joined: "Jun 2026" },
  { name: "Sana Kapoor", email: "sana@example.com", orders: 9, spent: 68450, joined: "May 2026" },
  { name: "Rohan Iyer", email: "rohan@example.com", orders: 22, spent: 212340, joined: "Mar 2026" },
  { name: "Meera Nair", email: "meera@example.com", orders: 5, spent: 18990, joined: "Jul 2026" },
  { name: "Kabir Singh", email: "kabir@example.com", orders: 17, spent: 154620, joined: "Feb 2026" },
];

export const sellerReviews: MockReview[] = [
  { customer: "Divya R.", product: "Wireless Headphones", rating: 5, text: "Sound quality is unreal at this price. Packaging was immaculate.", date: "2 days ago" },
  { customer: "Kunal P.", product: "Mechanical Keyboard", rating: 4, text: "Great feel, slight learning curve on the layout. Would buy again.", date: "5 days ago" },
  { customer: "Ishita V.", product: "Ceramic Pour-Over", rating: 5, text: "Gorgeous. My morning ritual looks like a café now.", date: "1 week ago" },
];

export const customerAddresses: MockAddress[] = [
  {
    label: "Home",
    line1: "14 Lakeview Road, Flat 3B",
    line2: "Indiranagar",
    city: "Bengaluru, Karnataka 560038",
    phone: "+91 98765 43210",
    isDefault: true,
  },
  {
    label: "Work",
    line1: "WeWork Galaxy, 4th Floor",
    line2: "Residency Road",
    city: "Bengaluru, Karnataka 560025",
    phone: "+91 98765 43210",
    isDefault: false,
  },
];

export const recommended: MockRecommended[] = [
  { name: "Minimal Canvas Backpack", category: "Lifestyle", price: 1899, oldPrice: 2499, rating: 4.7, sold: 320 },
  { name: "Nordic Desk Lamp", category: "Home", price: 1299, rating: 4.6, sold: 210 },
  { name: "Suede Loafers — Tan", category: "Fashion", price: 2799, oldPrice: 3499, rating: 4.8, sold: 154 },
  { name: "Reusable Coffee Cup", category: "Lifestyle", price: 699, rating: 4.9, sold: 512 },
];

export const adminActivity: MockActivity[] = [
  { text: "New seller store approved — Amara Textiles", time: "12 min ago", tone: "success" },
  { text: "Payment of ₹12,499 verified for ORD-1048", time: "34 min ago" },
  { text: "Inventory threshold alert: 4 SKUs low", time: "1 hr ago", tone: "warning" },
  { text: "New customer signup — Meera Nair", time: "2 hrs ago" },
  { text: "Refund requested for ORD-1043", time: "3 hrs ago", tone: "danger" },
];
