const express = require('express');
const router = express.Router();
const db = require('../db/connection');
const multer = require('multer');
const path = require('path');

// Configure Multer for image uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'frontend/img'); // Save images in the 'uploads/' folder
    },
    filename: (req, file, cb) => {
        const uniqueName = `${Date.now()}-${file.originalname}`;
        cb(null, uniqueName); // Generate a unique filename
    }
});
const upload = multer({ storage });

// Expose the 'uploads/' folder statically
const app = express();
app.use('/img', express.static(path.join(__dirname, '../frontend/img')));

// Add a new item to the database with image upload
router.post('/', upload.single('item_image'), (req, res, next) => {
    const { item_name, item_cost, availability, item_quantity } = req.body;
    const item_image = req.file ? `../frontend/img/${req.file.filename}` : null; // Store the image path

    // Validate input
    if (!item_name || !item_cost || !item_image || availability === undefined || !item_quantity) {
        const error = new Error('All fields are required: item_name, item_cost, item_image, availability, item_quantity.');
        error.status = 400; // Bad Request
        return next(error);
    }

    const query = `
        INSERT INTO item (item_name, item_cost, item_image, availability, item_quantity)
        VALUES (?, ?, ?, ?, ?);
    `;
    db.query(query, [item_name, item_cost, item_image, availability, item_quantity], (err, result) => {
        if (err) {
            return next(new Error('Failed to add item to the database.'));
        }
        res.status(201).json({ message: 'Item added successfully', id: result.insertId });
    });
});

// Update an item with optional image upload
router.put('/:item_id', upload.single('item_image'), (req, res, next) => {
    let { item_name, item_cost, availability, item_quantity } = req.body;
    const item_image = req.file ? `../frontend/img/${req.file.filename}` : null; // Store the image path


    // Validate input
    item_quantity = parseInt(item_quantity);
    availability = availability === '1' ? 1 : 0;
    item_cost = parseFloat(item_cost);

    if (isNaN(item_quantity) || isNaN(item_cost) || !item_name || availability === undefined) {
        return res.status(400).json({ error: 'Invalid input data.' });
    }

    const query = `
        UPDATE item
        SET item_name = ?, item_cost = ?, item_image = COALESCE(?, item_image), availability = ?, item_quantity = ?
        WHERE item_id = ?;
    `;

    db.query(query, [item_name, item_cost, item_image, availability, item_quantity, req.params.item_id], (err, result) => {
        if (err) {
            return next(new Error('Failed to update item.'));
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Item not found.' });
        }
        res.status(200).json({ message: 'Item updated successfully' });
    });
});

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

// search
router.get('/search', (req, res, next) => {
    const { name } = req.query;
    console.log('Search route hit with name:', name);

    if (!name) {
        return res.status(400).json({ error: 'Search query (name) is required.' });
    }

    const query = `
        SELECT item_id, item_name, item_cost, item_image, availability, item_quantity
        FROM item
        WHERE item_name LIKE ?;
    `;

    db.query(query, [`%${name}%`], (err, results) => {
        if (err) {
            console.error('Database query failed:', err);
            const error = new Error('Failed to search items.');
            error.status = 500;
            return next(error);
        }

        console.log('Query results:', results);
        res.status(200).json(results || []);
    });
});

router.get('/all', (req, res, next) => {
    const query = `
        SELECT item_id, item_name, item_cost, item_image, availability, item_quantity
        FROM item;
    `;

    db.query(query, (err, results) => {
        if (err) {
            const error = new Error('Failed to fetch all items.');
            error.status = 500;
            return next(error); // Pass error to middleware
        }
        res.status(200).json(results); // Send all items as response
    });
});

// Get an item by item_id
router.get('/:item_id', (req, res, next) => {
    const query = `
        SELECT item_id, item_name, item_cost, item_image, availability, item_quantity
        FROM item
        WHERE item_id = ?;
    `;

    db.query(query, [req.params.item_id], (err, results) => {
        if (err) {
            const error = new Error('Failed to fetch item.');
            error.status = 500;
            return next(error);
        }

        // If no item found
        if (results.length === 0) {
            return res.status(404).json({ message: 'Item not found' });
        }

        // Send the found item as the response
        res.status(200).json(results[0]);
    });
});


// // Add a new item to the database
// router.post('/', (req, res, next) => {
//     const { item_name, item_cost, item_image, availability, item_quantity } = req.body;

//     // Validate input
//     if (!item_name || !item_cost || !item_image || availability === undefined || !item_quantity) {
//         const error = new Error('All fields are required: item_name, item_cost, item_image, availability, item_quantity.');
//         error.status = 400; // Bad Request
//         return next(error);
//     }

//     const query = `
//         INSERT INTO item (item_name, item_cost, item_image, availability, item_quantity)
//         VALUES (?, ?, ?, ?, ?);
//     `;
//     db.query(query, [item_name, item_cost, item_image, availability, item_quantity], (err, result) => {
//         if (err) return next(new Error('Failed to add item to the database.'));
//         res.status(201).json({ message: 'Item added successfully', id: result.insertId });
//     });
// });


// Add an item to a vending machine
router.post('/vending-machine/:id', (req, res, next) => {
    const { item_id, item_quantity } = req.body;
    console.log(req);
    console.log(item_id)
    console.log(item_quantity);
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
// router.put('/:item_id', (req, res, next) => {
//     let { item_quantity, availability, item_name, item_cost } = req.body;

//     // Convert fields to correct types
//     item_quantity = parseInt(item_quantity); // Convert item_quantity to an integer
//     availability = availability === '1' ? 1 : 0; // Convert availability to 1 or 0
//     item_cost = parseFloat(item_cost); // Convert item_cost to a float

//     // Basic validation
//     if (isNaN(item_quantity) || isNaN(item_cost) || availability === undefined || !item_name) {
//         return res.status(400).json({ error: 'Invalid data. Please provide valid item_quantity, item_cost, availability, and item_name.' });
//     }

//     // SQL query to update the item
//     const query = `
//         UPDATE item
//         SET item_quantity = ?, availability = ?, item_name = ?, item_cost = ?
//         WHERE item_id = ?;
//     `;
    
//     db.query(query, [item_quantity, availability, item_name, item_cost, req.params.item_id], (err, result) => {
//         if (err) {
//             return res.status(500).json({ error: 'Failed to update item.' });
//         }

//         // Check if any row was affected (i.e., item exists)
//         if (result.affectedRows === 0) {
//             return res.status(404).json({ error: 'Item not found.' });
//         }

//         // Success
//         res.status(200).json({ message: 'Item updated successfully' });
//     });
// });


// Delete an item
router.delete('/:item_id', (req, res, next) => {
    const query = 'DELETE FROM item WHERE item_id = ?';
    db.query(query, [req.params.item_id], (err) => {
        if (err) return next(new Error('Failed to delete item.'));
        res.status(200).json({ message: 'Item deleted' });
    });
});


module.exports = router;
