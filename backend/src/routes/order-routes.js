import express from 'express';
const router = express.Router();
import * as orderController from '../controller/order-controller.js';
import { adminauthenticate } from '../middleware/adminauth.js';

// Order creation (Public for customers checking out on frontend or store)
router.post('/', orderController.createOrder);

// List all orders (Protected - Admin only)
router.get('/', adminauthenticate, orderController.getAllOrders);

// Test Qikink API Connection and credentials (Protected - Admin only)
router.get('/qikink/test-connection', adminauthenticate, orderController.testQikinkConnection);

// Qikink Webhook for automatic delivery and tracking status updates (with common aliases - Public for Qikink webhooks)
router.post('/qikink-webhook', orderController.handleQikinkWebhook);
router.post('/qikink/webhook', orderController.handleQikinkWebhook);
router.post('/webhook', orderController.handleQikinkWebhook);

// Customer "My Orders" History & Tracking (Public for customer accounts)
router.get('/customer/history', orderController.getCustomerOrderHistory);

// Single order details by orderId or MongoDB _id (Order tracking & confirmation)
router.get('/:id', orderController.getOrderById);

// Update order fulfillment, status, notes, or tracking (Protected - Admin only)
router.patch('/:id', adminauthenticate, orderController.updateOrder);

// Dispatch order to Qikink Fulfillment API (Protected - Admin only)
router.post('/:id/dispatch-qikink', adminauthenticate, orderController.dispatchOrderToQikink);

// Sync real-time status & tracking from Qikink API (Protected - Admin only)
router.post('/:id/sync-qikink', adminauthenticate, orderController.syncQikinkStatus);
router.get('/:id/sync-qikink', adminauthenticate, orderController.syncQikinkStatus);

// Cancel order (Protected - Admin only)
router.post('/:id/cancel', adminauthenticate, orderController.cancelOrder);

export default router;

