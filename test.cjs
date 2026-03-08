const db = require('better-sqlite3')('business.db');
const totalSales = db.prepare('SELECT SUM(total_amount) as total FROM orders').get();
const orderCount = db.prepare('SELECT COUNT(*) as count FROM orders').get();
const lowStock = db.prepare('SELECT COUNT(*) as count FROM products WHERE stock < 20').get();
const salesByDay = db.prepare(`
  SELECT date(created_at) as date, SUM(total_amount) as sales
  FROM orders
  GROUP BY date(created_at)
  ORDER BY date DESC
  LIMIT 7
`).all();
console.log(JSON.stringify({
  totalSales: totalSales ? totalSales.total || 0 : 0,
  orderCount: orderCount ? orderCount.count || 0 : 0,
  lowStock: lowStock ? lowStock.count || 0 : 0,
  salesByDay: salesByDay.reverse()
}));
