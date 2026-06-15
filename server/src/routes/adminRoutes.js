const express = require('express');
const router = express.Router();
const admin = require('../controllers/adminController');

router.post('/login', admin.auth, (req, res) => res.json({ success: true }));
router.get('/dashboard', admin.auth, admin.getDashboard);
router.patch('/sessions/:sessionId/orders/:orderId/status', admin.auth, admin.updateOrderStatus);

module.exports = router;
