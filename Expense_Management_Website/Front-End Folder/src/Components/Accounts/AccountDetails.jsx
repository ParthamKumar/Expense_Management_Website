import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "./AccountDetails.css";

const AccountDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [client, setClient] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [selectedTransactionIds, setSelectedTransactionIds] = useState([]);

  const [loadingClient, setLoadingClient] = useState(true);
  const [loadingTransactions, setLoadingTransactions] = useState(true);
  const [clientError, setClientError] = useState(null);
  const [transactionsError, setTransactionsError] = useState(null);

  const [startDate, setStartDate] = useState(new Date("2024-08-01"));
  const [endDate, setEndDate] = useState(new Date());
  const [description, setDescription] = useState("");
  const [transactionType, setTransactionType] = useState("");

  const [summary, setSummary] = useState({ totalCredit: 0, totalDebit: 0 });
  const [isClientInfoOpen, setIsClientInfoOpen] = useState(false);

  useEffect(() => {
    const fetchClientDetails = async () => {
      try {
        const res = await axios.get(`http://localhost:3000/accounts/getClient/${id}`);
        setClient(res.data);
      } catch (err) {
        setClientError("Error fetching client details");
      } finally {
        setLoadingClient(false);
      }
    };
    fetchClientDetails();
  }, [id]);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const res = await axios.get(`http://localhost:3000/accounts/getClientTransactions/${id}`);
        setTransactions(res.data);
        setSelectedTransactionIds(res.data.map((t) => t.transaction_id));
      } catch (err) {
        setTransactionsError("Error fetching transactions");
      } finally {
        setLoadingTransactions(false);
      }
    };
    fetchTransactions();
  }, [id]);

  useEffect(() => {
    let filtered = [...transactions];

    if (startDate && endDate) {
      filtered = filtered.filter((t) => {
        const txDate = new Date(t.date);
        return txDate >= startDate && txDate <= endDate;
      });
    }

    if (description) {
      filtered = filtered.filter((t) =>
        t.description?.toLowerCase().includes(description.toLowerCase())
      );
    }

    if (transactionType) {
      filtered = filtered.filter((t) => t.transaction_type === transactionType);
    }

    setFilteredTransactions(filtered);

    const selectedFiltered = filtered.filter((t) =>
      selectedTransactionIds.includes(t.transaction_id)
    );
    calculateSummary(selectedFiltered);
  }, [transactions, startDate, endDate, description, transactionType, selectedTransactionIds]);

  const calculateSummary = (txns) => {
    let credit = 0,
      debit = 0;
    txns.forEach(({ transaction_type, amount }) => {
      if (transaction_type === "credit") credit += amount;
      else if (transaction_type === "debit") debit += amount;
    });
    setSummary({ totalCredit: credit, totalDebit: debit });
  };

  const handleClearFilters = () => {
    setStartDate(new Date("2024-08-01"));
    setEndDate(new Date());
    setDescription("");
    setTransactionType("");
  };

  const handleDeleteAccount = async () => {
    if (transactions.length > 0) {
      alert("Cannot delete account. There are associated transactions.");
      return;
    }

    if (window.confirm("Are you sure you want to delete this account?")) {
      try {
        await axios.delete(`http://localhost:3000/accounts/deleteClient/${id}`);
        alert("Account deleted successfully!");
        navigate("/dashboard/accounts");
      } catch (err) {
        alert("Failed to delete account");
      }
    }
  };

  const handleEditAccount = () => {
    navigate(`/dashboard/accounts/editClient/${id}`);
  };

  const toggleClientInfo = () => {
    setIsClientInfoOpen(!isClientInfoOpen);
  };

  const formatDate = (d) => {
    const date = new Date(d);
    return `${date.getDate().toString().padStart(2, "0")} ${date.toLocaleString("default", {
      month: "short",
    })} ${date.getFullYear()}`;
  };

  const handleTransactionClick = (txnId) => {
    navigate(`/dashboard/transactions/details/${txnId}`);
  };

  const handleSelectAllChange = (e) => {
    const checked = e.target.checked;
    if (checked) {
      const newSelected = [
        ...new Set([
          ...selectedTransactionIds,
          ...filteredTransactions.map((t) => t.transaction_id),
        ]),
      ];
      setSelectedTransactionIds(newSelected);
    } else {
      const newSelected = selectedTransactionIds.filter(
        (id) => !filteredTransactions.some((t) => t.transaction_id === id)
      );
      setSelectedTransactionIds(newSelected);
    }
  };

  const handleTransactionCheckboxChange = (txnId) => {
    setSelectedTransactionIds((prev) =>
      prev.includes(txnId)
        ? prev.filter((id) => id !== txnId)
        : [...prev, txnId]
    );
  };

  const isAllFilteredSelected = filteredTransactions.every((t) =>
    selectedTransactionIds.includes(t.transaction_id)
  );

  if (loadingClient || loadingTransactions) return <div>Loading...</div>;

  return (
    <div className="account-details-wrapper">
      <h2>Account Details</h2>

      {clientError && <p>{clientError}</p>}
      {client && (
        <div className="client-section">
          <div className="client-section-header" onClick={toggleClientInfo}>
            <h3>Client Information</h3>
            <span className={`arrow-toggle ${isClientInfoOpen ? "open" : ""}`}>▼</span>
          </div>

          {isClientInfoOpen && (
            <div className="client-section-body">
              <div className="client-data-list">
                <p><strong>Name:</strong> {client.name}</p>
                <p><strong>Email:</strong> {client.email}</p>
                <p><strong>Contact:</strong> {client.contact}</p>
                <p><strong>Address:</strong> {client.address}</p>
                <p><strong>Description:</strong> {client.description || "No description available"}</p>
              </div>
              <div className="client-action-buttons">
                <button className="action-btn action-edit" onClick={handleEditAccount}>Edit Account</button>
                <button className="action-btn action-delete" onClick={handleDeleteAccount}>Delete Account</button>
              </div>
            </div>
          )}
        </div>
      )}

      <h3>Transactions</h3>

      <div className="filter-panel">
        <DatePicker selected={startDate} onChange={(date) => setStartDate(date)} dateFormat="dd MMM yyyy" />
        <DatePicker selected={endDate} onChange={(date) => setEndDate(date)} dateFormat="dd MMM yyyy" />
        <input type="text" placeholder="Search by description..." value={description} onChange={(e) => setDescription(e.target.value)} />
        <select value={transactionType} onChange={(e) => setTransactionType(e.target.value)}>
          <option value="">All</option>
          <option value="credit">Credit</option>
          <option value="debit">Debit</option>
        </select>
        <button className="filter-clear-btn" onClick={handleClearFilters}>Clear Filters</button>
      </div>

      <div className="summary-panel">
        <div className="summary-item-block">
          <span className="summary-text-label">Total Credit</span>
          <span className="summary-text-value text-credit">₹{summary.totalCredit.toLocaleString()}</span>
        </div>
        <div className="summary-item-block">
          <span className="summary-text-label">Total Debit</span>
          <span className="summary-text-value text-debit">₹{summary.totalDebit.toLocaleString()}</span>
        </div>
        <div className="summary-item-block">
          <span className="summary-text-label">Net</span>
          <span className="summary-text-value text-net">₹{(summary.totalDebit - summary.totalCredit).toLocaleString()}</span>
        </div>
      </div>

      {transactionsError && <p>{transactionsError}</p>}
      {filteredTransactions.length === 0 ? (
        <p>No transactions found.</p>
      ) : (
        <div className="transaction-table-wrapper">
          <table className="transaction-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Description</th>
                <th>Credit (INR)</th>
                <th>Debit (INR)</th>
                <th>Account</th>
                <th style={{ width: "40px", textAlign: "center" }}>
                  <input type="checkbox" checked={isAllFilteredSelected} onChange={handleSelectAllChange} />
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.map((txn) => (
                <tr key={txn.transaction_id}>
                  <td onClick={() => handleTransactionClick(txn.transaction_id)}>{formatDate(txn.date)}</td>
                  <td onClick={() => handleTransactionClick(txn.transaction_id)}>{txn.description || "No description"}</td>
                  <td className="text-credit" onClick={() => handleTransactionClick(txn.transaction_id)}>
  {txn.transaction_type === "credit"
    ? `₹${txn.amount.toLocaleString()} (${txn.transaction_id})`
    : "-"}
</td>
<td className="text-debit" onClick={() => handleTransactionClick(txn.transaction_id)}>
  {txn.transaction_type === "debit"
    ? `₹${txn.amount.toLocaleString()} (${txn.transaction_id})`
    : "-"}
</td>

                  <td onClick={() => handleTransactionClick(txn.transaction_id)}>{txn.account}</td>
                  <td style={{ textAlign: "center" }}>
                    <input
                      type="checkbox"
                      checked={selectedTransactionIds.includes(txn.transaction_id)}
                      onChange={() => handleTransactionCheckboxChange(txn.transaction_id)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AccountDetails;
