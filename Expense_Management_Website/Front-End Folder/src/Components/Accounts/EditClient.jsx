import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import './EditClient.css'

const EditClient = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [clientData, setClientData] = useState({
    name: "",
    email: "",
    contact: "",
    address: "",
    description: ""
  });

  useEffect(() => {
    const fetchClient = async () => {
      try {
        const res = await axios.get(`http://localhost:3000/accounts/getClient/${id}`);
        setClientData(res.data);
      } catch (err) {
        alert("Failed to fetch client details");
      }
    };
    fetchClient();
  }, [id]);

  const handleChange = (e) => {
    setClientData({ ...clientData, [e.target.name]: e.target.value });
  };

const handleSubmit = async (e) => {
  e.preventDefault();
  try {
    await axios.put(`http://localhost:3000/accounts/updateClient/${id}`, clientData);
    alert("Client updated successfully!");
    navigate(`/dashboard/accounts/details/${id}`);
  } catch (err) {
    alert("Failed to update client");
  }
};

  return (
    <div className="edit-client-form">
      <h2>Edit Client</h2>
      <form onSubmit={handleSubmit}>
        <input type="text" name="name" value={clientData.name} onChange={handleChange} placeholder="Name" required />
        <input type="email" name="email" value={clientData.email} onChange={handleChange} placeholder="Email" />
        <input type="text" name="contact" value={clientData.contact} onChange={handleChange} placeholder="Contact" />
        <input type="text" name="address" value={clientData.address} onChange={handleChange} placeholder="Address" />
        <textarea name="description" value={clientData.description} onChange={handleChange} placeholder="Description"></textarea>
        <button type="submit">Update Client</button>
      </form>
    </div>
  );
};

export default EditClient;
