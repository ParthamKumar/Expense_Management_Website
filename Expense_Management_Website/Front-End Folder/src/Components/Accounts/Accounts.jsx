import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Accounts.css';

const Accounts = () => {
    const [clients, setClients] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchClients = async () => {
            try {
                const response = await axios.get('http://localhost:3000/accounts/getClients');
                const sortedClients = response.data.sort((a, b) => a.name.localeCompare(b.name)); // Alphabetical sort
                setClients(sortedClients);
                setLoading(false);
            } catch (err) {
                setError('Failed to load clients');
                setLoading(false);
            }
        };
        fetchClients();
    }, []);

    const handleClientClick = (id) => {
        navigate(`/dashboard/accounts/details/${id}`);
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

    const filteredClients = clients.filter(client =>
        client.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <p>Loading clients...</p>;
    if (error) return <p>{error}</p>;

    return (
        <div className="accounts-container">
            <div className="header">
                <h4>Accounts</h4>
                <button className="btn btn-primary add-client-btn" onClick={handleAddClient}>Add Account</button>
            </div>

            <input
                type="text"
                placeholder="Search clients..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-box"
            />

            <div className="clients-list">
                {filteredClients.map(client => (
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
