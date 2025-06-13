import express from "express";
// import con from "../utils/db.js"; // Ensure the correct MySQL connection is imported
import { con, pool } from "../utils/db.js";


const router = express.Router();

// Adding Product 
router.post('/addProduct', (req, res) => {
    const { name } = req.body;

    if (!name) {
        return res.status(400).json({ message: 'Product name is required' });
    }

    const query = `INSERT INTO Products (name) VALUES (?)`;
    con.query(query, [name], (err, result) => {
        if (err) {
            return res.status(500).json({ message: 'Error adding product', error: err });
        }
        res.status(200).json({ message: 'Product added successfully', productId: result.insertId });
    });
});

router.get('/getProducts', (req, res) => {
    const query = `SELECT * FROM Products`;

    con.query(query, (err, results) => {
        if (err) {
            return res.status(500).json({ message: 'Error fetching products', error: err });
        }
        res.status(200).json(results);
    });
});

export default router;