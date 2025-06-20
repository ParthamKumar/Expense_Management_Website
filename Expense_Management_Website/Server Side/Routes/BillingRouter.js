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

// Api to add transaction from the Billing portion 
router.post('/add', (req, res) => {
    const {
        client_id,
        name,
        date,
        description,
        transaction_type,
        amount,
        buySellTransactionId,
        source
    } = req.body;

    // Validate required fields
    if (!client_id || !name || !date || !transaction_type || !amount) {
        return res.status(400).send('Missing required fields');
    }

    const query = `
        INSERT INTO transactions 
        (client_id, name, date, description, transaction_type, amount, buySellTransactionId, source) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    con.query(
        query,
        [
            client_id,
            name,
            date,
            description || null,
            transaction_type,
            amount,
            buySellTransactionId || null,
            source || null
        ],
        (err, result) => {
            if (err) {
                console.error('Error adding transaction:', err);
                return res.status(500).send('Error adding transaction');
            }
            res.status(200).send({ message: 'Transaction added successfully' });
        }
    );
});

// api to post buyselltransactions from billing
router.post("/addItems", async (req, res) => {
  const transactions = req.body;

  if (!Array.isArray(transactions) || transactions.length === 0) {
    return res.status(400).json({ message: "Invalid or empty payload" });
  }

  try {
    const values = transactions.map(t => [
      t.transaction_type,
      t.date,
      t.party_id,
      t.party_type,
      t.party_description || null,
      t.product_id,
      t.quantity,
      t.rate,
      t.unit,
      t.buying_amount,
      t.contributors_sum,
      t.total_amount,
      t.buyer_id,
      t.buyer_description || null,
      t.buyer_type,
      t.source
    ]);

    const query = `
      INSERT INTO buySellTransactions (
        transaction_type,
        date,
        party_id,
        party_type,
        party_description,
        product_id,
        quantity,
        rate,
        unit,
        buying_amount,
        contributors_sum,
        total_amount,
        buyer_id,
        buyer_description,
        buyer_type,
        source
      ) VALUES ?
    `;

    const [result] = await pool.query(query, [values]);

    res.json({ message: "Buy/Sell transactions added successfully", inserted: result.affectedRows });
  } catch (err) {
    console.error("Error inserting buy/sell transactions:", err);
    res.status(500).json({ message: "Failed to insert transactions", error: err });
  }
});

router.delete('/deletebill/:billNo', async (req, res) => {
  const billNo = req.params.billNo;

  try {
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    // Get bill ID using bill_no
    const [billRows] = await connection.query('SELECT id, client_id, invoice_date, total_amount FROM bills WHERE bill_no = ?', [billNo]);

    if (billRows.length === 0) {
      await connection.release();
      return res.status(404).json({ message: 'Bill not found' });
    }

    const billId = billRows[0].id;
    const clientId = billRows[0].client_id;
    const invoiceDate = billRows[0].invoice_date;
    const totalAmount = billRows[0].total_amount;

    // 1. Delete bill_items
    await connection.query('DELETE FROM bill_items WHERE bill_id = ?', [billId]);

    // 2. Delete bill
    await connection.query('DELETE FROM bills WHERE id = ?', [billId]);

    // 3. Delete transaction
    await connection.query(
      `DELETE FROM transactions 
       WHERE bill_no = ?`,
      [clientId, invoiceDate, totalAmount, `Invoice #${billNo}`]
    );

    // 4. Delete buySellTransactions
    await connection.query(
      `DELETE FROM buySellTransactions 
       WHERE bill_no = ?`,
      [clientId, invoiceDate, `Bill #${billNo}`]
    );

    await connection.commit();
    await connection.release();

    res.status(200).json({ message: 'Complete bill and related records deleted successfully' });

  } catch (err) {
    console.error('Rollback error:', err);
    res.status(500).json({ message: 'Error deleting complete bill records', error: err });
  }
});


// ✅ COMBINED BACKEND API FOR ATOMIC OPERATION
router.post('/saveCompleteBill', async (req, res) => {
  const connection = await pool.getConnection();
  await connection.beginTransaction();

  try {
    const { billData, transactionData, buySellTransactionData } = req.body;

    // 1. Insert Bill
    const [billResult] = await connection.query(
      `INSERT INTO bills (bill_no, client_id, invoice_date, due_date, total_amount, type)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        billData.bill_no,
        billData.client_id,
        billData.invoice_date,
        billData.due_date,
        billData.total_amount,
        billData.type
      ]
    );

    const billId = billResult.insertId;
    const billNo = billData.bill_no;

    // 2. Insert Bill Items
    for (const item of billData.items) {
      const [product] = await connection.query(
        `SELECT id FROM products WHERE name = ? LIMIT 1`, 
        [item.product_name]
      );

      if (product.length === 0) throw new Error(`Product not found: ${item.product_name}`);

      await connection.query(
        `INSERT INTO bill_items (bill_id, product_id, description, qty, price, type)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [billId, product[0].id, item.description, item.qty, item.price, item.type]
      );
    }

    // 3. Insert Transaction with bill_no link
    await connection.query(
      `INSERT INTO transactions (client_id, name, date, description, transaction_type, amount, buySellTransactionId, bill_no)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        transactionData.client_id,
        transactionData.name,
        transactionData.date,
        transactionData.description,
        transactionData.transaction_type,
        transactionData.amount,
        transactionData.buySellTransactionId || null,
        billNo
      ]
    );

    // 4. Insert Buy/Sell Transactions with bill_no
    const buySellValues = buySellTransactionData.map(t => [
      t.transaction_type,
      t.date,
      t.party_id,
      t.party_type,
      t.party_description || null,
      t.product_id,
      t.quantity,
      t.rate,
      t.unit,
      t.buying_amount,
      t.contributors_sum,
      t.total_amount,
      t.buyer_id,
      t.buyer_description || null,
      t.buyer_type,
      billNo
    ]);

    await connection.query(
      `INSERT INTO buySellTransactions (
         transaction_type, date, party_id, party_type, party_description, product_id,
         quantity, rate, unit, buying_amount, contributors_sum, total_amount,
         buyer_id, buyer_description, buyer_type, bill_no
       ) VALUES ?`,
      [buySellValues]
    );

    await connection.commit();
    res.status(200).json({ message: 'Bill, transaction, and buy/sell data saved successfully' });

  } catch (error) {
    await connection.rollback();
    console.error('Rollback error:', error);
    res.status(500).json({ message: 'Failed to save data', error: error.message });
  } finally {
    connection.release();
  }
});





export default router;
