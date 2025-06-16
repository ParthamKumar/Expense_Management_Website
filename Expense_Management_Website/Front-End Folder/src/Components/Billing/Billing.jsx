import React from 'react';
import './Billing.css';
import { useNavigate } from 'react-router-dom';

const Billing = () => {
  const navigate = useNavigate();

  const handleAddBill = () => {
    navigate('/dashboard/billing/addbill');
  };

  return (
    <div className="billing-container">
      <h2>Billing Section</h2>
      <button className="add-bill-button" onClick={handleAddBill}>
        Add Bill
      </button>
    </div>
  );
};

export default Billing;
