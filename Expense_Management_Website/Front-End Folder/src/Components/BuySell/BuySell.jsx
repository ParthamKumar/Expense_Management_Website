import React, { useState, useEffect } from 'react';
import axios from 'axios';
import BuySellForm from './BuySellForm';
import './BuySell.css';

const BuySell = () => {
  const [showForm, setShowForm] = useState(false);
  const [formType, setFormType] = useState('buy');
  const [combinedTransactions, setCombinedTransactions] = useState([]);
  const [editData, setEditData] = useState(null);

  useEffect(() => {
    loadTransactions();
  }, []);

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    const day = String(date.getDate()).padStart(2, '0');
    const month = date.toLocaleString('en-GB', { month: 'long' });
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const loadTransactions = async () => {
    try {
      const res = await axios.get('http://localhost:3000/buysell/gettransactions');
      const transactions = res.data;
      const grouped = {};

      transactions.forEach(tx => {
        if (tx.transaction_type === 'buy') {
          grouped[tx.id] = { buy: tx };
        } else if (tx.transaction_type === 'sell') {
          const match = Object.values(grouped).find(
            g => g.buy &&
              g.buy.buyer_id === tx.party_id &&
              g.buy.date === tx.date
          );
          if (match) match.sell = tx;
          else grouped[`sell-${tx.id}`] = { sell: tx };
        }
      });

      setCombinedTransactions(Object.values(grouped));
    } catch (err) {
      console.error('Error fetching transactions:', err);
    }
  };

  const handleAction = (type) => {
    setFormType(type);
    setEditData(null);
    setShowForm(true);
  };

  const handleEdit = (transaction, type) => {
    setFormType(type);
    setEditData(transaction);
    setShowForm(true);
  };

  const handleFormSubmit = () => {
    setShowForm(false);
    setEditData(null);
    loadTransactions();
  };

  const handleDeleteTransaction = async (buyTransactionId) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this transaction?');
    if (!confirmDelete) return;

    try {
      await axios.delete(`http://localhost:3000/buysell/deleteBuySellTransaction/${buyTransactionId}`);
      alert('Transaction deleted successfully');
      loadTransactions();
    } catch (err) {
      console.error('Failed to delete transaction:', err);
      alert('Failed to delete transaction');
    }
  };

  return (
    <div className="buy-sell-container">
      <div className="action-buttons">
        <button className="btn buy" onClick={() => handleAction('buy')}>New Buy</button>
        <button className="btn sell" onClick={() => handleAction('sell')}>New Sell</button>
      </div>

      {showForm && (
        <BuySellForm
          type={formType}
          onClose={() => {
            setShowForm(false);
            setEditData(null);
          }}
          onSubmit={handleFormSubmit}
          editData={editData}
        />
      )}

      <h3 className="section-heading">All Transactions</h3>

      <div className="transaction-cards-grid">
        {combinedTransactions.map((pair, idx) => {
          const { buy, sell } = pair;
          if (!buy) return null;

          return (
            <div key={idx} className="transaction-card">
              <div className="card-actions">
                <button
                  className="action-btn edit-btn"
                  title="Edit Buy Transaction"
                  onClick={() => handleEdit(buy, 'buy')}
                >
                  ✏️
                </button>
                <button
                  className="action-btn delete-btn"
                  title="Delete Transaction"
                  onClick={() => handleDeleteTransaction(buy.id)}
                >
                  🗑️
                </button>
              </div>

              <div className="card-header">
                <div className="transaction-type">
                  <span className="buy-label">Buying</span>
                </div>
                <div className="date-section">
                  <span className="date-label">DATE</span>
                  <div className="date-value">{formatDate(buy.date)}</div>
                </div>
              </div>

              <div className="party-info">
                <div className="party-row">
                  <span className="label">Party Name:</span>
                  <span className="value">{buy.party_name}</span>
                  <span className={`type-badge type-${buy.party_type}`}>{buy.party_type}</span>
                </div>
              </div>

              <div className="product-section">
                <table className="product-table">
                  <thead>
                    <tr>
                      <th>Product Name</th>
                      <th>Quantity</th>
                      <th>Unit Rate</th>
                      <th>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>{buy.product_name}</td>
                      <td>{buy.quantity}</td>
                      <td>{buy.unit} ₹{buy.rate}</td>
                      <td>₹{Number(buy.buying_amount).toLocaleString()}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="contributors-section">
                <h4 className="section-title">Contributors</h4>
                {buy.contributors && buy.contributors.length > 0 ? (
                  <table className="contributors-table">
                    <thead>
                      <tr>
                        <th>Contributor Name</th>
                        <th>Description</th>
                        <th>Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {buy.contributors.map(con => (
                        <tr key={con.id}>
                          <td>{con.contributor_name}</td>
                          <td>{con.description}</td>
                          <td>₹{Number(con.amount).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p className="no-contributors">No contributors</p>
                )}

                <div className="contributors-total">
                  <span>₹{Number(buy.contributors_sum).toLocaleString()}</span>
                </div>
              </div>

              <div className="grand-total">
                <span className="total-label">Grand Total</span>
                <span className="total-amount">₹{Number(buy.total_amount).toLocaleString()}</span>
              </div>

              {sell && (
                <div className="selling-section">
                  <div className="sell-header">
                    <h4 className="section-title">Selling</h4>
                    <div className="sell-actions">
                      <button
                        className="action-btn edit-btn"
                        title="Edit Sell Transaction"
                        onClick={() => handleEdit(sell, 'sell')}
                      >
                        ✏️
                      </button>
                    </div>
                  </div>
                  <table className="selling-table">
                    <thead>
                      <tr>
                        <th>Party Name</th>
                        <th>Description</th>
                        <th>Type</th>
                        <th>Final Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>{sell.party_name}</td>
                        <td>{sell.party_description}</td>
                        <td>
                          <span className={`type-badge type-${sell.party_type}`}>{sell.party_type}</span>
                        </td>
                        <td>₹{Number(sell.total_amount).toLocaleString()}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default BuySell;