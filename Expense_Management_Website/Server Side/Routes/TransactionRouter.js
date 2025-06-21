import express from 'express';
// import con from '../utils/db.js'; // Ensure this points to the correct MySQL connection object
import { con, pool } from "../utils/db.js";


const router = express.Router();

router.post('/add', (req, res) => {
    const { client_id, name, date, description, transaction_type, amount, buySellTransactionId } = req.body;

    // Validate required fields
    if (!client_id || !name || !date || !transaction_type || !amount) {
        return res.status(400).send('Missing required fields');
    }

    const query = `
        INSERT INTO transactions (client_id, name, date, description, transaction_type, amount, buySellTransactionId) 
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    con.query(
        query,
        [client_id, name, date, description || null, transaction_type, amount, buySellTransactionId || null],
        (err, result) => {
            if (err) {
                console.error('Error adding transaction:', err);
                return res.status(500).send('Error adding transaction');
            }
            res.status(200).send({ message: 'Transaction added successfully' });
        }
    );
});


// router.post('/addFullTransaction', async (req, res) => {
//   const conn = await pool.getConnection();
//   try {
//     await conn.beginTransaction();

//     const {
//       transaction_type,
//       date,
//       party_id,
//       party_type,
//       party_description,
//       product_id,
//       quantity,
//       rate,
//       unit,
//       buying_amount,
//       contributors_sum,
//       total_amount,
//       buyer_id,
//       buyer_description,
//       buyer_type,
//       contributors
//     } = req.body;

//     // Validate required fields
//     if (
//       !transaction_type || !date || !party_id || !party_type || !product_id ||
//       !quantity || !rate || !unit || !buying_amount || !total_amount ||
//       !buyer_id || !buyer_type || !contributors?.length
//     ) {
//       return res.status(400).json({ success: false, message: 'Missing required fields' });
//     }

//     // Insert into buyselltransactions
//     const [buySellResult] = await conn.query(
//       `INSERT INTO buyselltransactions 
//         (transaction_type, date, party_id, party_type, party_description, product_id, quantity, rate, unit, 
//          buying_amount, contributors_sum, total_amount, buyer_id, buyer_description, buyer_type)
//        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
//       [
//         transaction_type,
//         date,
//         party_id,
//         party_type,
//         party_description || null,
//         product_id,
//         quantity,
//         rate,
//         unit,
//         buying_amount,
//         contributors_sum,
//         total_amount,
//         buyer_id,
//         buyer_description || null,
//         buyer_type
//       ]
//     );

//     const transactionId = buySellResult.insertId;

//     // Insert each contributor
//     for (const c of contributors) {
//       await conn.query(
//         `INSERT INTO contributors (transaction_id, client_id, description, amount, type)
//          VALUES (?, ?, ?, ?, ?)`,
//         [transactionId, c.client_id, c.description, c.amount, c.type]
//       );

//       await conn.query(
//         `INSERT INTO transactions (client_id, name, date, description, transaction_type, amount, account)
//          VALUES (?, ?, ?, ?, ?, ?, ?)`,
//         [
//           c.client_id,
//           'Contributor',
//           date,
//           c.description || 'Contributor cost',
//           c.type,
//           c.amount,
//           'Contributors'
//         ]
//       );
//     }

//     // Insert party (seller) transaction
//     await conn.query(
//       `INSERT INTO transactions (client_id, name, date, description, transaction_type, amount, account)
//        VALUES (?, ?, ?, ?, ?, ?, ?)`,
//       [
//         party_id,
//         'Seller',
//         date,
//         party_description || 'Selling Product',
//         'credit',
//         buying_amount,
//         'BuySell'
//       ]
//     );

//     // Insert buyer transaction
//     await conn.query(
//       `INSERT INTO transactions (client_id, name, date, description, transaction_type, amount, account)
//        VALUES (?, ?, ?, ?, ?, ?, ?)`,
//       [
//         buyer_id,
//         'Buyer',
//         date,
//         buyer_description || 'Buying Product',
//         buyer_type,
//         total_amount,
//         'BuySell'
//       ]
//     );

//     await conn.commit();
//     res.json({ success: true, message: 'Transaction recorded successfully.' });
//   } catch (err) {
//     await conn.rollback();
//     console.error('Error adding full transaction:', err);
//     res.status(500).json({ success: false, error: err.message });
//   } finally {
//     conn.release();
//   }
// });




router.get('/gettransactions', (req, res) => {
    const query = 'SELECT * FROM transactions order by date DESC';
    con.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching transactions:', err);
            res.status(500).send('Error fetching transactions');
        } else {
            res.json(results);
        }
    });
});
// router.get('/gettransactions', (req, res) => {
//     const { startDate, endDate } = req.query;
//     let query = 'SELECT * FROM transactions';
//     const queryParams = [];

//     if (startDate && endDate) {
//         query += ' WHERE DATE(date) BETWEEN ? AND ?';
//         queryParams.push(startDate, endDate);
//     }

//     query += ' ORDER BY date DESC';

//     con.query(query, queryParams, (err, results) => {
//         if (err) {
//             console.error('Error fetching transactions:', err);
//             res.status(500).send('Error fetching transactions');
//         } else {
//             res.json(results);
//         }
//     });
// });


router.get('/searchtransactions', (req, res) => {
    const { name, startDate, endDate, description, transactionType } = req.query;
    let query = 'SELECT * FROM transactions WHERE 1=1';
    const params = [];

    if (name) {
        query += ' AND name LIKE ?';
        params.push(`%${name}%`);
    }

    if (startDate && endDate) {
        query += ' AND date BETWEEN ? AND ?';
        params.push(startDate, endDate);
    }

    if (description) {
        query += ' AND description LIKE ?';
        params.push(`%${description}%`);
    }

    if (transactionType) {
        // query += ' AND transaction_type = ?';
        params.push(transactionType);
    }

    // Add ORDER BY clause to sort by date in descending order (newest first)
    query += ' ORDER BY date DESC';

    con.query(query, params, (err, results) => {
        if (err) {
            return res.status(500).json({ message: 'Database error', error: err });
        }
        res.status(200).json(results);
    });
});

router.get('/gettransaction/:id', (req, res) => {
    const transactionId = req.params.id;

    const query = `
        SELECT 
            t.transaction_id,
            t.client_id,
            t.name,
            t.date,
            t.description,
            t.transaction_type,
            t.amount,
            t.buySellTransactionId,
            c.name AS client_name,
            c.email AS client_email
        FROM transactions t
        INNER JOIN clients c ON t.client_id = c.id
        WHERE t.transaction_id = ?
    `;

    con.query(query, [transactionId], (error, results) => {
        if (error) {
            console.error('Error executing query:', error);
            return res.status(500).json({ message: 'Internal server error' });
        }

        if (results.length === 0) {
            return res.status(404).json({ message: 'Transaction not found' });
        }

        const transaction = results[0];
        res.json({
            transaction_id: transaction.transaction_id,
            client_id: transaction.client_id,
            name: transaction.name,
            date: transaction.date,
            description: transaction.description,
            transaction_type: transaction.transaction_type,
            amount: transaction.amount,
            account: transaction.account,
            buySellTransactionId: transaction.buySellTransactionId,
            client: {
                name: transaction.client_name,
                email: transaction.client_email
            }
        });
    });
});

router.get('/gettransaction/:id', (req, res) => {
    const transactionId = req.params.id;

    const query = `
        SELECT 
            t.transaction_id,
            t.client_id,
            t.name,
            t.date,
            t.description,
            t.transaction_type,
            t.amount,
            t.buySellTransactionId,
            c.name AS client_name,
            c.email AS client_email
        FROM transactions t
        INNER JOIN clients c ON t.client_id = c.id
        WHERE t.transaction_id = ?
    `;

    con.query(query, [transactionId], (error, results) => {
        if (error) {
            console.error('Error executing query:', error);
            return res.status(500).json({ message: 'Internal server error' });
        }

        if (results.length === 0) {
            return res.status(404).json({ message: 'Transaction not found' });
        }

        const transaction = results[0];
        res.json({
            transaction_id: transaction.transaction_id,
            client_id: transaction.client_id,
            name: transaction.name,
            date: transaction.date,
            description: transaction.description,
            transaction_type: transaction.transaction_type,
            amount: transaction.amount,
            buySellTransactionId: transaction.buySellTransactionId,
            client: {
                name: transaction.client_name,
                email: transaction.client_email
            }
        });
    });
});

// routes/transactions.js
router.put('/updatetransaction/:transaction_id', async (req, res) => {
  const { transaction_id } = req.params;
  const {
    name,
    date,
    description = '',
    transaction_type,
    amount
    // account — removed because it does not exist in DB
  } = req.body;

  if (!name || !date || !transaction_type || amount == null) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    const query = `
      UPDATE transactions
      SET name=?, date=?, description=?, transaction_type=?, amount=?
      WHERE transaction_id=?
    `;
    const values = [
      name,
      new Date(date),
      description,
      transaction_type.toLowerCase(),
      amount,
      transaction_id
    ];

    const [result] = await pool.execute(query, values);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    res.json({ message: 'Transaction updated successfully' });
  } catch (err) {
    console.error('Update error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});




// DELETE transaction by ID
router.delete('/deletetransaction/:id', (req, res) => {
    const transactionId = req.params.id;

    // Query to delete the transaction
    const query = 'DELETE FROM transactions WHERE transaction_id = ?';

    // Execute the query
    con.query(query, [transactionId], (error, results) => {
        if (error) {
            console.error('Error executing query:', error);
            return res.status(500).json({ message: 'Internal server error' });
        }

        if (results.affectedRows === 0) {
            return res.status(404).json({ message: 'Transaction not found' });
        }

        // Return success message
        res.json({ message: 'Transaction deleted successfully' });
    });
});

// Backend: Express route with optional date filtering
router.get('/gettransactions', (req, res) => {
    const { startDate, endDate } = req.query;
    let query = 'SELECT * FROM transactions';
    const values = [];

    if (startDate && endDate) {
        query += ' WHERE date BETWEEN ? AND ?';
        values.push(startDate, endDate);
    }

    query += ' ORDER BY date DESC';

    con.query(query, values, (err, results) => {
        if (err) {
            console.error('Error fetching transactions:', err);
            res.status(500).send('Error fetching transactions');
        } else {
            res.json(results);
        }
    });
});

// adding data into two tables Transaction and Buysell
// router.post('/addbuyselltransaction', async (req, res) => {
//   const conn = await pool.getConnection();
//   try {
//     const {
//       client_id,
//       name,
//       date,
//       description,
//       transaction_type,
//       transactionType, // buy/sell
//       amount,
//       product_id,
//       quantity,
//       rate
//     } = req.body;

//     await conn.beginTransaction();

//     let buySellId = null;

//     if (product_id && quantity && rate && transactionType) {
//       const buying_amount = parseFloat(quantity) * parseFloat(rate);
//       const total_amount = buying_amount;

//       const [buySellResult] = await conn.query(`
//         INSERT INTO buyselltransactions (
//           transaction_type, date, party_id, party_type, party_description,
//           product_id, quantity, rate, unit, buying_amount,
//           contributors_sum, total_amount,
//           buyer_id, buyer_description, buyer_type
//         )
//         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
//       `, [
//         transactionType, // 'buy' or 'sell'
//         date.split('T')[0],
//         client_id,
//         transaction_type === 'credit' ? 'debit' : 'credit',
//         description,
//         product_id,
//         parseFloat(quantity),
//         parseFloat(rate),
//         'unit', // Replace if dynamic
//         buying_amount,
//         0.00,
//         total_amount,
//         client_id,
//         description,
//         transaction_type
//       ]);

//       buySellId = buySellResult.insertId;
//     }

//     // Insert into transaction
//     await conn.query(`
//       INSERT INTO transactions (
//         client_id, name, date, description,
//         transaction_type, amount, buySellTransactionId
//       )
//       VALUES (?, ?, ?, ?, ?, ?, ?)
//     `, [
//       client_id,
//       name,
//       date,
//       description,
//       transaction_type,
//       parseFloat(amount),
//       buySellId
//     ]);

//     await conn.commit();
//     res.status(201).json({ message: 'Transaction with Buy/Sell details added successfully' });
//   } catch (err) {
//     await conn.rollback();
//     console.error('Transaction failed:', err);
//     res.status(500).json({ error: 'Failed to add transaction', details: err.message });
//   } finally {
//     conn.release();
//   }
// });

router.post('/addbuyselltransaction', async (req, res) => {
  const conn = await pool.getConnection();
  try {
    const {
      client_id,
      name,
      date,
      description,
      transaction_type,
      transactionType, // buy/sell
      amount,
      product_id,
      quantity,
      rate
    } = req.body;

    await conn.beginTransaction();

    let buySellId = null;

    if (product_id && quantity && rate && transactionType) {
      const buying_amount = parseFloat(quantity) * parseFloat(rate);
      const total_amount = buying_amount;

      const [buySellResult] = await conn.query(`
        INSERT INTO buyselltransactions (
          transaction_type, date, party_id, party_type, party_description,
          product_id, quantity, rate, unit, buying_amount,
          contributors_sum, total_amount,
          buyer_id, buyer_description, buyer_type
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        transactionType, // 'buy' or 'sell'
        date.split('T')[0],
        client_id,
        transaction_type === 'credit' ? 'debit' : 'credit',
        description,
        product_id,
        parseFloat(quantity),
        parseFloat(rate),
        'unit', // Replace with dynamic value if needed
        buying_amount,
        0.00,
        total_amount,
        client_id,
        description,
        transaction_type
      ]);

      buySellId = buySellResult.insertId;
    }

    // Insert into transactions with both linkage fields
    await conn.query(`
      INSERT INTO transactions (
        client_id, name, date, description,
        transaction_type, amount,
        buySellTransactionId, buySellCombined
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      client_id,
      name,
      date,
      description,
      transaction_type,
      parseFloat(amount),
      buySellId,
      buySellId // <-- also insert into new column
    ]);

    await conn.commit();
    res.status(201).json({ message: 'Transaction with Buy/Sell details added successfully' });
  } catch (err) {
    await conn.rollback();
    console.error('Transaction failed:', err);
    res.status(500).json({ error: 'Failed to add transaction', details: err.message });
  } finally {
    conn.release();
  }
});

router.delete('/deletebuyselltransaction/:id', async (req, res) => {
  const conn = await pool.getConnection();
  try {
    const transactionId = req.params.id;

    await conn.beginTransaction();

    // Fetch the transaction to get buySellTransactionId or buySellCombined
    const [rows] = await conn.query(`
      SELECT buySellTransactionId, buySellCombined 
      FROM transactions 
      WHERE transaction_id = ?
    `, [transactionId]);

    if (rows.length === 0) {
      await conn.rollback();
      return res.status(404).json({ error: 'Transaction not found' });
    }

    const { buySellTransactionId, buySellCombined } = rows[0];

    // Delete the transaction
    await conn.query(`DELETE FROM transactions WHERE transaction_id = ?`, [transactionId]);

    // Determine the buysell ID to delete
    const buySellId = buySellTransactionId || buySellCombined;

    // If linked, delete the corresponding buysell transaction
    if (buySellId) {
      await conn.query(`DELETE FROM buyselltransactions WHERE id = ?`, [buySellId]);
    }

    await conn.commit();
    res.status(200).json({ message: 'Transaction and related Buy/Sell deleted successfully' });
  } catch (err) {
    await conn.rollback();
    console.error('Delete transaction failed:', err);
    res.status(500).json({ error: 'Failed to delete transaction', details: err.message });
  } finally {
    conn.release();
  }
});

export default router;
