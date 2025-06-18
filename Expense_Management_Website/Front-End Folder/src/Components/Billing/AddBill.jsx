import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './AddBill.css';
import { Trash2 } from 'lucide-react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';


const AddBill = () => {
    const [billNo, setBillNo] = useState('');

  const [clients, setClients] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedClient, setSelectedClient] = useState('');
  const [items, setItems] = useState([
    {
      product: '',
      description: '',
      qty: 1,
      price: 0,
      type: 'Debit'
    }
  ]);
  const [showPreview, setShowPreview] = useState(false);
  const [invoiceDate, setInvoiceDate] = useState(new Date());
  const [dueDate, setDueDate] = useState(new Date());

 useEffect(() => {
  const fetchData = async () => {
    try {
      const [clientRes, productRes, billNoRes] = await Promise.all([
        axios.get('http://localhost:3000/accounts/getClients'),
        axios.get('http://localhost:3000/products/getProducts'),
        axios.get('http://localhost:3000/billing/nextBillNo')
      ]);

      setClients(clientRes.data);
      setProducts(productRes.data);
      setBillNo(billNoRes.data.billNo);
      console.log(billNo)
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };
  fetchData();
}, []);


  const addItem = () => {
    const newItem = {
      product: '',
      description: '',
      qty: 1,
      price: 0,
      type: items.length === 0 ? 'Debit' : 'Credit'
    };
    setItems([...items, newItem]);
  };

  const deleteItem = (index) => {
    const updated = [...items];
    updated.splice(index, 1);
    setItems(updated);
  };

  const updateItem = (index, key, value) => {
    const updated = [...items];
    updated[index][key] = key === 'qty' || key === 'price' ? parseInt(value) || 0 : value;
    setItems(updated);
  };

  const subtotal = items.reduce((sum, item) => sum + item.qty * item.price, 0);
  const total = subtotal;

  const saveDraft = async () => {
    try {
      const payload = {
        clientId: selectedClient,
        items: items,
        invoiceDate: invoiceDate.toISOString(),
        dueDate: dueDate.toISOString(),
        totalAmount: total
      };
      // console.log(payload)
      


      const response = await axios.post('http://localhost:3000/billing/addBill', payload);

      if (response.status === 200 || response.status === 201) {
        alert('Bill saved successfully!');
        setSelectedClient('');
        setItems([{ product: '', description: '', qty: 1, price: 0, type: 'Debit' }]);
        setInvoiceDate(new Date());
        setDueDate(new Date());
      } else {
        alert('Failed to save bill.');
      }
    } catch (error) {
      console.error('Error saving bill:', error);
      alert('Error saving bill.');
    }
  };

  return (
    <div className="bill-container">
      <div className="scroll-content">
        <header className="bill-header">
          <div className="company-details">
            <img src="/Images/logosticker.png" alt="Company Logo" className="company-logo" />
            <div>
              <h2>CHAWLA BROKER</h2>
              <p>Propritor Naresh Kumar Chawla</p>
              <p>Contact No: 0333731300</p>
              <p>Email: nareshchawla7300@gmail.com</p>
              <p>Address: Site Area Hyderabad</p>
            </div>
          </div>

          <div className="date-fields">
            {/* res.json({ billNo: `INV-2025-${String(nextId).padStart(3, '0')}` }); */}
        <p className="bill-no">Bill No: <span>{billNo}</span></p>
            <div className="date-row">
              <div className="date-group">
                <p>Issue Date</p>
                <DatePicker
                  selected={invoiceDate}
                  onChange={(date) => setInvoiceDate(date)}
                  placeholderText="Invoice Date"
                  dateFormat="dd MMM yyyy"
                  showMonthDropdown
                  showYearDropdown
                  dropdownMode="select"
                />
              </div>
              <div className="date-group">
                <p>Due Date</p>
                <DatePicker
                  selected={dueDate}
                  onChange={(date) => setDueDate(date)}
                  placeholderText="Due Date"
                  dateFormat="dd MMM yyyy"
                  showMonthDropdown
                  showYearDropdown
                  dropdownMode="select"
                />
              </div>
            </div>
          </div>
        </header>

        <section className="bill-to">
          <h3>Bill To:</h3>
          <select
            className="client-dropdown"
            value={selectedClient}
            onChange={(e) => setSelectedClient(e.target.value)}
          >
            <option value="">-- Select Client --</option>
            {clients.map((client) => (
              <option key={client.id} value={client.id}>{client.name}</option>
            ))}
          </select>
        </section>

        <section className="items-section">
          <div className="items-header">
            <h3>Items</h3>
            <button onClick={addItem}>+ Add Item</button>
          </div>
          <table className="items-table">
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
              {items.map((item, index) => (
                <tr key={index}>
                  <td>
                    <select value={item.type} onChange={(e) => updateItem(index, 'type', e.target.value)}>
                      <option value="Debit">Debit</option>
                      <option value="Credit">Credit</option>
                    </select>
                  </td>
                  <td>
                    <select value={item.product} onChange={(e) => updateItem(index, 'product', e.target.value)}>
                      <option value="">-- Select Product --</option>
                      {products.map((product) => (
                        <option key={product.id} value={product.name}>{product.name}</option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <input
                      value={item.description}
                      onChange={(e) => updateItem(index, 'description', e.target.value)}
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      value={item.qty}
                      onChange={(e) => updateItem(index, 'qty', e.target.value)}
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      value={item.price}
                      onChange={(e) => updateItem(index, 'price', e.target.value)}
                    />
                  </td>
                  <td>₹{(item.qty * item.price).toFixed(2)}</td>
                  <td><Trash2 onClick={() => deleteItem(index)} className="delete-icon" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section className="summary-section">
          <div className="totals-box">
            <p>Total: <strong className="total-amount">₹{total.toFixed(2)}</strong></p>
          </div>
        </section>
      </div>

      <section className="bill-actions">
        <button className="download-btn">⬇ Download</button>
        <button className="preview-btn" onClick={() => setShowPreview(true)}>👁 Preview</button>
        <button className="save-btn" onClick={saveDraft}>💾 Save Draft</button>
      </section>
    </div>
  );
};

export default AddBill;
