import express from "express";
// import con from "../utils/db.js"; // Ensure the correct MySQL connection is imported
import { con, pool } from "../utils/db.js";


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
    const query = 'SELECT * FROM clients ORDER BY name ASC'; // Alphabetical sort in SQL

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

    // Fetch transactions for the client, sorted by date in descending order
    const query = 'SELECT * FROM transactions WHERE client_id = ? ORDER BY date DESC';
    con.query(query, [clientId], (err, results) => {
        if (err) {
            return res.status(500).json({ message: 'Database error', error: err });
        }
        res.status(200).json(results);
    });
});
router.get('/getClientTransactions/:id', (req, res) => {
    const clientId = req.params.id;
    const { name, startDate, endDate, description, transactionType } = req.query;

    let query = 'SELECT * FROM transactions WHERE client_id = ?';
    const params = [clientId];

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
        query += ' AND transaction_type = ?';
        params.push(transactionType);
    }

    con.query(query, params, (err, results) => {
        if (err) {
            return res.status(500).json({ message: 'Database error', error: err });
        }

        res.status(200).json(results);
    });
});

// DELETE account by ID
router.delete('/deleteClient/:id', async (req, res) => {
    const clientId = req.params.id;

    try {
        // Check if the client has any transactions
        const transactions = await con.query(
            'SELECT * FROM transactions WHERE client_id = ?',
            [clientId]
        );

        if (transactions.length > 0) {
            return res.status(400).json({ message: 'Cannot delete account. There are associated transactions.' });
        }

        // Delete the client
        const result = await con.query(
            'DELETE FROM clients WHERE id = ?',
            [clientId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Client not found' });
        }

        res.json({ message: 'Client deleted successfully' });
    } catch (error) {
        console.error('Error deleting client:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

router.put('/updateClient/:id', async (req, res) => {
  const clientId = req.params.id;
  const { name, email, contact, address, description } = req.body;

  try {
    const result = await con.query(
      'UPDATE clients SET name = ?, email = ?, contact = ?, address = ?, description = ? WHERE id = ?',
      [name, email, contact, address, description, clientId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Client not found' });
    }

    res.json({ message: 'Client updated successfully' });
  } catch (error) {
    console.error('Error updating client:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});


// Express route (Node.js backend example)
router.get('/getClientSummary/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const transactions = await db.query('SELECT transaction_type, amount FROM transactions WHERE client_id = ?', [id]);

    let totalCredit = 0, totalDebit = 0;

    transactions.forEach(({ transaction_type, amount }) => {
      if (transaction_type === 'credit') totalCredit += amount;
      if (transaction_type === 'debit') totalDebit += amount;
    });

    res.json({ totalCredit, totalDebit });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to get summary' });
  }
});

export default router;
