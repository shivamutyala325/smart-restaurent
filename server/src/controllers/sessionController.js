const Session = require('../models/Session');
const MenuItem = require('../models/MenuItem');

// Simulated login: accepts phone and tableNumber, creates or reuses active session
exports.loginOrCreate = async (req, res) => {
	const { phone, tableNumber } = req.body;
	if (!phone || !tableNumber) return res.status(400).json({ message: 'phone and tableNumber required' });

	let session = await Session.findOne({ phone, tableNumber, isActive: true });
	if (!session) {
		session = await Session.create({ phone, tableNumber });
	}
	res.json(session);
};

exports.getSession = async (req, res) => {
	const { id } = req.params;
	const session = await Session.findById(id).populate('cart.menuItem').populate('keepForLater.menuItem').populate('orders.items.menuItem');
	if (!session) return res.status(404).json({ message: 'Not found' });
	res.json(session);
};

exports.addToCart = async (req, res) => {
	const { id } = req.params;
	const { menuItemId, quantity } = req.body;
	const session = await Session.findById(id);
	if (!session || !session.isActive) return res.status(404).json({ message: 'Session not found/active' });

	const existing = session.cart.find((c) => c.menuItem.toString() === menuItemId);
	if (existing) existing.quantity += quantity || 1;
	else session.cart.push({ menuItem: menuItemId, quantity: quantity || 1 });

	await session.save();
	res.json(session);
};

exports.moveToKeepForLater = async (req, res) => {
	const { id } = req.params;
	const { menuItemId } = req.body;
	const session = await Session.findById(id);
	if (!session) return res.status(404).json({ message: 'Not found' });
	const idx = session.cart.findIndex((c) => c.menuItem.toString() === menuItemId);
	if (idx === -1) return res.status(400).json({ message: 'Item not in cart' });
	const [item] = session.cart.splice(idx, 1);
	session.keepForLater.push(item);
	await session.save();
	res.json(session);
};

exports.moveKeepToCart = async (req, res) => {
	const { id } = req.params;
	const { menuItemId } = req.body;
	const session = await Session.findById(id);
	if (!session) return res.status(404).json({ message: 'Not found' });
	const idx = session.keepForLater.findIndex((c) => c.menuItem.toString() === menuItemId);
	if (idx === -1) return res.status(400).json({ message: 'Item not in keepForLater' });
	const [item] = session.keepForLater.splice(idx, 1);
	const existing = session.cart.find((c) => c.menuItem.toString() === menuItemId);
	if (existing) existing.quantity += item.quantity;
	else session.cart.push({ menuItem: item.menuItem, quantity: item.quantity });
	await session.save();
	res.json(session);
};

exports.updateCartQuantity = async (req, res) => {
	const { id } = req.params;
	const { menuItemId, quantity } = req.body;
	const session = await Session.findById(id);
	if (!session) return res.status(404).json({ message: 'Not found' });
	const item = session.cart.find((c) => c.menuItem.toString() === menuItemId);
	if (!item) return res.status(404).json({ message: 'Item not in cart' });
	if (quantity <= 0) {
		session.cart = session.cart.filter((c) => c.menuItem.toString() !== menuItemId);
	} else {
		item.quantity = quantity;
	}
	await session.save();
	res.json(session);
};

exports.placeOrderFromCart = async (req, res) => {
	const { id } = req.params;
	const session = await Session.findById(id).populate('cart.menuItem');
	if (!session || session.cart.length === 0) return res.status(400).json({ message: 'Cart empty or session invalid' });

	const orderItems = session.cart.map((c) => ({
		menuItem: c.menuItem._id,
		name: c.menuItem.name,
		price: c.menuItem.price,
		quantity: c.quantity
	}));
	const total = orderItems.reduce((sum, it) => sum + it.price * it.quantity, 0);
	session.orders.push({ items: orderItems, status: 'Pending', totalAmount: total });
	session.totalAmount += total;
	session.totalItemsOrdered += orderItems.reduce((s, it) => s + it.quantity, 0);
	session.cart = [];
	await session.save();
	res.json(session);
};

exports.cancelOrder = async (req, res) => {
	const { id, orderId } = req.params;
	const session = await Session.findById(id);
	if (!session) return res.status(404).json({ message: 'Not found' });
	const order = session.orders.id(orderId);
	if (!order) return res.status(404).json({ message: 'Order not found' });
	if (['In-Progress', 'Ready', 'Served', 'Paid'].includes(order.status)) {
		return res.status(400).json({ message: 'Cannot cancel at this stage' });
	}
	order.status = 'Cancelled';
	await session.save();
	res.json(session);
};

exports.markOrderServed = async (req, res) => {
	const { id, orderId } = req.params;
	const session = await Session.findById(id);
	if (!session) return res.status(404).json({ message: 'Not found' });
	const order = session.orders.id(orderId);
	if (!order) return res.status(404).json({ message: 'Order not found' });
	// Allow marking as Served from Pending/Ready/In-Progress
	if (order.status === 'Paid' || order.status === 'Cancelled') {
		return res.status(400).json({ message: 'Cannot change served state for this order' });
	}
	order.status = 'Served';
	await session.save();
	res.json(session);
};

exports.simulatePaymentAndClose = async (req, res) => {
	const { id } = req.params;
	const session = await Session.findById(id);
	if (!session || !session.isActive) return res.status(404).json({ message: 'Not found' });
	// Mark all pending/served as Paid
	session.orders.forEach((o) => {
		if (o.status !== 'Cancelled' && o.status !== 'Paid') o.status = 'Paid';
	});
	session.isActive = false;
	session.endedAt = new Date();
	await session.save();
	res.json(session);
};

exports.listActive = async (req, res) => {
	const sessions = await Session.find({ isActive: true }).sort({ startedAt: -1 });
	res.json(sessions);
};


