import express from "express";
import { con, pool } from "../utils/db.js"; // ✅ use pool for async/await

const router = express.Router();

router.get('/getBill/:id', async (req, res) => {
  const billId = parseInt(req.params.id);

  try {
    // Get bill and client info
    const [billRows] = await pool.query(
      `SELECT b.*, c.name as client_name, c.contact, c.email, c.address
       FROM bills b
       JOIN clients c ON b.client_id = c.id
       WHERE b.id = ?`,
      [billId]
    );

    if (billRows.length === 0) {
      return res.status(404).json({ message: 'Bill not found' });
    }

    // Get bill items with product info
    const [itemRows] = await pool.query(
      `SELECT bi.*, p.name as product_name
       FROM bill_items bi
       JOIN products p ON bi.product_id = p.id
       WHERE bi.bill_id = ?`,
      [billId]
    );

    const bill = {
      ...billRows[0],
      items: itemRows
    };

    res.json(bill);
  } catch (err) {
    console.error('Error fetching bill:', err);
    res.status(500).json({ message: 'Server error' });
  }
});
router.post('/addBill', async (req, res) => {
  const { clientId, items, invoiceDate, dueDate, totalAmount } = req.body;

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // 1. Validate client exists
    const [clientRows] = await conn.query(`SELECT id FROM clients WHERE id = ?`, [clientId]);
    if (clientRows.length === 0) {
      return res.status(400).json({ message: 'Client not found' });
    }

    // 2. Insert into bills table
    const [billResult] = await conn.query(
      `INSERT INTO bills (client_id, invoice_date, due_date, total_amount, type) VALUES (?, ?, ?, ?, ?)`,
      [clientId, invoiceDate, dueDate, totalAmount, 'Credit']
    );
    const billId = billResult.insertId;

    // 3. Insert bill items
    for (const item of items) {
      const [productRows] = await conn.query(`SELECT id FROM products WHERE name = ?`, [item.product]);
      if (productRows.length === 0) {
        await conn.rollback();
        return res.status(400).json({ message: `Product not found: ${item.product}` });
      }
      const productId = productRows[0].id;

      await conn.query(
        `INSERT INTO bill_items (bill_id, product_id, description, qty, price, type) VALUES (?, ?, ?, ?, ?, ?)`,
        [billId, productId, item.description, item.qty, item.price, item.type]
      );
    }

    await conn.commit();
    res.status(201).json({ message: 'Bill and items added successfully', billId });
  } catch (error) {
    await conn.rollback();
    console.error('Error saving bill:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  } finally {
    conn.release();
  }
});
router.get('/nextBillNo', async (req, res) => {
  try {
    const conn = await pool.getConnection();

    // Get all bill IDs sorted ascending
    const [rows] = await conn.query(`SELECT id FROM bills ORDER BY id ASC`);

    if (rows.length === 0) {
      return res.json({ billNo: 'INV-2025-001' });
    }

    // Extract all existing IDs
    const ids = rows.map(row => row.id);
    const maxId = Math.max(...ids);

    // Check if maxId exists in the table
    const hasMax = ids.includes(maxId);

    const nextId = hasMax ? maxId + 1 : maxId; // If max ID is deleted, reuse it

    const nextBillNo = `INV-2025-${nextId.toString().padStart(3, '0')}`;
    res.json({ billNo: nextBillNo });
  } catch (error) {
    console.error('Error fetching next bill number:', error);
    res.status(500).json({ message: 'Server error' });
  }
});









export default router;
