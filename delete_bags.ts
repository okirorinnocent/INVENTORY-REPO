import Database from 'better-sqlite3';

const db = new Database('business.db');
const stmt = db.prepare('DELETE FROM products WHERE name LIKE ? OR description LIKE ? OR category LIKE ?');
const info = stmt.run('%bag%', '%bag%', '%bag%');
console.log(`Deleted ${info.changes} bags.`);
