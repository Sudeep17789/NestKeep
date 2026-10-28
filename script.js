// ========================================
// NestKeep - Hostel & PG Management System
// Dashboard and Room Management
// ========================================

// Load saved room records from browser storage.

function loadRooms() {
    try {
        const savedRooms = localStorage.getItem("nestkeep_rooms");

        if (!savedRooms) {
            return [];
        }

        const parsedRooms = JSON.parse(savedRooms);

        if (!Array.isArray(parsedRooms)) {
            return [];
        }

        return parsedRooms.filter(room =>
            room &&
            typeof room.id === "number" &&
            typeof room.number === "string" &&
            Number.isInteger(room.capacity) &&
            room.capacity >= 1 &&
            room.capacity <= 100
        );

    } catch (error) {
        console.error("Unable to load rooms:", error);
        return [];
    }
}

let rooms = loadRooms();


// Save rooms to browser storage.

function saveRooms() {
    try {
        localStorage.setItem(
            "nestkeep_rooms",
            JSON.stringify(rooms)
        );

        return true;

    } catch (error) {
        console.error("Unable to save rooms:", error);

        alert(
            "Could not save room data. Check your browser storage settings."
        );

        return false;
    }
}


// Update dashboard cards.

function updateDashboard() {
    let residents = [];
    let complaints = [];

    try {
        residents = JSON.parse(
            localStorage.getItem("nestkeep_residents") || "[]"
        );

        complaints = JSON.parse(
            localStorage.getItem("nestkeep_complaints") || "[]"
        );

        if (!Array.isArray(residents)) residents = [];
        if (!Array.isArray(complaints)) complaints = [];

    } catch (error) {
        console.error("Unable to load dashboard data:", error);
    }

    const pendingRent = residents.reduce((total, resident) => {
        return total + Math.max(
            0,
            Number(resident.pendingRent) || 0
        );
    }, 0);

    document.getElementById("totalRooms").textContent =
        rooms.length;

    document.getElementById("totalResidents").textContent =
        residents.length;

    document.getElementById("pendingRent").textContent =
        "₹" + pendingRent.toLocaleString("en-IN");

    document.getElementById("openComplaints").textContent =
        complaints.filter(complaint =>
            complaint.status !== "Resolved"
        ).length;
}


// Display all registered rooms.

function displayRooms() {
    const roomList = document.getElementById("roomList");

    roomList.replaceChildren();

    if (rooms.length === 0) {
        const message = document.createElement("p");

        message.className = "empty-message";
        message.textContent =
            "No rooms added yet. Add your first room!";

        roomList.appendChild(message);

        return;
    }

    rooms.forEach(room => {
        const item = document.createElement("div");

        item.className = "room-item";

        const details = document.createElement("div");

        details.className = "room-details";

        const number = document.createElement("span");

        number.className = "room-number";
        number.textContent = "Room " + room.number;

        const capacity = document.createElement("span");

        capacity.className = "room-capacity";
        capacity.textContent =
            room.capacity + (room.capacity === 1 ? " bed" : " beds");

        details.append(number, capacity);

        const deleteButton = document.createElement("button");

        deleteButton.className = "delete-btn";
        deleteButton.textContent = "Delete";
        deleteButton.type = "button";

        deleteButton.addEventListener("click", () => {
            deleteRoom(room.id);
        });

        item.append(details, deleteButton);

        roomList.appendChild(item);
    });
}


// Add a new room.

document.getElementById("roomForm").addEventListener(
    "submit",
    function (event) {
        event.preventDefault();

        const roomNumber = document
            .getElementById("roomNumber")
            .value
            .trim();

        const bedCapacity = Number(
            document.getElementById("bedCapacity").value
        );

        if (!roomNumber) {
            alert("Please enter a room number.");
            return;
        }

        if (
            !Number.isInteger(bedCapacity) ||
            bedCapacity < 1 ||
            bedCapacity > 100
        ) {
            alert("Enter a whole number of beds between 1 and 100.");
            return;
        }

        // Prevent duplicate room numbers.

        const duplicate = rooms.some(room =>
            room.number.toLowerCase() === roomNumber.toLowerCase()
        );

        if (duplicate) {
            alert("This room number already exists.");
            return;
        }

        const newRoom = {
            id: Date.now(),
            number: roomNumber,
            capacity: bedCapacity
        };

        rooms.push(newRoom);

        if (!saveRooms()) {
            rooms.pop();
            return;
        }

        displayRooms();
        updateDashboard();

        this.reset();

        alert("Room added successfully!");
    }
);


// Delete a room.

function deleteRoom(id) {
    const confirmed = confirm(
        "Are you sure you want to delete this room?"
    );

    if (!confirmed) {
        return;
    }

    const previousRooms = rooms;

    rooms = rooms.filter(room => room.id !== id);

    if (!saveRooms()) {
        rooms = previousRooms;
        return;
    }

    displayRooms();
    updateDashboard();

    alert("Room deleted successfully!");
}


// Initialize the application.

function initializeApp() {
    displayRooms();
    updateDashboard();
}

initializeApp();