import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import './AccountDetails.css'; // Ensure CSS file is imported

const AccountDetails = () => {
    const { id } = useParams(); // Get the client id from the URL
    const [client, setClient] = useState(null);
    const [transactions, setTransactions] = useState([]); // State for transactions
    const [loadingClient, setLoadingClient] = useState(true);
    const [loadingTransactions, setLoadingTransactions] = useState(true);
    const [clientError, setClientError] = useState(null);
    const [transactionsError, setTransactionsError] = useState(null);

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

        // Fetch client transactions
        const fetchClientTransactions = async () => {
            try {
                const transactionsResponse = await axios.get(`http://localhost:3000/accounts/getClientTransactions/${id}`);
                setTransactions(transactionsResponse.data);
            } catch (err) {
                setTransactionsError('Error fetching client transactions');
            } finally {
                setLoadingTransactions(false);
            }
        };

        fetchClientDetails();
        fetchClientTransactions();
    }, [id]);

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
            
            {transactionsError && <p>{transactionsError}</p>}
            {!loadingTransactions && transactions.length === 0 ? (
                <p>No transactions found for this client.</p>
            ) : (
                <div className="transactions-table-container">
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
                            {transactions.map((transaction) => (
                                <tr key={transaction.transaction_id} onClick={() => handleTransactionClick(transaction.transaction_id)}>
                                    <td>{transaction.name}</td>
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
