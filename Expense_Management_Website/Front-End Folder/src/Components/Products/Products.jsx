import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Products.css';

const Products = () => {
    const [products, setProducts] = useState([
        { id: 1, name: 'Product A', price: 1000, stock: 50 },
        { id: 2, name: 'Product B', price: 2000, stock: 30 },
        { id: 3, name: 'Product C', price: 1500, stock: 20 },
        { id: 4, name: 'Product D', price: 2500, stock: 10 },
    ]);

    const navigate = useNavigate();

    const handleProductClick = (id) => {
        navigate(`/dashboard/products/details/${id}`); // Navigate to ProductDetails component with product id
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
            <div className="products-list">
                {products.map(product => (
                    <div className="product-card" key={product.id} onClick={() => handleProductClick(product.id)}>
                        <h5>{product.name}</h5>
                        <p>Price: ₹{product.price.toLocaleString()}</p>
                        <p>Stock: {product.stock}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Products;