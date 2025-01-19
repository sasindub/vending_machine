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

app.use('/api/vending-machines', vendingMachinesRoutes);
app.use('/api/items', itemsRoutes);
app.use('/api/payments', paymentsRoutes);

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));



