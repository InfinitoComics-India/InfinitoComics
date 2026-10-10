import ShopOrder from '../models/ShopOrder.js';
import Product from '../models/Product.js';

// Format helper
const formatOrderNumber = () => {
  return String(Math.floor(1000 + Math.random() * 9000));
};

export const createOrder = async (req, res) => {
  try {
    const body = req.body || {};
    const orderNum = body.id || body.orderNumber || formatOrderNumber();
    const orderId = body.orderId ? (body.orderId.startsWith('#') ? body.orderId : `#${body.orderId}`) : `#${orderNum}`;

    // Normalize customer info
    const reqEmail = String(body.customer?.email || body.address?.email || '').trim().toLowerCase();
    const fallbackName = reqEmail === 'admin@infinitohq.com' ? 'Super Admin' : (reqEmail === 'anushka@infinitohq.com' ? 'Anushka' : 'Aarav Sharma');
    const rawCustomerName = body.customer?.name || body.address?.name;
    const resolvedName = (rawCustomerName && String(rawCustomerName).toLowerCase() !== 'valued customer' && String(rawCustomerName).toLowerCase() !== 'customer')
      ? rawCustomerName
      : fallbackName;

    const customer = {
      name: resolvedName,
      email: reqEmail || 'customer@infinitohq.com',
      phone: body.customer?.phone || body.address?.phone || '+91 98765 43210',
      totalOrders: body.customer?.totalOrders || 1,
    };

    // Normalize shipping address
    const addr = body.address || body.shippingAddress || {};
    const formattedAddr = addr.formatted || [addr.line1, addr.city, addr.state, addr.pincode, addr.country || 'India'].filter(Boolean).join(', ');

    const shippingAddress = {
      name: addr.name || customer.name,
      phone: addr.phone || customer.phone,
      line1: addr.line1 || 'Sector 18, House No. 42',
      city: addr.city || 'Chandigarh',
      state: addr.state || 'Punjab',
      pincode: addr.pincode || '160018',
      country: addr.country || 'India',
      formatted: formattedAddr,
    };

    // Normalize items
    const rawItems = Array.isArray(body.items) ? body.items : [];
    const items = rawItems.map((item, idx) => {
      const prod = item.product || {};
      const unitPrice = Number(prod.price || prod.salePrice || prod.basePrice || item.unitPrice || item.price || 1299);
      const qty = Number(item.quantity || 1);
      const prodName = item.name || prod.name || prod.title || 'INFINITO Item';

      return {
        productId: String(item.productId || prod.id || prod._id || `prod-${idx}`),
        name: prodName,
        sku: item.sku || `INF-${prodName.substring(0, 3).toUpperCase()}-${item.size || 'M'}`,
        variant: {
          size: item.size || item.variant?.size || 'M',
          color: item.color || item.variant?.color || 'Standard',
        },
        thumbnail: prod.image || (Array.isArray(prod.images) ? prod.images[0]?.url || prod.images[0] : null) || item.thumbnail || '',
        quantity: qty,
        unitPrice,
        total: unitPrice * qty,
      };
    });

    const subtotal = body.pricing?.subtotal || items.reduce((s, i) => s + i.total, 0);
    const tax = body.pricing?.tax !== undefined ? Number(body.pricing.tax) : Number((subtotal * 0.18).toFixed(2));
    const shipping = body.pricing?.shipping !== undefined ? Number(body.pricing.shipping) : (subtotal > 999 ? 0 : 50);
    const grandTotal = body.total ? Number(body.total) : (body.pricing?.grandTotal || Number((subtotal + tax + shipping).toFixed(2)));

    const now = new Date();
    const orderData = {
      orderId,
      id: orderNum,
      customer,
      shippingAddress,
      billingAddress: body.billingAddress || { ...shippingAddress, isSameAsShipping: true },
      items,
      pricing: {
        subtotal,
        shipping,
        tax,
        discount: body.pricing?.discount || 0,
        discountCode: body.pricing?.discountCode || '',
        grandTotal,
      },
      payment: {
        method: body.paymentMethod || body.payment?.method || 'Razorpay (UPI)',
        transactionId: body.payment?.transactionId || `pay_Rzp${Math.floor(10000000 + Math.random() * 90000000)}`,
        status: body.payment?.status || 'Paid',
        date: now,
      },
      fulfillment: {
        status: body.fulfillment?.status || 'Unfulfilled',
        qikink: {
          sent: false,
          sentAt: null,
          qikinkOrderId: null,
          status: 'Pending Dispatch',
        },
        tracking: {
          carrier: 'BlueDart Express',
          trackingNumber: '',
          trackingUrl: '',
          estimatedDelivery: '',
        },
      },
      timeline: {
        orderPlaced: now,
        paymentConfirmed: now,
        sentToQikink: null,
        printed: null,
        shipped: null,
        delivered: null,
      },
      notes: body.notes || '',
    };

    const newOrder = await ShopOrder.create(orderData);

    // Optionally increment product totalSales
    for (const it of items) {
      if (it.productId) {
        Product.findByIdAndUpdate(it.productId, { $inc: { totalSales: it.quantity } }).catch(() => {});
      }
    }

    return res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: newOrder,
    });
  } catch (error) {
    console.error('Error creating shop order:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to create order',
    });
  }
};

export const getAllOrders = async (req, res) => {
  try {
    const { status, paymentStatus, search, limit = 100 } = req.query;
    const query = {};

    if (status && status !== 'All') {
      const lower = status.toLowerCase();
      if (lower === 'pending') {
        query.$or = [{ 'fulfillment.status': 'Unfulfilled' }, { 'payment.status': 'Pending' }];
      } else if (lower === 'processing') {
        query['fulfillment.status'] = 'Processing';
      } else if (lower === 'fulfilled') {
        query['fulfillment.status'] = 'Fulfilled';
      } else if (lower === 'cancelled') {
        query['fulfillment.status'] = 'Cancelled';
      }
    }

    if (paymentStatus && paymentStatus !== 'All') {
      query['payment.status'] = paymentStatus;
    }

    if (search && search.trim()) {
      const regex = new RegExp(search.trim(), 'i');
      query.$or = [
        { orderId: regex },
        { id: regex },
        { 'customer.name': regex },
        { 'customer.email': regex },
        { 'customer.phone': regex },
        { 'items.name': regex },
        { 'items.sku': regex },
      ];
    }

    const orders = await ShopOrder.find(query)
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .lean();

    return res.status(200).json({
      success: true,
      data: orders,
      count: orders.length,
    });
  } catch (error) {
    console.error('Error fetching shop orders:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch orders',
    });
  }
};

export const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const cleanId = String(id).replace(/^#/, '');

    const order = await ShopOrder.findOne({
      $or: [
        { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null },
        { orderId: `#${cleanId}` },
        { orderId: cleanId },
        { id: cleanId },
      ].filter(Boolean),
    }).lean();

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    return res.status(200).json({
      success: true,
      data: order,
    });
  } catch (error) {
    console.error('Error fetching order by ID:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch order',
    });
  }
};

export const updateOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const cleanId = String(id).replace(/^#/, '');
    const updates = req.body || {};

    const order = await ShopOrder.findOne({
      $or: [
        { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null },
        { orderId: `#${cleanId}` },
        { orderId: cleanId },
        { id: cleanId },
      ].filter(Boolean),
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    // Apply updates
    if (updates.fulfillment) {
      order.fulfillment = { ...order.fulfillment.toObject(), ...updates.fulfillment };
      if (updates.fulfillment.status === 'Fulfilled' && !order.timeline?.delivered) {
        order.timeline = { ...(order.timeline || {}), delivered: new Date(), shipped: order.timeline?.shipped || new Date() };
      }
    }
    if (updates.payment) {
      order.payment = { ...order.payment.toObject(), ...updates.payment };
    }
    if (updates.notes !== undefined) {
      order.notes = updates.notes;
    }
    if (updates.timeline) {
      order.timeline = { ...(order.timeline || {}), ...updates.timeline };
    }

    await order.save();

    return res.status(200).json({
      success: true,
      message: 'Order updated successfully',
      data: order,
    });
  } catch (error) {
    console.error('Error updating order:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to update order',
    });
  }
};

export const cancelOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const cleanId = String(id).replace(/^#/, '');
    const { reason = 'Cancelled by customer/admin' } = req.body || {};

    const order = await ShopOrder.findOne({
      $or: [
        { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null },
        { orderId: `#${cleanId}` },
        { orderId: cleanId },
        { id: cleanId },
      ].filter(Boolean),
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    order.fulfillment = {
      ...(order.fulfillment || {}),
      status: 'Cancelled',
      qikink: { ...(order.fulfillment?.qikink || {}), status: 'Cancelled' },
    };
    order.payment = {
      ...(order.payment || {}),
      status: 'Refunded',
    };
    order.refund = {
      refundId: `rfnd_Rzp${Math.floor(10000000 + Math.random() * 90000000)}`,
      amount: order.pricing?.grandTotal || 0,
      type: 'Full Refund',
      reason,
      date: new Date(),
    };

    await order.save();

    return res.status(200).json({
      success: true,
      message: 'Order cancelled and refunded',
      data: order,
    });
  } catch (error) {
    console.error('Error cancelling order:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to cancel order',
    });
  }
};
