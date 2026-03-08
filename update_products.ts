import Database from 'better-sqlite3';

const db = new Database('business.db');

const updates = [
  { id: 1, desc: 'Premium Bluetooth 5.3 wireless earbuds with active noise cancellation (ANC), deep bass, and 24-hour battery life. Perfect for workouts, running, commuting, and hands-free calls.' },
  { id: 2, desc: 'Advanced fitness tracker smartwatch with heart rate monitor, sleep tracking, step counter, and GPS. Water-resistant design compatible with iOS and Android smartphones.' },
  { id: 3, desc: 'Lightweight, breathable athletic running shoes for men and women. Features a shock-absorbing sole, ergonomic arch support, and durable mesh for marathon training, jogging, and everyday comfort.' },
  { id: 4, desc: 'Programmable 12-cup drip coffee maker machine with built-in timer, auto-shutoff, and reusable washable filter. Brew the perfect morning espresso, dark roast, or decaf coffee at home.' }
];

const stmt = db.prepare('UPDATE products SET description = ? WHERE id = ?');

for (const update of updates) {
  stmt.run(update.desc, update.id);
}

console.log('Descriptions updated successfully.');
