import React, { useEffect, useState } from "react";
import "./AddBill.css";
import { Option, Trash2 } from "lucide-react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import axios from "axios";

const AddBill = () => {
  const [clients, setClients] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [billNo,setBillNo]= useState('')
  const [clientId,setClientId] = useState('');
  const [nextBillNo ,setNextBillNo] = useState('')



  useEffect(() => {
    const fetchClients = axios.get("http://localhost:3000/accounts/getClients");
    const fetchProducts = axios.get(
      "http://localhost:3000/products/getProducts"
    );
    const fetchNextBillNo = axios.get('http://localhost:3000/billing/nextBillNo');

    // console.log("Clinets", clients);
    // console.log("products", products);
    // console.log(nextBillNo)
    Promise.all([fetchClients, fetchProducts, fetchNextBillNo])
      .then(([clientsResponse, productsResponse,billRes]) => {
        setClients(clientsResponse.data);
        setProducts(productsResponse.data);
        setNextBillNo(billRes.data.nextBillNo.toString())


        setLoading(false);
      })
      .catch((error) => {
        console.log("Error", error);
        setLoading(false);
      });
  }, []);

  const [items, setItems] = useState([
    {
      product: "",
      description: "",
      qty: "",
      price: "",
      type: "Credit",
    },
    {
      product: "",
      description: "",
      qty: "",
      price: "",
      type: "Credit",
    },
  ]);

  const [showPreview, setShowPreview] = useState(false);
  const [invoiceDate, setInvoiceDate] = useState(new Date());
  const [dueDate, setDueDate] = useState(new Date());

  const addItem = () => {
    const newItem = {
      product: "",
      description: "",
      qty: "",
      price: "",
      type: items.length === 0 ? "Debit" : "Credit",
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
  updated[index][key] = value;

  if (key === "qty" || key === "price") {
    const qty = parseFloat(updated[index].qty) || 0;
    const price = parseFloat(updated[index].price) || 0;
    updated[index].total = (qty * price).toFixed(2);
  }

  setItems(updated);
};

  const subtotal = items.reduce((sum, item) => sum + item.qty * item.price, 0);
  const total = subtotal;

const handleSave = async () => {
  try {
    const parsedClientId = parseInt(clientId);
    const formattedInvoiceDate = invoiceDate?.toISOString().split("T")[0];
    const formattedDueDate = dueDate?.toISOString().split("T")[0];
    const parsedTotal = parseFloat(total);

    const billData = {
      bill_no: nextBillNo,
      client_id: parsedClientId,
      invoice_date: formattedInvoiceDate,
      due_date: formattedDueDate,
      total_amount: parsedTotal,
      type: items.length > 0 ? items[0].type : "Debit",
      items: items.map(item => ({
        product_name: item.product,
        description: item.description,
        qty: parseFloat(item.qty),
        price: parseFloat(item.price),
        type: item.type
      }))
    };

    const transactionData = {
      client_id: parsedClientId,
      name: clients.find(c => c.id === parsedClientId)?.name || "",
      date: formattedInvoiceDate,
      description: `Invoice #${nextBillNo}`,
      transaction_type: 'debit',
      amount: parsedTotal,
      buySellTransactionId: null,
      bill_no: nextBillNo
    };

    const buySellTransactionData = items.map(item => ({
      transaction_type: 'sell',
      date: formattedInvoiceDate,
      party_id: parsedClientId,
      party_type: 'debit',
      party_description: item.description || '',
      product_id: products.find(p => p.name === item.product)?.id || null,
      quantity: parseFloat(item.qty) || 0,
      rate: parseFloat(item.price) || 0,
      unit: ' ',
      buying_amount: 0,
      contributors_sum: 0,
      total_amount: parseFloat(item.qty * item.price).toFixed(2),
      buyer_id: parsedClientId,
      buyer_description: `Bill #${billNo}`,
      buyer_type: item.type.toLowerCase(),
      bill_no: nextBillNo
    }));

    console.log(" Bill data", billData)
    console.log(" buy sell",buySellTransactionData)
    console.log(" transacton",transactionData)

    await axios.post("http://localhost:3000/billing/saveCompleteBill", {
      billData,
      transactionData,
      buySellTransactionData
    });

    alert("All data saved successfully!");

    // Reset form here...

  } catch (err) {
    console.error("❌ Error saving complete data:", err.response?.data || err.message);
    alert("Failed to save bill. Everything was rolled back.");
  }
};




  return (
    <div className="bill-container">
      <div className="scroll-content">
        <header className="bill-header">
          <div className="company-details">
            <img
              src="/Images/logosticker.png"
              alt="Company Logo"
              className="company-logo"
            />
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
            <p className="bill-no">
              Bill No:  <span>{nextBillNo}</span>
            </p>

{/* <div className="bill-no">
  <label htmlFor="billNo">Bill No#</label>
  <input
    type="text"
    id="billNo"
    value={nextBillNo}
    onChange={(e) => setBillNo(e.target.value)}
    placeholder="Enter Bill No"
  />
</div> */}
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

          <select name="client-dropdown" value={clientId} onChange={(e)=>setClientId(e.target.value)}>
            <option value=""> Select Client </option>
            {clients.map((client) => (
              <option key={client.id} value={client.id}>
                
                {client.name}
              </option>
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
                      onChange={(e) =>
                        updateItem(index, "type", e.target.value)
                      }
                    >
                      <option value="Debit">Debit</option>
                      <option value="Credit">Credit</option>
                    </select>
                  </td>
                  <td>
                    <select
                      value={item.product}
                      onChange={(e) =>
                        updateItem(index, "product", e.target.value)
                      }
                    >
                      <option value="">Select Product</option>
                      {products.map((product) => (
                        <option key={product.id} value={product.name}>
                          {product.name}
                        </option>
                      ))}
                    </select>
                  </td>{" "}
                  <td>
                    <input
                      value={item.description}
                      onChange={(e) =>
                        updateItem(index, "description", e.target.value)
                      }
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      step="any"
                      value={item.qty}
                      onChange={(e) => updateItem(index, "qty", e.target.value)}
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      step="any"
                      value={item.price}
                      onChange={(e) =>
                        updateItem(index, "price", e.target.value)
                      }
                    />
                  </td>
                  <td>${(item.qty * item.price).toFixed(2)}</td>
                  <td>
                    <Trash2
                      onClick={() => deleteItem(index)}
                      className="delete-icon"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section className="summary-section">
          <div className="totals-box">
            <p>
              Total:{" "}
              <strong className="total-amount">${total.toFixed(2)}</strong>
            </p>
          </div>
        </section>
      </div>

      <section className="bill-actions">
        <button className="download-btn">⬇ Download</button>
        <button className="preview-btn" onClick={() => setShowPreview(true)}>
          👁 Preview
        </button>
        <button className="save-btn" onClick={handleSave}>💾 Save Draft</button>
      </section>

      {/* // Enhanced Preview Section - Replace your existing preview JSX with this */}
      {showPreview && (
  <div className="preview-overlay">
    <div className="preview-modal">
      <button
        className="close-preview"
        onClick={() => setShowPreview(false)}
      >
        ✖
      </button>

      {/* Invoice Header */}
      <div className="preview-header">
        <div className="preview-company-details">
          <img
            src="/Images/logosticker.png"
            alt="Company Logo"
            className="preview-logo"
          />
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
          <p className="invoice-number">{nextBillNo}</p>
        </div>
      </div>

      {/* Invoice Details */}
      <div className="preview-details">
        <div className="preview-bill-to">
          <h3>Bill To:</h3>
          <div className="client-info">
            <p className="client-name">
              {clients.find(c => c.id === parseInt(clientId))?.name || "N/A"}
            </p>
          </div>
        </div>
        <div className="preview-dates">
          <p>
            <strong>Invoice Date:</strong>{" "}
            {invoiceDate.toLocaleDateString("en-GB", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })}
          </p>
          <p>
            <strong>Due Date:</strong>{" "}
            {dueDate.toLocaleDateString("en-GB", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })}
          </p>
        </div>
      </div>

      {/* Items Table */}
      <div className="preview-items">
        <table>
          <thead>
            <tr>
              <th>Type</th>
              <th>Product/Service</th>
              <th>Description</th>
              <th>Qty</th>
              <th>Unit Price</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, i) => {
              const productName =
                products.find(p => p.name === item.product || p.id === parseInt(item.product))?.name || item.product;

              return (
                <tr key={i}>
                  <td>{item.type}</td>
                  <td className="product-name">{productName}</td>
                  <td className="description">{item.description}</td>
<td className="quantity">{item.qty || 0}</td>
                  <td className="unit-price">
  ${parseFloat(item.price || 0).toFixed(2)}
</td>
<td className="item-total">
  ${(parseFloat(item.qty || 0) * parseFloat(item.price || 0)).toFixed(2)}
</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Summary Section */}
      <div className="preview-summary">
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
