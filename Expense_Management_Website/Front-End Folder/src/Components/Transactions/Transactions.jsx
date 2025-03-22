import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Transactions.css'; // Import CSS
import axios from 'axios';

const Transactions = () => {
    
    const [transactions, setTransactions] = useState([]);
    const navigate = useNavigate();

    // Fetch transactions from the API
    useEffect(() => {
        const fetchTransactions = async () => {
            try {
                const response = await axios.get('http://localhost:3000/transactions/gettransactions');
                setTransactions(response.data);
            } catch (error) {
                console.error('Error fetching transactions:', error);
            }
        };
        fetchTransactions();
    }, []);

    const handleTransactionClick = (id) => {
        navigate(`/dashboard/transactions/details/${id}`);
    };

    const handleAddTransaction = () => {
        navigate('/dashboard/transactions/addTransaction');
    };

    // Function to format the date to 'DD MMM YYYY' format
    const formatDate = (dateString) => {
        const options = { day: '2-digit', month: 'short', year: 'numeric' };
        const date = new Date(dateString);
        return date.toLocaleDateString('en-GB', options);
    };

    return (
        <div className="transactions-container">
            <div className="header">
                <h4>Daily Transactions</h4>
                <button className="btn btn-primary add-transaction-btn" onClick={handleAddTransaction}>
                    Add Transaction
                </button>
            </div>
            <table className="transactions-table">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Date</th>
                        <th>Description</th>
                        <th>Credit (INR)</th>
                        <th>Debit (INR)</th>
                        <th>Account</th>
                    </tr>
                </thead>
                <tbody>
                    {transactions.map(transaction => (
                        <tr key={transaction.transaction_id} onClick={() => handleTransactionClick(transaction.transaction_id)}>
                            <td>{transaction.name}</td>
                            <td>{formatDate(transaction.date)}</td>
                            <td>{transaction.description}</td>
                            <td className="credit">
                                {transaction.transaction_type === 'credit' ? `₹${(transaction.amount).toLocaleString()}` : '-'}
                            </td>
                            <td className="debit">
                                {transaction.transaction_type === 'debit' ? `₹${(transaction.amount ).toLocaleString()}` : '-'}
                            </td>
                            <td>{transaction.account}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default Transactions;
