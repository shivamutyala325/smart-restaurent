const express = require('express');
const router = express.Router();
const menu = require('../controllers/menuController');
const { auth } = require('../controllers/adminController');

router.get('/', menu.list);
router.post('/', auth, menu.create);
router.put('/:id', auth, menu.update);
router.delete('/:id', auth, menu.remove);

module.exports = router;


