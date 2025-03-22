import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './AddAccount.css'; // Import CSS

const AddAccount = () => {
    const [formData, setFormData] = useState({
        name: '',
        contact: '',
        email: '',
        address: '',
        description: '',
        dateAdded: ''
    });

    const [error, setError] = useState(''); // For showing error if validation fails
    const navigate = useNavigate();

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleAddClient = async () => {
        if (!formData.name) {
            setError('Name is required');
            return; // Stop if validation fails
        }
    
        try {
            const response = await fetch('http://localhost:3000/accounts/addClient', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });
    
            const data = await response.json();
            if (response.ok) {
                console.log('Client added successfully:', data);
                navigate('/dashboard/accounts');
            } else {
                setError(data.message || 'Failed to add client');
            }
        } catch (error) {
            setError('An error occurred. Please try again.');
            console.error('Error:', error);
        }
    };


    return (
        <div className="add-account-container">
            <h2>Add New Client</h2>
            <form className="add-account-form">
                {error && <p className="error">{error}</p>} {/* Show error if validation fails */}
                <label>
                    Name:
                    <input 
                        type="text" 
                        name="name" 
                        value={formData.name} 
                        onChange={handleInputChange} 
                        required 
                    />
                </label>
                <label>
                    Contact No:
                    <input 
                        type="text" 
                        name="contact" 
                        value={formData.contact} 
                        onChange={handleInputChange} 
                        required 
                    />
                </label>
                <label>
                    Email:
                    <input 
                        type="email" 
                        name="email" 
                        value={formData.email} 
                        onChange={handleInputChange} 
                        required 
                    />
                </label>
                <label>
                    Address:
                    <input 
                        type="text" 
                        name="address" 
                        value={formData.address} 
                        onChange={handleInputChange} 
                        required 
                    />
                </label>
                <label>
                    Description:
                    <textarea 
                        name="description" 
                        value={formData.description} 
                        onChange={handleInputChange} 
                        required 
                    />
                </label>
                <label>
                    Date Account Added:
                    <input 
                        type="date" 
                        name="dateAdded" 
                        value={formData.dateAdded}
                        onChange={handleInputChange} 
                        required 
                    />
                </label>
                <button type="button" className="btn btn-primary" onClick={handleAddClient}>Add Client</button>
            </form>
        </div>
    );
};

export default AddAccount;
