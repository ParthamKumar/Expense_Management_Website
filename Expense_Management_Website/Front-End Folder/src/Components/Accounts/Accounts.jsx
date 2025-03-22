import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Accounts.css';

const Accounts = () => {
    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(true); // Loading state
    const [error, setError] = useState(null); // Error state
    const navigate = useNavigate();

    // Fetch clients data from backend API
    useEffect(() => {
        const fetchClients = async () => {
            try {
                const response = await axios.get('http://localhost:3000/accounts/getClients');
                setClients(response.data);
                setLoading(false);
            } catch (err) {
                setError('Failed to load clients');
                setLoading(false);
            }
        };
        fetchClients();
    }, []);

    const handleClientClick = (id) => {
        navigate(`/dashboard/accounts/details/${id}`); // Navigate to AccountDetails component with client id
    };

    const handleAddClient = () => {
        navigate('/dashboard/accounts/addAccount');
    };

    const handleLogout = () => {
        axios.get('http://localhost:3000/employee/logout')
        .then(result => {
            if (result.data.Status) {
                localStorage.removeItem("valid");
                navigate('/');
            }
        }).catch(err => console.log(err));
    };

    if (loading) {
        return <p>Loading clients...</p>;
    }

    if (error) {
        return <p>{error}</p>;
    }

    return (
        <div className="accounts-container">
            <div className="header">
                <h4>Accounts</h4>
                <button className="btn btn-primary add-client-btn" onClick={handleAddClient}>Add Account</button>
            </div>
            <div className="clients-list">
                {clients.map(client => (
                    <div className="client-card" key={client.id} onClick={() => handleClientClick(client.id)}>
                        <h5>{client.name}</h5>
                        <p>Email: {client.email}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Accounts;
