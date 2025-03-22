import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Accounts.css'

const Accounts = () => {
    const [clients, setClients] = useState([
        { id: 1, name: 'Client One', email: 'client1@example.com' },
        { id: 2, name: 'Client Two', email: 'client2@example.com' },
        { id: 3, name: 'Client Three', email: 'client3@example.com' },
    ]);
    const navigate = useNavigate();

    const handleClientClick = (id) => {
        navigate(`/dashboard/accounts/details/${id}`); // Navigate to AccountDetails component with client id
    };

    const handleAddClient = () => {
        navigate('/dashboard/accounts/addAccount');
    };

    const handleLogout = () => {
        axios.get('http://localhost:3000/employee/logout')
        .then(result => {
          if(result.data.Status) {
            localStorage.removeItem("valid")
            navigate('/')
          }
        }).catch(err => console.log(err))
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
}

export default Accounts;
