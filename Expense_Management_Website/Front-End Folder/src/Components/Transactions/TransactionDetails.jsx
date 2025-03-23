import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './TransactionDetails.css'; // Import CSS

const TransactionDetails = () => {
    const { id } = useParams();
    const [transaction, setTransaction] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    // Fetch transaction details from the API
    useEffect(() => {
        const fetchTransactionDetails = async () => {
            try {
                const response = await axios.get(`http://localhost:3000/transactions/gettransaction/${id}`);
                setTransaction(response.data);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching transaction details:', error);
                setError('Failed to fetch transaction details');
                setLoading(false);
            }
        };

        fetchTransactionDetails();
    }, [id]);

    // Function to handle deleting the transaction
    const handleDelete = async () => {
        const confirmDelete = window.confirm('Are you sure you want to delete this transaction?');
        if (confirmDelete) {
            try {
                await axios.delete(`http://localhost:3000/transactions/deletetransaction/${id}`);
                alert('Transaction deleted successfully!');
                navigate('/dashboard/transactions'); // Redirect to transactions list
            } catch (error) {
                console.error('Error deleting transaction:', error);
                alert('Failed to delete transaction');
            }
        }
    };

    // Function to handle editing the transaction
    const handleEdit = () => {
        navigate(`/dashboard/transactions/edittransaction/${id}`); // Navigate to edit page
    };

    // Function to format the date to 'DD MMM YYYY' format
    const formatDate = (dateString) => {
        const options = { day: '2-digit', month: 'short', year: 'numeric' };
        const date = new Date(dateString);
        return date.toLocaleDateString('en-GB', options);
    };

    if (loading) {
        return <div className="loading">Loading...</div>;
    }

    if (error) {
        return <div className="error">{error}</div>;
    }

    return (
        <div className="page-container">
            <div className="transaction-details-container">
                <h2>Transaction Details</h2>
                {transaction && (
                    <div className="transaction-details">
                        <p><strong>Name:</strong> {transaction.name}</p>
                        <p><strong>Date:</strong> {formatDate(transaction.date)}</p>
                        <p><strong>Description:</strong> {transaction.description}</p>
                        <p><strong>Type:</strong> {transaction.transaction_type}</p>
                        <p><strong>Amount:</strong> ₹{transaction.amount.toLocaleString()}</p>
                        <p><strong>Account:</strong> {transaction.account}</p>
                    </div>
                )}
            </div>

            {/* Buttons placed at the bottom of the page */}
            <div className="button-group">
                <button className="btn btn-edit" onClick={handleEdit}>
                    Edit Transaction
                </button>
                <button className="btn btn-delete" onClick={handleDelete}>
                    Delete Transaction
                </button>
                <button className="btn btn-back" onClick={() => navigate('/dashboard/transactions')}>
                    Back to Transactions
                </button>
            </div>
        </div>
    );
};

export default TransactionDetails;