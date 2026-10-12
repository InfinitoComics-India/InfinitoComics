import express from 'express';
const router = express.Router();
import * as orderController from '../controller/order-controller.js';

// Order creation (Public for customers checking out on frontend or store)
router.post('/', orderController.createOrder);

// List all orders (Admin / Public)
router.get('/', orderController.getAllOrders);

// Test Qikink API Connection and credentials
router.get('/qikink/test-connection', orderController.testQikinkConnection);

// Qikink Webhook for automatic delivery and tracking status updates
router.post('/qikink-webhook', orderController.handleQikinkWebhook);

// Single order details by orderId or MongoDB _id
router.get('/:id', orderController.getOrderById);

// Update order fulfillment, status, notes, or tracking
router.patch('/:id', orderController.updateOrder);

// Dispatch order to Qikink Fulfillment API
router.post('/:id/dispatch-qikink', orderController.dispatchOrderToQikink);

// Cancel order
router.post('/:id/cancel', orderController.cancelOrder);

export default router;
