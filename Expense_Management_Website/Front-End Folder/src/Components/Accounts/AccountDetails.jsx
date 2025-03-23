import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import './AccountDetails.css'; // Ensure CSS file is imported

const AccountDetails = () => {
    const { id } = useParams(); // Get the client id from the URL
    const [client, setClient] = useState(null);
    const [transactions, setTransactions] = useState([]); // State for all transactions
    const [filteredTransactions, setFilteredTransactions] = useState([]); // State for filtered transactions
    const [loadingClient, setLoadingClient] = useState(true);
    const [loadingTransactions, setLoadingTransactions] = useState(true);
    const [clientError, setClientError] = useState(null);
    const [transactionsError, setTransactionsError] = useState(null);

    // State for filters
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [description, setDescription] = useState('');
    const [transactionType, setTransactionType] = useState('');

    useEffect(() => {
        // Fetch client details
        const fetchClientDetails = async () => {
            try {
                const clientResponse = await axios.get(`http://localhost:3000/accounts/getClient/${id}`);
                setClient(clientResponse.data);
            } catch (err) {
                setClientError('Error fetching client details');
            } finally {
                setLoadingClient(false);
            }
        };

        fetchClientDetails();
    }, [id]);

    // Fetch client transactions
    useEffect(() => {
        const fetchClientTransactions = async () => {
            try {
                const transactionsResponse = await axios.get(`http://localhost:3000/accounts/getClientTransactions/${id}`);
                setTransactions(transactionsResponse.data);
                setFilteredTransactions(transactionsResponse.data); // Initialize filtered transactions
            } catch (err) {
                setTransactionsError('Error fetching client transactions');
            } finally {
                setLoadingTransactions(false);
            }
        };

        fetchClientTransactions();
    }, [id]);

    // Filter transactions on the spot
    useEffect(() => {
        let filtered = transactions;

        // Filter by date range
        if (startDate && endDate) {
            filtered = filtered.filter(transaction => {
                const transactionDate = new Date(transaction.date);
                const start = new Date(startDate);
                const end = new Date(endDate);
                return transactionDate >= start && transactionDate <= end;
            });
        }

        // Filter by description
        if (description) {
            filtered = filtered.filter(transaction =>
                transaction.description.toLowerCase().includes(description.toLowerCase())
            );
        }

        // Filter by transaction type
        if (transactionType) {
            filtered = filtered.filter(transaction =>
                transaction.transaction_type === transactionType
            );
        }

        setFilteredTransactions(filtered);
    }, [startDate, endDate, description, transactionType, transactions]);

    // Clear all filters
    const handleClearFilters = () => {
        setStartDate('');
        setEndDate('');
        setDescription('');
        setTransactionType('');
    };

    const handleTransactionClick = (transactionId) => {
        console.log('Transaction clicked:', transactionId);
        // Implement any desired logic when a transaction row is clicked
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString();
    };

    if (loadingClient && loadingTransactions) {
        return <div>Loading...</div>;
    }

    return (
        <div className="account-details-container">
            <h2>Account Details</h2>
            
            {clientError && <p>{clientError}</p>}
            {!loadingClient && client ? (
                <div className="client-info">
                    <p><strong>Name:</strong> {client.name}</p>
                    <p><strong>Email:</strong> {client.email}</p>
                    <p><strong>Contact:</strong> {client.contact}</p>
                    <p><strong>Address:</strong> {client.address}</p>
                    <p><strong>Description:</strong> {client.description ? client.description : "No description available"}</p>
                </div>
            ) : (
                <p>No client details found.</p>
            )}
    
            <h3>Transactions</h3>

            {/* Search Fields */}
            <div className="search-fields">
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
                <button className="btn-clear" onClick={handleClearFilters}>
                    Clear Filters
                </button>
            </div>
            
            {transactionsError && <p>{transactionsError}</p>}
            {!loadingTransactions && filteredTransactions.length === 0 ? (
                <p>No transactions found for this client.</p>
            ) : (
                <div className="transactions-table-container">
                    <table className="transactions-table">
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Description</th>
                                <th>Credit (INR)</th>
                                <th>Debit (INR)</th>
                                <th>Account</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredTransactions.map((transaction) => (
                                <tr key={transaction.transaction_id} onClick={() => handleTransactionClick(transaction.transaction_id)}>
                                    <td>{formatDate(transaction.date)}</td>
                                    <td>{transaction.description ? transaction.description : "No description"}</td>
                                    <td className="credit">
                                        {transaction.transaction_type === 'credit' ? `₹${(transaction.amount).toLocaleString()}` : '-'}
                                    </td>
                                    <td className="debit">
                                        {transaction.transaction_type === 'debit' ? `₹${(transaction.amount).toLocaleString()}` : '-'}
                                    </td>
                                    <td>{transaction.account}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default AccountDetails;