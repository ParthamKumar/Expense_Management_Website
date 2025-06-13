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
  const [dailySummary, setDailySummary] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const response = await axios.get(
          "http://localhost:3000/transactions/gettransactions"
        );
        setTransactions(response.data);
      } catch (error) {
        console.error("Error fetching transactions:", error);
      }
    };
    fetchTransactions();
  }, []);

  useEffect(() => {
    let filtered = transactions;

    if (searchTerm) {
      filtered = filtered.filter((transaction) =>
        transaction.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (startDate && endDate) {
      filtered = filtered.filter((transaction) => {
        const transactionDate = new Date(transaction.date);
        return transactionDate >= startDate && transactionDate <= endDate;
      });
    }

    if (description) {
      filtered = filtered.filter((transaction) =>
        transaction.description.toLowerCase().includes(description.toLowerCase())
      );
    }

    if (transactionType) {
      filtered = filtered.filter(
        (transaction) => transaction.transaction_type === transactionType
      );
    }

    setFilteredTransactions(filtered);

    if (startDate && endDate) {
      calculateSummary(filtered);
    } else {
      setDailySummary(null);
    }
  }, [
    transactions,
    searchTerm,
    startDate,
    endDate,
    description,
    transactionType,
  ]);

  const calculateSummary = (transactions) => {
    const summary = transactions.reduce(
      (acc, transaction) => {
        const amount = parseFloat(transaction.amount);
        if (transaction.transaction_type === "credit") {
          acc.totalCredit += amount;
        } else if (transaction.transaction_type === "debit") {
          acc.totalDebit += amount;
        }
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
    setDailySummary(null);
  };

  const handleTransactionClick = (id) => {
    navigate(`/dashboard/transactions/details/${id}`);
  };

  const handleAddTransaction = () => {
    navigate("/dashboard/transactions/addTransaction");
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
        <button
          className="btn btn-primary add-transaction-btn"
          onClick={handleAddTransaction}
        >
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

        <select
          value={transactionType}
          onChange={(e) => setTransactionType(e.target.value)}
        >
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
            <span className="summary-value credit">
              ₹{dailySummary.totalCredit.toLocaleString()}
            </span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Total Debit:</span>
            <span className="summary-value debit">
              ₹{dailySummary.totalDebit.toLocaleString()}
            </span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Net Amount:</span>
            <span
              className={`summary-value ${
                dailySummary.netAmount >= 0 ? "credit" : "debit"
              }`}
            >
              ₹{Math.abs(dailySummary.netAmount).toLocaleString()}
            </span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Transactions:</span>
            <span className="summary-value">
              {dailySummary.transactionCount}
            </span>
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
          </tr>
        </thead>
        <tbody>
          {filteredTransactions.map((transaction) => (
            <tr
              key={transaction.transaction_id}
              onClick={() => handleTransactionClick(transaction.transaction_id)}
            >
              <td>
                {transaction.name} {transaction.id}
              </td>
              <td>{formatDate(transaction.date)}</td>
              <td>{transaction.description}</td>
              <td className="credit">
                {transaction.transaction_type === "credit"
                  ? `₹${transaction.amount.toLocaleString()} (${transaction.transaction_id})`
                  : "-"}
              </td>
              <td className="debit">
                {transaction.transaction_type === "debit"
                  ? `₹${transaction.amount.toLocaleString()} (${transaction.transaction_id})`
                  : "-"}
              </td>
              <td>{transaction.account}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Transactions;
