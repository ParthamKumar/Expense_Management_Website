import express from "express";
import { con, pool } from "../utils/db.js"; // ✅ use pool for async/await

const router = express.Router();

router.post('/addBuySellTransaction', async (req, res) => {
  let conn;

  try {
    const {
      party_id,
      party_type,
      party_description,
      product_id,
      quantity,
      rate,
      unit,
      contributors = [],
      buyer_id,
      buyer_type,
      buyer_description,
      date
    } = req.body;

    const amount = parseFloat(quantity);
    const rateVal = parseFloat(rate);

    if (isNaN(amount) || isNaN(rateVal)) {
      return res.status(400).json({ message: 'Invalid quantity or rate' });
    }

    const buyingAmount = amount * rateVal;
    const contributorsSum = Array.isArray(contributors)
      ? contributors.reduce((sum, c) => sum + parseFloat(c.amount || 0), 0)
      : 0;
    const totalAmount = buyingAmount + contributorsSum;

    conn = await pool.getConnection();
    await conn.beginTransaction();

    // INSERT buy record
    const [buyResult] = await conn.query(`
      INSERT INTO buyselltransactions 
      (transaction_type, date, party_id, party_type, party_description, product_id, quantity, rate, unit, buying_amount, contributors_sum, total_amount, buyer_id, buyer_description, buyer_type)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      'buy', date, party_id, party_type, party_description, product_id, quantity, rate, unit,
      buyingAmount, contributorsSum, totalAmount,
      buyer_id, buyer_description, buyer_type
    ]);

    const buySellId = buyResult.insertId;

    // INSERT party ledger entry (credit)
    await conn.query(`
      INSERT INTO transactions (client_id, name, date, description, transaction_type, amount, buySellTransactionId)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [
      party_id, party_description, date,
      party_description, 'credit', buyingAmount, buySellId
    ]);

    // INSERT contributors (if any)
    for (const c of contributors) {
      const contributorAmount = parseFloat(c.amount);
      if (!c.client_id || isNaN(contributorAmount)) continue;

      await conn.query(`
        INSERT INTO contributors (transaction_id, client_id, description, amount, type)
        VALUES (?, ?, ?, ?, ?)
      `, [buySellId, c.client_id, c.description, contributorAmount, c.type]);

      await conn.query(`
        INSERT INTO transactions (client_id, name, date, description, transaction_type, amount, buySellTransactionId)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `, [
        c.client_id, c.description, date,
        party_description, c.type, contributorAmount, buySellId
      ]);
    }

    // INSERT sell record
    const [sellResult] = await conn.query(`
      INSERT INTO buyselltransactions 
      (transaction_type, date, party_id, party_type, party_description, product_id, quantity, rate, unit, buying_amount, contributors_sum, total_amount, buyer_id, buyer_description, buyer_type)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      'sell', date, buyer_id, buyer_type, buyer_description, product_id, quantity, rate, unit,
      buyingAmount, contributorsSum, totalAmount,
      party_id, party_description, party_type
    ]);

    const sellId = sellResult.insertId;

    // INSERT buyer ledger entry (debit)
    await conn.query(`
      INSERT INTO transactions (client_id, name, date, description, transaction_type, amount, buySellTransactionId)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [
      buyer_id, buyer_description, date,
      buyer_description, 'debit', totalAmount, sellId
    ]);

    await conn.commit();
    res.status(200).json({ message: 'Transaction completed successfully', buyTransactionId: buySellId, sellTransactionId: sellId });

  } catch (err) {
    if (conn) await conn.rollback();
    console.error('Transaction failed:', err);
    res.status(500).json({
      message: 'Transaction failed',
      error: err.message || JSON.stringify(err)
    });
  } finally {
    if (conn) conn.release();
  }
});

router.get('/gettransactions', (req, res) => {
  const query = `
    SELECT 
      b.*,
      party.name AS party_name,
      buyer.name AS buyer_name,
      products.name AS product_name
    FROM buyselltransactions b
    LEFT JOIN clients party ON b.party_id = party.id
    LEFT JOIN clients buyer ON b.buyer_id = buyer.id
    LEFT JOIN products ON b.product_id = products.id
    ORDER BY b.date DESC
  `;

  con.query(query, (err, transactions) => {
    if (err) {
      console.error('Error fetching transactions:', err);
      return res.status(500).send('Error fetching transactions');
    }

    // Extract all transaction IDs
    const transactionIds = transactions.map(tx => tx.id);
    if (transactionIds.length === 0) return res.json([]);

    // Query contributors with client names
    const contribQuery = `
      SELECT 
        c.*,
        clients.name AS contributor_name
      FROM contributors c
      LEFT JOIN clients ON c.client_id = clients.id
      WHERE c.transaction_id IN (?)
    `;

    con.query(contribQuery, [transactionIds], (err, contributors) => {
      if (err) {
        console.error('Error fetching contributors:', err);
        return res.status(500).send('Error fetching contributors');
      }

      // Group contributors by transaction_id
      const groupedContributors = {};
      contributors.forEach(c => {
        if (!groupedContributors[c.transaction_id]) {
          groupedContributors[c.transaction_id] = [];
        }
        groupedContributors[c.transaction_id].push(c);
      });

      // Attach contributors to each transaction
      const enhancedTransactions = transactions.map(tx => {
        tx.contributors = groupedContributors[tx.id] || [];
        return tx;
      });

      res.json(enhancedTransactions);
    });
  });
});


export default router;
