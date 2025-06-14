import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './BuySellForm.css';
import { useNavigate } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';


const BuySellForm = ({ type, onClose, onSubmit }) => {
  const [clients, setClients] = useState([]);
  const [products, setProducts] = useState([]);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    partyName: '',
    partyDescription: '',
    partyType: 'credit',
    productName: '',
    quantity: '',
    rate: '',
    unit: '40kg',
    contributors: [{ name: '', description: '', amount: '', type: 'credit' }],
    buyerName: '',
    buyerDescription: '',
    buyerType: 'debit',
    totalAmount: 0,
    contributorsSum: 0,
    buyingAmount: 0
  });

  useEffect(() => {
    const fetchDropdowns = async () => {
      try {
        const clientRes = await axios.get('http://localhost:3000/accounts/getClients');
        const productRes = await axios.get('http://localhost:3000/products/getProducts');
        setClients(clientRes.data || []);
        setProducts(productRes.data || []);
      } catch (err) {
        console.error('Error fetching clients/products:', err);
      }
    };
    fetchDropdowns();
  }, []);

  useEffect(() => {
    const buyingAmount = (parseFloat(formData.quantity) || 0) * (parseFloat(formData.rate) || 0);
    const contributorsSum = formData.contributors.reduce((sum, c) => {
      const amount = parseFloat(c.amount) || 0;
      return c.type === 'credit' ? sum + amount : sum - amount;
    }, 0);
    const totalAmount = buyingAmount + contributorsSum;

    setFormData(prev => ({
      ...prev,
      buyingAmount,
      contributorsSum,
      totalAmount
    }));
  }, [formData.quantity, formData.rate, formData.contributors]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleContributorChange = (index, field, value) => {
    const updated = [...formData.contributors];
    updated[index][field] = value;
    setFormData(prev => ({ ...prev, contributors: updated }));
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const party = clients.find(c => c.name === formData.partyName);
      const buyer = clients.find(c => c.name === formData.buyerName);
      const product = products.find(p => p.name === formData.productName);

      if (!party || !buyer || !product) {
        alert('Please ensure party, buyer, and product are selected properly.');
        return;
      }

      const payload = {
        transaction_type: type,
        date: formData.date,
        party_id: party.id,
        party_description: formData.partyDescription,
        party_type: formData.partyType,
        product_id: product.id,
        quantity: parseFloat(formData.quantity),
        rate: parseFloat(formData.rate),
        unit: formData.unit,
        buying_amount: parseFloat(formData.buyingAmount),
        contributors_sum: parseFloat(formData.contributorsSum),
        total_amount: parseFloat(formData.totalAmount),
        buyer_id: buyer.id,
        buyer_description: formData.buyerDescription,
        buyer_type: formData.buyerType,
        contributors: formData.contributors.map(c => {
          const contributorClient = clients.find(cl => cl.name === c.name);
          return {
            client_id: contributorClient?.id || null,
            description: c.description,
            amount: parseFloat(c.amount),
            type: c.type
          };
        }).filter(c => c.client_id !== null)
      };

      const res = await axios.post('http://localhost:3000/buysell/addBuySellTransaction', payload);

      alert('Transaction saved successfully!');
      navigate('/dashboard/buysell');
      if (onSubmit) onSubmit(res.data);
    } catch (err) {
      console.error('Error saving transaction:', err);
      alert('Failed to save transaction.');
    }
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
            
            {/* Section 1: Buying Details */}
            <div className="form-section">
              <h3>From Whom You Are Buying</h3>

              <div className="input-group">
                <label>Date*</label>
                <DatePicker
  selected={formData.date ? new Date(formData.date) : null}
  onChange={(date) =>
    setFormData((prev) => ({
      ...prev,
      date: date.toISOString().split('T')[0]  // Saving as "YYYY-MM-DD"
    }))
  }
  dateFormat="dd-MM-yyyy"
  showMonthDropdown
  showYearDropdown
  dropdownMode="select"
  className="custom-datepicker"
  required
/>

              </div>

              <div className="input-group">
                <label>Party Name*</label>
                <select name="partyName" value={formData.partyName} onChange={handleChange} required>
                  <option value="">-- Select Client --</option>
                  {clients.map((c, i) => (
                    <option key={i} value={c.name}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="input-group">
                <label>Party Type</label>
                <select name="partyType" value={formData.partyType} onChange={handleChange}>
                  <option value="debit">Debit</option>
                  <option value="credit">Credit</option>
                </select>
              </div>

              <div className="input-group">
                <label>Party Description</label>
                <input type="text" name="partyDescription" value={formData.partyDescription} onChange={handleChange} />
              </div>

              <div className="input-group">
                <label>Product Name*</label>
                <select name="productName" value={formData.productName} onChange={handleChange} required>
                  <option value="">-- Select Product --</option>
                  {products.map((p, i) => (
                    <option key={i} value={p.name}>{p.name}</option>
                  ))}
                </select>
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

              <div className="summary-box buying">
                <label>Buying Amount</label>
                <input type="number" name="buyingAmount" value={formData.buyingAmount} readOnly />
              </div>
            </div>

            {/* Section 2: Contributors Table */}
            <div className="form-section">
              <h3>Contributors (Transport, Labor, etc.)</h3>
              
              <table className="contributors-table">
                <thead>
                  <tr>
                    <th>Contributor Name</th>
                    <th>Description</th>
                    <th>Amount</th>
                    <th>Type</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {formData.contributors.map((c, i) => (
                    <tr key={i}>
                      <td>
                        <select
                          value={c.name}
                          onChange={e => handleContributorChange(i, 'name', e.target.value)}
                          required
                        >
                          <option value="">-- Select Client --</option>
                          {clients.map((cl, idx) => (
                            <option key={idx} value={cl.name}>{cl.name}</option>
                          ))}
                        </select>
                      </td>
                      <td>
                        <input
                          type="text"
                          placeholder="Description"
                          value={c.description}
                          onChange={e => handleContributorChange(i, 'description', e.target.value)}
                          required
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          placeholder="Amount"
                          value={c.amount}
                          onChange={e => handleContributorChange(i, 'amount', e.target.value)}
                          required
                          step="0.01"
                        />
                      </td>
                      <td>
                        <select 
                          value={c.type} 
                          onChange={e => handleContributorChange(i, 'type', e.target.value)}
                        >
                          <option value="credit">Credit</option>
                          <option value="debit">Debit</option>
                        </select>
                      </td>
                      <td>
                        {formData.contributors.length > 1 && (
                          <button 
                            type="button" 
                            className="remove-btn"
                            onClick={() => removeContributor(i)}
                          >
                            Remove
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              <button type="button" className="add-contributor-btn" onClick={addContributor}>
                + Add Contributor
              </button>

              <div className="summary-box contributors">
                <label>Contributors Total</label>
                <input type="number" name="contributorsSum" value={formData.contributorsSum} readOnly />
              </div>
            </div>

            {/* Section 3: Selling Details */}
            <div className="form-section">
              <h3>To Whom You Are Selling</h3>

              <div className="input-group">
                <label>Buyer Name*</label>
                <select name="buyerName" value={formData.buyerName} onChange={handleChange} required>
                  <option value="">-- Select Client --</option>
                  {clients.map((client, i) => (
                    <option key={i} value={client.name}>{client.name}</option>
                  ))}
                </select>
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

              <div className="summary-box total">
                <label>Grand Total</label>
                <input type="number" name="totalAmount" value={formData.totalAmount} readOnly />
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