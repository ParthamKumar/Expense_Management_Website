import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './AddTransaction.css';

const AddTransaction = () => {
    const [name, setName] = useState('');
    const [date, setDate] = useState('');
    const [description, setDescription] = useState('');
    const [amount, setAmount] = useState(''); // Single amount field
    const [transactionType, setTransactionType] = useState('credit'); // 'credit' or 'debit'
    const [account, setAccount] = useState('');
    const navigate = useNavigate();

    // Function to format the date to "DD-MMM-YYYY"
    const formatDate = (rawDate) => {
        const selectedDate = new Date(rawDate);
        const day = String(selectedDate.getDate()).padStart(2, '0');
        const month = selectedDate.toLocaleString('default', { month: 'short' });
        const year = selectedDate.getFullYear();
        return `${day}-${month}-${year}`;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Format the date before submitting
        const formattedDate = formatDate(date);

        // Prepare the transaction data based on transaction type
        const transactionData = {
            name,
            date: formattedDate,
            description,
            type: transactionType,
            amount,
            account,
        };

        console.log(transactionData); // Log for demonstration

        // After submitting the form, navigate back to the transactions list
        navigate('/dashboard/transactions');
    };

    return (
        <div className="add-transaction-container">
            <h2>Add Transaction</h2>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>Name</label>
                    <input 
                        type="text" 
                        value={name} 
                        onChange={(e) => setName(e.target.value)} 
                        placeholder="Enter transaction name" 
                        required 
                    />
                </div>
                <div className="form-group">
                    <label>Date</label>
                    <input 
                        type="date" 
                        value={date} 
                        onChange={(e) => setDate(e.target.value)} 
                        required 
                    />
                </div>
                <div className="form-group">
                    <label>Description</label>
                    <input 
                        type="text" 
                        value={description} 
                        onChange={(e) => setDescription(e.target.value)} 
                        placeholder="Add a short description" 
                    />
                </div>
                <div className="form-group">
                    <label>Transaction Type</label>
                    <div className="radio-group">
                        <label>
                            <input
                                type="radio"
                                value="credit"
                                checked={transactionType === 'credit'}
                                onChange={(e) => setTransactionType(e.target.value)}
                            />
                            Credit
                        </label>
                        <label>
                            <input
                                type="radio"
                                value="debit"
                                checked={transactionType === 'debit'}
                                onChange={(e) => setTransactionType(e.target.value)}
                            />
                            Debit
                        </label>
                    </div>
                </div>
                <div className="form-group">
                    <label>{transactionType === 'credit' ? 'Credit Amount' : 'Debit Amount'}</label>
                    <input 
                        type="number" 
                        value={amount} 
                        onChange={(e) => setAmount(e.target.value)} 
                        placeholder={`Enter ${transactionType} amount`} 
                        required 
                    />
                </div>
                <div className="form-group">
                    <label>Account</label>
                    <input 
                        type="text" 
                        value={account} 
                        onChange={(e) => setAccount(e.target.value)} 
                        placeholder="Account name" 
                    />
                </div>
                <button type="submit" className="submit-btn">Add Transaction</button>
            </form>
        </div>
    );
};

export default AddTransaction;
