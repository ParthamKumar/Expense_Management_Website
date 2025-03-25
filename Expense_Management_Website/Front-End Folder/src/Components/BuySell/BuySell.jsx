import React, { useState } from 'react';
import BuySellForm from './BuySellForm';
import './BuySell.css';

const BuySell = () => {
  const [showForm, setShowForm] = useState(false);
  const [formType, setFormType] = useState('buy');
  const [transactions, setTransactions] = useState([
    { 
      id: 1, 
      type: 'buy', 
      date: '2024-03-20', 
      party: 'ABC Traders',
      broker: 'John Doe',
      truckNo: 'MH-01-AB-1234',
      jins: 'Wheat',
      bags: 100,
      bagsRate: 50,
      perKgBags: 50,
      rate: 2000,
      weight: 5000,
      diffKathoti: 50,
      netWeight: 4950,
      amount: 990000,
      bardanaAmount: 5000,
      totalAmount: 995000,
      kharch: 1500,
      extra: 500,
      netAmount: 996000
    },
    // Add more sample transactions if needed
  ]);

  const handleAction = (type) => {
    setFormType(type);
    setShowForm(true);
  };

  const handleFormSubmit = (formData) => {
    const newTransaction = {
      id: Date.now(),
      ...formData,
      type: formType
    };
    setTransactions([...transactions, newTransaction]);
  };

  return (
    <div className="buy-sell-container">
      <div className="action-tabs">
        <div className="action-buttons">
          <button
            className="new-transaction buy"
            onClick={() => handleAction('buy')}
          >
            New Buy
          </button>
          <button
            className="new-transaction sell"
            onClick={() => handleAction('sell')}
          >
            New Sell
          </button>
        </div>
      </div>

      {showForm && (
        <BuySellForm
          type={formType}
          onClose={() => setShowForm(false)}
          onSubmit={handleFormSubmit}
        />
      )}

      <div className="transaction-history">
        <h3>ALL TRANSACTIONS</h3>
        <div className="history-table">
          <div className="table-header">
            <span>Date</span>
            <span>Type</span>
            <span>Party</span>
            <span>Jins</span>
            <span>Bags</span>
            <span>Rate</span>
            <span>Net Weight</span>
            <span>Total Amount</span>
            <span>Net Amount</span>
          </div>
          {transactions.map((transaction) => (
            <div 
              key={transaction.id}
              className={`table-row ${transaction.type}`}
            >
              <span>{transaction.date}</span>
              <span className="type-indicator">
                {transaction.type.toUpperCase()}
              </span>
              <span>{transaction.party}</span>
              <span>{transaction.jins}</span>
              <span>{transaction.bags}</span>
              <span>₹{transaction.rate}</span>
              <span>{transaction.netWeight}kg</span>
              <span>₹{transaction.totalAmount.toLocaleString()}</span>
              <span className="total">₹{transaction.netAmount.toLocaleString()}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BuySell;