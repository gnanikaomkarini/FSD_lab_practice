import React, { useEffect, useState } from "react";
import ProductTable from "./ProductTable";

function App() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch("http://localhost:5003/api/products")
      .then((res) => {
        if (!res.ok) {
          throw new Error("Failed to fetch products");
        }
        return res.json();
      })
      .then((data) => {
        setProducts(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  return (
    <div className="container">
      <h1>Product Inventory</h1>
      {loading && <div className="state">Loading products...</div>}
      {error && <div className="state error">{error}</div>}
      {!loading && !error && <ProductTable products={products} />}
    </div>
  );
}

export default App;
