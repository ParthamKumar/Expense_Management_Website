import React, { useState } from 'react';
import './AddBill.css';
import { Trash2 } from 'lucide-react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const AddBill = () => {
  const [items, setItems] = useState([
    {
      product: 'Web Development Serv',
      description: 'Custom website development with',
      qty: 1,
      price: 2500,
      type: 'Debit'
    },
    {
      product: 'SEO Optimization',
      description: 'Search engine optimization for 6',
      qty: 6,
      price: 300,
      type: 'Credit'
    }
  ]);

  const [showPreview, setShowPreview] = useState(false);
  const [invoiceDate, setInvoiceDate] = useState(new Date());
  const [dueDate, setDueDate] = useState(new Date());

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
          {/* <div className="invoice-info">
            <strong>INVOICE</strong>
          </div> */}
          <div className="date-fields">
  <p className="bill-no">Bill No: <span>INV-2025-001</span></p>

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
  <select className="client-dropdown">
    <option value="">-- Select Client --</option>
    <option value="John Doe Enterprises">John Doe Enterprises</option>
    <option value="Ali Traders">Ali Traders</option>
    <option value="Shan Distributors">Shan Distributors</option>
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
    <option value="Web Development Serv">Web Development Serv</option>
    <option value="SEO Optimization">SEO Optimization</option>
    <option value="Hosting Services">Hosting Services</option>
    <option value="Maintenance Plan">Maintenance Plan</option>
  </select>
</td>                  <td><input value={item.description} onChange={(e) => updateItem(index, 'description', e.target.value)} /></td>
                  <td><input type="number" value={item.qty} onChange={(e) => updateItem(index, 'qty', e.target.value)} /></td>
                  <td><input type="number" value={item.price} onChange={(e) => updateItem(index, 'price', e.target.value)} /></td>
                  <td>${(item.qty * item.price).toFixed(2)}</td>
                  <td><Trash2 onClick={() => deleteItem(index)} className="delete-icon" /></td>
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
        <button className="download-btn">⬇ Download</button>
        <button className="preview-btn" onClick={() => setShowPreview(true)}>👁 Preview</button>
        <button className="save-btn">💾 Save Draft</button>
      </section>

      {/* // Enhanced Preview Section - Replace your existing preview JSX with this */}
{showPreview && (
  <div className="preview-overlay">
    <div className="preview-modal">
      <button className="close-preview" onClick={() => setShowPreview(false)}>✖</button>
      
      {/* Complete Invoice Header */}
      <div className="preview-header">
        <div className="preview-company-details">
          <img src="/Images/logosticker.png" alt="Company Logo" className="preview-logo" />
          <div className="preview-company-info">
            <h2>CHAWLA BROKER</h2>
            <p>Propritor Naresh Kumar Chawla</p>
            <p>Contact No: 0333731300</p>
            <p>Email: nareshchawla7300@gmail.com</p>
            <p>Address: Site Area Hyderabad</p>
          </div>
        </div>
        
        <div className="preview-invoice-title">
          <h1>INVOICE</h1>
          <p className="invoice-number">INV-2025-001</p>
        </div>
      </div>

      {/* Invoice Details */}
      <div className="preview-details">
        <div className="preview-bill-to">
          <h3>Bill To:</h3>
          <div className="client-info">
            <p className="client-name">John Doe Enterprises</p>
            <p>Business Address Line 1</p>
            <p>Business Address Line 2</p>
            <p>City, State - Postal Code</p>
          </div>
        </div>
        <div className="preview-dates">
          <p><strong>Invoice Date:</strong> {invoiceDate.toLocaleDateString('en-GB', { 
            day: '2-digit', 
            month: 'short', 
            year: 'numeric' 
          })}</p>
          <p><strong>Due Date:</strong> {dueDate.toLocaleDateString('en-GB', { 
            day: '2-digit', 
            month: 'short', 
            year: 'numeric' 
          })}</p>
        </div>
        
        
      </div>

      {/* Items Table */}
      <div className="preview-items">
        <table>
          <thead>
            <tr>
              {/* <th>Type</th> */}
              <th>Product/Service</th>
              <th>Description</th>
              <th>Qty</th>
              <th>Unit Price</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, i) => (
              <tr key={i}>
                {/* <td>
                  <span className={`type-badge ${item.type.toLowerCase()}`}>
                    {item.type}
                  </span>
                </td> */}
                <td className="product-name">{item.product}</td>
                <td className="description">{item.description}</td>
                <td className="quantity">{item.qty}</td>
                <td className="unit-price">${item.price.toFixed(2)}</td>
                <td className="item-total">${(item.qty * item.price).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Summary Section */}
      <div className="preview-summary">
        {/* <div className="summary-row">
          <span className="summary-label">Subtotal:</span>
          <span className="summary-value">${subtotal.toFixed(2)}</span>
        </div> */}
        {/* <div className="summary-row">
          <span className="summary-label">Tax (0%):</span>
          <span className="summary-value">$0.00</span>
        </div> */}
        <div className="summary-row total-row">
          <span className="summary-label">Total Amount:</span>
          <span className="summary-value">${total.toFixed(2)}</span>
        </div>
      </div>

      {/* Footer */}
      <div className="preview-footer">
        <div className="payment-terms">
          <h4>Payment Terms:</h4>
          <p>Payment is due within 7 days of invoice date.</p>
          {/* <p>Late payments may incur additional charges.</p> */}
        </div>
        
        <div className="thank-you">
          <p><strong>Thank you for your business!</strong></p>
          <p>For any questions regarding this invoice, please contact us.</p>
        </div>
      </div>
    </div>
  </div>
)}
    </div>
  );
};

export default AddBill;
