import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import './AddTransaction.css';

const AddTransaction = () => {
    const [clients, setClients] = useState([]);
    const [accounts, setAccounts] = useState([]);
    const [selectedClientId, setSelectedClientId] = useState('');
    const [date, setDate] = useState(new Date());
    const [time, setTime] = useState('');
    const [description, setDescription] = useState('');
    const [amount, setAmount] = useState('');
    const [transactionType, setTransactionType] = useState('credit');
    const [selectedAccount, setSelectedAccount] = useState('--');
    const [customAccount, setCustomAccount] = useState('');
    const [useCustomAccount, setUseCustomAccount] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchClients = async () => {
            try {
                const response = await axios.get('http://localhost:3000/accounts/getClients');
                setClients(response.data);
                const uniqueAccounts = [...new Set(response.data.map(client => client.account))];
                setAccounts(uniqueAccounts.map((account, index) => ({ id: index + 1, name: account })));
            } catch (err) {
                console.error('Error fetching clients:', err);
            }
        };

        const now = new Date();
        const currentTime = now.toTimeString().split(' ')[0].slice(0, 5);
        setTime(currentTime);

        fetchClients();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        // const formattedDate = date.toISOString().split('T')[0];
        const formattedDate = date.getFullYear() + '-' +
    String(date.getMonth() + 1).padStart(2, '0') + '-' +
    String(date.getDate()).padStart(2, '0');

        const dateTime = `${formattedDate}T${time}:00`;
        const selectedClient = clients.find(client => String(client.id) === selectedClientId);

        // const transactionData = {
        //     client_id: selectedClientId,
        //     name: selectedClient ? selectedClient.name : '',
        //     date: dateTime,
        //     description: description.trim(),
        //     transaction_type: transactionType,
        //     amount: parseFloat(amount),
        //     account: useCustomAccount ? customAccount.trim() : selectedAccount,
        // };
        const transactionData = {
    client_id: selectedClientId,
    name: selectedClient ? selectedClient.name : '',
    date: dateTime,
    description: description.trim() === '' ? '--' : description.trim(),
    transaction_type: transactionType,
    amount: parseFloat(amount),
    account: useCustomAccount ? customAccount.trim() : selectedAccount,
};

        try {
            const response = await axios.post('http://localhost:3000/transactions/add', transactionData);
            console.log('Transaction added successfully:', response.data);
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
                    <DatePicker 
    selected={date}
    onChange={(newDate) => setDate(newDate)}
    dateFormat="dd-MM-yyyy"
    showMonthDropdown
    showYearDropdown
    dropdownMode="select"
    className="custom-datepicker"
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
                    <p className="account-info">
                        {transactionType === 'credit' 
                            ? '(Amount Coming In)' 
                            : '(Amount Going Out From)'}
                    </p>
                  

                    {useCustomAccount && (
                        <input
                            type="text"
                            placeholder="Enter custom account"
                            value={customAccount}
                            onChange={(e) => setCustomAccount(e.target.value)}
                            required
                        />
                    )}
                </div>

                <button type="submit" className="submit-btn">Add Transaction</button>
            </form>
        </div>
    );
};

export default AddTransaction;
