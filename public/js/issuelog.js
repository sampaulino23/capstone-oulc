$(document).ready(() => {

    $('tr').click(function () {
        
        var issueid = $(this).attr('id');

        $.ajax({
            url: "/staff/viewissue",
            method: "GET",
            contentType: "application/json",
            data: { issueid: issueid },
            success: function (res) {

                document.getElementById("resolveIssue").value = "";

                const issueSelected = $('#issueSelected'); 
                const issueInitialView = $('#issueInitialView');
                const issueView = $('#issueView');

                issueInitialView.attr("hidden", true); //hide initial view
                issueView.addClass("issueDesign");
                issueSelected.attr("hidden", false); //show issue selected view

                //assign values through id.
                document.getElementById("issueID").value = res.issue._id;
                // document.getElementById("status").innerHTML = res.issue.status;
                document.getElementById("statusText").innerHTML = "Status:&nbsp;";
                document.getElementById("status-header-text").innerHTML = res.issue.status;
                document.getElementById("department").innerHTML = res.issue.requester.department.abbrev;
                document.getElementById("title").innerHTML = res.issue.title;
                document.getElementById("type").innerHTML = res.issue.type;
                let oulcResponse = "OULC Response: ";
                if (res.issue.contractRequest) {
                    document.getElementById("documentnumber").innerHTML = res.issue.contractRequest.trackingNumber;
                    var requestlink = document.getElementById("documentnumber");
                    requestlink.href = "/request/requester/" + res.issue.contractRequest._id;
                    requestlink.style.textDecoration = "underline";
                }
                else {
                    document.getElementById("documentnumber").innerHTML = "N/A"
                }
                document.getElementById("summary").innerHTML = res.issue.summary;

                //disable input if status is resolved and hide resolve button
                if (res.issue.status == "Resolved") {
                    document.getElementById("resolveIssue").value = res.issue.response;
                    document.getElementById("resolveIssue").disabled = true;   
                    document.getElementById("resolveIssueBtn").style.visibility = 'hidden';
                    document.getElementById("resolveIssue").style.background = "#6AB085";
                    document.getElementById("resolveIssue").style.boxShadow = "0px 4px 4px rgba(0, 0, 0, 0.25)";
                }
                else {
                    document.getElementById("resolveIssue").disabled = false;  
                    document.getElementById("resolveIssueBtn").style.visibility = 'visible';
                    document.getElementById("resolveIssue").style.background = "#FFFFFF";
                    document.getElementById("resolveIssue").style.boxShadow = "inset 0px 4px 4px rgba(0, 0, 0, 0.25)";
                }

                console.log('SUCCESS');
            },
            error: function(err) {
                console.log(err);
            }
        });

    });

    $('#confirmResolveIssue').click(function () {

        var issueid = document.getElementById("issueID").value;
        var response = document.getElementById('resolveIssue').value;
        
        $.ajax({
            url: "/staff/resolveIssue",
            method: "GET",
            contentType: "application/json",
            data: { issueid: issueid, response: response },
            success: setTimeout(function () {
                // sessionStorage.setItem("action", "cleared");
                console.log('SUCCESS');
                location.reload();
            }, 350),
            error: function (err) {
                console.log(err);
            }
        });
    });

    $('#resolveIssue').change(function () {
        if(document.getElementById("resolveIssue").value == ""){
            document.getElementById("resolveIssueBtn").disabled = true;
        }else{
            document.getElementById("resolveIssueBtn").disabled = false;
        }
    });

});

//Search Filter 
function searchIssueTable() {
    var input, filter, table, tr, td, td2, td3;
      input = document.getElementById("searchIssueInput");
      filter = input.value.toUpperCase();
      table = document.getElementById("table");
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
function filterIssueType(){ //for issue type dropdown
    var dropdown = document.getElementById("issuetypedropdown");
    var table = document.getElementById("table");
    var rows = table.getElementsByTagName("tr");
    var filter = dropdown.value;

    for (let row of rows) { // `for...of` loops through the NodeList
        cells = row.getElementsByTagName("td");
        issuetype = cells[2] || null; // gets the 3rd `td` or nothing
        // if the filter is set to 'All', or this is the header row, or 2nd `td` text matches filter
        if (filter === "All" || !issuetype || (filter === issuetype.textContent)) {
            row.style.display = ""; // shows this row
        }
        else {
            row.style.display = "none"; // hides this row
        }
    }

    document.getElementById("all-tab").classList.add("selected");
    document.getElementById("open-tab").classList.remove("selected");
    document.getElementById("resolved-tab").classList.remove("selected");
}

// Reset Dropdown Filter Values
function resetIssueType(){ //for issues table
    document.getElementById("issuetypedropdown").value='a';
}

// Tab Filters (Issue Status)
function viewAllIssues(){ 
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
    document.getElementById("open-tab").classList.remove("selected");
    document.getElementById("resolved-tab").classList.remove("selected");
}

function viewPendingIssues(){ 
    var button = document.getElementById("open-tab");
    var table = document.getElementById("table");
    var rows = table.getElementsByTagName("tr");
    var filter = button.value;
    var length = 0;
    let filteredRows = [];

    for (let row of rows) { // `for...of` loops through the NodeList
        cells = row.getElementsByTagName("td");
        issuestatus = cells[3] || null; // gets the 5th `td` or nothing
        // if the filter is set to 'All', or this is the header row, or 2nd `td` text matches filter
        if ( !issuestatus || (filter === issuestatus.textContent)) {
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
    document.getElementById("open-tab").classList.add("selected");
    document.getElementById("resolved-tab").classList.remove("selected");
}

function viewResolvedIssues(){ 
    var button = document.getElementById("resolved-tab");
    var table = document.getElementById("table");
    var rows = table.getElementsByTagName("tr");
    var filter = button.value;
    var length = 0;
    let filteredRows = [];

    for (let row of rows) { // `for...of` loops through the NodeList
        cells = row.getElementsByTagName("td");
        issuestatus = cells[3] || null; // gets the 5th `td` or nothing
        // if the filter is set to 'All', or this is the header row, or 2nd `td` text matches filter
        if ( !issuestatus || (filter === issuestatus.textContent)) {
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
    document.getElementById("open-tab").classList.remove("selected");
    document.getElementById("resolved-tab").classList.add("selected");
}