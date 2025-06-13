import React, { useState, useEffect } from 'react';
import './BuySellForm.css';

const BuySellForm = ({ type, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    productName: '',
    quantity: '',
    rate: '',
    unit: 'kg',
    contributors: [{ name: '', description: '', amount: '', type: 'credit' }],
    buyerName: '',
    buyerDescription: '',
    buyerType: 'debit',
    totalAmount: 0,
    contributorsSum: 0,
    buyingAmount: 0
  });

  useEffect(() => {
    const buyingAmount = (parseFloat(formData.quantity) || 0) * (parseFloat(formData.rate) || 0);

    const contributorsSum = formData.contributors.reduce((sum, c) => {
      const amount = parseFloat(c.amount) || 0;
      return c.type === 'debit' ? sum + amount : sum - amount;
    }, 0);

    const total = buyingAmount + contributorsSum;

    setFormData(prev => ({
      ...prev,
      contributorsSum: contributorsSum.toFixed(2),
      buyingAmount: buyingAmount.toFixed(2),
      totalAmount: total.toFixed(2)
    }));
  }, [formData.quantity, formData.rate, formData.contributors]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleContributorChange = (index, field, value) => {
    const newContributors = [...formData.contributors];
    newContributors[index][field] = value;
    setFormData(prev => ({ ...prev, contributors: newContributors }));
  };

  const addContributor = () => {
    setFormData(prev => ({
      ...prev,
      contributors: [...prev.contributors, { name: '', description: '', amount: '', type: 'credit' }]
    }));
  };

  const removeContributor = (index) => {
    const updated = [...formData.contributors];
    updated.splice(index, 1);
    setFormData(prev => ({ ...prev, contributors: updated }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
    onClose();
  };

  return (
    <div className="form-overlay">
      <div className={`buy-sell-form ${type}`}>
        <div className="form-header">
          <h2>{type.toUpperCase()} FORM</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-grid">

            {/* SECTION 1: Buying */}
            <div className="form-section">
              <h3>From Whom You Are Buying</h3>
              <div className="input-group">
                <label>Date*</label>
                <input type="date" name="date" value={formData.date} onChange={handleChange} required />
              </div>
              <div className="input-group">
                <label>Product Name*</label>
                <input type="text" name="productName" value={formData.productName} onChange={handleChange} required />
              </div>
              <div className="input-group">
                <label>Quantity*</label>
                <input type="number" name="quantity" value={formData.quantity} onChange={handleChange} required step="0.01" />
              </div>
              <div className="input-group">
                <label>Rate per Unit*</label>
                <input type="number" name="rate" value={formData.rate} onChange={handleChange} required step="0.01" />
              </div>
              <div className="input-group">
                <label>Unit*</label>
                <select name="unit" value={formData.unit} onChange={handleChange}>
                  <option value="40kg">40KG</option>
                  <option value="kg">KG</option>
                  <option value="bag">Bag</option>
                  <option value="litre">Litre</option>
                </select>
              </div>
              <div className="input-group">
                <label>Buying Amount</label>
                <input type="number" value={formData.buyingAmount} readOnly className="read-only" />
              </div>
            </div>

            {/* SECTION 2: Contributors */}
            <div className="form-section">
              <h3>Contributors (Transport, Labor, etc.)</h3>
              {formData.contributors.map((c, i) => (
                <div key={i} className="contributor-row">
                  <input
                    type="text"
                    placeholder="Client Name"
                    value={c.name}
                    onChange={e => handleContributorChange(i, 'name', e.target.value)}
                    required
                  />
                  <input
                    type="text"
                    placeholder="Description"
                    value={c.description}
                    onChange={e => handleContributorChange(i, 'description', e.target.value)}
                    required
                  />
                  <input
                    type="number"
                    placeholder="Amount"
                    value={c.amount}
                    onChange={e => handleContributorChange(i, 'amount', e.target.value)}
                    required
                    step="0.01"
                  />
                  <select value={c.type} onChange={e => handleContributorChange(i, 'type', e.target.value)}>
                    <option value="credit">Credit</option>
                    <option value="debit">Debit</option>
                  </select>
                  {formData.contributors.length > 1 && (
                    <button type="button" onClick={() => removeContributor(i)}>Remove</button>
                  )}
                </div>
              ))}
              <button type="button" onClick={addContributor}>+ Add Contributor</button>

              <div className="input-group">
                <label>Contributors Total</label>
                <input type="number" value={formData.contributorsSum} readOnly className="read-only" />
              </div>
            </div>

            {/* SECTION 3: Selling */}
            <div className="form-section">
              <h3>To Whom You Are Selling</h3>
              <div className="input-group">
                <label>Buyer Name*</label>
                <input type="text" name="buyerName" value={formData.buyerName} onChange={handleChange} required />
              </div>
              <div className="input-group">
                <label>Buyer Description</label>
                <input type="text" name="buyerDescription" value={formData.buyerDescription} onChange={handleChange} />
              </div>
              <div className="input-group">
                <label>Buyer Type</label>
                <select name="buyerType" value={formData.buyerType} onChange={handleChange}>
                  <option value="debit">Debit</option>
                  <option value="credit">Credit</option>
                </select>
              </div>
              <div className="input-group">
                <label>Grand Total</label>
                <input type="number" value={formData.totalAmount} readOnly className="read-only" />
              </div>
            </div>

          </div>

          <div className="form-actions">
            <button type="button" className="btn cancel" onClick={onClose}>Cancel</button>
            <button type="submit" className={`btn submit ${type}`}>Confirm {type.toUpperCase()}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BuySellForm;
