import Database from 'better-sqlite3';
const db = new Database('business.db');
const products = db.prepare('SELECT * FROM products').all();
console.log(JSON.stringify(products, null, 2));
