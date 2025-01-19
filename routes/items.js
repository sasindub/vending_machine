const express = require('express');
const router = express.Router();
const db = require('../db/connection');

// Get all items in a vending machine
router.get('/vending-machine/:id', (req, res) => {
    const query = `
        SELECT i.item_id, i.item_name, i.item_cost, i.item_image, i.availability, i.item_quantity
        FROM vending_item vi
        JOIN item i ON vi.item_id = i.item_id
        WHERE vi.vending_machine_id = ?;
    `;
    db.query(query, [req.params.id], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// Add an item to a vending machine
router.post('/vending-machine/:id', (req, res) => {
    const { item_id, item_quantity } = req.body;
    const query = 'INSERT INTO vending_item (vending_machine_id, item_id) VALUES (?, ?)';
    db.query(query, [req.params.id, item_id], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Item added to vending machine' });
    });
});

// Update an item in a vending machine
router.put('/:item_id', (req, res) => {
    const { item_quantity, availability } = req.body;
    const query = `
        UPDATE item
        SET item_quantity = ?, availability = ?
        WHERE item_id = ?;
    `;
    db.query(query, [item_quantity, availability, req.params.item_id], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Item updated' });
    });
});

// Delete an item from a vending machine
router.delete('/:item_id', (req, res) => {
    const query = 'DELETE FROM item WHERE item_id = ?';
    db.query(query, [req.params.item_id], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Item deleted' });
    });
});

module.exports = router;
