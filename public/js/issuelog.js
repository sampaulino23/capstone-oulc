$(document).ready(() => {

    $('tr').click(function () {
        
        var issueid = $(this).attr('id');
        alert (issueid);

        $.ajax({
            url: "/staff/viewissue",
            method: "GET",
            contentType: "application/json",
            data: { issueid: issueid },
            success: function (res) {

                const issueView = $('#issueView');
                const issueSelected = $('#issueSelected');
                const issueInitialView = $('#issueInitialView');

                issueInitialView.attr("hidden", true);
                issueSelected.attr("hidden", false);

                document.getElementById("issueID").value = res.issue._id;

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
        alert ("CLICKED" + document.getElementById("issueID").value);
    });

});