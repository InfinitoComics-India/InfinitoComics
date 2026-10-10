import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
  productId: { type: String, default: '' },
  name: { type: String, required: true },
  sku: { type: String, default: 'INF-ITEM' },
  variant: {
    size: { type: String, default: 'M' },
    color: { type: String, default: 'Standard' },
  },
  thumbnail: { type: String, default: '' },
  quantity: { type: Number, required: true, min: 1, default: 1 },
  unitPrice: { type: Number, required: true, default: 0 },
  total: { type: Number, required: true, default: 0 },
}, { _id: false });

const shopOrderSchema = new mongoose.Schema({
  orderId: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  id: {
    type: String,
    trim: true,
  },
  customer: {
    name: { type: String, default: 'Aarav Sharma' },
    email: { type: String, default: 'customer@infinitohq.com' },
    phone: { type: String, default: '+91 98765 43210' },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    totalOrders: { type: Number, default: 1 },
  },
  shippingAddress: {
    name: { type: String, default: '' },
    phone: { type: String, default: '' },
    line1: { type: String, default: '' },
    city: { type: String, default: '' },
    state: { type: String, default: '' },
    pincode: { type: String, default: '' },
    country: { type: String, default: 'India' },
    formatted: { type: String, default: '' },
  },
  billingAddress: {
    name: { type: String, default: '' },
    line1: { type: String, default: '' },
    city: { type: String, default: '' },
    state: { type: String, default: '' },
    pincode: { type: String, default: '' },
    country: { type: String, default: 'India' },
    isSameAsShipping: { type: Boolean, default: true },
    formatted: { type: String, default: '' },
  },
  items: [orderItemSchema],
  pricing: {
    subtotal: { type: Number, required: true, default: 0 },
    shipping: { type: Number, default: 0 },
    tax: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    discountCode: { type: String, default: '' },
    grandTotal: { type: Number, required: true, default: 0 },
  },
  payment: {
    method: { type: String, default: 'Razorpay (UPI)' },
    transactionId: { type: String, default: '' },
    status: {
      type: String,
      enum: ['Paid', 'Pending', 'Failed', 'Refunded', 'Partially Refunded'],
      default: 'Paid',
    },
    date: { type: Date, default: Date.now },
  },
  fulfillment: {
    status: {
      type: String,
      enum: ['Unfulfilled', 'Processing', 'Fulfilled', 'Cancelled'],
      default: 'Unfulfilled',
    },
    qikink: {
      sent: { type: Boolean, default: false },
      sentAt: { type: Date, default: null },
      qikinkOrderId: { type: String, default: null },
      status: { type: String, default: 'Pending Dispatch' },
    },
    tracking: {
      carrier: { type: String, default: 'BlueDart Express' },
      trackingNumber: { type: String, default: '' },
      trackingUrl: { type: String, default: '' },
      estimatedDelivery: { type: String, default: '' },
    },
  },
  refund: {
    refundId: { type: String, default: null },
    amount: { type: Number, default: 0 },
    type: { type: String, default: 'Full Refund' },
    reason: { type: String, default: '' },
    date: { type: Date, default: null },
  },
  timeline: {
    orderPlaced: { type: Date, default: Date.now },
    paymentConfirmed: { type: Date, default: Date.now },
    sentToQikink: { type: Date, default: null },
    printed: { type: Date, default: null },
    shipped: { type: Date, default: null },
    delivered: { type: Date, default: null },
  },
  notes: { type: String, default: '' },
}, {
  timestamps: true,
});

shopOrderSchema.index({ orderId: 1 });
shopOrderSchema.index({ 'customer.email': 1 });
shopOrderSchema.index({ 'fulfillment.status': 1 });
shopOrderSchema.index({ 'payment.status': 1 });
shopOrderSchema.index({ createdAt: -1 });

const ShopOrder = mongoose.model('ShopOrder', shopOrderSchema);
export default ShopOrder;
