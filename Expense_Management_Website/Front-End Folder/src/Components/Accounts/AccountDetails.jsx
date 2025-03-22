import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import './AccountDetails.css'; // Import the CSS file

const AccountDetails = () => {
    const { id } = useParams(); // Get the client id from the URL
    const [client, setClient] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchClientDetails = async () => {
            try {
                const response = await axios.get(`http://localhost:3000/accounts/getClient/${id}`);
                setClient(response.data);
                setLoading(false);
            } catch (err) {
                setError('Error fetching client details');
                setLoading(false);
            }
        };

        fetchClientDetails();
    }, [id]);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>{error}</div>;
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
