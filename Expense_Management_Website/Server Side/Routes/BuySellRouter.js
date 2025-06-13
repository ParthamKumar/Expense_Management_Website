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

    conn = await pool.getConnection(); // ✅ FIXED: use pool.getConnection()
    await conn.beginTransaction();

    const [buyResult] = await conn.query(`
      INSERT INTO buyselltransactions 
      (transaction_type, date, party_id, party_type, party_description, product_id, quantity, rate, unit, buying_amount, contributors_sum, total_amount, buyer_id, buyer_description, buyer_type)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      'buy', date, party_id, party_type, party_description, product_id, quantity, rate, unit,
      buyingAmount, contributorsSum, totalAmount,
      buyer_id, buyer_description, buyer_type
    ]);

    const transactionId = buyResult.insertId;

    await conn.query(`
      INSERT INTO transactions (client_id, name, date, description, transaction_type, amount, account)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [
      party_id, party_description, date,
      'Buy product from ' + party_description,
      'credit', buyingAmount, 'party'
    ]);

    for (const c of contributors) {
      const contributorAmount = parseFloat(c.amount);
      if (!c.client_id || isNaN(contributorAmount)) continue;

      await conn.query(`
        INSERT INTO contributors (transaction_id, client_id, description, amount, type)
        VALUES (?, ?, ?, ?, ?)
      `, [transactionId, c.client_id, c.description, contributorAmount, c.type]);

      await conn.query(`
        INSERT INTO transactions (client_id, name, date, description, transaction_type, amount, account)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `, [
        c.client_id, c.description, date,
        `Contributor share for ${party_description}`,
        c.type, contributorAmount, 'contributor'
      ]);
    }

    await conn.query(`
      INSERT INTO buyselltransactions 
      (transaction_type, date, party_id, party_type, party_description, product_id, quantity, rate, unit, buying_amount, contributors_sum, total_amount, buyer_id, buyer_description, buyer_type)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      'sell', date, buyer_id, buyer_type, buyer_description, product_id, quantity, rate, unit,
      buyingAmount, contributorsSum, totalAmount,
      party_id, party_description, party_type
    ]);

    await conn.query(`
      INSERT INTO transactions (client_id, name, date, description, transaction_type, amount, account)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [
      buyer_id, buyer_description, date,
      'Sell to ' + buyer_description,
      'debit', totalAmount, 'buyer'
    ]);

    await conn.commit();
    res.status(200).json({ message: 'Transaction completed successfully', transactionId });

  } catch (err) {
    if (conn) await conn.rollback();
    console.error('Transaction failed:', err);
    res.status(500).json({
      message: 'Transaction failed',
      error: err.message || JSON.stringify(err)
    });
  } finally {
    if (conn) conn.release(); // ✅ Always release pool connection
  }
});

export default router;
