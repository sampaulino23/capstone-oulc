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
                var issuetitle;
                
                // issueView.empty();
                issueInitialView.attr("hidden", true);
                issueSelected.attr("hidden", false);
                
                // var content = document.createTextNode("<YOUR_CONTENT>");
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

                // issueView.appendChild(content);
                // const embedPDFView = document.createElement('p');
                console.log('SUCCESS');
            },
            error: function(err) {
                console.log(err);
            }
        });

    });

});