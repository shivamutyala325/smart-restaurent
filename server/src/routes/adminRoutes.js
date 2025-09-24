const express = require('express');
const router = express.Router();
const admin = require('../controllers/adminController');

router.post('/login', admin.auth, (req, res) => res.json({ success: true }));
router.get('/dashboard', admin.auth, admin.getDashboard);

module.exports = router;


