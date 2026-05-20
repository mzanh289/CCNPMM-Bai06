require('dotenv').config();
const axios = require('axios');
const fs = require('fs/promises');
const path = require('path');
const mongoose = require('mongoose');
const connection = require('../config/database');
const Product = require('../models/Product');
const Category = require('../models/Category');

const API_URL = 'https://dummyjson.com/products';
const IMAGE_DIR = path.resolve(__dirname, '..', '..', 'uploads', 'products');
const IMAGE_BASE = '/uploads/products';

const slugify = (value = '') =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');

const formatCategoryName = (value = '') =>
  value
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');

const ensureDir = async (dirPath) => {
  await fs.mkdir(dirPath, { recursive: true });
};

const fileExists = async (filePath) => {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
};

const getImageExtension = (url) => {
  try {
    const parsed = new URL(url);
    const ext = path.extname(parsed.pathname);
    return ext && ext.length <= 5 ? ext : '.jpg';
  } catch {
    return '.jpg';
  }
};

const downloadImage = async (url, filePath) => {
  if (await fileExists(filePath)) {
    return;
  }

  const response = await axios.get(url, { responseType: 'arraybuffer' });
  await fs.writeFile(filePath, response.data);
};

const fetchProducts = async () => {
  const response = await axios.get(API_URL, { params: { limit: 50, skip: 0 } });
  const payload = response.data || {};
  return Array.isArray(payload.products) ? payload.products : [];
};

const resolveCategory = async (rawCategory) => {
  const name = formatCategoryName(rawCategory || 'uncategorized');
  const slug = slugify(name);

  let category = await Category.findOne({ slug });
  if (!category) {
    category = await Category.create({ name, slug, isActive: true });
  }

  return category;
};

const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

const randomDiscount = (price) => {
  if (!price || Number.isNaN(price)) {
    return null;
  }

  if (Math.random() > 0.3) {
    return null;
  }

  const percent = randomInt(5, 30);
  const discountPrice = Math.max(0, price * (1 - percent / 100));
  return Number(discountPrice.toFixed(2));
};

const importProducts = async () => {
  await ensureDir(IMAGE_DIR);

  const products = await fetchProducts();
  let created = 0;
  let skipped = 0;
  let failed = 0;

  for (const item of products) {
    try {
      const existing = await Product.findOne({ externalId: item.id });

      const price = Number(item.price) || 0;
      const discountPrice = randomDiscount(price);
      const soldQuantity = randomInt(0, 500);
      const viewCount = randomInt(50, 5000);

      if (existing) {
        existing.soldQuantity = soldQuantity;
        existing.viewCount = viewCount;
        existing.discountPrice = discountPrice;
        await existing.save();
        skipped += 1;
        continue;
      }

      const category = await resolveCategory(item.category);
      const slug = item.slug ? slugify(item.slug) : slugify(item.title);

      const thumbnailExt = getImageExtension(item.thumbnail);
      const thumbnailFile = `${slug}-thumbnail${thumbnailExt}`;
      const thumbnailPath = path.join(IMAGE_DIR, thumbnailFile);
      const thumbnailRel = `${IMAGE_BASE}/${thumbnailFile}`;

      if (item.thumbnail) {
        await downloadImage(item.thumbnail, thumbnailPath);
      }

      const imageUrls = [];
      const images = Array.isArray(item.images) ? item.images : [];
      for (let index = 0; index < images.length; index += 1) {
        const imageUrl = images[index];
        const imageExt = getImageExtension(imageUrl);
        const imageFile = `${slug}-${index + 1}${imageExt}`;
        const imagePath = path.join(IMAGE_DIR, imageFile);
        const imageRel = `${IMAGE_BASE}/${imageFile}`;

        await downloadImage(imageUrl, imagePath);
        imageUrls.push(imageRel);
      }

      const mergedImages = [thumbnailRel, ...imageUrls].filter(Boolean);
      const uniqueImages = Array.from(new Set(mergedImages));

      await Product.create({
        name: item.title,
        slug,
        description: item.description || '',
        price,
        discountPrice,
        sku: `DUMMY-${item.id}`,
        externalId: item.id,
        thumbnail: thumbnailRel,
        images: imageUrls,
        imageUrls: uniqueImages,
        stockQuantity: Number(item.stock) || 0,
        soldQuantity,
        viewCount,
        category: category._id,
        isActive: true,
        tags: Array.isArray(item.tags) ? item.tags : []
      });

      created += 1;
    } catch (error) {
      failed += 1;
      console.error(`[importProducts] Failed for product ${item?.id}:`, error.message);
    }
  }

  console.log(`[importProducts] Done. Created: ${created}. Skipped: ${skipped}. Failed: ${failed}.`);
};

const run = async () => {
  try {
    await connection();
    await importProducts();
  } catch (error) {
    console.error('[importProducts] Error:', error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
};

run();
