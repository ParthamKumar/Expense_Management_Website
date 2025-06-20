import React, { useEffect, useState } from 'react';
import './ProductDetails.css';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const ProductDetails = () => {
  const { id } = useParams();
  const [transactions, setTransactions] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [selected, setSelected] = useState([]);
  const [loading, setLoading] = useState(true);

  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [partyName, setPartyName] = useState('');
  const [description, setDescription] = useState('');
  const [quantity, setQuantity] = useState('');
  const [rate, setRate] = useState('');
  const [transactionType, setTransactionType] = useState('all');

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const res = await axios.get(`http://localhost:3000/products/getBuySummaryByProduct/${id}`);
        const txns = res.data.transactions || [];
        setTransactions(txns);
        setFiltered(txns);
        setSelected(txns);
      } catch (err) {
        console.error('Error fetching transactions:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchTransactions();
  }, [id]);

  const parseTypedDate = (input) => {
    const parts = input.trim().split(/[-/]/);
    if (parts.length === 3) {
      let [day, month, year] = parts.map(Number);
      if (year < 1000 || month < 1 || month > 12 || day < 1 || day > 31) return null;
      return new Date(year, month - 1, day);
    }
    return null;
  };

  useEffect(() => {
    const filteredTxns = transactions.filter((tx) => {
      const txDate = new Date(tx.date);
      const start = startDate ? new Date(startDate.setHours(0, 0, 0, 0)) : null;
      const end = endDate ? new Date(endDate.setHours(23, 59, 59, 999)) : null;

      return (
        (!start || txDate >= start) &&
        (!end || txDate <= end) &&
        (!partyName || tx.partyName.toLowerCase().includes(partyName.toLowerCase())) &&
        (!description || (tx.description || '').toLowerCase().includes(description.toLowerCase())) &&
        (!quantity || String(tx.quantity).includes(quantity)) &&
        (!rate || String(tx.rate).includes(rate)) &&
        (transactionType === 'all' || tx.transaction_type === transactionType)
      );
    });

    setFiltered(filteredTxns);
  }, [startDate, endDate, partyName, description, quantity, rate, transactionType, transactions]);

  const clearFilters = () => {
    setStartDate(null);
    setEndDate(null);
    setPartyName('');
    setDescription('');
    setQuantity('');
    setRate('');
    setTransactionType('all');
  };

  const handleCheckboxChange = (tx) => {
    setSelected((prev) =>
      prev.includes(tx) ? prev.filter((t) => t !== tx) : [...prev, tx]
    );
  };

  const isChecked = (tx) => selected.includes(tx);

  const handleSelectAllToggle = () => {
    const allSelected = filtered.every(tx => selected.includes(tx));
    if (allSelected) {
      setSelected(prev => prev.filter(tx => !filtered.includes(tx)));
    } else {
      const newSelections = filtered.filter(tx => !selected.includes(tx));
      setSelected(prev => [...prev, ...newSelections]);
    }
  };

  const isAllFilteredSelected = filtered.length > 0 && filtered.every(tx => selected.includes(tx));

  const buySummary = selected.filter(tx => tx.transaction_type === 'buy').reduce((sum, tx) => ({
    quantity: sum.quantity + Number(tx.quantity || 0),
    amount: sum.amount + Number(tx.total_amount || 0)
  }), { quantity: 0, amount: 0 });

  const sellSummary = selected.filter(tx => tx.transaction_type === 'sell').reduce((sum, tx) => ({
    quantity: sum.quantity + Number(tx.quantity || 0),
    amount: sum.amount + Number(tx.total_amount || 0)
  }), { quantity: 0, amount: 0 });

  return (
    <div className="product-details-container">
      <h2>Buy/Sell Transactions for {transactions[0]?.product_name}</h2>

      <div className="search-fields">
        <DatePicker
          selected={startDate}
          onChange={(date) => setStartDate(date)}
          onChangeRaw={(e) => {
            const parsed = parseTypedDate(e.target.value);
            if (parsed) setStartDate(parsed);
          }}
          placeholderText="Start Date"
          dateFormat="dd MMM yyyy"
          showMonthDropdown
          showYearDropdown
          dropdownMode="select"
        />
        <DatePicker
          selected={endDate}
          onChange={(date) => setEndDate(date)}
          onChangeRaw={(e) => {
            const parsed = parseTypedDate(e.target.value);
            if (parsed) setEndDate(parsed);
          }}
          placeholderText="End Date"
          dateFormat="dd MMM yyyy"
          showMonthDropdown
          showYearDropdown
          dropdownMode="select"
        />
        <input type="text" placeholder="Party Name" value={partyName} onChange={(e) => setPartyName(e.target.value)} />
        <input type="text" placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
        <input type="text" placeholder="Quantity" value={quantity} onChange={(e) => setQuantity(e.target.value)} />
        <input type="text" placeholder="Rate" value={rate} onChange={(e) => setRate(e.target.value)} />
        <select value={transactionType} onChange={(e) => setTransactionType(e.target.value)}>
          <option value="all">All</option>
          <option value="buy">Buy</option>
          <option value="sell">Sell</option>
        </select>
        <button onClick={clearFilters}>Clear Filters</button>
      </div>

      {selected.length > 0 && (
        <div className="summary-table">
          <table>
            <thead>
              <tr><th colSpan="3">Summary (Selected Transactions)</th></tr>
            </thead>
            <tbody>
              <tr><td>Type</td><td>Total Quantity</td><td>Total Amount</td></tr>
              <tr><td>Buy</td><td>{buySummary.quantity}</td><td>₹{buySummary.amount.toLocaleString()}</td></tr>
              <tr><td>Sell</td><td>{sellSummary.quantity}</td><td>₹{sellSummary.amount.toLocaleString()}</td></tr>
            </tbody>
          </table>
        </div>
      )}

      {loading ? (
        <p>Loading transactions...</p>
      ) : filtered.length === 0 ? (
        <p>No transactions match the search criteria.</p>
      ) : (
        <div className="transactions-table">
  <div className="table-scroll">
    <table>
      <thead>
        <tr>
          <th>Date</th>
          <th>Type</th>
          <th>Party</th>
          <th>Description</th>
          <th>Bill No</th>
          <th>Qty</th>
          <th>Rate</th>
          <th>Unit</th>
          <th>Total</th>
          <th>
            <input
              type="checkbox"
              checked={isAllFilteredSelected}
              onChange={handleSelectAllToggle}
            /> Select
          </th>
        </tr>
      </thead>
      <tbody>
        {filtered.map((tx, index) => (
          <tr key={index} className={tx.transaction_type === 'buy' ? 'buy-row' : 'sell-row'}>
            <td>{new Date(tx.date).toLocaleDateString('en-GB')}</td>
            <td>{tx.transaction_type}</td>
            <td>{tx.partyName}</td>
            <td>{tx.description || 'N/A'}</td>
            <td>{tx.bill_no || 'N/A'}</td>
            <td>{tx.quantity}</td>
            <td>₹{tx.rate}</td>
            <td>{tx.unit}</td>
<td>₹{Math.round(Number(tx.quantity) * Number(tx.rate)).toLocaleString()}</td>
            <td>
              <input
                type="checkbox"
                checked={isChecked(tx)}
                onChange={() => handleCheckboxChange(tx)}
              />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
</div>

      )}
    </div>
  );
};

export default ProductDetails;
