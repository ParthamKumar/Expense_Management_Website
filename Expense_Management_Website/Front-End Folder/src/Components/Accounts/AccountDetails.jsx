import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import './AccountDetails.css'; // Import the CSS file

const AccountDetails = () => {
    const { id } = useParams(); // Get the client id from the URL
    const [client, setClient] = useState(null);

    useEffect(() => {
        // Simulate fetching client data by id
        const fetchClientDetails = () => {
            const clients = [
                { id: 1, name: 'Client One', email: 'client1@example.com', contact: '123-456-7890', address: '123 Street, City' },
                { id: 2, name: 'Client Two', email: 'client2@example.com', contact: '987-654-3210', address: '456 Avenue, City' },
                { id: 3, name: 'Client Three', email: 'client3@example.com', contact: '555-555-5555', address: '789 Boulevard, City' }
            ];
            const selectedClient = clients.find(client => client.id === parseInt(id));
            setClient(selectedClient);
        };

        fetchClientDetails();
    }, [id]);

    if (!client) {
        return <div>Loading...</div>;
    }

    return (
        <div className="account-details-container">
            <h2>Account Details</h2>
            <div className="client-info">
                <p><strong>Name:</strong> {client.name}</p>
                <p><strong>Email:</strong> {client.email}</p>
                <p><strong>Contact:</strong> {client.contact}</p>
                <p><strong>Address:</strong> {client.address}</p>
            </div>
        </div>
    );
}

export default AccountDetails;
