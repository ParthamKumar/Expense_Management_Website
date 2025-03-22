import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './AddAccount.css'; // Import CSS

const AddAccount = () => {
    const [formData, setFormData] = useState({
        name: '',
        contact: '',
        email: '',
        address: '',
        description: ''  // Add description field to state
    });
    const navigate = useNavigate();

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleAddClient = () => {
        // API call to add a client can be added here
        console.log('Client Added', formData);
        navigate('/accounts'); // Navigate back to accounts page after adding client
    };

    return (
        <div className="add-account-container">
            <h2>Add New Client</h2>
            <form className="add-account-form">
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
                <button type="button" className="btn btn-primary" onClick={handleAddClient}>Add Client</button>
            </form>
        </div>
    );
}

export default AddAccount;
