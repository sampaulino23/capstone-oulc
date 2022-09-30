//TABLE FILTER FOR OULC... //

/* REQUESTS TABLE */

//Search Filter 
function searchRequestTable() {
    var input, filter, table, tr, td, td2, td3,td4, td5, td6, td7, i;
      input = document.getElementById("myInput");
      filter = input.value.toUpperCase();
      table = document.getElementById("myRequestTable");
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
    document.getElementById("toreview-tab").classList.remove("selected");
    document.getElementById("waiting-tab").classList.remove("selected");
    document.getElementById("forlegalreview-tab").classList.remove("selected");
    document.getElementById("cleared-tab").classList.remove("selected");
    document.getElementById("cancelled-tab").classList.remove("selected");
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
    document.getElementById("toreview-tab").classList.remove("selected");
    document.getElementById("waiting-tab").classList.remove("selected");
    document.getElementById("forlegalreview-tab").classList.remove("selected");
    document.getElementById("cleared-tab").classList.remove("selected");
    document.getElementById("cancelled-tab").classList.remove("selected");
}

//Dropdown Filter
function repositoryFilterContractType(){ //for inventory (product category) and purchasing (product category)
    var dropdown = document.getElementById("repositorycontractdropdown");
    var table = document.getElementById("table");
    var rows = table.getElementsByTagName("tr");
    var filter = dropdown.value;

    for (let row of rows) { // `for...of` loops through the NodeList
        cells = row.getElementsByTagName("td");
        contracttype = cells[1] || null; // gets the 2nd `td` or nothing
        // if the filter is set to 'All', or this is the header row, or 2nd `td` text matches filter
        if (filter === "All" || !contracttype || (filter === contracttype.textContent)) {
            row.style.display = ""; // shows this row
        }
        else {
            row.style.display = "none"; // hides this row
        }
    }
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
    document.getElementById("toreview-tab").classList.remove("selected");
    document.getElementById("waiting-tab").classList.remove("selected");
    document.getElementById("forlegalreview-tab").classList.remove("selected");
    document.getElementById("cleared-tab").classList.remove("selected");
    document.getElementById("cancelled-tab").classList.remove("selected");
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
function viewAllRequests(){ 
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
    document.getElementById("cleared-tab").classList.remove("selected");
    document.getElementById("cancelled-tab").classList.remove("selected");
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
    document.getElementById("cleared-tab").classList.remove("selected");
    document.getElementById("cancelled-tab").classList.remove("selected");
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
    document.getElementById("cleared-tab").classList.remove("selected");
    document.getElementById("cancelled-tab").classList.remove("selected");
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
    document.getElementById("cleared-tab").classList.remove("selected");
    document.getElementById("cancelled-tab").classList.remove("selected");
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
    document.getElementById("cleared-tab").classList.remove("selected");
    document.getElementById("cancelled-tab").classList.remove("selected");
}

function viewCleared(){ 
    var button = document.getElementById("cleared-tab");
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
    document.getElementById("forlegalreview-tab").classList.remove("selected");
    document.getElementById("cleared-tab").classList.add("selected");
    document.getElementById("cancelled-tab").classList.remove("selected");
}

function viewCancelled(){ 
    var button = document.getElementById("cancelled-tab");
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
    document.getElementById("forlegalreview-tab").classList.remove("selected");
    document.getElementById("cleared-tab").classList.remove("selected");
    document.getElementById("cancelled-tab").classList.add("selected");
}

/* TEMPLATES TABLE */
function searchTemplateTable() {
    var input, filter, table, tr, td, td2, i;
      input = document.getElementById("myInput");
      filter = input.value.toUpperCase();
      table = document.getElementById("myTemplateTable");
      tr = table.getElementsByTagName("tr");
      
      for (i = 0; i < tr.length; i++) {
        td = tr[i].getElementsByTagName("td")[0]; // for column one
        td1 = tr[i].getElementsByTagName("td")[1]; // for column two
        td2 = tr[i].getElementsByTagName("td")[2]; 
    /* ADD columns here that you want you to filter to be used on */
        if (td) {
          if ( (td.innerHTML.toUpperCase().indexOf(filter) > -1) || (td1.innerHTML.toUpperCase().indexOf(filter) > -1) 
          || (td2.innerHTML.toUpperCase().indexOf(filter) > -1) )  {            
            tr[i].style.display = "";
          } else {
            tr[i].style.display = "none";
          }
        }
      }
}

//Cell color
$(document).ready(function() {
    var table = document.getElementById("myRequestTable");
    var rows = table.getElementsByTagName("tr");

    for (let row of rows) { // `for...of` loops through the NodeList
        cells = row.getElementsByTagName("td");
        var daysGap = cells[1] || null; // gets the 2nd `td` or nothing
        if ( !daysGap || daysGap.textContent < 0) {
            cells[1].style.background = "#F66969" // make the whole row text color red
        }
        else if (!daysGap || daysGap.textContent >= 0 && !daysGap || daysGap.textContent <= 6) {
            cells[1].style.background = "#FFDB5B"
        }
    }

    viewPending();

});

/* REPOSITORY TABLE */
function searchRepositoryTable() {
    var input, filter, table, tr, td, td2, i;
      input = document.getElementById("myInput");
      filter = input.value.toUpperCase();
      table = document.getElementById("myRepositoryTable");
      tr = table.getElementsByTagName("tr");
      
      for (i = 0; i < tr.length; i++) {
        td = tr[i].getElementsByTagName("td")[0]; // for column one
        td1 = tr[i].getElementsByTagName("td")[1]; // for column two
        td2 = tr[i].getElementsByTagName("td")[2];
        td4 = tr[i].getElementsByTagName("td")[4]; //tags hidden column
    /* ADD columns here that you want you to filter to be used on */
        if (td) {
          if ( (td.innerHTML.toUpperCase().indexOf(filter) > -1) || (td1.innerHTML.toUpperCase().indexOf(filter) > -1) ||
          (td2.innerHTML.toUpperCase().indexOf(filter) > -1) || (td4.innerHTML.toUpperCase().indexOf(filter) > -1) )  {            
            tr[i].style.display = "";
          } else {
            tr[i].style.display = "none";
          }
        }
      }
} 

// Tab Filters (Document Type)
function viewAllRepository(){ 
    var table = document.getElementById("table");
    var rows = table.getElementsByTagName("tr");

    for (let row of rows) { // `for...of` loops through the NodeList
        row.style.display = ""; // shows this row
    }
    document.getElementById("all-tab").classList.add("selected");
    document.getElementById("a-tab").classList.remove("selected");
    document.getElementById("b-tab").classList.remove("selected");
    document.getElementById("d-tab").classList.remove("selected");
    document.getElementById("h-tab").classList.remove("selected");
}

function viewTypeA(){ 
    var button = document.getElementById("a-tab");
    var table = document.getElementById("table");
    var rows = table.getElementsByTagName("tr");
    var filter = button.value;

    for (let row of rows) { // `for...of` loops through the NodeList
        cells = row.getElementsByTagName("td");
        documenttype = cells[1] || null; // gets the 8th `td` or nothing
        // if the filter is set to 'All', or this is the header row, or 2nd `td` text matches filter
        if ( !documenttype || (filter === documenttype.textContent)) {
            row.style.display = ""; // shows this row
        }
        else {
            row.style.display = "none"; // hides this row
        }
    }
    document.getElementById("all-tab").classList.remove("selected");
    document.getElementById("a-tab").classList.add("selected");
    document.getElementById("b-tab").classList.remove("selected");
    document.getElementById("d-tab").classList.remove("selected");
    document.getElementById("h-tab").classList.remove("selected");
}

function viewTypeB(){ 
    var button = document.getElementById("b-tab");
    var table = document.getElementById("table");
    var rows = table.getElementsByTagName("tr");
    var filter = button.value;

    for (let row of rows) { // `for...of` loops through the NodeList
        cells = row.getElementsByTagName("td");
        documenttype = cells[1] || null; // gets the 8th `td` or nothing
        // if the filter is set to 'All', or this is the header row, or 2nd `td` text matches filter
        if ( !documenttype || (filter === documenttype.textContent)) {
            row.style.display = ""; // shows this row
        }
        else {
            row.style.display = "none"; // hides this row
        }
    }
    document.getElementById("all-tab").classList.remove("selected");
    document.getElementById("a-tab").classList.remove("selected");
    document.getElementById("b-tab").classList.add("selected");
    document.getElementById("d-tab").classList.remove("selected");
    document.getElementById("h-tab").classList.remove("selected");
}

function viewTypeD(){ 
    var button = document.getElementById("d-tab");
    var table = document.getElementById("table");
    var rows = table.getElementsByTagName("tr");
    var filter = button.value;

    for (let row of rows) { // `for...of` loops through the NodeList
        cells = row.getElementsByTagName("td");
        documenttype = cells[1] || null; // gets the 8th `td` or nothing
        // if the filter is set to 'All', or this is the header row, or 2nd `td` text matches filter
        if ( !documenttype || (filter === documenttype.textContent)) {
            row.style.display = ""; // shows this row
        }
        else {
            row.style.display = "none"; // hides this row
        }
    }
    document.getElementById("all-tab").classList.remove("selected");
    document.getElementById("a-tab").classList.remove("selected");
    document.getElementById("b-tab").classList.remove("selected");
    document.getElementById("d-tab").classList.add("selected");
    document.getElementById("h-tab").classList.remove("selected");
}

function viewTypeH(){ 
    var button = document.getElementById("h-tab");
    var table = document.getElementById("table");
    var rows = table.getElementsByTagName("tr");
    var filter = button.value;

    for (let row of rows) { // `for...of` loops through the NodeList
        cells = row.getElementsByTagName("td");
        documenttype = cells[1] || null; // gets the 8th `td` or nothing
        // if the filter is set to 'All', or this is the header row, or 2nd `td` text matches filter
        if ( !documenttype || (filter === documenttype.textContent)) {
            row.style.display = ""; // shows this row
        }
        else {
            row.style.display = "none"; // hides this row
        }
    }
    document.getElementById("all-tab").classList.remove("selected");
    document.getElementById("a-tab").classList.remove("selected");
    document.getElementById("b-tab").classList.remove("selected");
    document.getElementById("d-tab").classList.remove("selected");
    document.getElementById("h-tab").classList.add("selected");
}