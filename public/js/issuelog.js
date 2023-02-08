$(document).ready(() => {

    var user_role = "{{user_role}}";

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

                issueInitialView.attr("hidden", true); //hide initial view.
                issueSelected.attr("hidden", false); //show issue selected view

                //assign values through id.
                document.getElementById("issueID").value = res.issue._id;
                document.getElementById("status").innerHTML = res.issue.status;
                document.getElementById("department").innerHTML = res.issue.requester.department.abbrev;
                document.getElementById("title").innerHTML = res.issue.title;
                document.getElementById("type").innerHTML = res.issue.type;
                document.getElementById("resolveIssue").innerHTML = res.issue.response;
                if (res.issue.contractRequest) {
                    document.getElementById("documentnumber").innerHTML = res.issue.contractRequest.trackingNumber;
                    var requestlink = document.getElementById("documentnumber");
                    requestlink.href = "/request/requester/" + res.issue.contractRequest._id;
                }
                else {
                    document.getElementById("documentnumber").innerHTML = "N/A"
                }
                document.getElementById("summary").innerHTML = res.issue.summary;

                //disable input if status is resolved and hide resolve button
                if (res.issue.status == "Resolved") {
                    document.getElementById("resolveIssue").disabled = true;   
                    document.getElementById("resolveIssueBtn").style.visibility = 'hidden';
                }
                else {
                    document.getElementById("resolveIssue").disabled = false;  
                    document.getElementById("resolveIssueBtn").style.visibility = 'visible';
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

});