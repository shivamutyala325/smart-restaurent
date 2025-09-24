const express = require('express');
const router = express.Router();
const s = require('../controllers/sessionController');

router.post('/login', s.loginOrCreate);
router.get('/:id', s.getSession);
router.post('/:id/cart', s.addToCart);
router.post('/:id/keep', s.moveToKeepForLater);
router.post('/:id/keep-to-cart', s.moveKeepToCart);
router.post('/:id/order', s.placeOrderFromCart);
router.post('/:id/order/:orderId/cancel', s.cancelOrder);
router.post('/:id/order/:orderId/served', s.markOrderServed);
router.post('/:id/cart/quantity', s.updateCartQuantity);
router.post('/:id/pay', s.simulatePaymentAndClose);
router.get('/', s.listActive);

module.exports = router;


