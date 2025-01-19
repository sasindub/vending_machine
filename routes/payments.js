const express = require('express');
const router = express.Router();
const db = require('../db/connection');

// Get payment methods for a vending machine
router.get('/vending-machine/:id', (req, res) => {
    const query = `
        SELECT pm.payment_id, pm.payment_name
        FROM vending_payment vp
        JOIN payment_method pm ON vp.payment_id = pm.payment_id
        WHERE vp.vending_machine_id = ?;
    `;
    db.query(query, [req.params.id], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// Add a payment method to a vending machine
router.post('/vending-machine/:id', (req, res) => {
    const { payment_id } = req.body;
    const query = 'INSERT INTO vending_payment (vending_machine_id, payment_id) VALUES (?, ?)';
    db.query(query, [req.params.id, payment_id], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Payment method added to vending machine' });
    });
});

// Remove a payment method from a vending machine
router.delete('/:id', (req, res) => {
    const query = 'DELETE FROM vending_payment WHERE vending_payment_id = ?';
    db.query(query, [req.params.id], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Payment method removed' });
    });
});

module.exports = router;
