const Session = require('../models/Session');
const MenuItem = require('../models/MenuItem');

exports.getDashboard = async (req, res) => {
	const activeSessions = await Session.find({ isActive: true });
	const pendingOrders = await Session.aggregate([
		{ $unwind: '$orders' },
		{ $match: { 'orders.status': 'Pending' } },
		{ $project: { _id: 0, sessionId: '$_id', order: '$orders' } }
	]);
	res.json({ activeTables: activeSessions.length, activeSessions, pendingOrders });
};

exports.auth = (req, res, next) => {
	const rawName = req.headers['x-admin-name'] ?? req.body?.name ?? '';
	const rawPassword = req.headers['x-admin-password'] ?? req.body?.password ?? '';
	const name = String(rawName).trim();
	const password = String(rawPassword).trim();

	const expectedName = String(process.env.ADMIN_NAME || 'admin').trim();
	const expectedPassword = String(process.env.ADMIN_PASSWORD || 'admin123').trim();
	if (process.env.DEBUG_AUTH === 'true') {
		console.log('Admin auth attempt', {
			receivedName: name,
			receivedPassword: password,
			envName: expectedName,
			envPassword: expectedPassword
		});
	}
	if (name === expectedName && password === expectedPassword) return next();
	return res.status(401).json({ message: 'Unauthorized' });
};


