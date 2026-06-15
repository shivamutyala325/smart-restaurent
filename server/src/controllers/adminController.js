const Session = require('../models/Session');

exports.getDashboard = async (req, res) => {
	const activeSessions = await Session.find({ isActive: true });
	const activeOrders = await Session.aggregate([
		{ $unwind: '$orders' },
		{ $match: { 'orders.status': { $in: ['Pending', 'In-Progress', 'Ready'] } } },
		{ $project: { _id: 0, sessionId: '$_id', tableNumber: '$tableNumber', order: '$orders' } }
	]);
	res.json({ activeTables: activeSessions.length, activeSessions, activeOrders });
};

exports.updateOrderStatus = async (req, res) => {
	const { sessionId, orderId } = req.params;
	const { status } = req.body;
	const allowed = ['Pending', 'In-Progress', 'Ready', 'Served'];
	if (!allowed.includes(status)) return res.status(400).json({ message: `Status must be one of: ${allowed.join(', ')}` });

	const session = await Session.findById(sessionId);
	if (!session) return res.status(404).json({ message: 'Session not found' });
	const order = session.orders.id(orderId);
	if (!order) return res.status(404).json({ message: 'Order not found' });
	if (['Paid', 'Cancelled'].includes(order.status)) {
		return res.status(400).json({ message: 'Cannot change status of a paid or cancelled order' });
	}
	order.status = status;
	await session.save();
	res.json(session);
};

exports.auth = (req, res, next) => {
	const rawName = req.headers['x-admin-name'] ?? req.body?.name ?? '';
	const rawPassword = req.headers['x-admin-password'] ?? req.body?.password ?? '';
	const name = String(rawName).trim();
	const password = String(rawPassword).trim();

	const expectedName = String(process.env.ADMIN_NAME || 'admin').trim();
	const expectedPassword = String(process.env.ADMIN_PASSWORD || 'admin123').trim();

	if (name === expectedName && password === expectedPassword) return next();
	return res.status(401).json({ message: 'Unauthorized' });
};
