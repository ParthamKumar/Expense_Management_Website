import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './AddProduct.css';

const AddProduct = () => {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        category: '',
        stock: '',
        supplier: '',
        dateAdded: new Date().toISOString().split('T')[0], // Default to today's date
        imageUrl: '',
        sku: ''
    });

    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const navigate = useNavigate();

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleAddProduct = async (e) => {
        e.preventDefault(); // Prevent default form submission
        setError('');
        
        if (!formData.name || !formData.price || !formData.category) {
            setError('Name, Price, and Category are required');
            return;
        }

        setIsSubmitting(true);

        try {
            const response = await fetch('http://localhost:3000/products/addProduct', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    ...formData,
                    price: parseFloat(formData.price),
                    stock: parseInt(formData.stock) || 0
                })
            });

            const data = await response.json();
            if (response.ok) {
                navigate('/dashboard/products', { state: { success: 'Product added successfully!' } });
            } else {
                setError(data.message || 'Failed to add product');
            }
        } catch (error) {
            setError('An error occurred. Please try again.');
            console.error('Error:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="add-product-container">
            <h2>Add New Product</h2>
            <form className="add-product-form" onSubmit={handleAddProduct}>
                {error && <p className="error">{error}</p>}
                
                <div className="form-row">
                    <label>
                        Product Name*
                        <input 
                            type="text" 
                            name="name" 
                            value={formData.name} 
                            onChange={handleInputChange} 
                            required 
                            placeholder="Enter product name"
                        />
                    </label>

                    <label>
                        SKU Code
                        <input 
                            type="text" 
                            name="sku" 
                            value={formData.sku} 
                            onChange={handleInputChange} 
                            placeholder="Product identifier"
                        />
                    </label>
                </div>

                <label>
                    Description
                    <textarea 
                        name="description" 
                        value={formData.description} 
                        onChange={handleInputChange} 
                        placeholder="Detailed product description"
                    />
                </label>

                <div className="form-row">
                    <label>
                        Price*
                        <div className="input-group">
                            <span className="currency-symbol">$</span>
                            <input 
                                type="number" 
                                name="price" 
                                value={formData.price} 
                                onChange={handleInputChange} 
                                step="0.01" 
                                min="0"
                                required 
                                placeholder="0.00"
                            />
                        </div>
                    </label>

                    <label>
                        Stock Quantity
                        <input 
                            type="number" 
                            name="stock" 
                            value={formData.stock} 
                            onChange={handleInputChange} 
                            min="0"
                            placeholder="Available units"
                        />
                    </label>
                </div>

                <div className="form-row">
                    <label>
                        Category*
                        <select 
                            name="category" 
                            value={formData.category} 
                            onChange={handleInputChange}
                            required
                        >
                            <option value="">Select Category</option>
                            <option value="electronics">Electronics</option>
                            <option value="clothing">Clothing</option>
                            <option value="groceries">Groceries</option>
                            <option value="furniture">Furniture</option>
                            <option value="health">Health & Beauty</option>
                            <option value="sports">Sports & Outdoors</option>
                        </select>
                    </label>

                    <label>
                        Supplier
                        <input 
                            type="text" 
                            name="supplier" 
                            value={formData.supplier} 
                            onChange={handleInputChange} 
                            placeholder="Manufacturer or vendor"
                        />
                    </label>
                </div>

                <div className="form-row">
                    <label>
                        Date Added*
                        <input 
                            type="date" 
                            name="dateAdded" 
                            value={formData.dateAdded}
                            onChange={handleInputChange} 
                            required 
                        />
                    </label>

                    <label>
                        Image URL
                        <input 
                            type="url" 
                            name="imageUrl" 
                            value={formData.imageUrl} 
                            onChange={handleInputChange} 
                            placeholder="https://example.com/product-image.jpg"
                        />
                    </label>
                </div>

                <div className="form-actions">
                    <button 
                        type="submit" 
                        className="btn btn-primary" 
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? 'Adding...' : 'Add Product'}
                    </button>
                    <button 
                        type="button" 
                        className="btn btn-secondary"
                        onClick={() => navigate('/dashboard/products')}
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AddProduct;