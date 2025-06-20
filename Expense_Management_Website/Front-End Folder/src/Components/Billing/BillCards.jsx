import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './AddBill.css';
import { Trash2 } from 'lucide-react';

const BillCards = () => {
  const [bills, setBills] = useState([]);
  const [selectedBill, setSelectedBill] = useState(null);
  const [form, setForm] = useState(null);
  const [clients, setClients] = useState([]);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    fetchBills();
    axios.get('http://localhost:3000/accounts/getClients').then(res => setClients(res.data));
    axios.get('http://localhost:3000/products/getProducts').then(res => setProducts(res.data));
  }, []);

  const fetchBills = () => {
    axios.get('http://localhost:3000/billing/allBills')
      .then(response => setBills(response.data))
      .catch(error => console.error('Failed to load bills:', error));
  };

  const handleEditClick = (bill) => {
    setSelectedBill(bill);
    setForm({
      client_id: bill.client_id,
      invoice_date: bill.invoice_date.slice(0, 10),
      due_date: bill.due_date.slice(0, 10),
      items: bill.items.map(item => ({
        ...item,
        qty: parseInt(item.qty),
        price: parseFloat(item.price),
      })),
    });
  };

  const handleInputChange = (e, index, field) => {
    if (field !== undefined) {
      const updatedItems = [...form.items];
      updatedItems[index][field] = field === 'qty' || field === 'price'
        ? Number(e.target.value)
        : e.target.value;
      setForm({ ...form, items: updatedItems });
    } else {
      setForm({ ...form, [e.target.name]: e.target.value });
    }
  };

  const addItem = () => {
    const newItem = {
      product_name: '',
      description: '',
      qty: 1,
      price: 0,
      item_type: 'Debit',
    };
    setForm({ ...form, items: [...form.items, newItem] });
  };

  const deleteItem = (index) => {
    const updatedItems = [...form.items];
    updatedItems.splice(index, 1);
    setForm({ ...form, items: updatedItems });
  };

  const handleDeleteBill = async (billNo) => {
  if (!window.confirm("Are you sure you want to delete this bill and all related records?")) return;
  try {
    await axios.delete(`http://localhost:3000/billing/deletebill/${billNo}`);
    setBills(prev => prev.filter(b => b.bill_no !== billNo));
    alert("Bill and all related records deleted successfully!");
  } catch (err) {
    console.error("Error deleting bill:", err);
    alert("Failed to delete bill. Please check console for more info.");
  }
};


  const handleSave = async () => {
    try {
      const updatedBill = {
        ...form,
        total_amount: form.items.reduce((sum, item) => sum + item.qty * item.price, 0),
        items: form.items.map(item => ({
          product_name: item.product_name,
          description: item.description,
          qty: item.qty,
          price: item.price,
          type: item.item_type,
        })),
      };

      await axios.put(`http://localhost:3000/billing/updateBill/${selectedBill.bill_id}`, updatedBill);

      setBills(prev =>
        prev.map(b =>
          b.bill_id === selectedBill.bill_id ? { ...selectedBill, ...updatedBill } : b
        )
      );

      setSelectedBill(null);
      setForm(null);
    } catch (err) {
      console.error('Error saving bill:', err);
    }
  };

  const total = form?.items.reduce((sum, item) => sum + item.qty * item.price, 0) || 0;

  return (
    <div className="bill-container">
      <div className="scroll-content">
        {selectedBill && form ? (
          <div className="preview-modal">
            <button className="close-preview" onClick={() => setSelectedBill(null)}>✖</button>
            <h2>Edit Bill #{selectedBill.bill_no}</h2>

            <div className="preview-details">
              <div>
                <label>Client</label>
                <select name="client_id" value={form.client_id} onChange={handleInputChange}>
                  <option value="">Select Client</option>
                  {clients.map(client => (
                    <option key={client.id} value={client.id}>{client.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label>Invoice Date</label>
                <input
                  type="date"
                  name="invoice_date"
                  value={form.invoice_date}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <label>Due Date</label>
                <input
                  type="date"
                  name="due_date"
                  value={form.due_date}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div className="items-header">
              <h3>Items</h3>
              <button onClick={addItem}>+ Add Item</button>
            </div>

            <div className="preview-items">
              <table>
                <thead>
                  <tr>
                    <th>Type</th>
                    <th>Product</th>
                    <th>Description</th>
                    <th>Qty</th>
                    <th>Price</th>
                    <th>Total</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {form.items.map((item, i) => (
                    <tr key={i}>
                      <td>
                        <select
                          value={item.item_type}
                          onChange={(e) => handleInputChange(e, i, 'item_type')}
                        >
                          <option value="Debit">Debit</option>
                          <option value="Credit">Credit</option>
                        </select>
                      </td>
                      <td>
                        <select
                          value={item.product_name}
                          onChange={(e) => handleInputChange(e, i, 'product_name')}
                        >
                          <option value="">Select Product</option>
                          {products.map(product => (
                            <option key={product.id} value={product.name}>{product.name}</option>
                          ))}
                        </select>
                      </td>
                      <td>
                        <input
                          value={item.description}
                          onChange={(e) => handleInputChange(e, i, 'description')}
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          value={item.qty}
                          onChange={(e) => handleInputChange(e, i, 'qty')}
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          value={item.price}
                          onChange={(e) => handleInputChange(e, i, 'price')}
                        />
                      </td>
                      <td>${(item.qty * item.price).toFixed(2)}</td>
                      <td><Trash2 onClick={() => deleteItem(i)} className="delete-icon" /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="preview-summary">
              <div className="summary-row total-row">
                <span className="summary-label">Total Amount:</span>
                <span className="summary-value">${total.toFixed(2)}</span>
              </div>
            </div>

            <div className="bill-actions">
              <button className="save-btn" onClick={handleSave}>💾 Save</button>
              <button className="preview-btn" onClick={() => setSelectedBill(null)}>Cancel</button>
            </div>
          </div>
        ) : (
          bills.map((bill) => (
            <div
              key={bill.bill_id}
              className="preview-modal"
              style={{ marginBottom: '40px', position: 'relative' }}
              onClick={() => handleEditClick(bill)}
            >
              <div style={{ position: 'absolute', top: 10, right: 10 }}>
                <Trash2
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteBill(bill.bill_no);
                  }}
                  color="red"
                  size={18}
                  style={{ cursor: 'pointer' }}
                  title="Delete Bill"
                />
              </div>
              <div className="preview-header">
                <div className="preview-company-details">
                  <img src="/Images/logosticker.png" alt="Company Logo" className="preview-logo" />
                  <div className="preview-company-info">
                    <h2>CHAWLA BROKER</h2>
                    <p>Proprietor: Naresh Kumar Chawla</p>
                    <p>Contact: 0333731300</p>
                    <p>Email: nareshchawla7300@gmail.com</p>
                    <p>Address: Site Area Hyderabad</p>
                  </div>
                </div>
                <div className="preview-invoice-title">
                  <h1>INVOICE</h1>
                  <p className="invoice-number">#{bill.bill_no}</p>
                </div>
              </div>

              <div className="preview-details">
                <div className="preview-bill-to">
                  <h3>Bill To:</h3>
                  <div className="client-info">
                    <p className="client-name">{bill.client_name}</p>
                  </div>
                </div>
                <div className="preview-dates">
                  <p><strong>Invoice Date:</strong> {new Date(bill.invoice_date).toLocaleDateString("en-GB")}</p>
                  <p><strong>Due Date:</strong> {new Date(bill.due_date).toLocaleDateString("en-GB")}</p>
                </div>
              </div>

              <div className="preview-items">
                <table>
                  <thead>
                    <tr>
                      <th>Type</th>
                      <th>Product</th>
                      <th>Description</th>
                      <th>Qty</th>
                      <th>Unit Price</th>
                      <th>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bill.items.map((item) => (
                      <tr key={item.item_id}>
                        <td><span className={`type-badge ${item.item_type.toLowerCase()}`}>{item.item_type}</span></td>
                        <td className="product-name">{item.product_name}</td>
                        <td className="description">{item.description}</td>
                        <td className="quantity">{item.qty}</td>
                        <td className="unit-price">${parseFloat(item.price).toFixed(2)}</td>
                        <td className="item-total">${(item.qty * parseFloat(item.price)).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="preview-summary">
                <div className="summary-row total-row">
                  <span className="summary-label">Total Amount:</span>
                  <span className="summary-value">${parseFloat(bill.total_amount).toFixed(2)}</span>
                </div>
              </div>

              <div className="preview-footer">
                <div className="payment-terms">
                  <h4>Payment Terms:</h4>
                  <p>Payment is due within 7 days of invoice date.</p>
                </div>
                <div className="thank-you">
                  <p><strong>Thank you for your business!</strong></p>
                  <p>For any questions regarding this invoice, please contact us.</p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default BillCards;
