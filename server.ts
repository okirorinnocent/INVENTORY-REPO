import express from 'express';
import { createServer as createViteServer } from 'vite';
import Database from 'better-sqlite3';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database('business.db');

// Initialize Database
db.exec(`
  CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    price REAL NOT NULL,
    stock INTEGER NOT NULL,
    category TEXT,
    image TEXT
  );

  CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_name TEXT NOT NULL,
    customer_email TEXT,
    total_amount REAL NOT NULL,
    status TEXT DEFAULT 'pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS order_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    quantity INTEGER NOT NULL,
    price REAL NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id),
    FOREIGN KEY (product_id) REFERENCES products(id)
  );

  CREATE TABLE IF NOT EXISTS subscribers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

// Seed some initial data if empty
const count = db.prepare('SELECT COUNT(*) as count FROM products').get() as { count: number };
if (count.count === 0) {
  const insertProduct = db.prepare('INSERT INTO products (name, description, price, stock, category, image) VALUES (?, ?, ?, ?, ?, ?)');
  insertProduct.run('Wireless Earbuds', 'Premium Bluetooth 5.3 wireless earbuds with active noise cancellation (ANC), deep bass, and 24-hour battery life. Perfect for workouts, running, commuting, and hands-free calls.', 49.99, 100, 'Electronics', 'https://picsum.photos/seed/earbuds/400/300');
  insertProduct.run('Smart Watch', 'Advanced fitness tracker smartwatch with heart rate monitor, sleep tracking, step counter, and GPS. Water-resistant design compatible with iOS and Android smartphones.', 89.99, 50, 'Electronics', 'https://picsum.photos/seed/watch/400/300');
  insertProduct.run('Running Shoes', 'Lightweight, breathable athletic running shoes for men and women. Features a shock-absorbing sole, ergonomic arch support, and durable mesh for marathon training, jogging, and everyday comfort.', 59.99, 200, 'Apparel', 'https://picsum.photos/seed/shoes/400/300');
  insertProduct.run('Coffee Maker', 'Programmable 12-cup drip coffee maker machine with built-in timer, auto-shutoff, and reusable washable filter. Brew the perfect morning espresso, dark roast, or decaf coffee at home.', 39.99, 30, 'Home', 'https://picsum.photos/seed/coffee/400/300');
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.get('/api/products', (req, res) => {
    const products = db.prepare('SELECT * FROM products').all();
    res.json(products);
  });

  app.post('/api/products', (req, res) => {
    const { name, description, price, stock, category, image } = req.body;
    const stmt = db.prepare('INSERT INTO products (name, description, price, stock, category, image) VALUES (?, ?, ?, ?, ?, ?)');
    const info = stmt.run(name, description, price, stock, category, image);
    res.json({ id: info.lastInsertRowid });
  });

  app.put('/api/products/:id', (req, res) => {
    const { name, description, price, stock, category, image } = req.body;
    const stmt = db.prepare('UPDATE products SET name = ?, description = ?, price = ?, stock = ?, category = ?, image = ? WHERE id = ?');
    stmt.run(name, description, price, stock, category, image, req.params.id);
    res.json({ success: true });
  });

  app.delete('/api/products/:id', (req, res) => {
    const stmt = db.prepare('DELETE FROM products WHERE id = ?');
    stmt.run(req.params.id);
    res.json({ success: true });
  });

  app.post('/api/subscribe', (req, res) => {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }
    try {
      const stmt = db.prepare('INSERT INTO subscribers (email) VALUES (?)');
      stmt.run(email);
      res.json({ success: true });
    } catch (error: any) {
      if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
        res.status(400).json({ error: 'Email already subscribed' });
      } else {
        res.status(500).json({ error: 'Failed to subscribe' });
      }
    }
  });

  app.get('/api/subscribers', (req, res) => {
    const subscribers = db.prepare('SELECT * FROM subscribers ORDER BY created_at DESC').all();
    res.json(subscribers);
  });

  app.delete('/api/subscribers/:id', (req, res) => {
    const stmt = db.prepare('DELETE FROM subscribers WHERE id = ?');
    stmt.run(req.params.id);
    res.json({ success: true });
  });

  app.get('/api/orders', (req, res) => {
    const orders = db.prepare('SELECT * FROM orders ORDER BY created_at DESC').all();
    const ordersWithItems = orders.map((order: any) => {
      const items = db.prepare(`
        SELECT oi.*, p.name, p.image 
        FROM order_items oi 
        JOIN products p ON oi.product_id = p.id 
        WHERE oi.order_id = ?
      `).all(order.id);
      return { ...order, items };
    });
    res.json(ordersWithItems);
  });

  app.put('/api/orders/:id/status', (req, res) => {
    const { status } = req.body;
    const stmt = db.prepare('UPDATE orders SET status = ? WHERE id = ?');
    stmt.run(status, req.params.id);
    res.json({ success: true });
  });

  app.post('/api/orders', (req, res) => {
    const { customer_name, customer_email, items } = req.body;
    
    let total_amount = 0;
    
    const transaction = db.transaction(() => {
      // Calculate total and check stock
      for (const item of items) {
        const product = db.prepare('SELECT price, stock FROM products WHERE id = ?').get(item.product_id) as any;
        if (!product || product.stock < item.quantity) {
          throw new Error(`Insufficient stock for product ID ${item.product_id}`);
        }
        total_amount += product.price * item.quantity;
      }

      const orderStmt = db.prepare('INSERT INTO orders (customer_name, customer_email, total_amount) VALUES (?, ?, ?)');
      const orderInfo = orderStmt.run(customer_name, customer_email, total_amount);
      const orderId = orderInfo.lastInsertRowid;

      const itemStmt = db.prepare('INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)');
      const updateStockStmt = db.prepare('UPDATE products SET stock = stock - ? WHERE id = ?');

      for (const item of items) {
        const product = db.prepare('SELECT price FROM products WHERE id = ?').get(item.product_id) as any;
        itemStmt.run(orderId, item.product_id, item.quantity, product.price);
        updateStockStmt.run(item.quantity, item.product_id);
      }

      return orderId;
    });

    try {
      const orderId = transaction();
      res.json({ id: orderId, success: true });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.get('/api/analytics', (req, res) => {
    const totalSales = db.prepare('SELECT SUM(total_amount) as total FROM orders').get() as any;
    const orderCount = db.prepare('SELECT COUNT(*) as count FROM orders').get() as any;
    const lowStock = db.prepare('SELECT COUNT(*) as count FROM products WHERE stock < 20').get() as any;
    
    // Sales by day for the last 7 days
    const salesByDay = db.prepare(`
      SELECT date(created_at) as date, SUM(total_amount) as sales
      FROM orders
      GROUP BY date(created_at)
      ORDER BY date DESC
      LIMIT 7
    `).all();

    res.json({
      totalSales: totalSales.total || 0,
      orderCount: orderCount.count || 0,
      lowStock: lowStock.count || 0,
      salesByDay: salesByDay.reverse()
    });
  });

  // AI Endpoints
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

  app.post('/api/ai/insights', async (req, res) => {
    try {
      const products = db.prepare('SELECT name, stock, price, category FROM products').all();
      const orders = db.prepare('SELECT * FROM orders ORDER BY created_at DESC LIMIT 50').all();
      
      const prompt = `
        Analyze this business data and tell me what customers need most, what I should stock more of, and how I can improve to make more money.
        
        Products: ${JSON.stringify(products)}
        Recent Orders: ${JSON.stringify(orders)}
        
        Provide a concise, actionable business advice summary.
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-3.1-pro-preview',
        contents: prompt,
      });

      res.json({ insights: response.text });
    } catch (error: any) {
      console.error('AI Error:', error);
      res.status(500).json({ error: 'Failed to generate insights' });
    }
  });

  app.post('/api/ai/ideas', async (req, res) => {
    try {
      const { query } = req.body;
      const prompt = `
        I am an unemployed entrepreneur looking to make money. 
        Based on current trends and the following query: "${query || 'general business ideas'}", 
        give me 3 innovative business ideas that I can apply to my e-commerce/inventory app.
        Use Google Search to find recent trends and data to support these ideas.
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: {
          tools: [{ googleSearch: {} }]
        }
      });

      res.json({ ideas: response.text });
    } catch (error: any) {
      console.error('AI Error:', error);
      res.status(500).json({ error: 'Failed to generate ideas' });
    }
  });

  app.post('/api/ai/chat', async (req, res) => {
    try {
      const { message, history } = req.body;
      
      let formattedHistory = history.map((msg: any) => ({
        role: msg.role === 'model' ? 'model' : 'user',
        parts: [{ text: msg.text }]
      }));

      // Gemini requires the first message to be from the user
      if (formattedHistory.length > 0 && formattedHistory[0].role === 'model') {
        formattedHistory.shift();
      }

      const chat = ai.chats.create({
        model: 'gemini-3.1-pro-preview',
        history: formattedHistory,
        config: {
          systemInstruction: 'You are an expert business advisor helping an entrepreneur grow their e-commerce and inventory business. Be concise, practical, and encouraging.',
        }
      });

      const response = await chat.sendMessage({ message });
      res.json({ reply: response.text });
    } catch (error: any) {
      console.error('AI Error:', error);
      res.status(500).json({ error: 'Failed to chat' });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static('dist'));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
