import express from 'express';
import con from '../utils/db.js'; // Ensure this points to the correct MySQL connection object

const router = express.Router();

router.post('/add', (req, res) => {
    // console.log('Transaction data:', req.body); 
    const { client_id, name, date, description, transaction_type, amount, account } = req.body;

    // Validate input data (optional but recommended)
    if (!client_id || !name || !date || !transaction_type || !amount || !account) {
        return res.status(400).send('Missing required fields');
    }

    const query = `
        INSERT INTO transactions (client_id, name, date, description, transaction_type, amount, account) 
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    con.query(query, [client_id, name, date, description, transaction_type, amount, account], (err, result) => {
        if (err) {
            console.error('Error adding transaction:', err);
            return res.status(500).send('Error adding transaction');
        }
        res.status(200).send({ message: 'Transaction added successfully' });
    });
});

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

    // Query to fetch transaction details along with client information
    const query = `
        SELECT 
            t.transaction_id,
            t.client_id,
            t.name,
            t.date,
            t.description,
            t.transaction_type,
            t.amount,
            t.account,
            c.name AS client_name,
            c.email AS client_email
        FROM transactions t
        INNER JOIN clients c ON t.client_id = c.id
        WHERE t.transaction_id = ?
    `;

    // Execute the query
    con.query(query, [transactionId], (error, results) => {
        if (error) {
            console.error('Error executing query:', error);
            return res.status(500).json({ message: 'Internal server error' });
        }

        if (results.length === 0) {
            return res.status(404).json({ message: 'Transaction not found' });
        }

        // Return the transaction details with client information
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
            client: {
                name: transaction.client_name,
                email: transaction.client_email
            }
        });
    });
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


export default router;
