//TABLE FILTER FOR ADMIN... //

//Search Filter
$(document).ready(function () {
    $(".search-icon").click(function () {
        $(".search-box").toggle();
        $(".search-box input[type='text']").focus();
    });

    $("#myInput").on("keyup", function () {
        var value = $(this).val().toLowerCase();
        $("#myTable tr").filter(function () {
            $(this).toggle($(this).text().toLowerCase().indexOf(value) > -1)
        });
    });

});

//Dropdown Filter
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

// Tab Filters (Active & Inactive)
function viewAll(){ //for inventory (product category) and purchasing (product category)
    var table = document.getElementById("table");
    var rows = table.getElementsByTagName("tr");

    for (let row of rows) { // `for...of` loops through the NodeList
        row.style.display = ""; // shows this row
    }
}

function viewActive(){ //for inventory (product category) and purchasing (product category)
    var button = document.getElementById("activeusers-tab");
    var table = document.getElementById("table");
    var rows = table.getElementsByTagName("tr");
    var filter = button.value;

    for (let row of rows) { // `for...of` loops through the NodeList
        cells = row.getElementsByTagName("td");
        isActive = cells[5] || null; // gets the 3rd `td` or nothing
        // if the filter is set to 'All', or this is the header row, or 2nd `td` text matches filter
        if ( !isActive || (filter === isActive.textContent)) {
            row.style.display = ""; // shows this row
        }
        else {
            row.style.display = "none"; // hides this row
        }
    }
}

function viewInactive(){ //for inventory (product category) and purchasing (product category)
    var button = document.getElementById("inactiveusers-tab");
    var table = document.getElementById("table");
    var rows = table.getElementsByTagName("tr");
    var filter = button.value;

    for (let row of rows) { // `for...of` loops through the NodeList
        cells = row.getElementsByTagName("td");
        isActive = cells[5] || null; // gets the 3rd `td` or nothing
        // if the filter is set to 'All', or this is the header row, or 2nd `td` text matches filter
        if ( !isActive || (filter === isActive.textContent)) {
            row.style.display = ""; // shows this row
        }
        else {
            row.style.display = "none"; // hides this row
        }
    }
}
