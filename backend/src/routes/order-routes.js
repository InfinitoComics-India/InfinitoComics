import express from 'express';
const router = express.Router();
import * as orderController from '../controller/order-controller.js';

// Order creation (Public for customers checking out on frontend or store)
router.post('/', orderController.createOrder);

// List all orders (Admin / Public)
router.get('/', orderController.getAllOrders);

// Single order details by orderId or MongoDB _id
router.get('/:id', orderController.getOrderById);

// Update order fulfillment, status, notes, or tracking
router.patch('/:id', orderController.updateOrder);

// Cancel order
router.post('/:id/cancel', orderController.cancelOrder);

export default router;
