//TABLE FILTER FOR ADMIN... //

//Search Filter 
function searchTable() {
    var input, filter, table, tr, td, td2, td3, i;
      input = document.getElementById("myInput");
      filter = input.value.toUpperCase();
      table = document.getElementById("myTable");
      tr = table.getElementsByTagName("tr");
      
      for (i = 0; i < tr.length; i++) {
        td = tr[i].getElementsByTagName("td")[0]; // for column one
        td1 = tr[i].getElementsByTagName("td")[1]; // for column two
        td2 = tr[i].getElementsByTagName("td")[2]; 
        td3 = tr[i].getElementsByTagName("td")[3]; 
    /* ADD columns here that you want you to filter to be used on */
        if (td) {
          if ( (td.innerHTML.toUpperCase().indexOf(filter) > -1) || (td1.innerHTML.toUpperCase().indexOf(filter) > -1) 
          || (td2.innerHTML.toUpperCase().indexOf(filter) > -1) || (td3.innerHTML.toUpperCase().indexOf(filter) > -1))  {            
            tr[i].style.display = "";
          } else {
            tr[i].style.display = "none";
          }
        }
      }
} 

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
    document.getElementById("all-tab").classList.add("selected");
    document.getElementById("activeusers-tab").classList.remove("selected");
    document.getElementById("inactiveusers-tab").classList.remove("selected");
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

    document.getElementById("all-tab").classList.remove("selected");
    document.getElementById("activeusers-tab").classList.add("selected");
    document.getElementById("inactiveusers-tab").classList.remove("selected");
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

    document.getElementById("all-tab").classList.remove("selected");
    document.getElementById("activeusers-tab").classList.remove("selected");
    document.getElementById("inactiveusers-tab").classList.add("selected");
}
