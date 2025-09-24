const MenuItem = require('../models/MenuItem');

exports.list = async (req, res) => {
	const items = await MenuItem.find({}).sort({ createdAt: -1 });
	res.json(items);
};

exports.create = async (req, res) => {
	try {
		const { name, price, description, category, isAvailable } = req.body || {};
		if (!name || price === undefined || price === null || isNaN(Number(price)) || Number(price) < 0 || !category) {
			return res.status(400).json({ message: 'Invalid input', fields: { name, price, category } });
		}
		const item = await MenuItem.create({ name, price: Number(price), description, category, isAvailable });
		return res.status(201).json(item);
	} catch (err) {
		return res.status(400).json({ message: err.message, errors: err.errors });
	}
};

exports.update = async (req, res) => {
	const { id } = req.params;
	const item = await MenuItem.findByIdAndUpdate(id, req.body, { new: true });
	if (!item) return res.status(404).json({ message: 'Not found' });
	res.json(item);
};

exports.remove = async (req, res) => {
	const { id } = req.params;
	const result = await MenuItem.findByIdAndDelete(id);
	if (!result) return res.status(404).json({ message: 'Not found' });
	res.json({ success: true });
};


