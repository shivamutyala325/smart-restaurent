const mongoose = require('mongoose');

const CartItemSchema = new mongoose.Schema(
	{
		menuItem: { type: mongoose.Schema.Types.ObjectId, ref: 'MenuItem', required: true },
		quantity: { type: Number, required: true, min: 1 }
	},
	{ _id: false }
);

const OrderItemSchema = new mongoose.Schema(
	{
		menuItem: { type: mongoose.Schema.Types.ObjectId, ref: 'MenuItem', required: true },
		name: String,
		price: Number,
		quantity: { type: Number, required: true, min: 1 }
	},
	{ _id: false }
);

const OrderSchema = new mongoose.Schema(
	{
		items: [OrderItemSchema],
		status: {
			type: String,
			enum: ['Pending', 'In-Progress', 'Ready', 'Served', 'Paid', 'Cancelled'],
			default: 'Pending'
		},
		totalAmount: { type: Number, default: 0 },
		placedAt: { type: Date, default: Date.now }
	},
	{ timestamps: true }
);

const SessionSchema = new mongoose.Schema(
	{
		phone: { type: String, required: true },
		tableNumber: { type: String, required: true },
		isActive: { type: Boolean, default: true },
		cart: [CartItemSchema],
		keepForLater: [CartItemSchema],
		orders: [OrderSchema],
		totalAmount: { type: Number, default: 0 },
		totalItemsOrdered: { type: Number, default: 0 },
		startedAt: { type: Date, default: Date.now },
		endedAt: { type: Date }
	},
	{ timestamps: true }
);

module.exports = mongoose.model('Session', SessionSchema);


