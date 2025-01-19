const express = require('express');
const router = express.Router();
const db = require('../db/connection');

// Get all vending machines
router.get('/', (req, res) => {
    const query = `
        SELECT vm.vending_machine_id, vm.vendor_name, vm.status_id, l.school, l.block, l.floor, s.status_name
        FROM vending_machine vm
        LEFT JOIN location l ON vm.location_id = l.location_id
        LEFT JOIN status s ON vm.status_id = s.status_id;
    `;
    db.query(query, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// Get vending machine by ID
router.get('/:id', (req, res) => {
    const query = `
        SELECT vm.*, l.school, l.block, l.floor, s.status_name
        FROM vending_machine vm
        LEFT JOIN location l ON vm.location_id = l.location_id
        LEFT JOIN status s ON vm.status_id = s.status_id
        WHERE vm.vending_machine_id = ?;
    `;
    db.query(query, [req.params.id], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results[0]);
    });
});

// Add a vending machine
router.post('/', (req, res) => {
    const { location_id, vendor_name, status_id } = req.body;
    const query = 'INSERT INTO vending_machine (location_id, vendor_name, status_id) VALUES (?, ?, ?)';
    db.query(query, [location_id, vendor_name, status_id], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Vending machine added', id: result.insertId });
    });
});

// Update a vending machine
router.put('/:id', (req, res) => {
    const { location_id, vendor_name, status_id } = req.body;
    const query = `
        UPDATE vending_machine
        SET location_id = ?, vendor_name = ?, status_id = ?
        WHERE vending_machine_id = ?;
    `;
    db.query(query, [location_id, vendor_name, status_id, req.params.id], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Vending machine updated' });
    });
});

// Delete a vending machine
router.delete('/:id', (req, res) => {
    const query = 'DELETE FROM vending_machine WHERE vending_machine_id = ?';
    db.query(query, [req.params.id], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Vending machine deleted' });
    });
});

module.exports = router;
