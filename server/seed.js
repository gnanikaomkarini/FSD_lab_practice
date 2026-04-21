const mongoose = require("mongoose");
const Product = require("./models/Product");

const MONGO_URI = "mongodb://127.0.0.1:27017/productdb";

const sampleProducts = [
  { name: "Laptop", price: 50000, quantity: 10 },
  { name: "Wireless Mouse", price: 799, quantity: 50 },
  { name: "Mechanical Keyboard", price: 3499, quantity: 25 },
];

async function seed() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB for seeding");

    await Product.deleteMany({});
    const inserted = await Product.insertMany(sampleProducts);
    console.log(`Inserted ${inserted.length} sample products`);
  } catch (err) {
    console.error("Seeding error:", err.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

seed();
