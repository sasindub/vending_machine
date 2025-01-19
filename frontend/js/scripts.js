const apiUrl = "http://localhost:3000/api/vending-machines";

// Fetch all vending machines when the page loads
function fetchVendingMachines() {
    fetch(apiUrl)
        .then((response) => response.json())
        .then((data) => populateTable(data))
        .catch((error) => console.error("Error fetching vending machines:", error));
}

// Populate the table with vending machine data
function populateTable(vendingMachines) {
    const tableBody = document.querySelector("#vending-machines-table tbody");
    tableBody.innerHTML = ""; // Clear existing rows

    vendingMachines.forEach((machine) => {
        const row = document.createElement("tr");

        row.innerHTML = `
            <td>${machine.vendor_name}</td>
            <td>${machine.block}</td>
            <td>${machine.floor}</td>
            <td>${getPaymentMethods(machine.vending_machine_id)}</td>
            <td>${machine.status_name}</td>
            <td><a href="#" onclick="fetchItems(${machine.vending_machine_id})">View Items</a></td>
        `;

        tableBody.appendChild(row);
    });
}

// Fetch payment methods for a vending machine
function getPaymentMethods(machineId) {
    // Fetch the payment methods from the API (synchronous simulation)
    fetch(`http://localhost:3000/api/payments/vending-machine/${machineId}`)
        .then((response) => response.json())
        .then((data) => {
            console.log(data);
            const methods = data.map((method) => method.payment_name).join(", ");
            console.log(methods);
            document.querySelector(`tr[data-id='${machineId}'] td:nth-child(4)`).innerText = methods;
        })
        .catch((error) => console.error("Error fetching payment methods:", error));
}

// Fetch items for a vending machine and display in a modal
function fetchItems(machineId) {
    fetch(`http://localhost:3000/api/items/vending-machine/${machineId}`)
        .then((response) => response.json())
        .then((data) => displayItemsInModal(data))
        .catch((error) => console.error("Error fetching items:", error));
}

// Display items in the modal
function displayItemsInModal(items) {
    const itemsList = document.getElementById("items-list");
    itemsList.innerHTML = ""; // Clear previous items

    items.forEach((item) => {
        const li = document.createElement("li");
        li.innerHTML = `
            <strong>${item.item_name}</strong> - $${item.item_cost.toFixed(2)}
            <br><img src="${item.item_image}" alt="${item.item_name}" width="100">
            <p>${item.availability ? "Available" : "Out of Stock"} - Quantity: ${item.item_quantity}</p>
        `;
        itemsList.appendChild(li);
    });

    openModal();
}

// Open the modal
function openModal() {
    document.getElementById("modal").style.display = "block";
}

// Close the modal
function closeModal() {
    document.getElementById("modal").style.display = "none";
}
