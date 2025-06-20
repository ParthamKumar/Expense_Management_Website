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

// router.get('/getBuySummaryByProduct/:productId', (req, res) => {
//     const productId = req.params.productId;

//     const query = `
//       SELECT 
//         bst.date,
//         c.name AS partyName,
//         bst.quantity,
//         bst.rate,
//         bst.buying_amount,
//         bst.unit,
//         p.name,
//         bst.party_description
//       FROM buyselltransactions bst
//       JOIN products p ON bst.product_id = p.id
//       JOIN clients c ON bst.party_id = c.id
//       WHERE p.id = ? AND bst.transaction_type = 'buy';
//     `;

//     con.query(query, [productId], (err, results) => {
//         if (err) {
//             console.error("DB Error:", err);
//             return res.status(500).json({ message: 'Failed to fetch buy transaction summary by product', error: err });
//         }
//         res.status(200).json({ transactions: results });
//     });
// });
router.get('/getBuySummaryByProduct/:productId', (req, res) => {
  const productId = req.params.productId;

  const query = `
    SELECT 
      bst.date,
      c.name AS partyName,
      COALESCE(bi.description, bst.party_description) AS description,
      COALESCE(bst.bill_no, 'N/A') AS bill_no,
      bst.quantity,
      bst.rate,
      bst.unit,
      p.name AS product_name,
      bst.transaction_type,
      COALESCE(b.total_amount, bst.buying_amount) AS total_amount
    FROM buyselltransactions bst
    JOIN products p ON bst.product_id = p.id
    JOIN clients c ON bst.party_id = c.id
    LEFT JOIN bills b ON bst.bill_no = b.bill_no
    LEFT JOIN bill_items bi ON b.id = bi.bill_id AND bi.product_id = bst.product_id
    WHERE 
      p.id = ?
      AND (
        bst.transaction_type = 'buy'
        OR (bst.transaction_type = 'sell' AND bst.bill_no IS NOT NULL)
      )
    ORDER BY bst.date DESC
  `;

  con.query(query, [productId], (err, results) => {
    if (err) {
      console.error("DB Error:", err);
      return res.status(500).json({ message: 'Failed to fetch transaction summary by product', error: err });
    }
    res.status(200).json({ transactions: results });
  });
});



export default router;