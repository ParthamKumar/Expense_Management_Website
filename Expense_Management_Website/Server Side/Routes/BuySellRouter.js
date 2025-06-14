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
router.put('/updateBuySellTransaction/:id', async (req, res) => {
  let conn;

  try {
    const transactionId = req.params.id;
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

    // Check if transaction exists
    const [existingTransaction] = await conn.query(
      'SELECT * FROM buyselltransactions WHERE id = ?', 
      [transactionId]
    );

    if (existingTransaction.length === 0) {
      await conn.rollback();
      return res.status(404).json({ message: 'Transaction not found' });
    }

    const originalTransaction = existingTransaction[0];
    
    // Find the corresponding sell transaction
    const [sellTransaction] = await conn.query(`
      SELECT * FROM buyselltransactions 
      WHERE transaction_type = 'sell' 
      AND buyer_id = ? 
      AND party_id = ? 
      AND product_id = ? 
      AND date = ?
      AND id != ?
    `, [
      originalTransaction.party_id, 
      originalTransaction.buyer_id, 
      originalTransaction.product_id, 
      originalTransaction.date,
      transactionId
    ]);

    const sellId = sellTransaction.length > 0 ? sellTransaction[0].id : null;

    // Delete existing related records
    await conn.query('DELETE FROM contributors WHERE transaction_id = ?', [transactionId]);
    await conn.query('DELETE FROM transactions WHERE buySellTransactionId = ?', [transactionId]);
    
    if (sellId) {
      await conn.query('DELETE FROM transactions WHERE buySellTransactionId = ?', [sellId]);
    }

    // UPDATE buy record
    await conn.query(`
      UPDATE buyselltransactions 
      SET date = ?, party_id = ?, party_type = ?, party_description = ?, 
          product_id = ?, quantity = ?, rate = ?, unit = ?, 
          buying_amount = ?, contributors_sum = ?, total_amount = ?, 
          buyer_id = ?, buyer_description = ?, buyer_type = ?
      WHERE id = ?
    `, [
      date, party_id, party_type, party_description, product_id, quantity, rate, unit,
      buyingAmount, contributorsSum, totalAmount,
      buyer_id, buyer_description, buyer_type, transactionId
    ]);

    // INSERT updated party ledger entry (credit)
    await conn.query(`
      INSERT INTO transactions (client_id, name, date, description, transaction_type, amount, buySellTransactionId)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [
      party_id, party_description, date,
      party_description, 'credit', buyingAmount, transactionId
    ]);

    // INSERT updated contributors (if any)
    for (const c of contributors) {
      const contributorAmount = parseFloat(c.amount);
      if (!c.client_id || isNaN(contributorAmount)) continue;

      await conn.query(`
        INSERT INTO contributors (transaction_id, client_id, description, amount, type)
        VALUES (?, ?, ?, ?, ?)
      `, [transactionId, c.client_id, c.description, contributorAmount, c.type]);

      await conn.query(`
        INSERT INTO transactions (client_id, name, date, description, transaction_type, amount, buySellTransactionId)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `, [
        c.client_id, c.description, date,
        party_description, c.type, contributorAmount, transactionId
      ]);
    }

    // UPDATE or CREATE sell record
    if (sellId) {
      await conn.query(`
        UPDATE buyselltransactions 
        SET date = ?, party_id = ?, party_type = ?, party_description = ?, 
            product_id = ?, quantity = ?, rate = ?, unit = ?, 
            buying_amount = ?, contributors_sum = ?, total_amount = ?, 
            buyer_id = ?, buyer_description = ?, buyer_type = ?
        WHERE id = ?
      `, [
        date, buyer_id, buyer_type, buyer_description, product_id, quantity, rate, unit,
        buyingAmount, contributorsSum, totalAmount,
        party_id, party_description, party_type, sellId
      ]);
    } else {
      // Create new sell record if it doesn't exist
      const [newSellResult] = await conn.query(`
        INSERT INTO buyselltransactions 
        (transaction_type, date, party_id, party_type, party_description, product_id, quantity, rate, unit, buying_amount, contributors_sum, total_amount, buyer_id, buyer_description, buyer_type)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        'sell', date, buyer_id, buyer_type, buyer_description, product_id, quantity, rate, unit,
        buyingAmount, contributorsSum, totalAmount,
        party_id, party_description, party_type
      ]);
      
      sellId = newSellResult.insertId;
    }

    // INSERT updated buyer ledger entry (debit)
    await conn.query(`
      INSERT INTO transactions (client_id, name, date, description, transaction_type, amount, buySellTransactionId)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [
      buyer_id, buyer_description, date,
      buyer_description, 'debit', totalAmount, sellId
    ]);

    await conn.commit();
    res.status(200).json({ 
      message: 'Transaction updated successfully', 
      buyTransactionId: transactionId, 
      sellTransactionId: sellId 
    });

  } catch (err) {
    if (conn) await conn.rollback();
    console.error('Transaction update failed:', err);
    res.status(500).json({
      message: 'Transaction update failed',
      error: err.message || JSON.stringify(err)
    });
  } finally {
    if (conn) conn.release();
  }
});

router.delete('/deleteBuySellTransaction/:id', async (req, res) => {
  let conn;
  const buyTransactionId = parseInt(req.params.id); // This is the ID of the buy transaction

  try {
    if (isNaN(buyTransactionId)) {
      return res.status(400).json({ message: 'Invalid transaction ID' });
    }

    conn = await pool.getConnection();
    await conn.beginTransaction();

    // Find the matching sell transaction ID
    const [sellTransactionRows] = await conn.query(`
      SELECT id FROM buyselltransactions 
      WHERE transaction_type = 'sell' AND buyer_id = (
        SELECT party_id FROM buyselltransactions WHERE id = ?
      ) AND party_id = (
        SELECT buyer_id FROM buyselltransactions WHERE id = ?
      ) AND product_id = (
        SELECT product_id FROM buyselltransactions WHERE id = ?
      ) AND quantity = (
        SELECT quantity FROM buyselltransactions WHERE id = ?
      ) AND rate = (
        SELECT rate FROM buyselltransactions WHERE id = ?
      ) LIMIT 1
    `, [buyTransactionId, buyTransactionId, buyTransactionId, buyTransactionId, buyTransactionId]);

    const sellTransactionId = sellTransactionRows.length > 0 ? sellTransactionRows[0].id : null;

    // Delete transactions linked to buy and sell
    await conn.query(`DELETE FROM transactions WHERE buySellTransactionId = ?`, [buyTransactionId]);
    if (sellTransactionId) {
      await conn.query(`DELETE FROM transactions WHERE buySellTransactionId = ?`, [sellTransactionId]);
    }

    // Delete contributors linked to the buy transaction
    await conn.query(`DELETE FROM contributors WHERE transaction_id = ?`, [buyTransactionId]);

    // Delete buy and sell transactions
    await conn.query(`DELETE FROM buyselltransactions WHERE id = ?`, [buyTransactionId]);
    if (sellTransactionId) {
      await conn.query(`DELETE FROM buyselltransactions WHERE id = ?`, [sellTransactionId]);
    }

    await conn.commit();
    res.status(200).json({
      message: 'Transaction and all related records deleted successfully',
      deletedBuyTransactionId: buyTransactionId,
      deletedSellTransactionId: sellTransactionId
    });
  } catch (err) {
    if (conn) await conn.rollback();
    console.error('Delete transaction failed:', err);
    res.status(500).json({ message: 'Delete transaction failed', error: err.message });
  } finally {
    if (conn) conn.release();
  }
});

router.put('/updateBuySellTransaction/:buyId', async (req, res) => {
  const buyId = parseInt(req.params.buyId);
  const {
    party_id, party_type, party_description,
    product_id, quantity, rate, unit,
    contributors = [], buyer_id, buyer_type,
    buyer_description, date
  } = req.body;
  let conn;

  if (isNaN(buyId)) {
    return res.status(400).json({ message: 'Invalid transaction ID' });
  }

  try {
    const amount = parseFloat(quantity);
    const rateVal = parseFloat(rate);
    if (isNaN(amount) || isNaN(rateVal)) {
      return res.status(400).json({ message: 'Invalid quantity or rate' });
    }
    const buyingAmount = amount * rateVal;
    const contributorsSum = contributors.reduce((sum, c) => sum + parseFloat(c.amount || 0), 0);
    const totalAmount = buyingAmount + contributorsSum;

    conn = await pool.getConnection();
    await conn.beginTransaction();

    await conn.query(`
      UPDATE buyselltransactions
      SET date=?, party_id=?, party_type=?, party_description=?,
          product_id=?, quantity=?, rate=?, unit=?,
          buying_amount=?, contributors_sum=?, total_amount=?,
          buyer_id=?, buyer_type=?, buyer_description=?
      WHERE id=? AND transaction_type='buy'
    `, [
      date, party_id, party_type, party_description,
      product_id, quantity, rate, unit,
      buyingAmount, contributorsSum, totalAmount,
      buyer_id, buyer_type, buyer_description,
      buyId
    ]);

    const [[sellTx]] = await conn.query(`
      SELECT id FROM buyselltransactions
      WHERE transaction_type='sell' AND buyer_id=? AND party_id=?
        AND product_id=? AND quantity=? AND rate=?
      LIMIT 1
    `, [party_id, buyer_id, product_id, quantity, rate]);
    const sellId = sellTx?.id;

    await conn.query(`
      UPDATE transactions
      SET client_id=?, name=?, date=?, description=?, transaction_type=?, amount=?
      WHERE buySellTransactionId=? AND transaction_type='credit'
    `, [party_id, party_description, date, party_description, 'credit', buyingAmount, buyId]);

    if (sellId) {
      await conn.query(`
        UPDATE transactions
        SET client_id=?, name=?, date=?, description=?, transaction_type=?, amount=?
        WHERE buySellTransactionId=? AND transaction_type='debit'
      `, [buyer_id, buyer_description, date, buyer_description, 'debit', totalAmount, sellId]);
    }

    await conn.query(`DELETE FROM contributors WHERE transaction_id=?`, [buyId]);
    if (sellId) await conn.query(`DELETE FROM transactions WHERE buySellTransactionId=? AND transaction_type='contributor'`, [buyId]);

    for (const c of contributors) {
      const contributorAmount = parseFloat(c.amount || 0);
      if (!c.client_id || isNaN(contributorAmount)) continue;
      await conn.query(`
        INSERT INTO contributors (transaction_id, client_id, description, amount, type)
        VALUES (?, ?, ?, ?, ?)
      `, [buyId, c.client_id, c.description, contributorAmount, c.type]);

      await conn.query(`
        INSERT INTO transactions (client_id, name, date, description, transaction_type, amount, buySellTransactionId)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `, [c.client_id, c.description, date, party_description, c.type, contributorAmount, buyId]);
    }

    if (sellId) {
      await conn.query(`
        UPDATE buyselltransactions
        SET date=?, party_id=?, party_type=?, party_description=?, product_id=?, quantity=?, rate=?, unit=?, buying_amount=?, contributors_sum=?, total_amount=?, buyer_id=?, buyer_description=?, buyer_type=?
        WHERE id=? AND transaction_type='sell'
      `, [
        date, buyer_id, buyer_type, buyer_description,
        product_id, quantity, rate, unit,
        buyingAmount, contributorsSum, totalAmount,
        party_id, party_description, party_type,
        sellId
      ]);
    }

    await conn.commit();
    res.status(200).json({ message: 'Transaction updated', buyId, sellId });
  } catch (err) {
    if (conn) await conn.rollback();
    console.error(err);
    res.status(500).json({ message: 'Update failed', error: err.message });
  } finally {
    if (conn) conn.release();
  }
});


export default router;
