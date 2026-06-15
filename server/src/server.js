const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');
const path = require('path');
const mongoose = require('mongoose');

dotenv.config({ path: path.join(__dirname, '../.env') });

const app = express();

app.use(
	cors({
		origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
		credentials: true,
		methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
		allowedHeaders: ['Content-Type', 'x-admin-name', 'x-admin-password']
	})
);
app.use(express.json());
app.use(morgan('dev'));

app.get('/api/health', (req, res) => {
	res.json({ status: 'ok' });
});

const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/smart_restaurant';
mongoose
	.connect(mongoUri)
	.then(() => console.log('MongoDB connected'))
	.catch((err) => {
		console.error('Mongo connection error', err);
		process.exit(1);
	});

app.use('/api/menu', require('./routes/menuRoutes'));
app.use('/api/sessions', require('./routes/sessionRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));

app.use((err, req, res, next) => {
	console.error(err.stack);
	res.status(err.status || 500).json({ message: err.message || 'Internal server error' });
});

const port = process.env.PORT || 4000;
app.listen(port, () => console.log(`Server running on port ${port}`));
