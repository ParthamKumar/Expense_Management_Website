import React, { useEffect, useState } from 'react';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import { Trash2 } from 'lucide-react';
import 'react-datepicker/dist/react-datepicker.css';
import './AddBill.css'; // Reuse existing CSS

const EditBillForm = ({ bill, onClose, onUpdate }) => {
  const [clients, setClients] = useState([]);
  const [products, setProducts] = useState([]);
  const [clientId, setClientId] = useState(bill.client_id);
  const [items, setItems] = useState([]);
  const [invoiceDate, setInvoiceDate] = useState(new Date(bill.invoice_date));
  const [dueDate, setDueDate] = useState(new Date(bill.due_date));

  useEffect(() => {
    axios.get("http://localhost:3000/accounts/getClients").then(res => setClients(res.data));
    axios.get("http://localhost:3000/products/getProducts").then(res => setProducts(res.data));

    const formattedItems = bill.items.map(item => ({
      item_id: item.item_id,
      product: item.product_name,
      description: item.description,
      qty: parseInt(item.qty),
      price: parseFloat(item.price),
      type: item.item_type,
    }));
    setItems(formattedItems);
  }, [bill]);

  const updateItem = (index, key, value) => {
    const updated = [...items];
    updated[index][key] = key === "qty" || key === "price" ? parseFloat(value) || 0 : value;
    setItems(updated);
  };

  const addItem = () => {
    const newItem = {
      product: '',
      description: '',
      qty: 1,
      price: 0,
      type: 'Debit',
    };
    setItems([...items, newItem]);
  };

  const deleteItem = (index) => {
    const updated = [...items];
    updated.splice(index, 1);
    setItems(updated);
  };

  const subtotal = items.reduce((sum, item) => sum + item.qty * item.price, 0);
  const total = subtotal;

  const handleSave = async () => {
    const updatedData = {
      bill_id: bill.bill_id,
      bill_no: bill.bill_no,
      client_id: parseInt(clientId),
      invoice_date: invoiceDate.toISOString().split("T")[0],
      due_date: dueDate.toISOString().split("T")[0],
      total_amount: total,
      items: items.map(i => ({
        product_name: i.product,
        description: i.description,
        qty: i.qty,
        price: i.price,
        type: i.type,
      })),
    };

    try {
      await axios.put(`http://localhost:3000/billing/updateBill/${bill.bill_id}`, updatedData);
      alert("Bill updated successfully.");
      onUpdate(); // Refresh list
      onClose();  // Close edit form
    } catch (err) {
      console.error("Error updating bill:", err);
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
              <p>Proprietor: Naresh Kumar Chawla</p>
              <p>Contact No: 0333731300</p>
              <p>Email: nareshchawla7300@gmail.com</p>
              <p>Address: Site Area Hyderabad</p>
            </div>
          </div>
          <div className="date-fields">
            <p className="bill-no">Bill No: <span>{bill.bill_no}</span></p>
            <div className="date-row">
              <div className="date-group">
                <p>Invoice Date</p>
                <DatePicker
                  selected={invoiceDate}
                  onChange={(date) => setInvoiceDate(date)}
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
          <select value={clientId} onChange={(e) => setClientId(e.target.value)}>
            <option value="">Select Client</option>
            {clients.map(client => (
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
                    <select
                      value={item.type}
                      onChange={(e) => updateItem(index, "type", e.target.value)}
                    >
                      <option value="Debit">Debit</option>
                      <option value="Credit">Credit</option>
                    </select>
                  </td>
                  <td>
                    <select
                      value={item.product}
                      onChange={(e) => updateItem(index, "product", e.target.value)}
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
                      onChange={(e) => updateItem(index, "description", e.target.value)}
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      value={item.qty}
                      onChange={(e) => updateItem(index, "qty", e.target.value)}
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      value={item.price}
                      onChange={(e) => updateItem(index, "price", e.target.value)}
                    />
                  </td>
                  <td>${(item.qty * item.price).toFixed(2)}</td>
                  <td>
                    <Trash2 onClick={() => deleteItem(index)} className="delete-icon" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section className="summary-section">
          <div className="totals-box">
            <p>Total: <strong className="total-amount">${total.toFixed(2)}</strong></p>
          </div>
        </section>
      </div>

      <section className="bill-actions">
        <button className="preview-btn" onClick={onClose}>Cancel</button>
        <button className="save-btn" onClick={handleSave}>💾 Save Changes</button>
      </section>
    </div>
  );
};

export default EditBillForm;
