import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Transactions.css'; // Import CSS

const Transactions = () => {
    const conversionRate = 83; // 1 USD = 83 INR (example conversion rate)
    
    const [transactions, setTransactions] = useState([
        { id: 1, name: 'Client One', date: '2025-03-21', description: 'Payment for services', credit: 1000, debit: 0, account: 'Account A' },
        { id: 2, name: 'Client Two', date: '2025-03-22', description: 'Refund issued', credit: 0, debit: 500, account: 'Account B' },
        { id: 3, name: 'Client Three', date: '2025-03-22', description: 'Subscription renewal', credit: 300, debit: 0, account: 'Account C' },
    ]);

    const navigate = useNavigate();

    const handleTransactionClick = (id) => {
        navigate(`/dashboard/transactions/details/${id}`); // Navigate to TransactionDetails component with transaction id
    };

    const handleAddTransaction = () => {
        navigate('/dashboard/transactions/addTransaction'); // Navigate to the form for adding a new transaction
    };

    // Function to format the date to 'DD MMM YYYY' format
    const formatDate = (dateString) => {
        const options = { day: '2-digit', month: 'short', year: 'numeric' };
        const date = new Date(dateString);
        return date.toLocaleDateString('en-GB', options); // 'en-GB' gives the 'DD MMM YYYY' format
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
                        <tr key={transaction.id} onClick={() => handleTransactionClick(transaction.id)}>
                            <td>{transaction.name}</td>
                            <td>{formatDate(transaction.date)}</td>
                            <td>{transaction.description}</td>
                            <td className="credit">{transaction.credit ? `₹${(transaction.credit * conversionRate).toLocaleString()}` : '-'}</td>
                            <td className="debit">{transaction.debit ? `₹${(transaction.debit * conversionRate).toLocaleString()}` : '-'}</td>
                            <td>{transaction.account}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default Transactions;
