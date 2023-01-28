$(document).ready(() => {
    $('#searchPolicyInput').keyup(() => {
        console.log('search policy');

        var input, filter, table, tr, td, i;
        input = document.getElementById("searchPolicyInput");
        filter = input.value.toUpperCase();
        table = document.getElementById("myPolicyTable");
        tr = table.getElementsByTagName("tr");
        
        for (i = 0; i < tr.length; i++) {
            td = tr[i].getElementsByTagName("td")[0]; // for column one
        
        if (td) {
            if ( (td.innerHTML.toUpperCase().indexOf(filter) > -1) )  {            
                    tr[i].style.display = "";
                } else {
                    tr[i].style.display = "none";
                }
            }
        }
    }),
    $('tr').click(function () {
        
        var policyid = $(this).attr('id');

        $.ajax({
            url: "/staff/viewpolicy",
            method: "GET",
            contentType: "application/json",
            data: { policyid: policyid },
            success: function (res) {

                const policyView = $('#policyView');
                const policyViewFullSize = $('#policyViewFullSize');

                policyView.empty();
                policyViewFullSize.empty();

                const embedPDFView = document.createElement('embed');
                embedPDFView.setAttribute('src', `/staff/policy/${res.fileid}`);
                embedPDFView.setAttribute('width', '100%');
                embedPDFView.setAttribute('height', '600px');

                const embedPDFViewFullSize = document.createElement('embed');
                embedPDFViewFullSize.setAttribute('src', `/staff/policy/${res.fileid}`);
                embedPDFViewFullSize.setAttribute('width', '100%');
                embedPDFViewFullSize.setAttribute('height', '800px');

                policyView.append(embedPDFView);
                policyViewFullSize.append(embedPDFViewFullSize)

                $(".full-size-btn").css("display", "block");

                console.log('POLICY VIEW SUCCESS');
            },
            error: function(err) {
                console.log(err);
            }
        });

    });
});