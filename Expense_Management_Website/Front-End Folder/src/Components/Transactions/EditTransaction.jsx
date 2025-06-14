import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import './EditTransaction.css';

const EditTransaction = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [startDate, setStartDate] = useState(null);

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        transaction_type: '',
        amount: ''
    });

    useEffect(() => {
        axios.get(`http://localhost:3000/transactions/gettransaction/${id}`)
            .then((response) => {
                const t = response.data;

                const normalizedType = t.transaction_type?.toLowerCase() === 'credit' ? 'credit' : 'debit';

                setFormData({
                    name: t.name || '',
                    description: t.description || '',
                    transaction_type: normalizedType,
                    amount: t.amount || '',
                    account: t.account || ''
                });

                setStartDate(t.date ? new Date(t.date) : null);
            })
            .catch(() => alert("Failed to load transaction"));
    }, [id]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const payload = {
            ...formData,
            transaction_type: formData.transaction_type.toLowerCase(), // to match enum
            date: startDate ? startDate.toISOString().slice(0, 19).replace('T', ' ') : null
        };

        axios.put(`http://localhost:3000/transactions/updatetransaction/${id}`, payload)
            .then(() => {
                alert("Transaction updated successfully!");
                navigate(`/dashboard/transactions/details/${id}`);
            })
            .catch(() => alert("Failed to update transaction"));
    };

    return (
        <div className="edit-form-container">
            <h2>Edit Transaction</h2>
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Name"
                    required
                />
                <DatePicker
                    selected={startDate}
                    onChange={(date) => setStartDate(date)}
                    placeholderText="Date"
                    dateFormat="dd MMM yyyy"
                    showMonthDropdown
                    showYearDropdown
                    dropdownMode="select"
                    className="date-picker"
                    required
                />
                <input
                    type="text"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Description"
                />
                <select
                    name="transaction_type"
                    value={formData.transaction_type}
                    onChange={handleChange}
                    required
                >
                    <option value="">Select Type</option>
                    <option value="credit">Credit</option>
                    <option value="debit">Debit</option>
                </select>
                <input
                    type="number"
                    name="amount"
                    value={formData.amount}
                    onChange={handleChange}
                    placeholder="Amount"
                    required
                />
                
                
                <button type="submit" className="btn btn-primary">Update</button>
            </form>
        </div>
    );
};

export default EditTransaction;
