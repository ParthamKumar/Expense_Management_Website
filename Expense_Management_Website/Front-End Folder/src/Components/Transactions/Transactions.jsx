import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "./Transactions.css";

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState(new Date("2024-08-01"));
  const [endDate, setEndDate] = useState(new Date());
  const [description, setDescription] = useState("");
  const [transactionType, setTransactionType] = useState("");
  const [selectedTransactions, setSelectedTransactions] = useState(new Set());
  const [selectAll, setSelectAll] = useState(true);
  const [dailySummary, setDailySummary] = useState(null);
  const navigate = useNavigate();

  // Fetch all transactions and select all initially
  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const response = await axios.get("http://localhost:3000/transactions/gettransactions");
        setTransactions(response.data);

        const allIds = new Set(response.data.map((t) => t.transaction_id));
        setSelectedTransactions(allIds);
        setSelectAll(true);
      } catch (error) {
        console.error("Error fetching transactions:", error);
      }
    };
    fetchTransactions();
  }, []);

  // Apply filters when filters or transactions change
  useEffect(() => {
    let filtered = transactions;

    if (searchTerm) {
      filtered = filtered.filter((t) =>
        t.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (startDate && endDate) {
      filtered = filtered.filter((t) => {
        const txDate = new Date(t.date).toISOString().split("T")[0];
        const start = startDate.toISOString().split("T")[0];
        const end = endDate.toISOString().split("T")[0];
        return txDate >= start && txDate <= end;
      });
    }

    if (description) {
      filtered = filtered.filter((t) =>
        t.description.toLowerCase().includes(description.toLowerCase())
      );
    }

    if (transactionType) {
      filtered = filtered.filter((t) => t.transaction_type === transactionType);
    }

    setFilteredTransactions(filtered);

    // Update "select all" checkbox based on current selection
    const allVisibleSelected = filtered.every(t => selectedTransactions.has(t.transaction_id));
    setSelectAll(allVisibleSelected);
  }, [transactions, searchTerm, startDate, endDate, description, transactionType, selectedTransactions]);

  // Recalculate summary based on selected items
  useEffect(() => {
    const selected = filteredTransactions.filter((t) =>
      selectedTransactions.has(t.transaction_id)
    );
    calculateSummary(selected);
  }, [filteredTransactions, selectedTransactions]);

  const calculateSummary = (transactions) => {
    const summary = transactions.reduce(
      (acc, t) => {
        const amount = parseFloat(t.amount);
        if (t.transaction_type === "credit") acc.totalCredit += amount;
        else if (t.transaction_type === "debit") acc.totalDebit += amount;
        acc.transactionCount += 1;
        return acc;
      },
      { totalCredit: 0, totalDebit: 0, transactionCount: 0 }
    );
    summary.netAmount = summary.totalCredit - summary.totalDebit;
    setDailySummary(summary);
  };

  const handleClearFilters = () => {
    setSearchTerm("");
    setStartDate(new Date("2024-08-01"));
    setEndDate(new Date());
    setDescription("");
    setTransactionType("");
  };

  const handleTransactionClick = (id) => {
    navigate(`/dashboard/transactions/details/${id}`);
  };

  const handleAddTransaction = () => {
    navigate("/dashboard/transactions/addTransaction");
  };

  const handleCheckboxChange = (id) => {
    const newSelected = new Set(selectedTransactions);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedTransactions(newSelected);
  };

  const handleSelectAll = () => {
    if (selectAll) {
      const newSelected = new Set(selectedTransactions);
      filteredTransactions.forEach(t => newSelected.delete(t.transaction_id));
      setSelectedTransactions(newSelected);
      setSelectAll(false);
    } else {
      const newSelected = new Set(selectedTransactions);
      filteredTransactions.forEach(t => newSelected.add(t.transaction_id));
      setSelectedTransactions(newSelected);
      setSelectAll(true);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="transactions-container">
      <div className="header">
        <h4>Transactions</h4>
        <button className="btn btn-primary add-transaction-btn" onClick={handleAddTransaction}>
          Add Transaction
        </button>
      </div>

      <div className="search-fields">
        <input
          type="text"
          placeholder="Search by name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <DatePicker
          selected={startDate}
          onChange={(date) => setStartDate(date)}
          placeholderText="Start Date"
          dateFormat="dd MMM yyyy"
          showMonthDropdown
          showYearDropdown
          dropdownMode="select"
        />

        <DatePicker
          selected={endDate}
          onChange={(date) => setEndDate(date)}
          placeholderText="End Date"
          dateFormat="dd MMM yyyy"
          showMonthDropdown
          showYearDropdown
          dropdownMode="select"
        />

        <input
          type="text"
          placeholder="Search by description..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <select value={transactionType} onChange={(e) => setTransactionType(e.target.value)}>
          <option value="">All</option>
          <option value="credit">Credit</option>
          <option value="debit">Debit</option>
        </select>

        <button className="btn btn-clear" onClick={handleClearFilters}>
          Clear Filters
        </button>
      </div>

      {dailySummary && (
        <div className="daily-summary-box">
          <div className="summary-item">
            <span className="summary-label">Total Credit:</span>
            <span className="summary-value credit">₹{dailySummary.totalCredit.toLocaleString()}</span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Total Debit:</span>
            <span className="summary-value debit">₹{dailySummary.totalDebit.toLocaleString()}</span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Net Amount:</span>
            <span className={`summary-value ${dailySummary.netAmount >= 0 ? "credit" : "debit"}`}>
              ₹{Math.abs(dailySummary.netAmount).toLocaleString()}
            </span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Transactions:</span>
            <span className="summary-value">{dailySummary.transactionCount}</span>
          </div>
        </div>
      )}

      <table className="transactions-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Date</th>
            <th>Description</th>
            <th>Credit (INR)</th>
            <th>Debit (INR)</th>
            <th>Account</th>
            <th style={{ width: "40px", textAlign: "right" }}>
              <input type="checkbox" checked={selectAll} onChange={handleSelectAll} />
            </th>
          </tr>
        </thead>
        <tbody>
          {filteredTransactions.map((t) => (
            <tr key={t.transaction_id}>
              <td onClick={() => handleTransactionClick(t.transaction_id)}>{t.name}</td>
              <td onClick={() => handleTransactionClick(t.transaction_id)}>{formatDate(t.date)}</td>
              <td onClick={() => handleTransactionClick(t.transaction_id)}>{t.description}</td>
              <td className="credit" onClick={() => handleTransactionClick(t.transaction_id)}>
                {t.transaction_type === "credit" ? `₹${t.amount.toLocaleString()}` : "-"}
              </td>
              <td className="debit" onClick={() => handleTransactionClick(t.transaction_id)}>
                {t.transaction_type === "debit" ? `₹${t.amount.toLocaleString()}` : "-"}
              </td>
              <td onClick={() => handleTransactionClick(t.transaction_id)}>{t.account}</td>
              <td style={{ textAlign: "right" }}>
                <input
                  type="checkbox"
                  checked={selectedTransactions.has(t.transaction_id)}
                  onChange={() => handleCheckboxChange(t.transaction_id)}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Transactions;
