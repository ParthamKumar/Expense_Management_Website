import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Transactions.css'; // Import CSS
import axios from 'axios';

const Transactions = () => {
    const [transactions, setTransactions] = useState([]);
    const [filteredTransactions, setFilteredTransactions] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [description, setDescription] = useState('');
    const [transactionType, setTransactionType] = useState(''); // 'credit' or 'debit'
    const navigate = useNavigate();

    // Fetch transactions from the API
    useEffect(() => {
        const fetchTransactions = async () => {
            try {
                const response = await axios.get('http://localhost:3000/transactions/gettransactions');
                setTransactions(response.data);
                setFilteredTransactions(response.data); // Initialize filtered transactions
            } catch (error) {
                console.error('Error fetching transactions:', error);
            }
        };
        fetchTransactions();
    }, []);

    // Handle search by name, date range, description, or transaction type
    useEffect(() => {
        const fetchTransactions = async () => {
            try {
                const response = await axios.get('http://localhost:3000/transactions/searchtransactions', {
                    params: {
                        name: searchTerm,
                        startDate: startDate,
                        endDate: endDate,
                        description: description,
                        transactionType: transactionType
                    }
                });
                setFilteredTransactions(response.data);
            } catch (error) {
                console.error('Error fetching transactions:', error);
            }
        };
        fetchTransactions();
    }, [searchTerm, startDate, endDate, description, transactionType]);

    // Clear all filters
    const handleClearFilters = () => {
        setSearchTerm('');
        setStartDate('');
        setEndDate('');
        setDescription('');
        setTransactionType('');
    };

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

            {/* Search Field */}
            <div className="search-fields">
                <input
                    type="text"
                    placeholder="Search by name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                <input
                    type="date"
                    placeholder="Start Date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                />
                <input
                    type="date"
                    placeholder="End Date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                />
                <input
                    type="text"
                    placeholder="Search by description..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                />
                <select
                    value={transactionType}
                    onChange={(e) => setTransactionType(e.target.value)}
                >
                    <option value="">All</option>
                    <option value="credit">Credit</option>
                    <option value="debit">Debit</option>
                </select>
                <button className="btn btn-clear" onClick={handleClearFilters}>
                    Clear Filters
                </button>
            </div>

            {/* Transactions Table */}
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
                    {filteredTransactions.map(transaction => (
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