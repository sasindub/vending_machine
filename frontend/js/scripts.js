const vendingMachinesApiUrl = "http://localhost:3000/api/vending-machines";
const addItemApiUrl = "http://localhost:3000/api/items/all";
const addToMachineApiUrl = "http://localhost:3000/api/items/vending-machine";

let currentVendingMachineId = null; // Track the vending machine being modified

// Fetch all vending machines on page load
function fetchVendingMachines() {
    fetch(vendingMachinesApiUrl)
        .then((response) => response.json())
        .then((data) => populateTable(data))
        .catch((error) => console.error("Error fetching vending machines:", error));
}

// Populate the vending machines table
// Populate the vending machines container with cards
function populateTable(vendingMachines) {
    const container = document.getElementById("vending-machines-container");
    container.innerHTML = ""; // Clear existing content

        // Add sample image if not available in API
        const sampleImage = ["v1.png","v2.png","v3.png","v4.png","v4.png","v4.png"];
        var i = 1 ;
    vendingMachines.forEach((machine) => {
        const card = document.createElement("div");
        card.classList.add("vending-machine-card");

        card.innerHTML = `
            <img src="./img/v${i}.png" alt="${machine.vendor_name}">
            <h3>${machine.vendor_name}</h3>
            <p><strong>Block:</strong> ${machine.block}</p>
            <p><strong>Floor:</strong> ${machine.floor}</p>
            <p><strong>Status:</strong> ${machine.status_name}</p>
            <p><strong>Payment Methods:</strong> ${machine.payment_id  === 1 ? "Card" : "Cash" || "Loading..."}</p>
            <a href="#" class="view-items-btn" onclick="fetchItems(${machine.vending_machine_id})">View Items</a>
        `;
        i = i +1;
        container.appendChild(card);
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

// Open modal for viewing items in a vending machine
// Fetch and display items as cards in the modal
function fetchItems(machineId) {
    currentVendingMachineId = machineId; // Track the current vending machine ID

    fetch(`http://localhost:3000/api/items/vending-machine/${machineId}`)
        .then((response) => response.json())
        .then((data) => {
            const itemsContainer = document.getElementById("items-container");
            itemsContainer.innerHTML = ""; // Clear previous items

            data.forEach((item) => {
                const card = document.createElement("div");
                card.classList.add("item-card");

                card.innerHTML = `
                    <img src="${item.item_image}" alt="${item.item_name}">
                    <h3>${item.item_name}</h3>
                    <p>Cost: $${item.item_cost}</p>
                    <p>Quantity: ${item.item_quantity}</p>
                    <p class="availability ${item.availability ? "" : "not-available"}">
                        ${item.availability ? "Available" : "Out of Stock"}
                    </p>
                `;

                itemsContainer.appendChild(card);
            });

            openModal("item-details-modal");
        })
        .catch((error) => console.error("Error fetching items:", error));
}


// Open modal for adding an item to a vending machine
function openAddToMachineModal() {
    fetchAllItemsForDropdown();
    openModal("add-to-machine-modal");
}

// Fetch all items and populate the dropdown for adding to a vending machine
function fetchAllItemsForDropdown() {
    fetch(addItemApiUrl)
        .then((response) => response.json())
        .then((data) => {
            const itemSelect = document.getElementById("item-select");
            itemSelect.innerHTML = ""; // Clear existing options

            data.forEach((item) => {
                const option = document.createElement("option");
                option.value = item.item_id;
                option.textContent = `${item.item_name} - Price: $${item.item_cost}`;
                itemSelect.appendChild(option);
            });
        })
        .catch((error) => console.error("Error fetching items for dropdown:", error));
}

// Handle form submission to add an item to a vending machine
function handleAddToMachine(event) {
    event.preventDefault();

    const formData = new FormData(event.target);
    const payload = Object.fromEntries(formData.entries());

    fetch(`${addToMachineApiUrl}/${currentVendingMachineId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    })
        .then((response) => {
            if (response.ok) {
                alert("Item added to vending machine successfully!");
                closeModal("add-to-machine-modal");
                fetchItems(currentVendingMachineId); // Refresh vending machine items
            } else {
                throw new Error("Failed to add item to vending machine.");
            }
        })
        .catch((error) => {
            console.error("Error adding item to vending machine:", error);
            alert("An error occurred. Please try again.");
        });
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

// General modal management
function openModal(modalId) {
    document.getElementById(modalId).style.display = "block";
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = "none";
}
