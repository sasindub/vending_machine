const db = require('../db/connection');

const getAllMachines = (req, res) => {
    const query = `
        SELECT vm.*, l.school, l.block, l.floor, s.status_name
        FROM vending_machine vm
        LEFT JOIN location l ON vm.location_id = l.location_id
        LEFT JOIN status s ON vm.status_id = s.status_id;
    `;
    db.query(query, (err, results) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.status(200).json(results);
        }
    });
};

// Define other CRUD operations here...
module.exports = { getAllMachines, getMachineById, addMachine, updateMachine, deleteMachine };
