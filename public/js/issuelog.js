$(document).ready(() => {

    $('tr').click(function () {
        
        var issueid = $(this).attr('id');

        $.ajax({
            url: "/staff/viewissue",
            method: "GET",
            contentType: "application/json",
            data: { issueid: issueid },
            success: function (res) {

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
                if (res.issue.contractRequest) {
                    document.getElementById("documentnumber").innerHTML = res.issue.contractRequest.trackingNumber;
                }
                else {
                    document.getElementById("documentnumber").innerHTML = "N/A"
                }
                document.getElementById("summary").innerHTML = res.issue.summary;

                console.log('SUCCESS');
            },
            error: function(err) {
                console.log(err);
            }
        });

    });

    $('#confirmResolveIssue').click(function () {

        var issueid = document.getElementById("issueID").value;
        
        $.ajax({
            url: "/staff/resolveIssue",
            method: "GET",
            contentType: "application/json",
            data: { issueid: issueid },
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