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
  const { bill_no, client_id, invoice_date, due_date, total_amount, type, items } = req.body;

  con.beginTransaction((err) => {
    if (err) return res.status(500).json({ message: 'Transaction error', error: err });

    const billQuery = `
      INSERT INTO bills (bill_no, client_id, invoice_date, due_date, total_amount, type)
      VALUES (?, ?, ?, ?, ?, ?)
    `;

    con.query(billQuery, [bill_no, client_id, invoice_date, due_date, total_amount, type], (err, result) => {
      if (err) {
        return con.rollback(() => {
          res.status(500).json({ message: 'Failed to insert bill', error: err });
        });
      }

      const billId = result.insertId;

      // Get product ID from name
      const itemPromises = items.map(item => {
        return new Promise((resolve, reject) => {
          const getProductIdQuery = 'SELECT id FROM products WHERE name = ? LIMIT 1';
          con.query(getProductIdQuery, [item.product_name], (err, result) => {
            if (err || result.length === 0) return reject(err || 'Product not found');
            const productId = result[0].id;

            const itemInsertQuery = `
              INSERT INTO bill_items (bill_id, product_id, description, qty, price, type)
              VALUES (?, ?, ?, ?, ?, ?)
            `;
            con.query(itemInsertQuery, [billId, productId, item.description, item.qty, item.price, item.type], (err) => {
              if (err) return reject(err);
              resolve();
            });
          });
        });
      });

      Promise.all(itemPromises)
        .then(() => {
          con.commit((err) => {
            if (err) {
              return con.rollback(() => {
                res.status(500).json({ message: 'Commit failed', error: err });
              });
            }
            res.status(201).json({ message: 'Bill and items saved successfully!' });
          });
        })
        .catch((err) => {
          con.rollback(() => {
            res.status(500).json({ message: 'Failed to save items', error: err });
          });
        });
    });
  });
});


router.get('/nextBillNo', (req, res) => {
  const query = `SELECT bill_no FROM bills ORDER BY id DESC LIMIT 1`;

  con.query(query, (err, result) => {
    if (err) {
      return res.status(500).json({ message: 'Error retrieving latest bill number', error: err });
    }

    let nextBillNo = 1;

    if (result.length > 0) {
      const lastBillNo = parseInt(result[0].bill_no);
      nextBillNo = isNaN(lastBillNo) ? 1 : lastBillNo + 1;
    }

    res.json({ nextBillNo });
  });
});

router.get('/allBills', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        b.id AS bill_id,
        b.bill_no,
        b.client_id,
        c.name AS client_name,
        b.invoice_date,
        b.due_date,
        b.total_amount,
        b.type AS bill_type,
        bi.id AS item_id,
        bi.product_id,
        p.name AS product_name,
        bi.description,
        bi.qty,
        bi.price,
        bi.type AS item_type
      FROM 
        bills b
      JOIN 
        clients c ON b.client_id = c.id
      LEFT JOIN 
        bill_items bi ON bi.bill_id = b.id
      LEFT JOIN 
        products p ON bi.product_id = p.id
      ORDER BY 
        b.id, bi.id
    `);

    // Group rows by bill_id
    const bills = {};
    for (const row of rows) {
      const {
        bill_id,
        bill_no,
        client_id,
        client_name,
        invoice_date,
        due_date,
        total_amount,
        bill_type,
        item_id,
        product_id,
        product_name,
        description,
        qty,
        price,
        item_type,
      } = row;

      if (!bills[bill_id]) {
        bills[bill_id] = {
          bill_id,
          bill_no,
          client_id,
          client_name,
          invoice_date,
          due_date,
          total_amount,
          bill_type,
          items: [],
        };
      }

      if (item_id) {
        bills[bill_id].items.push({
          item_id,
          product_id,
          product_name,
          description,
          qty,
          price,
          item_type,
        });
      }
    }

    const result = Object.values(bills);
    res.json(result);
  } catch (err) {
    console.error('Error fetching all bills with items:', err);
    res.status(500).json({ message: 'Server error', error: err });
  }
});

router.get('/bill/:billNo', async (req, res) => {
  const { billNo } = req.params;

  try {
    const [rows] = await pool.query(`
      SELECT 
        b.id AS bill_id,
        b.bill_no,
        b.client_id,
        c.name AS client_name,
        b.invoice_date,
        b.due_date,
        b.total_amount,
        b.type AS bill_type,
        bi.id AS item_id,
        bi.product_id,
        p.name AS product_name,
        bi.description,
        bi.qty,
        bi.price,
        bi.type AS item_type
      FROM 
        bills b
      JOIN 
        clients c ON b.client_id = c.id
      LEFT JOIN 
        bill_items bi ON bi.bill_id = b.id
      LEFT JOIN 
        products p ON bi.product_id = p.id
      WHERE 
        b.bill_no = ?
      ORDER BY 
        b.id, bi.id
    `, [billNo]);

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Bill not found' });
    }

    // Build a single bill object
    const {
      bill_id,
      client_id,
      client_name,
      invoice_date,
      due_date,
      total_amount,
      bill_type,
    } = rows[0];

    const bill = {
      bill_id,
      bill_no: billNo,
      client_id,
      client_name,
      invoice_date,
      due_date,
      total_amount,
      bill_type,
      items: [],
    };

    for (const row of rows) {
      if (row.item_id) {
        bill.items.push({
          item_id: row.item_id,
          product_id: row.product_id,
          product_name: row.product_name,
          description: row.description,
          qty: row.qty,
          price: row.price,
          item_type: row.item_type,
        });
      }
    }

    res.json(bill);
  } catch (err) {
    console.error('Error fetching bill with items:', err);
    res.status(500).json({ message: 'Server error', error: err });
  }
});



export default router;
