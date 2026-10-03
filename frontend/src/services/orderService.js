// Service for managing Shop orders, delivery addresses, and invoice generation

const ORDERS_KEY = "infinito_orders";
const ADDRESS_KEY = "infinito_delivery_address";
const CURRENT_ORDER_KEY = "infinito_current_order";

export const DEFAULT_ADDRESS = {
  line1: "Sector 18, House No. 42, Green Park Extension, Sector 18",
  city: "Chandigarh",
  state: "Punjab",
  pincode: "160018",
  country: "India",
  formatted: "Sector 18, House No. 42, Green Park Extension, Sector 18\nChandigarh, Punjab\n160018, India",
};

export const getDeliveryAddress = () => {
  try {
    const raw = localStorage.getItem(ADDRESS_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return DEFAULT_ADDRESS;
};

export const saveDeliveryAddress = (addr) => {
  try {
    const formatted = `${addr.line1 || ''}\n${addr.city || ''}, ${addr.state || ''}\n${addr.pincode || ''}, ${addr.country || 'India'}`.trim();
    const toSave = { ...addr, formatted };
    localStorage.setItem(ADDRESS_KEY, JSON.stringify(toSave));
    return toSave;
  } catch (e) {
    console.error("Failed to save address:", e);
    return addr;
  }
};

export const formatOrderDate = (baseDate = new Date(), daysToAdd = 0) => {
  const d = new Date(baseDate);
  d.setDate(d.getDate() + daysToAdd);
  const day = String(d.getDate()).padStart(2, "0");
  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sept", "Oct", "Nov", "Dec",
  ];
  const month = months[d.getMonth()];
  const year = d.getFullYear();
  return `${day} ${month}, ${year}`;
};

export const createOrder = ({ items = [], address = null, paymentMethod = "UPI" }) => {
  const orderNumber = Math.floor(1000 + Math.random() * 9000);
  const orderId = `#${orderNumber}`;
  const now = new Date();

  // Dynamic delivery milestone dates
  const placedDate = formatOrderDate(now, 0);
  const dispatchedDate = formatOrderDate(now, 2);
  const outForDeliveryDate = formatOrderDate(now, 4);
  const deliveredDate = formatOrderDate(now, 6);

  const subtotal = items.reduce((sum, item) => {
    const p = Number(item.product?.price || 0);
    const q = Number(item.quantity || 1);
    return sum + p * q;
  }, 0);

  const total = items.reduce((sum, item) => {
    const p = Number(item.product?.price || 0);
    const q = Number(item.quantity || 1);
    return sum + p * q * 1.18;
  }, 0);

  const finalTotal = Number(total.toFixed(2));
  const cancellationFee = 199;
  const refundAmount = Number(Math.max(0, finalTotal - cancellationFee).toFixed(2));

  const newOrder = {
    orderId,
    id: orderNumber.toString(),
    createdAt: now.toISOString(),
    items,
    address: address || getDeliveryAddress(),
    paymentMethod,
    subtotal,
    taxPercent: 18,
    total: finalTotal,
    cancellationFee,
    refundAmount,
    status: "Order Placed",
    timeline: {
      placedDate,
      dispatchedDate,
      outForDeliveryDate,
      deliveredDate,
    },
  };

  try {
    const raw = localStorage.getItem(ORDERS_KEY);
    const list = raw ? JSON.parse(raw) : [];
    list.unshift(newOrder);
    localStorage.setItem(ORDERS_KEY, JSON.stringify(list));
    localStorage.setItem(CURRENT_ORDER_KEY, JSON.stringify(newOrder));
  } catch (e) {
    console.error("Failed to store order:", e);
  }

  return newOrder;
};

export const getOrderById = (idOrHash) => {
  if (!idOrHash) {
    try {
      const cur = localStorage.getItem(CURRENT_ORDER_KEY);
      if (cur) return JSON.parse(cur);
    } catch {}
  }

  const clean = String(idOrHash || "").replace(/^#/, "").trim();
  try {
    const raw = localStorage.getItem(ORDERS_KEY);
    const list = raw ? JSON.parse(raw) : [];
    const found = list.find(
      (o) => String(o.id) === clean || String(o.orderId) === `#${clean}`
    );
    if (found) return found;

    const cur = localStorage.getItem(CURRENT_ORDER_KEY);
    if (cur) return JSON.parse(cur);
  } catch {}

  // Fallback demo order matching SS2-SS4 if none exists
  return {
    orderId: `#4721`,
    id: "4721",
    createdAt: new Date().toISOString(),
    status: "Order Placed",
    items: [
      {
        productId: "demo-tshirt-1",
        size: "M",
        quantity: 1,
        product: {
          name: "INFINITO",
          title: "INFINITO Premium Tshirt",
          price: 1299,
          mrp: 2599,
          rating: 4.5,
          image: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&auto=format&fit=crop&q=80",
          description: "The Special Edition Crimson Red T-Shirt is designed to capture the energy, passion, and spirit of INFINITO. Featuring a deep crimson red color with a clean, statement-driven d...",
        },
      },
      {
        productId: "demo-tshirt-2",
        size: "M",
        quantity: 1,
        product: {
          name: "INFINITO",
          title: "INFINITO Premium Tshirt",
          price: 1299,
          mrp: 2599,
          rating: 4.5,
          image: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&auto=format&fit=crop&q=80",
          description: "The Special Edition Crimson Red T-Shirt is designed to capture the energy, passion, and spirit of INFINITO. Featuring a deep crimson red color with a clean, statement-driven d...",
        },
      },
    ],
    address: DEFAULT_ADDRESS,
    paymentMethod: "UPI",
    total: 3065.64,
    cancellationFee: 199,
    refundAmount: 2866.64,
    timeline: {
      placedDate: formatOrderDate(new Date(), 0),
      dispatchedDate: formatOrderDate(new Date(), 2),
      outForDeliveryDate: formatOrderDate(new Date(), 4),
      deliveredDate: formatOrderDate(new Date(), 6),
    },
  };
};

export const cancelOrder = (orderId, reasonData) => {
  const clean = String(orderId || "").replace(/^#/, "").trim();
  try {
    const raw = localStorage.getItem(ORDERS_KEY);
    const list = raw ? JSON.parse(raw) : [];
    const index = list.findIndex(
      (o) => String(o.id) === clean || String(o.orderId) === `#${clean}`
    );

    let updatedOrder = null;
    if (index !== -1) {
      list[index].status = "Cancelled";
      list[index].cancelledAt = new Date().toISOString();
      list[index].cancellationReason = reasonData;
      updatedOrder = list[index];
      localStorage.setItem(ORDERS_KEY, JSON.stringify(list));
    }

    const cur = localStorage.getItem(CURRENT_ORDER_KEY);
    if (cur) {
      const curOrder = JSON.parse(cur);
      if (String(curOrder.id) === clean || String(curOrder.orderId) === `#${clean}` || !orderId) {
        curOrder.status = "Cancelled";
        curOrder.cancelledAt = new Date().toISOString();
        curOrder.cancellationReason = reasonData;
        updatedOrder = curOrder;
        localStorage.setItem(CURRENT_ORDER_KEY, JSON.stringify(curOrder));
      }
    }

    return updatedOrder || { orderId: `#${clean}`, status: "Cancelled", ...reasonData };
  } catch (e) {
    console.error("Failed to cancel order:", e);
    return null;
  }
};

// Generates and prints a clean, downloadable PDF invoice
export const downloadInvoicePdf = (order) => {
  const ord = order || getOrderById();
  const printWindow = window.open("", "_blank", "width=800,height=900");
  if (!printWindow) {
    alert("Please allow popups to download the invoice PDF.");
    return;
  }

  const itemsHtml = (ord.items || [])
    .map((item, idx) => {
      const p = Number(item.product?.price || 0);
      const q = Number(item.quantity || 1);
      const rowTotal = (p * q * 1.18).toFixed(2);
      const title = item.product?.title || item.product?.name || "INFINITO Premium Tshirt";
      return `
        <tr style="border-bottom: 1px solid #e5e7eb;">
          <td style="padding: 12px; font-weight: 600;">${title} (${item.size || 'M'})</td>
          <td style="padding: 12px; text-align: center;">${q}</td>
          <td style="padding: 12px; text-align: right;">₹${p}</td>
          <td style="padding: 12px; text-align: right;">18%</td>
          <td style="padding: 12px; text-align: right; font-weight: 700;">₹${rowTotal}</td>
        </tr>
      `;
    })
    .join("");

  const addrHtml = ord.address?.formatted
    ? ord.address.formatted.replace(/\n/g, "<br/>")
    : "Sector 18, House No. 42, Green Park Extension, Sector 18<br/>Chandigarh, Punjab<br/>160018, India";

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Invoice ${ord.orderId}</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; padding: 40px; color: #111; max-width: 800px; margin: 0 auto; }
          .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #DD1215; padding-bottom: 20px; margin-bottom: 30px; }
          .logo { font-size: 28px; font-weight: 900; letter-spacing: 2px; color: #DD1215; text-transform: uppercase; }
          .meta { text-align: right; font-size: 13px; color: #555; line-height: 1.6; }
          .section-title { font-size: 14px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 10px; color: #000; }
          .address-box { border: 1px solid #ddd; padding: 15px; margin-bottom: 30px; font-size: 14px; line-height: 1.6; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 30px; font-size: 14px; }
          th { background: #f9fafb; border-bottom: 2px solid #e5e7eb; padding: 12px; text-align: left; font-weight: 700; }
          .total-row td { border-top: 2px solid #111; font-weight: 900; font-size: 16px; padding: 16px 12px; }
          .footer { text-align: center; margin-top: 50px; font-size: 12px; color: #888; border-top: 1px solid #eee; padding-top: 20px; }
          @media print {
            body { padding: 0; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <div class="logo">INFINITO</div>
            <div style="font-size: 11px; text-transform: uppercase; color: #666; letter-spacing: 1px;">Where Imagination Breaks Boundaries</div>
          </div>
          <div class="meta">
            <div><strong>TAX INVOICE</strong></div>
            <div>Order: <strong>${ord.orderId}</strong></div>
            <div>Date: ${ord.timeline?.placedDate || formatOrderDate(new Date(), 0)}</div>
            <div>Status: ${ord.status}</div>
          </div>
        </div>

        <div class="section-title">Deliver At This Address</div>
        <div class="address-box">
          ${addrHtml}
        </div>

        <div class="section-title">Invoice Details</div>
        <table>
          <thead>
            <tr>
              <th style="width: 45%;">Item</th>
              <th style="text-align: center;">Qty</th>
              <th style="text-align: right;">Price</th>
              <th style="text-align: right;">Tax</th>
              <th style="text-align: right;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
            <tr class="total-row">
              <td colspan="4" style="text-transform: uppercase;">TOTAL</td>
              <td style="text-align: right; color: #DD1215;">₹${Number(ord.total).toFixed(2)}</td>
            </tr>
          </tbody>
        </table>

        <div class="footer">
          <p>Thank you for ordering with INFINITO. All merchandise is officially verified and licensed.</p>
          <p>Questions? Contact support@infinitohq.com | https://infinitohq.com</p>
        </div>

        <script>
          window.onload = function() {
            window.print();
          };
        </script>
      </body>
    </html>
  `;

  printWindow.document.open();
  printWindow.document.write(html);
  printWindow.document.close();
};
