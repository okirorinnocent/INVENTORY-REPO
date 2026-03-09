import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

const app = express();
app.use(express.json());

const MONGODB_URI = process.env.MONGODB_URI;

// --- Database Connection ---
if (MONGODB_URI) {
    mongoose.connect(MONGODB_URI)
        .then(() => console.log('Connected to MongoDB Atlas'))
        .catch(err => console.error('Could not connect to MongoDB', err));
} else {
    console.error('MONGODB_URI is not defined in environment variables.');
}

// --- Database Models (Schemas) ---
const OrderSchema = new mongoose.Schema({
    customerName: String,
    items: Array,
    total: Number,
    status: { type: String, default: 'Pending' },
    createdAt: { type: Date, default: Date.now },
});
const Order = mongoose.models.Order || mongoose.model('Order', OrderSchema);

const SubscriberSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    subscribedAt: { type: Date, default: Date.now },
});
const Subscriber = mongoose.models.Subscriber || mongoose.model('Subscriber', SubscriberSchema);

const ProductSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: String,
    price: { type: Number, required: true },
    stock: { type: Number, required: true, default: 0 },
    category: String,
    image: String,
});
const Product = mongoose.models.Product || mongoose.model('Product', ProductSchema);

// --- API Routes ---

// 1. Receive Orders (for customers)
app.post('/api/orders', async (req, res) => {
    try {
        const newOrder = new Order(req.body);
        await newOrder.save();
        res.status(201).json({ message: 'Order received successfully!', order: newOrder });
    } catch (error) {
        res.status(500).json({ message: 'Failed to create order', error });
    }
});

// 2. View All Orders (for Admin)
app.get('/api/orders', async (req, res) => {
    // Simple security: check for a secret key in the request header
    const adminSecret = req.headers['x-admin-secret'];
    if (adminSecret !== process.env.ADMIN_SECRET) {
        return res.status(401).json({ message: 'Unauthorized: Admin access only.' });
    }

    try {
        const allOrders = await Order.find().sort({ createdAt: -1 });
        res.status(200).json(allOrders);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch orders', error });
    }
});

// 3. Allow people to subscribe
app.post('/api/subscribe', async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ message: 'Email is required.' });
        }
        // Use `findOneAndUpdate` with `upsert` to avoid creating duplicates
        const newSubscriber = await Subscriber.findOneAndUpdate(
            { email },
            { email },
            { upsert: true, new: true }
        );
        res.status(200).json({ message: 'Thank you for subscribing!', subscriber: newSubscriber });
    } catch (error) {
        res.status(500).json({ message: 'Subscription failed', error });
    }
});

// 4. Product Management (Inventory)
app.get('/api/products', async (req, res) => {
    try {
        const products = await Product.find();
        res.json(products);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch products' });
    }
});

app.post('/api/products', async (req, res) => {
    try {
        const product = await Product.create(req.body);
        res.status(201).json(product);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create product' });
    }
});

app.put('/api/products/:id', async (req, res) => {
    try {
        const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(product);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update product' });
    }
});

app.delete('/api/products/:id', async (req, res) => {
    try {
        await Product.findByIdAndDelete(req.params.id);
        res.json({ message: 'Product deleted' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete product' });
    }
});

// Export the app for Vercel
export default app;
