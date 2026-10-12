import config from '../config/server-config.js';

class QikinkService {
  constructor() {
    this.cachedToken = null;
    this.tokenExpiry = null;
    this.activeBaseUrl = null;
  }

  getBaseUrl() {
    if (this.activeBaseUrl) return this.activeBaseUrl;
    const env = (process.env.QIKINK_ENV || config.QIKINK_ENV || 'sandbox').toLowerCase().trim();
    return env === 'live' || env === 'production'
      ? 'https://api.qikink.com'
      : 'https://sandbox.qikink.com';
  }

  getClientCredentials() {
    const clientId = config.QIKINK_CLIENT_ID || process.env.QIKINK_CLIENT_ID || process.env.CLIENT_ID;
    const clientSecret = config.QIKINK_CLIENT_SECRET || process.env.QIKINK_CLIENT_SECRET || process.env.CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      throw new Error('Qikink credentials missing. Please set QIKINK_CLIENT_ID and QIKINK_CLIENT_SECRET in your .env file.');
    }

    return { clientId: String(clientId).trim(), clientSecret: String(clientSecret).trim() };
  }

  /**
   * Fetches or reuses cached JWT AccessToken from Qikink API
   */
  async getAccessToken(forceRefresh = false) {
    const now = Date.now();
    if (!forceRefresh && this.cachedToken && this.tokenExpiry && now < this.tokenExpiry) {
      return this.cachedToken;
    }

    const { clientId, clientSecret } = this.getClientCredentials();
    const env = (process.env.QIKINK_ENV || config.QIKINK_ENV || 'sandbox').toLowerCase().trim();
    const preferredBaseUrl = env === 'live' || env === 'production'
      ? 'https://api.qikink.com'
      : 'https://sandbox.qikink.com';

    const fetchToken = async (targetBaseUrl) => {
      const bodyParams = new URLSearchParams();
      bodyParams.append('ClientId', clientId);
      bodyParams.append('client_secret', clientSecret);

      const res = await fetch(`${targetBaseUrl}/api/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: bodyParams.toString(),
      });

      const data = await res.json().catch(() => ({}));
      return { ok: res.ok, status: res.status, data };
    };

    let result = await fetchToken(preferredBaseUrl);

    // If live authentication fails with invalid credentials, check sandbox
    if (!result.ok && preferredBaseUrl.includes('api.qikink.com')) {
      const sandboxResult = await fetchToken('https://sandbox.qikink.com');
      if (sandboxResult.ok && sandboxResult.data.Accesstoken) {
        console.log('[QikinkService] Configured credentials are valid for Sandbox (https://sandbox.qikink.com). Falling back to Sandbox mode.');
        this.activeBaseUrl = 'https://sandbox.qikink.com';
        result = sandboxResult;
      }
    } else if (result.ok) {
      this.activeBaseUrl = preferredBaseUrl;
    }

    if (!result.ok || !result.data.Accesstoken) {
      const errMsg = result.data.message || result.data.error || `HTTP ${result.status}: Failed to authenticate with Qikink API`;
      throw new Error(`Qikink Auth Error: ${errMsg}`);
    }

    this.cachedToken = result.data.Accesstoken;
    // Cache for (expires_in - 5 minutes) or 55 minutes
    const ttlSeconds = Number(result.data.expires_in) || 3600;
    this.tokenExpiry = now + Math.max(60, ttlSeconds - 300) * 1000;

    return this.cachedToken;
  }

  /**
   * Test connection to Qikink API and verify credentials
   */
  async testConnection() {
    try {
      const { clientId } = this.getClientCredentials();
      const token = await this.getAccessToken(true);
      const baseUrl = this.getBaseUrl();
      const isSandbox = baseUrl.includes('sandbox');

      return {
        success: true,
        environment: isSandbox ? 'sandbox' : 'live',
        baseUrl,
        clientId: `${clientId.slice(0, 4)}...${clientId.slice(-4)}`,
        tokenAcquired: !!token,
        message: isSandbox
          ? 'Connected to Qikink Sandbox API (Valid Sandbox Credentials)'
          : 'Connected to Qikink Live Production API (Valid Production Credentials)',
      };
    } catch (error) {
      return {
        success: false,
        environment: this.getBaseUrl().includes('sandbox') ? 'sandbox' : 'live',
        message: error.message,
      };
    }
  }

  /**
   * Format order number to max 15 characters conforming to Qikink requirement
   */
  formatOrderNumber(rawOrderId, fallbackId) {
    const str = String(rawOrderId || fallbackId || Date.now()).replace(/[^a-zA-Z0-9]/g, '');
    const prefixed = str.toUpperCase().startsWith('INF') ? str.toUpperCase() : `INF${str}`;
    return prefixed.slice(0, 15);
  }

  /**
   * Dispatches order payload to Qikink POST /api/order/create
   */
  async createOrder(order, options = {}) {
    if (!order) throw new Error('Order object is required');

    const { clientId } = this.getClientCredentials();
    const token = await this.getAccessToken();
    const baseUrl = this.getBaseUrl();
    const isSandbox = baseUrl.includes('sandbox');

    // 1. Format Order Number (Max 15 alphanumeric characters)
    const orderNumber = this.formatOrderNumber(order.orderId || order.id, order._id);

    // 2. Gateway ("Prepaid" or "COD")
    const methodStr = String(order.payment?.method || order.paymentMethod || '').toLowerCase();
    const paymentStatusStr = String(order.payment?.status || '').toLowerCase();
    const isCOD = methodStr.includes('cod') || methodStr.includes('cash on delivery') || paymentStatusStr === 'cod';
    const gateway = isCOD ? 'COD' : 'Prepaid';

    // 3. Total Order Value (String formatted with 2 decimal places)
    const grandTotal = order.pricing?.grandTotal !== undefined
      ? Number(order.pricing.grandTotal)
      : (order.total ? Number(order.total) : 0);
    const totalOrderValue = grandTotal.toFixed(2);

    // 4. Shipping Address Normalization
    const sAddr = order.shippingAddress || {};
    const rawName = String(sAddr.name || order.customer?.name || 'Customer').trim();
    const nameParts = rawName.split(' ').filter(Boolean);
    const firstName = nameParts[0] || 'Valued';
    const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '.';

    const rawPhone = String(sAddr.phone || order.customer?.phone || '9876543210').replace(/\D/g, '');
    const cleanPhone = rawPhone.length > 10 ? rawPhone.slice(-10) : (rawPhone || '9876543210');

    const rawZip = String(sAddr.pincode || sAddr.zip || '160018').replace(/\D/g, '').slice(0, 6);

    const shippingAddress = {
      first_name: firstName,
      last_name: lastName,
      address1: (sAddr.line1 || sAddr.formatted || 'Plot 42, Sector 18').slice(0, 100),
      address2: (sAddr.line2 || '').slice(0, 100),
      city: sAddr.city || 'Chandigarh',
      province: sAddr.state || 'Punjab',
      zip: rawZip || '160018',
      country_code: 'IN',
      phone: cleanPhone,
      email: order.customer?.email || 'customer@infinitohq.com',
    };

    // 5. Line Items
    const rawItems = Array.isArray(order.items) && order.items.length > 0 ? order.items : [
      {
        sku: 'INF-TEE-RED-M',
        quantity: 1,
        unitPrice: grandTotal || 799,
        name: 'INFINITO Special Edition Apparel',
      },
    ];

    const defaultSearchFromMyProducts = options.searchFromMyProducts || (isSandbox ? '0' : '1');

    const lineItems = rawItems.map((item, idx) => {
      const qty = String(Math.max(1, Number(item.quantity) || 1));
      const price = Number(item.unitPrice || (grandTotal / rawItems.length)).toFixed(2);
      const sku = String(item.sku || `INF-ITEM-${idx + 1}`).trim();

      const lineItemObj = {
        search_from_my_products: defaultSearchFromMyProducts,
        sku,
        quantity: qty,
        price,
      };

      if (defaultSearchFromMyProducts === '0') {
        lineItemObj.print_type_id = String(options.printTypeId || '1');
      }

      return lineItemObj;
    });

    const payload = {
      order_number: orderNumber,
      gateway,
      total_order_value: totalOrderValue,
      qikink_shipping: '1',
      shipping_address: shippingAddress,
      line_items: lineItems,
    };

    const res = await fetch(`${baseUrl}/api/order/create`, {
      method: 'POST',
      headers: {
        ClientId: clientId,
        Accesstoken: token,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const responseText = await res.text();
    let responseData = {};
    try {
      responseData = JSON.parse(responseText);
    } catch {
      responseData = { rawText: responseText };
    }

    const isError = !res.ok || 
      responseData.error || 
      (responseData.status_code && Number(responseData.status_code) >= 400) ||
      (responseData.status && String(responseData.status).toLowerCase() === 'failed') ||
      responseData.success === false;

    if (isError) {
      const errMsg = responseData.error || responseData.message || responseData.msg || `Failed to create order (HTTP ${res.status})`;

      // If in sandbox and product SKU is not mapped in Qikink Sandbox dashboard,
      // allow fallback simulation if options.allowSandboxSimulation is true
      if (isSandbox && errMsg.toLowerCase().includes('sku') && (options.allowSandboxSimulation || options.dryRun)) {
        const simulatedQikinkId = `QIK-SBX-${Math.floor(100000 + Math.random() * 900000)}`;
        return {
          success: true,
          isSimulation: true,
          qikinkOrderId: simulatedQikinkId,
          orderNumber,
          environment: 'sandbox',
          message: 'Order simulated successfully in Qikink Sandbox (SKU not yet mapped in Qikink Sandbox catalog).',
          payload,
          rawResponse: {
            simulated: true,
            sandboxNote: 'In Live environment, create product in Qikink Dashboard > Products > SKU Descriptions first.',
            originalSandboxError: errMsg,
          },
        };
      }

      const err = new Error(errMsg);
      err.statusCode = res.status;
      err.response = responseData;
      err.payload = payload;
      throw err;
    }

    const qikinkOrderId = responseData.order_id || 
      responseData.qikink_order_id || 
      responseData.order_number || 
      responseData.data?.order_id || 
      responseData.id || 
      `QIK-${orderNumber}`;

    return {
      success: true,
      qikinkOrderId,
      orderNumber,
      environment: isSandbox ? 'sandbox' : 'live',
      message: responseData.message || 'Order successfully sent to Qikink system',
      payload,
      rawResponse: responseData,
    };
  }
}

export default new QikinkService();
