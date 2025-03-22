import express from "express";
import con from "../utils/db.js"; // Ensure the correct MySQL connection is imported

const router = express.Router();

// Add a new client
router.post('/addClient', (req, res) => {
    const { name, contact, email, address, description, dateAdded } = req.body;

    if (!name || !contact || !email || !address || !dateAdded) {
        return res.status(400).json({ message: 'Please fill in all required fields' });
    }

    const query = `INSERT INTO clients (name, contact, email, address, description, date_added) VALUES (?, ?, ?, ?, ?, ?)`;
    con.query(query, [name, contact, email, address, description, dateAdded], (err, result) => {
        if (err) {
            return res.status(500).json({ message: 'Error adding client', error: err });
        }
        res.status(200).json({ message: 'Client added successfully', clientId: result.insertId });
    });
});

// Get all clients
router.get('/getClients', (req, res) => {
    const query = 'SELECT * FROM clients';
    
    con.query(query, (err, results) => {
        if (err) {
            return res.status(500).json({ message: 'Error fetching clients', error: err });
        }
        res.status(200).json(results);
    });
});

// Get specific client details by ID
router.get('/getClient/:id', (req, res) => {
    const clientId = req.params.id;
    const query = 'SELECT * FROM clients WHERE id = ?';
    
    con.query(query, [clientId], (err, result) => {
        if (err) {
            return res.status(500).json({ message: 'Error fetching client', error: err });
        }
        if (result.length === 0) {
            return res.status(404).json({ message: 'Client not found' });
        }
        res.status(200).json(result[0]); // Return the first (and only) client result
    });
});

// Get only client names and IDs
router.get('/getClientNames', (req, res) => {
    const query = 'SELECT id, name FROM clients';
    
    con.query(query, (err, result) => {
        if (err) {
            return res.status(500).json({ message: 'Error fetching client names', error: err });
        }
        res.status(200).json(result);
    });
});

// Get transactions for a specific client
router.get('/getClientTransactions/:id', (req, res) => {
    const clientId = req.params.id;

    con.query('SELECT * FROM transactions WHERE client_id = ?', [clientId], (err, results) => {
        if (err) {
            return res.status(500).json({ message: 'Database error', error: err });
        }

        if (results.length === 0) {
            return res.status(404).json({ message: 'No transactions found for this client' });
        }

        res.status(200).json(results);
    });
});

export default router;
