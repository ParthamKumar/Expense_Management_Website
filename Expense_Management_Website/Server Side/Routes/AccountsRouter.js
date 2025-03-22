import express from "express";
import con from "../utils/db.js"; // Use the correct MySQL connection object (make sure `con` is correct)

const router = express.Router();

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


router.get('/getClients', (req, res) => {
    const query = 'SELECT * FROM clients';
    
    con.query(query, (err, results) => {
        if (err) {
            return res.status(500).json({ message: 'Error fetching clients', error: err });
        }
        res.status(200).json(results);
    });
});

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

router.get('/getClients', (req, res) => {
    const query = 'SELECT id, name FROM clients';
    
    con.query(query, (err, result) => {
        if (err) {
            return res.status(500).json({ message: 'Error fetching clients', error: err });
        }
        res.status(200).json(result);
    });
});


export default router;
