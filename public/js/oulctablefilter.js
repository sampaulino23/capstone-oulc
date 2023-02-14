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
        td9 = tr[i].getElementsByTagName("td")[9]; 
    /* ADD columns here that you want you to filter to be used on */
        if (td) {
          if ( (td.innerHTML.toUpperCase().indexOf(filter) > -1) || (td1.innerHTML.toUpperCase().indexOf(filter) > -1) 
          || (td2.innerHTML.toUpperCase().indexOf(filter) > -1) || (td3.innerHTML.toUpperCase().indexOf(filter) > -1)
          || (td4.innerHTML.toUpperCase().indexOf(filter) > -1) || (td5.innerHTML.toUpperCase().indexOf(filter) > -1) 
          || (td6.innerHTML.toUpperCase().indexOf(filter) > -1) || (td7.innerHTML.toUpperCase().indexOf(filter) > -1) 
          || (td9.innerHTML.toUpperCase().indexOf(filter) > -1) )  {            
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
function filterContractType(){ //for contract type dropdown
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
function filterRequestType(){ //for requests type dropdown
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

    var totalRows = $('#table').find('tbody tr:has(td)').length;
    var recordPerPage = 30;
    var totalPages = Math.ceil(totalRows / recordPerPage);
    var $pages = $('<div id="pages"></div>');
    for (i = 0; i < totalPages; i++) {
        $('<span class="pageNumber">&nbsp;' + (i + 1) + '</span>').appendTo($pages);
    }
    
    $("#after-table").html($pages);

    $('.pageNumber').hover(
        function() {
            $(this).addClass('focus');
        },
        function() {
            $(this).removeClass('focus');
        }
    );

    $('table').find('tbody tr:has(td)').hide();
    var tr = $('table tbody tr:has(td)');
    for (var i = 0; i <= recordPerPage - 1; i++) {
        $(tr[i]).show();
    }

    $('span').click(function(event) {
        $('#table').find('tbody tr:has(td)').hide();
        var nBegin = ($(this).text() - 1) * recordPerPage;
        var nEnd = $(this).text() * recordPerPage - 1;
        for (var i = nBegin; i <= nEnd; i++) {
            $(tr[i]).show();
        }
    });
    
    document.getElementById("all-tab").classList.add("selected");
    document.getElementById("unassigned-tab").classList.remove("selected");
    document.getElementById("pending-tab").classList.remove("selected");
    document.getElementById("toreview-tab").classList.remove("selected");
    document.getElementById("waiting-tab").classList.remove("selected");
    document.getElementById("forlegalreview-tab").classList.remove("selected");
    document.getElementById("cleared-tab").classList.remove("selected");
    document.getElementById("cancelled-tab").classList.remove("selected");
}

function viewAllRequestsRequester(){ 
    var table = document.getElementById("table");
    var rows = table.getElementsByTagName("tr");

    var totalRows = $('#table').find('tbody tr:has(td)').length;
    var recordPerPage = 30;
    var totalPages = Math.ceil(totalRows / recordPerPage);
    var $pages = $('<div id="pages"></div>');
    for (i = 0; i < totalPages; i++) {
        $('<span class="pageNumber">&nbsp;' + (i + 1) + '</span>').appendTo($pages);
    }
    
    $("#after-table").html($pages);

    $('.pageNumber').hover(
        function() {
            $(this).addClass('focus');
        },
        function() {
            $(this).removeClass('focus');
        }
    );

    $('table').find('tbody tr:has(td)').hide();
    var tr = $('table tbody tr:has(td)');
    for (var i = 0; i <= recordPerPage - 1; i++) {
        $(tr[i]).show();
    }

    $('span').click(function(event) {
        $('#table').find('tbody tr:has(td)').hide();
        var nBegin = ($(this).text() - 1) * recordPerPage;
        var nEnd = $(this).text() * recordPerPage - 1;
        for (var i = nBegin; i <= nEnd; i++) {
            $(tr[i]).show();
        }
    });
    
    document.getElementById("all-tab-requester").classList.add("selected");
    document.getElementById("waiting-tab-requester").classList.remove("selected");
    document.getElementById("pending-tab-requester").classList.remove("selected");
    document.getElementById("forlegalreview-tab").classList.remove("selected");
    document.getElementById("cleared-tab-requester").classList.remove("selected");
    document.getElementById("cancelled-tab-requester").classList.remove("selected");
}

function viewAllRequestsAtty(){ 
    var table = document.getElementById("table");
    var rows = table.getElementsByTagName("tr");

    var totalRows = $('#table').find('tbody tr:has(td)').length;
    var recordPerPage = 30;
    var totalPages = Math.ceil(totalRows / recordPerPage);
    var $pages = $('<div id="pages"></div>');
    for (i = 0; i < totalPages; i++) {
        $('<span class="pageNumber">&nbsp;' + (i + 1) + '</span>').appendTo($pages);
    }
    
    $("#after-table").html($pages);

    $('.pageNumber').hover(
        function() {
            $(this).addClass('focus');
        },
        function() {
            $(this).removeClass('focus');
        }
    );

    $('table').find('tbody tr:has(td)').hide();
    var tr = $('table tbody tr:has(td)');
    for (var i = 0; i <= recordPerPage - 1; i++) {
        $(tr[i]).show();
    }

    $('span').click(function(event) {
        $('#table').find('tbody tr:has(td)').hide();
        var nBegin = ($(this).text() - 1) * recordPerPage;
        var nEnd = $(this).text() * recordPerPage - 1;
        for (var i = nBegin; i <= nEnd; i++) {
            $(tr[i]).show();
        }
    });
    
    document.getElementById("all-tab-atty").classList.add("selected");
    document.getElementById("unassigned-tab-atty").classList.remove("selected");
    document.getElementById("forlegalreview-tab-atty").classList.remove("selected");
    document.getElementById("toreview-tab-atty").classList.remove("selected");
    document.getElementById("waiting-tab-atty").classList.remove("selected");
    document.getElementById("cleared-tab-atty").classList.remove("selected");
    document.getElementById("cancelled-tab-atty").classList.remove("selected");
}

function viewUnassignedRequestsStaff(){ 
    var table = document.getElementById("table");
    var rows = table.getElementsByTagName("tr");
    var filter = "";
    var length = 0;
    let filteredRows = [];

    for (let row of rows) { // `for...of` loops through the NodeList
        cells = row.getElementsByTagName("td");
        requeststatus = cells[9] || null; // gets the 10th `td` or nothing
        // if the filter is set to 'All', or this is the header row, or 2nd `td` text matches filter
        if ( !requeststatus || (filter === requeststatus.textContent)) {
            // row.style.display = ""; // shows this row
            length++;
            filteredRows.push(row);
        }
        else {
            row.style.display = "none"; // hides this row
        }
    }
    var totalRows = length;
    var recordPerPage = 30;
    var totalPages = Math.ceil(totalRows / recordPerPage);
    var $pages = $('<div id="pages"></div>');
    for (i = 0; i < totalPages; i++) {
        $('<span class="pageNumber">&nbsp;' + (i + 1) + '</span>').appendTo($pages);
    }
    
    $("#after-table").html($pages);

    $('.pageNumber').hover(
        function() {
            $(this).addClass('focus');
        },
        function() {
            $(this).removeClass('focus');
        }
    );

    $('table').find('tbody tr:has(td)').hide();
    for (var i = 0; i <= recordPerPage - 1; i++) {
        $(filteredRows[i]).show();
    }

    $('span').click(function(event) {
        $('#table').find('tbody tr:has(td)').hide();
        var nBegin = ($(this).text() - 1) * recordPerPage;
        var nEnd = $(this).text() * recordPerPage - 1;
        for (var i = nBegin; i <= nEnd; i++) {
            $(filteredRows[i]).show();
        }
    });

    document.getElementById("all-tab").classList.remove("selected");
    document.getElementById("unassigned-tab").classList.add("selected");
    document.getElementById("pending-tab").classList.remove("selected");
    document.getElementById("toreview-tab").classList.remove("selected");
    document.getElementById("waiting-tab").classList.remove("selected");
    document.getElementById("forlegalreview-tab").classList.remove("selected");
    document.getElementById("cleared-tab").classList.remove("selected");
    document.getElementById("cancelled-tab").classList.remove("selected");
}

function viewUnassignedRequestsAtty(){ 
    var table = document.getElementById("table");
    var rows = table.getElementsByTagName("tr");
    var filter = "";
    var length = 0;
    let filteredRows = [];

    for (let row of rows) { // `for...of` loops through the NodeList
        cells = row.getElementsByTagName("td");
        requeststatus = cells[8] || null; // gets the 9th `td` or nothing
        // if the filter is set to 'All', or this is the header row, or 2nd `td` text matches filter
        if ( !requeststatus || (filter === requeststatus.textContent)) {
            // row.style.display = ""; // shows this row
            length++;
            filteredRows.push(row);
        }
        else {
            row.style.display = "none"; // hides this row
        }
    }
    var totalRows = length;
    var recordPerPage = 30;
    var totalPages = Math.ceil(totalRows / recordPerPage);
    var $pages = $('<div id="pages"></div>');
    for (i = 0; i < totalPages; i++) {
        $('<span class="pageNumber">&nbsp;' + (i + 1) + '</span>').appendTo($pages);
    }
    
    $("#after-table").html($pages);

    $('.pageNumber').hover(
        function() {
            $(this).addClass('focus');
        },
        function() {
            $(this).removeClass('focus');
        }
    );

    $('table').find('tbody tr:has(td)').hide();
    for (var i = 0; i <= recordPerPage - 1; i++) {
        $(filteredRows[i]).show();
    }

    $('span').click(function(event) {
        $('#table').find('tbody tr:has(td)').hide();
        var nBegin = ($(this).text() - 1) * recordPerPage;
        var nEnd = $(this).text() * recordPerPage - 1;
        for (var i = nBegin; i <= nEnd; i++) {
            $(filteredRows[i]).show();
        }
    });

    document.getElementById("all-tab-atty").classList.remove("selected");
    document.getElementById("unassigned-tab-atty").classList.add("selected");
    document.getElementById("forlegalreview-tab-atty").classList.remove("selected");
    document.getElementById("toreview-tab-atty").classList.remove("selected");
    document.getElementById("waiting-tab-atty").classList.remove("selected");
    document.getElementById("cleared-tab-atty").classList.remove("selected");
    document.getElementById("cancelled-tab-atty").classList.remove("selected");
}

function viewPending(){ 
    var button = document.getElementById("pending-tab");
    var table = document.getElementById("table");
    var rows = table.getElementsByTagName("tr");
    var filter = button.value;
    var length = 0;
    let filteredRows = [];

    for (let row of rows) { // `for...of` loops through the NodeList
        cells = row.getElementsByTagName("td");
        requeststatus = cells[7] || null; // gets the 8th `td` or nothing
        // if the filter is set to 'All', or this is the header row, or 2nd `td` text matches filter
        if ( !requeststatus || (filter === requeststatus.textContent)) {
            // row.style.display = ""; // shows this row
            length++;
            filteredRows.push(row);
        }
        else {
            row.style.display = "none"; // hides this row
        }
    }
    var totalRows = length;
    var recordPerPage = 30;
    var totalPages = Math.ceil(totalRows / recordPerPage);
    var $pages = $('<div id="pages"></div>');
    for (i = 0; i < totalPages; i++) {
        $('<span class="pageNumber">&nbsp;' + (i + 1) + '</span>').appendTo($pages);
    }
    
    $("#after-table").html($pages);

    $('.pageNumber').hover(
        function() {
            $(this).addClass('focus');
        },
        function() {
            $(this).removeClass('focus');
        }
    );

    $('table').find('tbody tr:has(td)').hide();
    for (var i = 0; i <= recordPerPage - 1; i++) {
        $(filteredRows[i]).show();
    }

    $('span').click(function(event) {
        $('#table').find('tbody tr:has(td)').hide();
        var nBegin = ($(this).text() - 1) * recordPerPage;
        var nEnd = $(this).text() * recordPerPage - 1;
        for (var i = nBegin; i <= nEnd; i++) {
            $(filteredRows[i]).show();
        }
    });

    document.getElementById("all-tab").classList.remove("selected");
    document.getElementById("unassigned-tab").classList.remove("selected");
    document.getElementById("pending-tab").classList.add("selected");
    document.getElementById("toreview-tab").classList.remove("selected");
    document.getElementById("waiting-tab").classList.remove("selected");
    document.getElementById("forlegalreview-tab").classList.remove("selected");
    document.getElementById("cleared-tab").classList.remove("selected");
    document.getElementById("cancelled-tab").classList.remove("selected");
}

function viewPendingRequester(){ 
    var button = document.getElementById("pending-tab-requester");
    var table = document.getElementById("table");
    var rows = table.getElementsByTagName("tr");
    var filter = button.value;
    var length = 0;
    let filteredRows = [];

    for (let row of rows) { // `for...of` loops through the NodeList
        cells = row.getElementsByTagName("td");
        requeststatus = cells[7] || null; // gets the 8th `td` or nothing
        // if the filter is set to 'All', or this is the header row, or 2nd `td` text matches filter
        if ( !requeststatus || (filter === requeststatus.textContent)) {
            // row.style.display = ""; // shows this row
            length++;
            filteredRows.push(row);
        }
        else {
            row.style.display = "none"; // hides this row
        }
    }
    var totalRows = length;
    var recordPerPage = 30;
    var totalPages = Math.ceil(totalRows / recordPerPage);
    var $pages = $('<div id="pages"></div>');
    for (i = 0; i < totalPages; i++) {
        $('<span class="pageNumber">&nbsp;' + (i + 1) + '</span>').appendTo($pages);
    }
    
    $("#after-table").html($pages);

    $('.pageNumber').hover(
        function() {
            $(this).addClass('focus');
        },
        function() {
            $(this).removeClass('focus');
        }
    );

    $('table').find('tbody tr:has(td)').hide();
    for (var i = 0; i <= recordPerPage - 1; i++) {
        $(filteredRows[i]).show();
    }

    $('span').click(function(event) {
        $('#table').find('tbody tr:has(td)').hide();
        var nBegin = ($(this).text() - 1) * recordPerPage;
        var nEnd = $(this).text() * recordPerPage - 1;
        for (var i = nBegin; i <= nEnd; i++) {
            $(filteredRows[i]).show();
        }
    });

    document.getElementById("all-tab-requester").classList.remove("selected");
    document.getElementById("waiting-tab-requester").classList.remove("selected");
    document.getElementById("pending-tab-requester").classList.add("selected");
    document.getElementById("forlegalreview-tab-requester").classList.remove("selected");
    document.getElementById("cleared-tab-requester").classList.remove("selected");
    document.getElementById("cancelled-tab-requester").classList.remove("selected");
}

function viewToReview(){ 
    var button = document.getElementById("toreview-tab");
    var table = document.getElementById("table");
    var rows = table.getElementsByTagName("tr");
    var filter = button.value;
    var length = 0;
    let filteredRows = [];

    for (let row of rows) { // `for...of` loops through the NodeList
        cells = row.getElementsByTagName("td");
        requeststatus = cells[7] || null; // gets the 8th `td` or nothing
        // if the filter is set to 'All', or this is the header row, or 2nd `td` text matches filter
        if ( !requeststatus || (filter === requeststatus.textContent)) {
            // row.style.display = ""; // shows this row
            length++;
            filteredRows.push(row);
        }
        else {
            row.style.display = "none"; // hides this row
        }
    }
    var totalRows = length;
    var recordPerPage = 30;
    var totalPages = Math.ceil(totalRows / recordPerPage);
    var $pages = $('<div id="pages"></div>');
    for (i = 0; i < totalPages; i++) {
        $('<span class="pageNumber">&nbsp;' + (i + 1) + '</span>').appendTo($pages);
    }
    
    $("#after-table").html($pages);

    $('.pageNumber').hover(
        function() {
            $(this).addClass('focus');
        },
        function() {
            $(this).removeClass('focus');
        }
    );

    $('table').find('tbody tr:has(td)').hide();
    for (var i = 0; i <= recordPerPage - 1; i++) {
        $(filteredRows[i]).show();
    }

    $('span').click(function(event) {
        $('#table').find('tbody tr:has(td)').hide();
        var nBegin = ($(this).text() - 1) * recordPerPage;
        var nEnd = $(this).text() * recordPerPage - 1;
        for (var i = nBegin; i <= nEnd; i++) {
            $(filteredRows[i]).show();
        }
    });

    document.getElementById("all-tab").classList.remove("selected");
    document.getElementById("unassigned-tab").classList.remove("selected");
    document.getElementById("pending-tab").classList.remove("selected");
    document.getElementById("toreview-tab").classList.add("selected");
    document.getElementById("waiting-tab").classList.remove("selected");
    document.getElementById("forlegalreview-tab").classList.remove("selected");
    document.getElementById("cleared-tab").classList.remove("selected");
    document.getElementById("cancelled-tab").classList.remove("selected");
}

function viewToReviewAtty(){ 
    var button = document.getElementById("toreview-tab-atty");
    var table = document.getElementById("table");
    var rows = table.getElementsByTagName("tr");
    var filter = button.value;
    var length = 0;
    let filteredRows = [];

    for (let row of rows) { // `for...of` loops through the NodeList
        cells = row.getElementsByTagName("td");
        requeststatus = cells[7] || null; // gets the 8th `td` or nothing
        // if the filter is set to 'All', or this is the header row, or 2nd `td` text matches filter
        if ( !requeststatus || (filter === requeststatus.textContent)) {
            // row.style.display = ""; // shows this row
            length++;
            filteredRows.push(row);
        }
        else {
            row.style.display = "none"; // hides this row
        }
    }
    var totalRows = length;
    var recordPerPage = 30;
    var totalPages = Math.ceil(totalRows / recordPerPage);
    var $pages = $('<div id="pages"></div>');
    for (i = 0; i < totalPages; i++) {
        $('<span class="pageNumber">&nbsp;' + (i + 1) + '</span>').appendTo($pages);
    }
    
    $("#after-table").html($pages);

    $('.pageNumber').hover(
        function() {
            $(this).addClass('focus');
        },
        function() {
            $(this).removeClass('focus');
        }
    );

    $('table').find('tbody tr:has(td)').hide();
    for (var i = 0; i <= recordPerPage - 1; i++) {
        $(filteredRows[i]).show();
    }

    $('span').click(function(event) {
        $('#table').find('tbody tr:has(td)').hide();
        var nBegin = ($(this).text() - 1) * recordPerPage;
        var nEnd = $(this).text() * recordPerPage - 1;
        for (var i = nBegin; i <= nEnd; i++) {
            $(filteredRows[i]).show();
        }
    });

    document.getElementById("all-tab-atty").classList.remove("selected");
    document.getElementById("unassigned-tab-atty").classList.remove("selected");
    document.getElementById("forlegalreview-tab-atty").classList.remove("selected");
    document.getElementById("toreview-tab-atty").classList.add("selected");
    document.getElementById("waiting-tab-atty").classList.remove("selected");
    document.getElementById("cleared-tab-atty").classList.remove("selected");
    document.getElementById("cancelled-tab-atty").classList.remove("selected");
}

function viewWaiting(){
    var button = document.getElementById("waiting-tab");
    var table = document.getElementById("table");
    var rows = table.getElementsByTagName("tr");
    var filter = button.value;
    var length = 0;
    let filteredRows = [];

    for (let row of rows) { // `for...of` loops through the NodeList
        cells = row.getElementsByTagName("td");
        requeststatus = cells[7] || null; // gets the 8th `td` or nothing
        // if the filter is set to 'All', or this is the header row, or 2nd `td` text matches filter
        if ( !requeststatus || (filter === requeststatus.textContent)) {
            // row.style.display = ""; // shows this row
            length++;
            filteredRows.push(row)
        }
        else {
            row.style.display = "none"; // hides this row
        }
    }
    

    var totalRows = length;
    var recordPerPage = 30;
    var totalPages = Math.ceil(totalRows / recordPerPage);
    var $pages = $('<div id="pages"></div>');
    for (i = 0; i < totalPages; i++) {
        $('<span class="pageNumber">&nbsp;' + (i + 1) + '</span>').appendTo($pages);
    }
    
    $("#after-table").html($pages);

    $('.pageNumber').hover(
        function() {
            $(this).addClass('focus');
        },
        function() {
            $(this).removeClass('focus');
        }
    );

    $('table').find('tbody tr:has(td)').hide();
    for (var i = 0; i <= recordPerPage - 1; i++) {
        $(filteredRows[i]).show();
    }

    $('span').click(function(event) {
        $('#table').find('tbody tr:has(td)').hide();
        var nBegin = ($(this).text() - 1) * recordPerPage;
        var nEnd = $(this).text() * recordPerPage - 1;
        for (var i = nBegin; i <= nEnd; i++) {
            $(filteredRows[i]).show();
        }
    });

    document.getElementById("all-tab").classList.remove("selected");
    document.getElementById("unassigned-tab").classList.remove("selected");
    document.getElementById("pending-tab").classList.remove("selected");
    document.getElementById("toreview-tab").classList.remove("selected");
    document.getElementById("waiting-tab").classList.add("selected");
    document.getElementById("forlegalreview-tab").classList.remove("selected");
    document.getElementById("cleared-tab").classList.remove("selected");
    document.getElementById("cancelled-tab").classList.remove("selected");
}

function viewWaitingAtty(){
    var button = document.getElementById("waiting-tab-atty");
    var table = document.getElementById("table");
    var rows = table.getElementsByTagName("tr");
    var filter = button.value;
    var length = 0;
    let filteredRows = [];

    for (let row of rows) { // `for...of` loops through the NodeList
        cells = row.getElementsByTagName("td");
        requeststatus = cells[7] || null; // gets the 8th `td` or nothing
        // if the filter is set to 'All', or this is the header row, or 2nd `td` text matches filter
        if ( !requeststatus || (filter === requeststatus.textContent)) {
            // row.style.display = ""; // shows this row
            length++;
            filteredRows.push(row)
        }
        else {
            row.style.display = "none"; // hides this row
        }
    }
    

    var totalRows = length;
    var recordPerPage = 30;
    var totalPages = Math.ceil(totalRows / recordPerPage);
    var $pages = $('<div id="pages"></div>');
    for (i = 0; i < totalPages; i++) {
        $('<span class="pageNumber">&nbsp;' + (i + 1) + '</span>').appendTo($pages);
    }
    
    $("#after-table").html($pages);

    $('.pageNumber').hover(
        function() {
            $(this).addClass('focus');
        },
        function() {
            $(this).removeClass('focus');
        }
    );

    $('table').find('tbody tr:has(td)').hide();
    for (var i = 0; i <= recordPerPage - 1; i++) {
        $(filteredRows[i]).show();
    }

    $('span').click(function(event) {
        $('#table').find('tbody tr:has(td)').hide();
        var nBegin = ($(this).text() - 1) * recordPerPage;
        var nEnd = $(this).text() * recordPerPage - 1;
        for (var i = nBegin; i <= nEnd; i++) {
            $(filteredRows[i]).show();
        }
    });

    document.getElementById("all-tab-atty").classList.remove("selected");
    document.getElementById("unassigned-tab-atty").classList.remove("selected");
    document.getElementById("forlegalreview-tab-atty").classList.remove("selected");
    document.getElementById("toreview-tab-atty").classList.remove("selected");
    document.getElementById("waiting-tab-atty").classList.add("selected");
    document.getElementById("cleared-tab-atty").classList.remove("selected");
    document.getElementById("cancelled-tab-atty").classList.remove("selected");
}

function viewWaitingRequester(){
    var button = document.getElementById("waiting-tab-requester");
    var table = document.getElementById("table");
    var rows = table.getElementsByTagName("tr");
    var filter = button.value;
    var length = 0;
    let filteredRows = [];

    for (let row of rows) { // `for...of` loops through the NodeList
        cells = row.getElementsByTagName("td");
        requeststatus = cells[7] || null; // gets the 8th `td` or nothing
        // if the filter is set to 'All', or this is the header row, or 2nd `td` text matches filter
        if ( !requeststatus || (filter === requeststatus.textContent)) {
            // row.style.display = ""; // shows this row
            length++;
            filteredRows.push(row)
        }
        else {
            row.style.display = "none"; // hides this row
        }
    }
    

    var totalRows = length;
    var recordPerPage = 30;
    var totalPages = Math.ceil(totalRows / recordPerPage);
    var $pages = $('<div id="pages"></div>');
    for (i = 0; i < totalPages; i++) {
        $('<span class="pageNumber">&nbsp;' + (i + 1) + '</span>').appendTo($pages);
    }
    
    $("#after-table").html($pages);

    $('.pageNumber').hover(
        function() {
            $(this).addClass('focus');
        },
        function() {
            $(this).removeClass('focus');
        }
    );

    $('table').find('tbody tr:has(td)').hide();
    for (var i = 0; i <= recordPerPage - 1; i++) {
        $(filteredRows[i]).show();
    }

    $('span').click(function(event) {
        $('#table').find('tbody tr:has(td)').hide();
        var nBegin = ($(this).text() - 1) * recordPerPage;
        var nEnd = $(this).text() * recordPerPage - 1;
        for (var i = nBegin; i <= nEnd; i++) {
            $(filteredRows[i]).show();
        }
    });

    document.getElementById("all-tab-requester").classList.remove("selected");
    document.getElementById("waiting-tab-requester").classList.add("selected");
    document.getElementById("pending-tab-requester").classList.remove("selected");
    document.getElementById("forlegalreview-tab-requester").classList.remove("selected");
    document.getElementById("cleared-tab-requester").classList.remove("selected");
    document.getElementById("cancelled-tab-requester").classList.remove("selected");
}

function viewForLegalReview(){ 
    var button = document.getElementById("forlegalreview-tab");
    var table = document.getElementById("table");
    var rows = table.getElementsByTagName("tr");
    var filter = button.value;
    var length = 0;
    let filteredRows = [];

    for (let row of rows) { // `for...of` loops through the NodeList
        cells = row.getElementsByTagName("td");
        requeststatus = cells[7] || null; // gets the 8th `td` or nothing
        // if the filter is set to 'All', or this is the header row, or 2nd `td` text matches filter
        if ( !requeststatus || (filter === requeststatus.textContent)) {
            // row.style.display = ""; // shows this row
            length++;
            filteredRows.push(row);
        }
        else {
            row.style.display = "none"; // hides this row
        }
    }
    

    var totalRows = length;
    var recordPerPage = 30;
    var totalPages = Math.ceil(totalRows / recordPerPage);
    var $pages = $('<div id="pages"></div>');
    for (i = 0; i < totalPages; i++) {
        $('<span class="pageNumber">&nbsp;' + (i + 1) + '</span>').appendTo($pages);
    }
    
    $("#after-table").html($pages);

    $('.pageNumber').hover(
        function() {
            $(this).addClass('focus');
        },
        function() {
            $(this).removeClass('focus');
        }
    );

    $('table').find('tbody tr:has(td)').hide();
    for (var i = 0; i <= recordPerPage - 1; i++) {
        $(filteredRows[i]).show();
    }

    $('span').click(function(event) {
        $('#table').find('tbody tr:has(td)').hide();
        var nBegin = ($(this).text() - 1) * recordPerPage;
        var nEnd = $(this).text() * recordPerPage - 1;
        for (var i = nBegin; i <= nEnd; i++) {
            $(filteredRows[i]).show();
        }
    });

    document.getElementById("all-tab").classList.remove("selected");
    document.getElementById("unassigned-tab").classList.remove("selected");
    document.getElementById("pending-tab").classList.remove("selected");
    // document.getElementById("toreview-tab").classList.remove("selected");
    document.getElementById("waiting-tab").classList.remove("selected");
    document.getElementById("forlegalreview-tab").classList.add("selected");
    document.getElementById("cleared-tab").classList.remove("selected");
    document.getElementById("cancelled-tab").classList.remove("selected");
}

function viewForLegalReviewAtty(){ 
    var button = document.getElementById("forlegalreview-tab-atty");
    var table = document.getElementById("table");
    var rows = table.getElementsByTagName("tr");
    var filter = button.value;
    var length = 0;
    let filteredRows = [];

    for (let row of rows) { // `for...of` loops through the NodeList
        cells = row.getElementsByTagName("td");
        requeststatus = cells[7] || null; // gets the 8th `td` or nothing
        // if the filter is set to 'All', or this is the header row, or 2nd `td` text matches filter
        if ( !requeststatus || (filter === requeststatus.textContent)) {
            // row.style.display = ""; // shows this row
            length++;
            filteredRows.push(row);
        }
        else {
            row.style.display = "none"; // hides this row
        }
    }
    

    var totalRows = length;
    var recordPerPage = 30;
    var totalPages = Math.ceil(totalRows / recordPerPage);
    var $pages = $('<div id="pages"></div>');
    for (i = 0; i < totalPages; i++) {
        $('<span class="pageNumber">&nbsp;' + (i + 1) + '</span>').appendTo($pages);
    }
    
    $("#after-table").html($pages);

    $('.pageNumber').hover(
        function() {
            $(this).addClass('focus');
        },
        function() {
            $(this).removeClass('focus');
        }
    );

    $('table').find('tbody tr:has(td)').hide();
    for (var i = 0; i <= recordPerPage - 1; i++) {
        $(filteredRows[i]).show();
    }

    $('span').click(function(event) {
        $('#table').find('tbody tr:has(td)').hide();
        var nBegin = ($(this).text() - 1) * recordPerPage;
        var nEnd = $(this).text() * recordPerPage - 1;
        for (var i = nBegin; i <= nEnd; i++) {
            $(filteredRows[i]).show();
        }
    });

    document.getElementById("all-tab-atty").classList.remove("selected");
    document.getElementById("unassigned-tab-atty").classList.remove("selected");
    document.getElementById("forlegalreview-tab-atty").classList.add("selected");
    document.getElementById("toreview-tab-atty").classList.remove("selected");
    document.getElementById("waiting-tab-atty").classList.remove("selected");
    document.getElementById("cleared-tab-atty").classList.remove("selected");
    document.getElementById("cancelled-tab-atty").classList.remove("selected");
}

function viewForLegalReviewRequester(){ 
    var button = document.getElementById("forlegalreview-tab-requester");
    var table = document.getElementById("table");
    var rows = table.getElementsByTagName("tr");
    var filter = button.value;
    var length = 0;
    let filteredRows = [];

    for (let row of rows) { // `for...of` loops through the NodeList
        cells = row.getElementsByTagName("td");
        requeststatus = cells[7] || null; // gets the 8th `td` or nothing
        // if the filter is set to 'All', or this is the header row, or 2nd `td` text matches filter
        if ( !requeststatus || (filter === requeststatus.textContent)) {
            // row.style.display = ""; // shows this row
            length++;
            filteredRows.push(row);
        }
        else {
            row.style.display = "none"; // hides this row
        }
    }
    

    var totalRows = length;
    var recordPerPage = 30;
    var totalPages = Math.ceil(totalRows / recordPerPage);
    var $pages = $('<div id="pages"></div>');
    for (i = 0; i < totalPages; i++) {
        $('<span class="pageNumber">&nbsp;' + (i + 1) + '</span>').appendTo($pages);
    }
    
    $("#after-table").html($pages);

    $('.pageNumber').hover(
        function() {
            $(this).addClass('focus');
        },
        function() {
            $(this).removeClass('focus');
        }
    );

    $('table').find('tbody tr:has(td)').hide();
    for (var i = 0; i <= recordPerPage - 1; i++) {
        $(filteredRows[i]).show();
    }

    $('span').click(function(event) {
        $('#table').find('tbody tr:has(td)').hide();
        var nBegin = ($(this).text() - 1) * recordPerPage;
        var nEnd = $(this).text() * recordPerPage - 1;
        for (var i = nBegin; i <= nEnd; i++) {
            $(filteredRows[i]).show();
        }
    });

    document.getElementById("all-tab-requester").classList.remove("selected");
    document.getElementById("waiting-tab-requester").classList.remove("selected");
    document.getElementById("pending-tab-requester").classList.remove("selected");
    document.getElementById("forlegalreview-tab-requester").classList.add("selected");
    document.getElementById("cleared-tab-requester").classList.remove("selected");
    document.getElementById("cancelled-tab-requester").classList.remove("selected");
}

function viewCleared(){ 
    var button = document.getElementById("cleared-tab");
    var table = document.getElementById("table");
    var rows = table.getElementsByTagName("tr");
    var filter = button.value;
    var length = 0;
    let filteredRows = [];

    for (let row of rows) { // `for...of` loops through the NodeList
        cells = row.getElementsByTagName("td");
        requeststatus = cells[7] || null; // gets the 8th `td` or nothing
        // if the filter is set to 'All', or this is the header row, or 2nd `td` text matches filter
        if ( !requeststatus || (filter === requeststatus.textContent)) {
            // row.style.display = ""; // shows this row
            length++;
            filteredRows.push(row);
        }
        else {
            row.style.display = "none"; // hides this row
        }
    }
    

    var totalRows = length;
    var recordPerPage = 30;
    var totalPages = Math.ceil(totalRows / recordPerPage);
    var $pages = $('<div id="pages"></div>');
    for (i = 0; i < totalPages; i++) {
        $('<span class="pageNumber">&nbsp;' + (i + 1) + '</span>').appendTo($pages);
    }
    
    $("#after-table").html($pages);

    $('.pageNumber').hover(
        function() {
            $(this).addClass('focus');
        },
        function() {
            $(this).removeClass('focus');
        }
    );

    $('table').find('tbody tr:has(td)').hide();
    for (var i = 0; i <= recordPerPage - 1; i++) {
        $(filteredRows[i]).show();
    }

    $('span').click(function(event) {
        $('#table').find('tbody tr:has(td)').hide();
        var nBegin = ($(this).text() - 1) * recordPerPage;
        var nEnd = $(this).text() * recordPerPage - 1;
        for (var i = nBegin; i <= nEnd; i++) {
            $(filteredRows[i]).show();
        }
    });


    document.getElementById("all-tab").classList.remove("selected");
    document.getElementById("forlegalreview-tab").classList.remove("selected");
    document.getElementById("waiting-tab").classList.remove("selected");
    document.getElementById("cleared-tab").classList.add("selected");
    document.getElementById("cancelled-tab").classList.remove("selected");
}

function viewClearedAtty(){ 
    var button = document.getElementById("cleared-tab-atty");
    var table = document.getElementById("table");
    var rows = table.getElementsByTagName("tr");
    var filter = button.value;
    var length = 0;
    let filteredRows = [];

    for (let row of rows) { // `for...of` loops through the NodeList
        cells = row.getElementsByTagName("td");
        requeststatus = cells[7] || null; // gets the 8th `td` or nothing
        // if the filter is set to 'All', or this is the header row, or 2nd `td` text matches filter
        if ( !requeststatus || (filter === requeststatus.textContent)) {
            // row.style.display = ""; // shows this row
            length++;
            filteredRows.push(row);
        }
        else {
            row.style.display = "none"; // hides this row
        }
    }
    

    var totalRows = length;
    var recordPerPage = 30;
    var totalPages = Math.ceil(totalRows / recordPerPage);
    var $pages = $('<div id="pages"></div>');
    for (i = 0; i < totalPages; i++) {
        $('<span class="pageNumber">&nbsp;' + (i + 1) + '</span>').appendTo($pages);
    }
    
    $("#after-table").html($pages);

    $('.pageNumber').hover(
        function() {
            $(this).addClass('focus');
        },
        function() {
            $(this).removeClass('focus');
        }
    );

    $('table').find('tbody tr:has(td)').hide();
    for (var i = 0; i <= recordPerPage - 1; i++) {
        $(filteredRows[i]).show();
    }

    $('span').click(function(event) {
        $('#table').find('tbody tr:has(td)').hide();
        var nBegin = ($(this).text() - 1) * recordPerPage;
        var nEnd = $(this).text() * recordPerPage - 1;
        for (var i = nBegin; i <= nEnd; i++) {
            $(filteredRows[i]).show();
        }
    });


    document.getElementById("all-tab-atty").classList.remove("selected");
    document.getElementById("unassigned-tab-atty").classList.remove("selected");
    document.getElementById("forlegalreview-tab-atty").classList.remove("selected");
    document.getElementById("waiting-tab-atty").classList.remove("selected");
    document.getElementById("toreview-tab-atty").classList.remove("selected");
    document.getElementById("cleared-tab-atty").classList.add("selected");
    document.getElementById("cancelled-tab-atty").classList.remove("selected");
}

function viewClearedRequester(){ 
    var button = document.getElementById("cleared-tab-requester");
    var table = document.getElementById("table");
    var rows = table.getElementsByTagName("tr");
    var filter = button.value;
    var length = 0;
    let filteredRows = [];

    for (let row of rows) { // `for...of` loops through the NodeList
        cells = row.getElementsByTagName("td");
        requeststatus = cells[7] || null; // gets the 8th `td` or nothing
        // if the filter is set to 'All', or this is the header row, or 2nd `td` text matches filter
        if ( !requeststatus || (filter === requeststatus.textContent)) {
            // row.style.display = ""; // shows this row
            length++;
            filteredRows.push(row);
        }
        else {
            row.style.display = "none"; // hides this row
        }
    }
    

    var totalRows = length;
    var recordPerPage = 30;
    var totalPages = Math.ceil(totalRows / recordPerPage);
    var $pages = $('<div id="pages"></div>');
    for (i = 0; i < totalPages; i++) {
        $('<span class="pageNumber">&nbsp;' + (i + 1) + '</span>').appendTo($pages);
    }
    
    $("#after-table").html($pages);

    $('.pageNumber').hover(
        function() {
            $(this).addClass('focus');
        },
        function() {
            $(this).removeClass('focus');
        }
    );

    $('table').find('tbody tr:has(td)').hide();
    for (var i = 0; i <= recordPerPage - 1; i++) {
        $(filteredRows[i]).show();
    }

    $('span').click(function(event) {
        $('#table').find('tbody tr:has(td)').hide();
        var nBegin = ($(this).text() - 1) * recordPerPage;
        var nEnd = $(this).text() * recordPerPage - 1;
        for (var i = nBegin; i <= nEnd; i++) {
            $(filteredRows[i]).show();
        }
    });


    document.getElementById("all-tab-requester").classList.remove("selected");
    document.getElementById("waiting-tab-requester").classList.remove("selected");
    document.getElementById("pending-tab-requester").classList.remove("selected");
    document.getElementById("forlegalreview-tab-requester").classList.remove("selected");
    document.getElementById("cleared-tab-requester").classList.add("selected");
    document.getElementById("cancelled-tab-requester").classList.remove("selected");
}

function viewCancelledAtty(){ 
    var button = document.getElementById("cancelled-tab-atty");
    var table = document.getElementById("table");
    var rows = table.getElementsByTagName("tr");
    var filter = button.value;
    var length = 0;
    let filteredRows = [];

    for (let row of rows) { // `for...of` loops through the NodeList
        cells = row.getElementsByTagName("td");
        requeststatus = cells[7] || null; // gets the 8th `td` or nothing
        // if the filter is set to 'All', or this is the header row, or 2nd `td` text matches filter
        if ( !requeststatus || (filter === requeststatus.textContent)) {
            // row.style.display = ""; // shows this row
            length++;
            filteredRows.push(row);
        }
        else {
            row.style.display = "none"; // hides this row
        }
    }
    

    var totalRows = length;
    var recordPerPage = 30;
    var totalPages = Math.ceil(totalRows / recordPerPage);
    var $pages = $('<div id="pages"></div>');
    for (i = 0; i < totalPages; i++) {
        $('<span class="pageNumber">&nbsp;' + (i + 1) + '</span>').appendTo($pages);
    }
    
    $("#after-table").html($pages);

    $('.pageNumber').hover(
        function() {
            $(this).addClass('focus');
        },
        function() {
            $(this).removeClass('focus');
        }
    );

    $('table').find('tbody tr:has(td)').hide();
    for (var i = 0; i <= recordPerPage - 1; i++) {
        $(filteredRows[i]).show();
    }

    $('span').click(function(event) {
        $('#table').find('tbody tr:has(td)').hide();
        var nBegin = ($(this).text() - 1) * recordPerPage;
        var nEnd = $(this).text() * recordPerPage - 1;
        for (var i = nBegin; i <= nEnd; i++) {
            $(filteredRows[i]).show();
        }
    });

    document.getElementById("all-tab-atty").classList.remove("selected");
    document.getElementById("unassigned-tab-atty").classList.remove("selected");
    document.getElementById("forlegalreview-tab-atty").classList.remove("selected");
    document.getElementById("toreview-tab-atty").classList.remove("selected");
    document.getElementById("waiting-tab-atty").classList.remove("selected");
    document.getElementById("cleared-tab-atty").classList.remove("selected");
    document.getElementById("cancelled-tab-atty").classList.add("selected");
}

function viewCancelledRequester(){ 
    var button = document.getElementById("cancelled-tab-requester");
    var table = document.getElementById("table");
    var rows = table.getElementsByTagName("tr");
    var filter = button.value;
    var length = 0;
    let filteredRows = [];

    for (let row of rows) { // `for...of` loops through the NodeList
        cells = row.getElementsByTagName("td");
        requeststatus = cells[7] || null; // gets the 8th `td` or nothing
        // if the filter is set to 'All', or this is the header row, or 2nd `td` text matches filter
        if ( !requeststatus || (filter === requeststatus.textContent)) {
            // row.style.display = ""; // shows this row
            length++;
            filteredRows.push(row);
        }
        else {
            row.style.display = "none"; // hides this row
        }
    }
    

    var totalRows = length;
    var recordPerPage = 30;
    var totalPages = Math.ceil(totalRows / recordPerPage);
    var $pages = $('<div id="pages"></div>');
    for (i = 0; i < totalPages; i++) {
        $('<span class="pageNumber">&nbsp;' + (i + 1) + '</span>').appendTo($pages);
    }
    
    $("#after-table").html($pages);

    $('.pageNumber').hover(
        function() {
            $(this).addClass('focus');
        },
        function() {
            $(this).removeClass('focus');
        }
    );

    $('table').find('tbody tr:has(td)').hide();
    for (var i = 0; i <= recordPerPage - 1; i++) {
        $(filteredRows[i]).show();
    }

    $('span').click(function(event) {
        $('#table').find('tbody tr:has(td)').hide();
        var nBegin = ($(this).text() - 1) * recordPerPage;
        var nEnd = $(this).text() * recordPerPage - 1;
        for (var i = nBegin; i <= nEnd; i++) {
            $(filteredRows[i]).show();
        }
    });

    document.getElementById("all-tab-requester").classList.remove("selected");
    document.getElementById("waiting-tab-requester").classList.remove("selected");
    document.getElementById("pending-tab-requester").classList.remove("selected");
    document.getElementById("forlegalreview-tab-requester").classList.remove("selected");
    document.getElementById("cleared-tab-requester").classList.remove("selected");
    document.getElementById("cancelled-tab-requester").classList.add("selected");
}

/* TEMPLATES TABLE */
//Search Filter 
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
    const currentRole = $('#currentRole').val();
    const currentUserID = $('#currentId').val();
    // var loggedUser = document.getElementById('userrole').textContent;
    $("th.default").each(function(){
        sorttable.innerSortFunction.apply(this, []);
    });

    for (let row of rows) { // `for...of` loops through the NodeList
        cells = row.getElementsByTagName("td");
        var daysGap = cells[1] || null; // gets the 2nd `td` or nothing
        var assignedAttyID = cells[8] || null; // gets the hidden attorney id or null
        if ( !daysGap || daysGap.textContent < 0) {
            cells[1].style.background = "#F66969" // make the whole row text color red
        }
        else if (!daysGap || daysGap.textContent >= 0 && !daysGap || daysGap.textContent <= 6) {
            cells[1].style.background = "#FFDB5B"
        }
        
    }

    if (currentRole == 'Staff') {
        viewPending();
    } else if (currentRole == 'Attorney') {
        viewForLegalReviewAtty();
    } else if (currentRole == 'Requester') {
        viewWaitingRequester();
    }
});

/* REPOSITORY TABLE */
//Search Filter 
function searchRepositoryTable() {
    var input, filter, table, tr, td, td2, td3, td4, i;
      input = document.getElementById("myInput");
      filter = input.value.toUpperCase();
      table = document.getElementById("myRepositoryTable");
      tr = table.getElementsByTagName("tr");
      
      for (i = 0; i < tr.length; i++) {
        td = tr[i].getElementsByTagName("td")[0]; // for column one
        td1 = tr[i].getElementsByTagName("td")[1]; // for column two
        td2 = tr[i].getElementsByTagName("td")[2];
        td3 = tr[i].getElementsByTagName("td")[3];
        td4 = tr[i].getElementsByTagName("td")[4]; //tags hidden column
    /* ADD columns here that you want you to filter to be used on */
        if (td) {
          if ( (td.innerHTML.toUpperCase().indexOf(filter) > -1) || (td1.innerHTML.toUpperCase().indexOf(filter) > -1) ||
          (td2.innerHTML.toUpperCase().indexOf(filter) > -1) || (td3.innerHTML.toUpperCase().indexOf(filter) > -1) || (td4.innerHTML.toUpperCase().indexOf(filter) > -1) )  {            
            tr[i].style.display = "";
          } else {
            tr[i].style.display = "none";
          }
        }
      }
} 

// Dropdown Filters (Document Type)
function repositoryFilterContractType(){ //for contract type dropdown
    var dropdown = document.getElementById("repositorycontractdropdown");
    var table = document.getElementById("table");
    var rows = table.getElementsByTagName("tr");
    var filter = dropdown.value;

    for (let row of rows) { // `for...of` loops through the NodeList
        cells = row.getElementsByTagName("td");
        contracttype = cells[2] || null; // gets the 2nd `td` or nothing
        // if the filter is set to 'All', or this is the header row, or 2nd `td` text matches filter
        if (filter === "All" || !contracttype || (filter === contracttype.textContent)) {
            row.style.display = ""; // shows this row
        }
        else {
            row.style.display = "none"; // hides this row
        }
    }
}
