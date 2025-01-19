const express = require('express');
const router = express.Router();
const db = require('../db/connection');

// Get payment methods for a vending machine
router.get('/vending-machine/:id', (req, res, next) => {
    const query = `
        SELECT pm.payment_id, pm.payment_name
        FROM vending_payment vp
        JOIN payment_method pm ON vp.payment_id = pm.payment_id
        WHERE vp.vending_machine_id = ?;
    `;
    db.query(query, [req.params.id], (err, results) => {
        if (err) return next(new Error('Failed to fetch payment methods.'));
        res.status(200).json(results);
    });
});

// Add a payment method to a vending machine
router.post('/vending-machine/:id', (req, res, next) => {
    const { payment_id } = req.body;

    if (!payment_id) {
        return next(new Error('Field is required: payment_id.'));
    }

    const query = 'INSERT INTO vending_payment (vending_machine_id, payment_id) VALUES (?, ?)';
    db.query(query, [req.params.id, payment_id], (err) => {
        if (err) return next(new Error('Failed to add payment method.'));
        res.status(201).json({ message: 'Payment method added' });
    });
});

// Delete a payment method
router.delete('/:id', (req, res, next) => {
    const query = 'DELETE FROM vending_payment WHERE vending_payment_id = ?';
    db.query(query, [req.params.id], (err) => {
        if (err) return next(new Error('Failed to delete payment method.'));
        res.status(200).json({ message: 'Payment method deleted' });
    });
});

module.exports = router;
