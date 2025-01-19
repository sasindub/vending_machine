const express = require('express');
const router = express.Router();
const db = require('../db/connection');

// Get all items in a vending machine
router.get('/vending-machine/:id', (req, res, next) => {
    const query = `
        SELECT i.item_id, i.item_name, i.item_cost, i.item_image, i.availability, i.item_quantity
        FROM vending_item vi
        JOIN item i ON vi.item_id = i.item_id
        WHERE vi.vending_machine_id = ?;
    `;
    db.query(query, [req.params.id], (err, results) => {
        if (err) return next(new Error('Failed to fetch items for vending machine.'));
        res.status(200).json(results);
    });
});


// Add an item to a vending machine
router.post('/vending-machine/:id', (req, res, next) => {
    const { item_id, item_quantity } = req.body;

    if (!item_id || !item_quantity) {
        return next(new Error('All fields are required: item_id, item_quantity.'));
    }

    const query = 'INSERT INTO vending_item (vending_machine_id, item_id) VALUES (?, ?)';
    db.query(query, [req.params.id, item_id], (err) => {
        if (err) return next(new Error('Failed to add item to vending machine.'));
        res.status(201).json({ message: 'Item added to vending machine' });
    });
});

// Update an item
router.put('/:item_id', (req, res, next) => {
    const { item_quantity, availability } = req.body;

    if (!item_quantity || availability === undefined) {
        return next(new Error('All fields are required: item_quantity, availability.'));
    }

    const query = `
        UPDATE item
        SET item_quantity = ?, availability = ?
        WHERE item_id = ?;
    `;
    db.query(query, [item_quantity, availability, req.params.item_id], (err) => {
        if (err) return next(new Error('Failed to update item.'));
        res.status(200).json({ message: 'Item updated' });
    });
});

// Delete an item
router.delete('/:item_id', (req, res, next) => {
    const query = 'DELETE FROM item WHERE item_id = ?';
    db.query(query, [req.params.item_id], (err) => {
        if (err) return next(new Error('Failed to delete item.'));
        res.status(200).json({ message: 'Item deleted' });
    });
});

module.exports = router;
