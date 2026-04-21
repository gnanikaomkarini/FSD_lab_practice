const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const productsRouter = require("./routes/products");

const app = express();
const PORT = 5003;
const MONGO_URI = "mongodb://127.0.0.1:27017/productdb";

app.use(cors());
app.use(express.json());

app.use("/api/products", productsRouter);

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("Connected to MongoDB:", MONGO_URI);
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err.message);
    process.exit(1);
  });
