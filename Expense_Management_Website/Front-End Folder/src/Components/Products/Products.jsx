import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Products.css';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Fetch products from API
  useEffect(() => {
    axios.get('http://localhost:3000/products/getProducts')
      .then((res) => setProducts(res.data))
      .catch((err) => {
        console.error('Error fetching products:', err);
        setError('Failed to fetch products.');
      });
  }, []);

  const handleProductClick = (id) => {
    navigate(`/dashboard/products/details/${id}`);
  };

  const handleAddProduct = () => {
    navigate('/dashboard/products/addProduct');
  };

  return (
    <div className="products-container">
      <div className="header">
        <h4>Products</h4>
        <button className="btn btn-primary add-product-btn" onClick={handleAddProduct}>Add Product</button>
      </div>

      {error && <p className="error">{error}</p>}

      <div className="products-list">
        {products.length > 0 ? (
          products.map(product => (
            <div className="product-card" key={product.id} onClick={() => handleProductClick(product.id)}>
              <h5>{product.name}</h5>
              {product.price && <p>Price: ₹{Number(product.price).toLocaleString()}</p>}
              {product.stock && <p>Stock: {product.stock}</p>}
            </div>
          ))
        ) : (
          <p>No products found.</p>
        )}
      </div>
    </div>
  );
};

export default Products;
