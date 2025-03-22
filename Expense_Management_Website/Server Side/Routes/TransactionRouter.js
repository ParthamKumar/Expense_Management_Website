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
    const query = 'SELECT * FROM transactions';
    con.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching transactions:', err);
            res.status(500).send('Error fetching transactions');
        } else {
            res.json(results);
        }
    });
});

export default router;
