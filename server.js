const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const db = require('./db/connection');

const vendingMachinesRoutes = require('./routes/vendingMachines');
const itemsRoutes = require('./routes/items');
const paymentsRoutes = require('./routes/payments');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

// Check Database Connection
db.connect((err) => {
    if (err) {
        console.error('Failed to connect to the database:', err.message);
        process.exit(1);
    } else {
        console.log('Connected to the database.');
    }
});

// Routes
app.use('/api/vending-machines', vendingMachinesRoutes);
app.use('/api/items', itemsRoutes);
app.use('/api/payments', paymentsRoutes);

// Centralized Error Handling
app.use((err, req, res, next) => {
    console.error('Error:', err.message);
    res.status(err.status || 500).json({
        error: err.message || 'An unexpected error occurred.',
    });
});

// Start the Server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
