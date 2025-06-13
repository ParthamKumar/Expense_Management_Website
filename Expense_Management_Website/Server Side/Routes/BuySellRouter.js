import express from "express";
import con from "../utils/db.js"; // Ensure the correct MySQL connection is imported

const router = express.Router();

router.post('/addBuySellTransaction', (req, res) => {
    const {
        transaction_type,
        date,
        party_id,
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
        contributors = []
    } = req.body;

    if (!transaction_type || !date || !party_id || !product_id || !quantity || !rate || !unit || !buyer_id || !buyer_type) {
        return res.status(400).json({ message: 'Missing required fields' });
    }

    const transactionQuery = `
        INSERT INTO buysellTransactions
        (transaction_type, date, party_id, product_id, quantity, rate, unit, buying_amount, contributors_sum, total_amount, buyer_id, buyer_description, buyer_type)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const transactionValues = [
        transaction_type,
        date,
        party_id,
        product_id,
        quantity,
        rate,
        unit,
        buying_amount,
        contributors_sum,
        total_amount,
        buyer_id,
        buyer_description || '',
        buyer_type
    ];

    con.query(transactionQuery, transactionValues, (err, result) => {
        if (err) {
            console.error('Transaction Insertion Error:', err);
            return res.status(500).json({ message: 'Error inserting transaction', error: err });
        }

        const transactionId = result.insertId;

        if (contributors.length === 0) {
            return res.status(200).json({ message: 'Transaction added successfully without contributors', transactionId });
        }

        const contributorQuery = `
            INSERT INTO contributors (transaction_id, client_id, description, amount, type)
            VALUES ?
        `;

        const contributorValues = contributors.map(c => [
            transactionId,
            c.client_id,
            c.description || '',
            c.amount,
            c.type
        ]);

        con.query(contributorQuery, [contributorValues], (err2) => {
            if (err2) {
                console.error('Contributor Insertion Error:', err2);
                return res.status(500).json({ message: 'Transaction added but error adding contributors', error: err2 });
            }

            res.status(200).json({ message: 'Transaction and contributors added successfully', transactionId });
        });
    });
});



export default router;
