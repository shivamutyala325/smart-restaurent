const express = require('express');
const router = express.Router();
const s = require('../controllers/sessionController');
const { auth } = require('../controllers/adminController');

router.post('/login', s.loginOrCreate);
router.get('/', auth, s.listActive);
router.get('/:id', s.getSession);
router.post('/:id/cart', s.addToCart);
router.post('/:id/keep', s.moveToKeepForLater);
router.post('/:id/keep-to-cart', s.moveKeepToCart);
router.patch('/:id/cart/quantity', s.updateCartQuantity);
router.post('/:id/order', s.placeOrderFromCart);
router.patch('/:id/order/:orderId/cancel', s.cancelOrder);
router.post('/:id/pay', s.simulatePaymentAndClose);

module.exports = router;
