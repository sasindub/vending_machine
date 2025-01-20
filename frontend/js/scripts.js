const vendingMachinesApiUrl = "http://localhost:3000/api/vending-machines";
const addItemApiUrl = "http://localhost:3000/api/items";

// Fetch all vending machines on page load
function fetchVendingMachines() {
    fetch(vendingMachinesApiUrl)
        .then((response) => response.json())
        .then((data) => populateTable(data))
        .catch((error) => console.error("Error fetching vending machines:", error));
}

// Populate the vending machines table
function populateTable(vendingMachines) {
    const tableBody = document.querySelector("#vending-machines-table tbody");
    tableBody.innerHTML = "";

    vendingMachines.forEach((machine) => {
        const row = document.createElement("tr");

        row.innerHTML = `
            <td>${machine.vendor_name}</td>
            <td>${machine.block}</td>
            <td>${machine.floor}</td>
            <td>${machine.payment_methods || "Loading..."}</td>
            <td>${machine.status_name}</td>
            <td><a href="#" onclick="fetchItems(${machine.vending_machine_id})">View Items</a></td>
        `;

        tableBody.appendChild(row);
        fetchPaymentMethods(machine.vending_machine_id);
    });
}

// Fetch payment methods for a vending machine
function fetchPaymentMethods(machineId) {
    fetch(`http://localhost:3000/api/payments/vending-machine/${machineId}`)
        .then((response) => response.json())
        .then((data) => {
            const methods = data.map((method) => method.payment_name).join(", ");
            const row = document.querySelector(`#vending-machines-table tbody tr:nth-child(${machineId}) td:nth-child(4)`);
            if (row) row.innerText = methods;
        })
        .catch((error) => console.error("Error fetching payment methods:", error));
}

// Open and close modals
function openModal(modalId) {
    document.getElementById(modalId).style.display = "block";
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = "none";
}

function openAddItemModal() {
    openModal("add-item-modal");
}

// Fetch and display items in modal
function fetchItems(machineId) {
    fetch(`http://localhost:3000/api/items/vending-machine/${machineId}`)
        .then((response) => response.json())
        .then((data) => {
            const itemsList = document.getElementById("items-list");
            itemsList.innerHTML = "";
            data.forEach((item) => {
                const li = document.createElement("li");
                li.innerHTML = `<strong>${item.item_name}</strong> - $${item.item_cost.toFixed(2)}<br>
                <img src="${item.item_image}" alt="${item.item_name}" width="100">
                <p>${item.availability ? "Available" : "Out of Stock"} - Quantity: ${item.item_quantity}</p>`;
                itemsList.appendChild(li);
            });
            openModal("item-details-modal");
        })
        .catch((error) => console.error("Error fetching items:", error));
}

// Handle the Add Item form submission
function handleAddItem(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const payload = Object.fromEntries(formData.entries());

    fetch(addItemApiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    })
        .then((response) => {
            if (response.ok) {
                alert("Item added successfully!");
                closeModal("add-item-modal");
                event.target.reset();
            } else {
                throw new Error("Failed to add item.");
            }
        })
        .catch((error) => {
            console.error("Error adding item:", error);
            alert("An error occurred. Please try again.");
        });
}
