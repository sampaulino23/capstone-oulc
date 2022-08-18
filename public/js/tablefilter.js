//TABLE FILTER FOR ADMIN...

function filterUserDepartment(){ //for inventory (product category) and purchasing (product category)
    var dropdown = document.getElementById("departmentdropdown");
    var table = document.getElementById("table");
    var rows = table.getElementsByTagName("tr");
    var filter = dropdown.value;

    for (let row of rows) { // `for...of` loops through the NodeList
        cells = row.getElementsByTagName("td");
        department = cells[2] || null; // gets the 2nd `td` or nothing
        // if the filter is set to 'All', or this is the header row, or 2nd `td` text matches filter
        if (filter === "All" || !department || (filter === department.textContent)) {
            row.style.display = ""; // shows this row
        }
        else {
            row.style.display = "none"; // hides this row
        }
    }
}

function filterUserRole(){ //for inventory (product category) and purchasing (product category)
    var dropdown = document.getElementById("roledropdown");
    var table = document.getElementById("table");
    var rows = table.getElementsByTagName("tr");
    var filter = dropdown.value;

    for (let row of rows) { // `for...of` loops through the NodeList
        cells = row.getElementsByTagName("td");
        role = cells[3] || null; // gets the 3rd `td` or nothing
        // if the filter is set to 'All', or this is the header row, or 2nd `td` text matches filter
        if (filter === "All" || !role || (filter === role.textContent)) {
            row.style.display = ""; // shows this row
        }
        else {
            row.style.display = "none"; // hides this row
        }
    }
}

// Reset Dropdown Filter Values
function resetDepartment(){ //for admin user management
    document.getElementById("departmentdropdown").value='a';

    if(document.getElementById("roledropdown").value === "All")    {
        document.getElementById("departmentdropdown").value='All';
    }
}
function resetRole(){ //for admin user management
    document.getElementById("roledropdown").value='a';

    if(document.getElementById("departmentdropdown").value === "All")    {
        document.getElementById("roledropdown").value='All';
    }
}

