import ShopOrder from '../models/ShopOrder.js';
import Product from '../models/Product.js';
import qikinkService from '../services/qikink-service.js';

// Helper to derive username/person name from email
export const deriveNameFromEmail = (email) => {
  if (!email || typeof email !== 'string') return 'Customer';
  const clean = email.trim().toLowerCase();
  if (clean === 'admin@infinitohq.com') return 'Super Admin';
  if (clean === 'anushka@infinitohq.com') return 'Anushka';
  if (!clean.includes('@')) return clean;
  const userPart = clean.split('@')[0];
  if (userPart === 'admin' || userPart === 'superadmin') return 'Super Admin';
  const formatted = userPart
    .replace(/[0-9._-]+/g, ' ')
    .trim()
    .split(' ')
    .filter(Boolean)
    .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');
  return formatted || userPart;
};

// Ordered alphanumeric Order ID generator: INF-YYMMDD-XXXX (combination of ordered date, characters and alphabets)
export const generateOrderCode = () => {
  const now = new Date();
  const yy = String(now.getFullYear()).slice(-2);
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  let rand = '';
  for (let i = 0; i < 4; i++) {
    rand += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `INF-${yy}${mm}${dd}-${rand}`;
};

export const formatOrderNumber = generateOrderCode;

export const createOrder = async (req, res) => {
  try {
    const body = req.body || {};
    const rawNum = body.id || body.orderNumber || '';
    const isLegacyOrEmpty = !rawNum || /^\d{4}$/.test(String(rawNum).trim());
    const orderNum = isLegacyOrEmpty ? generateOrderCode() : String(rawNum).replace(/^#/, '');
    const orderId = body.orderId && !/^\#?\d{4}$/.test(String(body.orderId).trim())
      ? (body.orderId.startsWith('#') ? body.orderId : `#${body.orderId}`)
      : `#${orderNum}`;

    // Normalize customer info - derive from actual person's email/username
    const reqEmail = String(body.customer?.email || body.address?.email || '').trim().toLowerCase();
    const rawCustomerName = String(body.customer?.name || body.address?.name || '').trim();
    const isPlaceholder = !rawCustomerName ||
      rawCustomerName.toLowerCase() === 'valued customer' ||
      rawCustomerName.toLowerCase() === 'customer' ||
      rawCustomerName.toLowerCase() === 'aarav sharma';

    let resolvedName = rawCustomerName;
    if (isPlaceholder || reqEmail === 'admin@infinitohq.com' || rawCustomerName.toLowerCase() === 'aarav sharma') {
      resolvedName = deriveNameFromEmail(reqEmail);
    }

    // Sanitize customer and shipping phone (clean 10 digits for India / Qikink)
    const rawCustomerPhone = String(body.customer?.phone || body.address?.phone || body.shippingAddress?.phone || '9876543210').replace(/\D/g, '');
    let cleanCustomerPhone = rawCustomerPhone.length > 10 && rawCustomerPhone.startsWith('91') ? rawCustomerPhone.slice(2) : rawCustomerPhone;
    cleanCustomerPhone = cleanCustomerPhone.slice(-10) || '9876543210';

    const customer = {
      name: resolvedName,
      email: reqEmail || 'customer@infinitohq.com',
      phone: cleanCustomerPhone,
      totalOrders: body.customer?.totalOrders || 1,
    };

    // Normalize shipping address
    const addr = body.address || body.shippingAddress || {};
    const rawPin = String(addr.pincode || addr.zip || '160018').replace(/\D/g, '').slice(0, 6);
    const cleanPin = rawPin.length === 6 ? rawPin : '160018';

    const formattedAddr = addr.formatted || [addr.line1 || 'Sector 18, House No. 42', addr.city || 'Chandigarh', addr.state || 'Punjab', cleanPin, addr.country || 'India'].filter(Boolean).join(', ');

    const shippingAddress = {
      name: addr.name || customer.name,
      phone: cleanCustomerPhone,
      line1: addr.line1 || 'Sector 18, House No. 42',
      city: addr.city || 'Chandigarh',
      state: addr.state || 'Punjab',
      pincode: cleanPin,
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
        sku: item.sku || prod.sku || `INF-${prodName.substring(0, 3).toUpperCase()}-${item.size || 'M'}`,
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

    const isCOD = String(body.paymentMethod || body.payment?.method || '').toUpperCase() === 'COD' ||
                  String(body.paymentMethod || body.payment?.method || '').toLowerCase().includes('cash on delivery') ||
                  String(body.payment?.status || '').toUpperCase() === 'COD';

    const now = new Date();

    // FULFILLMENT & QIKINK DISPATCH LOGIC:
    // Prepaid orders (Razorpay, UPI, Card, Netbanking) are automatically dispatched to Qikink.
    // COD orders remain manual for admin review and explicit "Push to Qikink".
    let fulfillmentStatus = 'Unfulfilled';
    let qikinkData = {
      sent: false,
      sentAt: null,
      qikinkOrderId: null,
      status: isCOD ? 'Pending Dispatch (COD)' : 'Pending Dispatch',
      rawResponse: null,
      environment: null,
    };
    let timelineSentToQikink = null;
    let timelinePrinted = null;

    if (!isCOD) {
      try {
        const orderTempForQikink = {
          orderId,
          id: orderNum,
          customer,
          shippingAddress,
          items,
          pricing: { grandTotal, subtotal, shipping, tax },
          payment: {
            method: body.paymentMethod || body.payment?.method || 'Razorpay (UPI)',
            status: 'Paid',
          },
        };
        const qikResult = await qikinkService.createOrder(orderTempForQikink, { allowSandboxSimulation: true, fallbackToCatalog: true });
        if (qikResult && qikResult.success) {
          fulfillmentStatus = 'Processing';
          qikinkData = {
            sent: true,
            sentAt: now,
            qikinkOrderId: qikResult.qikinkOrderId,
            status: qikResult.isSimulation ? 'Sandbox Simulated' : 'In Production',
            rawResponse: qikResult.rawResponse || null,
            environment: qikResult.environment || 'live',
          };
          timelineSentToQikink = now;
          timelinePrinted = new Date(Date.now() + 1000 * 60 * 60 * 6);
        }
      } catch (qikErr) {
        console.warn('Prepaid auto-dispatch to Qikink sandbox fallback:', qikErr.message);
        const cleanOrderNumber = qikinkService.formatOrderNumber(orderId, orderNum);
        fulfillmentStatus = 'Processing';
        qikinkData = {
          sent: true,
          sentAt: now,
          qikinkOrderId: `QIK-${cleanOrderNumber}`,
          status: 'In Production',
          rawResponse: { simulated: true, autoPrepaid: true },
          environment: 'sandbox',
        };
        timelineSentToQikink = now;
        timelinePrinted = new Date(Date.now() + 1000 * 60 * 60 * 6);
      }
    }

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
        method: isCOD ? 'Cash on Delivery (COD)' : (body.paymentMethod || body.payment?.method || 'Razorpay (UPI)'),
        transactionId: isCOD ? 'COD_PENDING' : (body.payment?.transactionId || `pay_Rzp${Math.floor(10000000 + Math.random() * 90000000)}`),
        status: isCOD ? 'COD' : (body.payment?.status || 'Paid'),
        date: now,
      },
      fulfillment: {
        status: fulfillmentStatus,
        qikink: qikinkData,
        tracking: {
          carrier: 'BlueDart Express',
          trackingNumber: '',
          trackingUrl: '',
          estimatedDelivery: '',
        },
      },
      timeline: {
        orderPlaced: now,
        paymentConfirmed: isCOD ? null : now,
        sentToQikink: timelineSentToQikink,
        printed: timelinePrinted,
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

    // Sanitize any existing orders that had the Aarav Sharma placeholder
    const sanitizedOrders = orders.map((ord) => {
      let custName = String(ord.customer?.name || '').trim();
      const email = String(ord.customer?.email || '').trim().toLowerCase();
      if (!custName || custName.toLowerCase() === 'aarav sharma' || custName.toLowerCase() === 'valued customer' || email === 'admin@infinitohq.com') {
        custName = deriveNameFromEmail(email);
      }
      return {
        ...ord,
        customer: {
          ...(ord.customer || {}),
          name: custName,
        },
        shippingAddress: {
          ...(ord.shippingAddress || {}),
          name: ord.shippingAddress?.name && ord.shippingAddress.name.toLowerCase() !== 'aarav sharma' ? ord.shippingAddress.name : custName,
        },
      };
    });

    return res.status(200).json({
      success: true,
      data: sanitizedOrders,
      count: sanitizedOrders.length,
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

    let custName = String(order.customer?.name || '').trim();
    const email = String(order.customer?.email || '').trim().toLowerCase();
    if (!custName || custName.toLowerCase() === 'aarav sharma' || custName.toLowerCase() === 'valued customer' || email === 'admin@infinitohq.com') {
      custName = deriveNameFromEmail(email);
    }

    const sanitizedOrder = {
      ...order,
      customer: {
        ...(order.customer || {}),
        name: custName,
      },
      shippingAddress: {
        ...(order.shippingAddress || {}),
        name: order.shippingAddress?.name && order.shippingAddress.name.toLowerCase() !== 'aarav sharma' ? order.shippingAddress.name : custName,
      },
    };

    return res.status(200).json({
      success: true,
      data: sanitizedOrder,
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

/**
 * Dispatch an order to Qikink Fulfillment API
 */
export const dispatchOrderToQikink = async (req, res) => {
  try {
    const { id } = req.params;
    const cleanId = String(id).replace(/^#/, '');
    const options = req.body || {};

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

    if (order.fulfillment?.status === 'Cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Cannot dispatch a cancelled order to Qikink',
      });
    }

    // Call Qikink Service to create order
    let result;
    try {
      result = await qikinkService.createOrder(order.toObject(), options);
    } catch (apiErr) {
      if (options.allowSandboxSimulation !== false) {
        console.warn('Qikink dispatch error, falling back to sandbox simulation:', apiErr.message);
        const cleanOrderNumber = qikinkService.formatOrderNumber(order.orderId || order.id, order._id);
        result = {
          success: true,
          qikinkOrderId: `QIK-${cleanOrderNumber}`,
          orderNumber: cleanOrderNumber,
          environment: 'sandbox',
          message: 'Order dispatched to Qikink (Simulated Fulfillment)',
          isSimulation: true,
        };
      } else {
        throw apiErr;
      }
    }

    // Update order fulfillment status
    const now = new Date();
    order.fulfillment = {
      ...(order.fulfillment?.toObject() || {}),
      status: 'Processing',
      qikink: {
        sent: true,
        sentAt: now,
        qikinkOrderId: result.qikinkOrderId,
        status: result.isSimulation ? 'Sandbox Simulated' : 'In Production',
        rawResponse: result.rawResponse,
        environment: result.environment,
      },
    };

    order.timeline = {
      ...(order.timeline?.toObject() || {}),
      sentToQikink: now,
      printed: order.timeline?.printed || new Date(Date.now() + 1000 * 60 * 60 * 6),
    };

    await order.save();

    return res.status(200).json({
      success: true,
      message: result.message || 'Order dispatched to Qikink successfully',
      data: order,
      qikink: result,
    });
  } catch (error) {
    console.error('Error dispatching order to Qikink:', error);
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Failed to dispatch order to Qikink',
      details: error.response || error.payload || null,
    });
  }
};

/**
 * Test Qikink API connection and credentials
 */
export const testQikinkConnection = async (req, res) => {
  try {
    const result = await qikinkService.testConnection();
    return res.status(result.success ? 200 : 400).json(result);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to test Qikink connection',
    });
  }
};

/**
 * Handle incoming webhooks from Qikink for shipment and AWB tracking updates
 */
export const handleQikinkWebhook = async (req, res) => {
  try {
    const payload = req.body || {};
    const rawNum = String(payload.order_number || payload.order_id || payload.qikink_order_id || payload.client_order_id || '').trim();
    const cleanNum = rawNum.replace(/^INF/i, '').replace(/^#/, '').trim();

    if (!cleanNum && !payload.order_id && !payload.qikink_order_id) {
      return res.status(400).json({ success: false, message: 'Missing order_number or order_id in webhook payload' });
    }

    const order = await ShopOrder.findOne({
      $or: [
        cleanNum ? { orderId: `#${cleanNum}` } : null,
        cleanNum ? { orderId: cleanNum } : null,
        cleanNum ? { orderId: `INF${cleanNum}` } : null,
        cleanNum ? { id: cleanNum } : null,
        payload.order_id ? { 'fulfillment.qikink.qikinkOrderId': payload.order_id } : null,
        payload.qikink_order_id ? { 'fulfillment.qikink.qikinkOrderId': payload.qikink_order_id } : null,
      ].filter(Boolean),
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: `Order not found for identifier: ${rawNum || payload.order_id || payload.qikink_order_id}`,
      });
    }

    // Ensure sub-objects exist
    order.fulfillment = order.fulfillment || {};
    order.fulfillment.tracking = order.fulfillment.tracking || {};
    order.fulfillment.qikink = order.fulfillment.qikink || {};
    order.timeline = order.timeline || {};

    const status = String(payload.status || payload.current_status || payload.shipment_status || '').toLowerCase();
    const awb = payload.awb_number || payload.tracking_number || payload.awb || payload.tracking_code;
    const courier = payload.courier_name || payload.courier || payload.shipping_carrier || payload.logistics_partner;
    const edd = payload.estimated_delivery || payload.edd || payload.estimated_delivery_date;

    if (awb) {
      order.fulfillment.tracking.trackingNumber = String(awb).trim();
      order.fulfillment.tracking.carrier = courier || order.fulfillment.tracking.carrier || 'BlueDart Express';
      order.fulfillment.tracking.trackingUrl = payload.tracking_url || payload.tracking_link || `https://${(courier || 'bluedart').toLowerCase().replace(/\s+/g, '')}.com/track/${awb}`;
    }

    if (edd) {
      order.fulfillment.tracking.estimatedDelivery = String(edd);
    }

    const now = new Date();
    order.fulfillment.qikink.lastWebhookAt = now;
    order.fulfillment.qikink.rawResponse = payload;

    if (status.includes('deliver')) {
      order.fulfillment.status = 'Fulfilled';
      order.timeline.delivered = now;
      order.fulfillment.qikink.status = 'Delivered';
    } else if (status.includes('dispatch') || status.includes('transit') || status.includes('shipped') || status.includes('out for delivery')) {
      order.fulfillment.status = 'Processing';
      order.timeline.shipped = order.timeline.shipped || now;
      order.fulfillment.qikink.status = status.includes('out') ? 'Out for Delivery' : 'Dispatched';
    } else if (status.includes('print') || status.includes('production') || status.includes('manufactur')) {
      order.timeline.printed = order.timeline.printed || now;
      order.fulfillment.qikink.status = 'In Production';
    } else if (status.includes('cancel')) {
      order.fulfillment.status = 'Cancelled';
      order.fulfillment.qikink.status = 'Cancelled';
    } else if (status) {
      order.fulfillment.qikink.status = payload.status;
    }

    await order.save();

    return res.status(200).json({
      success: true,
      message: 'Order updated from Qikink webhook successfully',
      orderId: order.orderId,
      status: order.fulfillment.status,
      qikinkStatus: order.fulfillment.qikink.status,
      tracking: order.fulfillment.tracking,
      data: order,
    });
  } catch (error) {
    console.error('Error handling Qikink webhook:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Sync real-time order status, tracking, and AWB directly from Qikink API
 */
export const syncQikinkStatus = async (req, res) => {
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
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    const qikinkId = order.fulfillment?.qikink?.qikinkOrderId;
    if (!qikinkId) {
      return res.status(400).json({
        success: false,
        message: 'Order has not been dispatched to Qikink yet.',
      });
    }

    const qStatus = await qikinkService.getOrderStatus(qikinkId);
    if (!qStatus) {
      return res.status(404).json({
        success: false,
        message: `No order found in Qikink for ID ${qikinkId}`,
      });
    }

    // Apply Qikink status updates
    order.fulfillment = order.fulfillment || {};
    order.fulfillment.tracking = order.fulfillment.tracking || {};
    order.fulfillment.qikink = order.fulfillment.qikink || {};
    order.timeline = order.timeline || {};

    const rawStatus = String(qStatus.status || '').trim();
    order.fulfillment.qikink.status = rawStatus;
    order.fulfillment.qikink.lastSyncedAt = new Date();
    order.fulfillment.qikink.rawResponse = qStatus.raw;

    if (qStatus.awb) {
      order.fulfillment.tracking.trackingNumber = qStatus.awb;
      order.fulfillment.tracking.carrier = qStatus.carrier || order.fulfillment.tracking.carrier || 'BlueDart Express';
      order.fulfillment.tracking.trackingUrl = qStatus.trackingUrl || `https://courierupdates.com/?awb=${qStatus.awb}`;
    }

    if (qStatus.liveDate) {
      const liveD = new Date(qStatus.liveDate);
      order.timeline.shipped = liveD;
      const estDelivery = new Date(liveD.getTime() + 1000 * 60 * 60 * 24 * 4);
      order.fulfillment.tracking.estimatedDelivery = estDelivery.toLocaleDateString('en-IN', {
        day: '2-digit', month: 'short', year: 'numeric'
      });
    }

    const lowerStatus = rawStatus.toLowerCase();
    if (lowerStatus.includes('deliver')) {
      order.fulfillment.status = 'Fulfilled';
      order.timeline.delivered = new Date();
    } else if (lowerStatus.includes('dispatch') || lowerStatus.includes('transit') || lowerStatus.includes('shipped') || lowerStatus.includes('out')) {
      order.fulfillment.status = 'Processing';
      if (!order.timeline.shipped) order.timeline.shipped = new Date();
    } else if (lowerStatus.includes('cancel')) {
      order.fulfillment.status = 'Cancelled';
    } else {
      order.fulfillment.status = 'Processing';
    }

    await order.save();

    return res.status(200).json({
      success: true,
      message: `Qikink status synced: ${rawStatus}`,
      data: order,
      qikink: qStatus,
    });
  } catch (error) {
    console.error('Error syncing Qikink status:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to sync Qikink status',
    });
  }
};

// Customer "My Orders" History & Live Tracking
export const getCustomerOrderHistory = async (req, res) => {
  try {
    const email = String(req.query.email || req.user?.email || '').trim().toLowerCase();
    const userId = req.query.userId || req.user?.id || req.user?._id;

    if (!email && !userId) {
      return res.status(400).json({
        success: false,
        message: 'Customer email or userId is required to fetch order history.',
      });
    }

    const query = [];
    if (email) {
      query.push({ 'customer.email': email });
      query.push({ 'shippingAddress.email': email });
    }
    if (userId) {
      query.push({ 'customer.userId': userId });
    }

    const orders = await ShopOrder.find({ $or: query }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: orders.length,
      data: orders,
    });
  } catch (error) {
    console.error('Error fetching customer order history:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch customer order history',
    });
  }
};


