const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const Category = require('../models/Category');
const Product = require('../models/Product');
const Discount = require('../models/Discount');
const Order = require('../models/Order');
const OrderItem = require('../models/OrderItem');

const seedDir = path.join(__dirname, '..', '..', 'seed-json');

const readSeedFile = (filename) => {
  const filePath = path.join(seedDir, filename);
  if (!fs.existsSync(filePath)) {
    return [];
  }
  const raw = fs.readFileSync(filePath, 'utf8');
  return JSON.parse(raw);
};

const normalizeMongoExtended = (value) => {
  if (Array.isArray(value)) {
    return value.map(normalizeMongoExtended);
  }

  if (value && typeof value === 'object') {
    if (Object.keys(value).length === 1 && value.$oid) {
      return new mongoose.Types.ObjectId(value.$oid);
    }

    if (Object.keys(value).length === 1 && value.$date) {
      return new Date(value.$date);
    }

    return Object.entries(value).reduce((acc, [key, val]) => {
      acc[key] = normalizeMongoExtended(val);
      return acc;
    }, {});
  }

  return value;
};

const ensureSeedData = async () => {
  const categoryCount = await Category.countDocuments();
  const productCount = await Product.countDocuments();

  if (categoryCount > 0 || productCount > 0) {
    return { seeded: false };
  }

  const categories = normalizeMongoExtended(readSeedFile('categories.json'));
  const products = normalizeMongoExtended(readSeedFile('products.json'));
  const discounts = normalizeMongoExtended(readSeedFile('discounts.json'));
  const orders = normalizeMongoExtended(readSeedFile('orders.json'));
  const orderItems = normalizeMongoExtended(readSeedFile('order_items.json'));

  if (categories.length) {
    await Category.insertMany(categories);
  }
  if (products.length) {
    await Product.insertMany(products);
  }

  if (discounts.length) {
    await Discount.insertMany(discounts);
  }
  if (orders.length) {
    await Order.insertMany(orders);
  }
  if (orderItems.length) {
    await OrderItem.insertMany(orderItems);
  }

  return { seeded: true };
};

module.exports = { ensureSeedData };
