const apiUrl = "http://localhost:3000/api/items";

function fetchAllItems() {
    const apiNew = `${apiUrl}/all`;
    fetch(apiNew)
        .then((response) => {
            if (!response.ok) throw new Error(`Failed to fetch items. Status: ${response.status}`);
            return response.json();
        })
        .then((data) => {
            populateItemsTable(data);
        })
        .catch((error) => {
            console.error("Error fetching items:", error);
            // alert("Failed to load items. Please try again later.");
        });
}

// Populate the items table
function populateItemsTable(items) {
    const tableBody = document.querySelector("#items-table tbody");
    tableBody.innerHTML = "";

    // Handle case when items is empty or invalid
    if (!Array.isArray(items) || items.length === 0) {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td colspan="6" style="text-align: center; font-style: italic;">No items found</td>
        `;
        tableBody.appendChild(row);
        return;
    }

    // Populate rows if items exist
    items.forEach((item) => {
        const row = document.createElement("tr");

        row.innerHTML = `
            <td>${item.item_name}</td>
            <td>$${item.item_cost}</td>
            <td><img src="${item.item_image}" alt="${item.item_name}" style="width:50px;height:50px;"></td>
            <td>${item.availability ? "Available" : "Not Available"}</td>
            <td>${item.item_quantity}</td>
            <td>
                <button onclick="editItem(${item.item_id})">Edit</button>
                <button onclick="deleteItem(${item.item_id})">Delete</button>
            </td>
        `;

        tableBody.appendChild(row);
    });
}

// Search items by name
function searchItems() {
    const searchQuery = document.getElementById('search-input').value.trim();

    // If search query is empty, show all items
    if (searchQuery === '') {
        fetchAllItems();
        return;
    }

    // Fetch filtered items based on the search query
    fetch(`${apiUrl}/search?name=${encodeURIComponent(searchQuery)}`)
        .then((response) => {
            if (!response.ok) throw new Error(`Failed to search items. Status: ${response.status}`);
            return response.json();
        })
        .then((data) => {
            console.log("Search results:", data);
            populateItemsTable(data); // Populate table
        })
        .catch((error) => {
            console.error("Error searching items:", error);
            alert("Failed to search items. Please try again later.");
        });
}

// Open modal for adding a new item
function openAddItemModal() {
    document.getElementById("item-form").reset();
    document.getElementById("item_id").value = ""; // Clear hidden ID field
    document.getElementById("modal-title").innerText = "Add New Item";
    openModal("item-modal");
}

// Open modal for editing an existing item
function editItem(itemId) {
    fetch(`${apiUrl}/${itemId}`)
        .then((response) => {
            if (!response.ok) throw new Error("Failed to fetch item details.");
            return response.json();
        })
        .then((item) => {
            document.getElementById("item_name").value = item.item_name;
            document.getElementById("item_cost").value = item.item_cost;
            document.getElementById("availability").value = item.availability ? "1" : "0";
            document.getElementById("item_quantity").value = item.item_quantity;
            document.getElementById("item_id").value = item.item_id;

            document.getElementById("modal-title").innerText = "Edit Item";
            openModal("item-modal");
        })
        .catch((error) => {
            console.error("Error fetching item details:", error);
        });
}

// Handle Add/Edit item form submission
function handleItemFormSubmit(event) {
    event.preventDefault();

    const form = document.getElementById('item-form');
    const formData = new FormData(form);

    const itemId = formData.get('item_id');
    const method = itemId ? 'PUT' : 'POST';
    const url = itemId ? `${apiUrl}/${itemId}` : apiUrl;

    fetch(url, {
        method: method,
        body: formData, // Send FormData with the image file
    })
        .then((response) => {
            if (!response.ok) throw new Error('Failed to save item.');
            closeModal('item-modal');
            alert(itemId ? 'Item updated successfully!' : 'Item added successfully!');
            fetchAllItems(); // Refresh table
        })
        .catch((error) => {
            console.error('Error saving item:', error);
            alert('An error occurred. Please try again.');
        });
}


// Delete an item
function deleteItem(itemId) {
    if (confirm("Are you sure you want to delete this item?")) {
        fetch(`${apiUrl}/${itemId}`, { method: "DELETE" })
            .then((response) => {
                if (!response.ok) throw new Error("Failed to delete item.");
                fetchAllItems(); // Refresh table
            })
            .catch((error) => {
                console.error("Error deleting item:", error);
                alert("Failed to delete item. Please try again.");
            });
    }
}

// Open and close modals
function openModal(modalId) {
    document.getElementById(modalId).style.display = "block";
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = "none";
}
