import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './AddTransaction.css';

const AddTransaction = () => {
    const [clients, setClients] = useState([]);
    const [accounts, setAccounts] = useState([]); // State for accounts
    const [selectedClientId, setSelectedClientId] = useState(''); // Store client_id
    const [date, setDate] = useState(''); // Date in 'YYYY-MM-DD' format
    const [time, setTime] = useState(''); // Time in 'HH:MM' format
    const [description, setDescription] = useState('');
    const [amount, setAmount] = useState(''); 
    const [transactionType, setTransactionType] = useState('credit'); 
    const [selectedAccount, setSelectedAccount] = useState(''); // Store selected account
    const navigate = useNavigate();

    // Fetch clients and set current date and time
    useEffect(() => {
        const fetchClients = async () => {
            try {
                const response = await axios.get('http://localhost:3000/accounts/getClients');
                setClients(response.data);

                // Extract unique accounts from clients
                const uniqueAccounts = [...new Set(response.data.map(client => client.account))];
                setAccounts(uniqueAccounts.map((account, index) => ({ id: index + 1, name: account })));
            } catch (err) {
                console.error('Error fetching clients:', err);
            }
        };

        // Set current date and time
        const now = new Date();
        const currentDate = now.toISOString().split('T')[0]; // Format: 'YYYY-MM-DD'
        const currentTime = now.toTimeString().split(' ')[0].slice(0, 5); // Format: 'HH:MM'

        setDate(currentDate);
        setTime(currentTime);

        fetchClients();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Combine date and time into a single DATETIME value
        const dateTime = `${date}T${time}:00`; // Format: 'YYYY-MM-DDTHH:MM:SS'

        // Ensure client ID is correctly matched (typecasting if necessary)
        const selectedClient = clients.find(client => String(client.id) === selectedClientId); 
    
        // Prepare transaction data
        const transactionData = {
            client_id: selectedClientId, 
            name: selectedClient ? selectedClient.name : '', // If client is found, include name
            date: dateTime, // Use combined date and time
            description: description.trim(),
            transaction_type: transactionType,
            amount: parseFloat(amount),
            account: selectedAccount.trim(), // Use selected account
        };
    
        // Debugging: log transaction data before sending
        console.log('Transaction Data:', transactionData);
    
        try {
            const response = await axios.post('http://localhost:3000/transactions/add', transactionData);
            console.log('Transaction added successfully:', response.data);
    
            // Navigate after successful submission
            navigate('/dashboard/transactions');
        } catch (err) {
            console.error('Error adding transaction:', err.response?.data || err.message);
        }
    };
    
    return (
        <div className="add-transaction-container">
            <h2>Add Transaction</h2>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>Client Name</label>
                    <select 
                        value={selectedClientId} 
                        onChange={(e) => setSelectedClientId(e.target.value)} 
                        required
                    >
                        <option value="">Select Client</option>
                        {clients.map((client) => (
                            <option key={client.id} value={client.id}>
                                {client.name}
                            </option>
                        ))}
                    </select>
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
                    <label>Time</label>
                    <input 
                        type="time" 
                        value={time} 
                        onChange={(e) => setTime(e.target.value)} 
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
                     {/* Conditional text based on transaction type */}
                     <p className="account-info">
                        {transactionType === 'credit' 
                            ? '(Amount Coming In)' 
                            : '(Amount Going Out From)'}
                    </p>
                    <label>Account</label>
                    <select 
                        value={selectedAccount} 
                        onChange={(e) => setSelectedAccount(e.target.value)} 
                        required
                    >
                        <option value="">Select Account</option>
                        {clients.map((client) => (
                            <option key={client.id} value={client.name}>
                                {client.name}
                            </option>
                        ))}
                    </select>
                   
                </div>

                <button type="submit" className="submit-btn">Add Transaction</button>
            </form>
        </div>
    );
};

export default AddTransaction;