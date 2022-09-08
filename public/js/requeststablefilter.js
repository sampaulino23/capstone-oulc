//TABLE FILTER FOR REQUEST TABLE... //

//Search Filter 
function searchTable() {
    var input, filter, table, tr, td, td2, td3,td4, td5, td6, td7, i;
      input = document.getElementById("myInput");
      filter = input.value.toUpperCase();
      table = document.getElementById("myTable");
      tr = table.getElementsByTagName("tr");
      
      for (i = 0; i < tr.length; i++) {
        td = tr[i].getElementsByTagName("td")[0]; // for column one
        td1 = tr[i].getElementsByTagName("td")[1]; // for column two
        td2 = tr[i].getElementsByTagName("td")[2]; 
        td3 = tr[i].getElementsByTagName("td")[3]; 
        td4 = tr[i].getElementsByTagName("td")[4]; 
        td5 = tr[i].getElementsByTagName("td")[5]; 
        td6 = tr[i].getElementsByTagName("td")[6]; 
        td7 = tr[i].getElementsByTagName("td")[7]; 
    /* ADD columns here that you want you to filter to be used on */
        if (td) {
          if ( (td.innerHTML.toUpperCase().indexOf(filter) > -1) || (td1.innerHTML.toUpperCase().indexOf(filter) > -1) 
          || (td2.innerHTML.toUpperCase().indexOf(filter) > -1) || (td3.innerHTML.toUpperCase().indexOf(filter) > -1)
          || (td4.innerHTML.toUpperCase().indexOf(filter) > -1) || (td5.innerHTML.toUpperCase().indexOf(filter) > -1) 
          || (td6.innerHTML.toUpperCase().indexOf(filter) > -1) || (td7.innerHTML.toUpperCase().indexOf(filter) > -1) )  {            
            tr[i].style.display = "";
          } else {
            tr[i].style.display = "none";
          }
        }
      }
    document.getElementById("all-tab").classList.add("selected");
    document.getElementById("pending-tab").classList.remove("selected");
    document.getElementById("waiting-tab").classList.remove("selected");
    document.getElementById("forlegalreview-tab").classList.remove("selected");
} 

//Dropdown Filter
function filterContractType(){ //for inventory (product category) and purchasing (product category)
    var dropdown = document.getElementById("contracttypedropdown");
    var table = document.getElementById("table");
    var rows = table.getElementsByTagName("tr");
    var filter = dropdown.value;

    for (let row of rows) { // `for...of` loops through the NodeList
        cells = row.getElementsByTagName("td");
        contracttype = cells[3] || null; // gets the 2nd `td` or nothing
        // if the filter is set to 'All', or this is the header row, or 2nd `td` text matches filter
        if (filter === "All" || !contracttype || (filter === contracttype.textContent)) {
            row.style.display = ""; // shows this row
        }
        else {
            row.style.display = "none"; // hides this row
        }
    }

    document.getElementById("all-tab").classList.add("selected");
    document.getElementById("pending-tab").classList.remove("selected");
    document.getElementById("waiting-tab").classList.remove("selected");
    document.getElementById("forlegalreview-tab").classList.remove("selected");
}

function filterRequestType(){ //for inventory (product category) and purchasing (product category)
    var dropdown = document.getElementById("requesttypedropdown");
    var table = document.getElementById("table");
    var rows = table.getElementsByTagName("tr");
    var filter = dropdown.value;

    for (let row of rows) { // `for...of` loops through the NodeList
        cells = row.getElementsByTagName("td");
        requesttype = cells[6] || null; // gets the 3rd `td` or nothing
        // if the filter is set to 'All', or this is the header row, or 2nd `td` text matches filter
        if (filter === "All" || !requesttype || (filter === requesttype.textContent)) {
            row.style.display = ""; // shows this row
        }
        else {
            row.style.display = "none"; // hides this row
        }
    }

    document.getElementById("all-tab").classList.add("selected");
    document.getElementById("pending-tab").classList.remove("selected");
    document.getElementById("waiting-tab").classList.remove("selected");
    document.getElementById("forlegalreview-tab").classList.remove("selected");
}

// Reset Dropdown Filter Values
function resetContractType(){ //for requests table
    document.getElementById("contracttypedropdown").value='a';

    if(document.getElementById("requesttypedropdown").value === "All")    {
        document.getElementById("contracttypedropdown").value='All';
    }
}
function resetRequestType(){ //for admin user management
    document.getElementById("requesttypedropdown").value='a';

    if(document.getElementById("contracttypedropdown").value === "All")    {
        document.getElementById("requesttypedropdown").value='All';
    }
}

// Tab Filters (Request Status)
function viewAll(){ 
    var table = document.getElementById("table");
    var rows = table.getElementsByTagName("tr");

    for (let row of rows) { // `for...of` loops through the NodeList
        row.style.display = ""; // shows this row
    }
    document.getElementById("all-tab").classList.add("selected");
    document.getElementById("pending-tab").classList.remove("selected");
    document.getElementById("toreview-tab").classList.remove("selected");
    document.getElementById("waiting-tab").classList.remove("selected");
    document.getElementById("forlegalreview-tab").classList.remove("selected");
}

function viewPending(){ 
    var button = document.getElementById("pending-tab");
    var table = document.getElementById("table");
    var rows = table.getElementsByTagName("tr");
    var filter = button.value;

    for (let row of rows) { // `for...of` loops through the NodeList
        cells = row.getElementsByTagName("td");
        requeststatus = cells[7] || null; // gets the 8th `td` or nothing
        // if the filter is set to 'All', or this is the header row, or 2nd `td` text matches filter
        if ( !requeststatus || (filter === requeststatus.textContent)) {
            row.style.display = ""; // shows this row
        }
        else {
            row.style.display = "none"; // hides this row
        }
    }

    document.getElementById("all-tab").classList.remove("selected");
    document.getElementById("pending-tab").classList.add("selected");
    document.getElementById("toreview-tab").classList.remove("selected");
    document.getElementById("waiting-tab").classList.remove("selected");
    document.getElementById("forlegalreview-tab").classList.remove("selected");
}

function viewToReview(){ 
    var button = document.getElementById("toreview-tab");
    var table = document.getElementById("table");
    var rows = table.getElementsByTagName("tr");
    var filter = button.value;

    for (let row of rows) { // `for...of` loops through the NodeList
        cells = row.getElementsByTagName("td");
        requeststatus = cells[7] || null; // gets the 8th `td` or nothing
        // if the filter is set to 'All', or this is the header row, or 2nd `td` text matches filter
        if ( !requeststatus || (filter === requeststatus.textContent)) {
            row.style.display = ""; // shows this row
        }
        else {
            row.style.display = "none"; // hides this row
        }
    }

    document.getElementById("all-tab").classList.remove("selected");
    document.getElementById("pending-tab").classList.remove("selected");
    document.getElementById("toreview-tab").classList.add("selected");
    document.getElementById("waiting-tab").classList.remove("selected");
    document.getElementById("forlegalreview-tab").classList.remove("selected");
}

function viewWaiting(){ 
    var button = document.getElementById("waiting-tab");
    var table = document.getElementById("table");
    var rows = table.getElementsByTagName("tr");
    var filter = button.value;

    for (let row of rows) { // `for...of` loops through the NodeList
        cells = row.getElementsByTagName("td");
        requeststatus = cells[7] || null; // gets the 8th `td` or nothing
        // if the filter is set to 'All', or this is the header row, or 2nd `td` text matches filter
        if ( !requeststatus || (filter === requeststatus.textContent)) {
            row.style.display = ""; // shows this row
        }
        else {
            row.style.display = "none"; // hides this row
        }
    }

    document.getElementById("all-tab").classList.remove("selected");
    document.getElementById("pending-tab").classList.remove("selected");
    document.getElementById("toreview-tab").classList.remove("selected");
    document.getElementById("waiting-tab").classList.add("selected");
    document.getElementById("forlegalreview-tab").classList.remove("selected");
}

function viewForLegalReview(){ 
    var button = document.getElementById("forlegalreview-tab");
    var table = document.getElementById("table");
    var rows = table.getElementsByTagName("tr");
    var filter = button.value;

    for (let row of rows) { // `for...of` loops through the NodeList
        cells = row.getElementsByTagName("td");
        requeststatus = cells[7] || null; // gets the 8th `td` or nothing
        // if the filter is set to 'All', or this is the header row, or 2nd `td` text matches filter
        if ( !requeststatus || (filter === requeststatus.textContent)) {
            row.style.display = ""; // shows this row
        }
        else {
            row.style.display = "none"; // hides this row
        }
    }

    document.getElementById("all-tab").classList.remove("selected");
    document.getElementById("pending-tab").classList.remove("selected");
    document.getElementById("toreview-tab").classList.remove("selected");
    document.getElementById("waiting-tab").classList.remove("selected");
    document.getElementById("forlegalreview-tab").classList.add("selected");
}

