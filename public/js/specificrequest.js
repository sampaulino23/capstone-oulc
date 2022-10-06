$(window).bind('beforeunload', function() {
    var rowCount = $('#documentsAttachedTable tr').length;

    var allreviewed = true;

    var documentsattached = [];

    for(var i = 0; i < rowCount; i++) {
        var documentattachedrow = $('#documentsAttachedTable tr:eq(' + i + ' )');
        var documentattachedrowid = documentattachedrow.attr('id');
        var documentattachedrowtype = documentattachedrow.attr('class');
        var isreviewed = documentattachedrow.find('.is-reviewed').val();

        var documenttype;

        if (documentattachedrowtype == 'latest-version-contract-row') {
            documenttype = 'contract';
        } else if (documentattachedrowtype == 'reference-document-row') {
            documenttype = 'refdoc';
        }

        if (isreviewed == 'false') {    // if not all reviewed
            allreviewed = false;
        }

        let documentattached = {
            documentid: documentattachedrowid,
            documenttype: documenttype,
            isreviewed: isreviewed
        }
        
        documentsattached.push(documentattached);
    }

    if (allreviewed == false) {
        $("#allReviewed").attr("hidden", true);
    }

    $.ajax({
        url: "/setrevieweddocuments",
        method: "GET",
        contentType: "application/json",
        data: {documentsattached: documentsattached},
        success: function() {
            console.log('SUCCESS');
        },
        error: function(err) {
            console.log(err);
        }
    });
});

$(window).on('load', function() {

    var fileidSelected = $('#fileSelected').find(":selected").val();

    // change file view
    const fileView = $('#fileView');
    fileView.empty();
    const embedPDFView = document.createElement('embed');
    embedPDFView.setAttribute('src', `/request/viewfile/${fileidSelected}`);
    embedPDFView.setAttribute('width', '100%');
    embedPDFView.setAttribute('height', '600px');
    fileView.append(embedPDFView);

    const fileViewFull = $('#fileViewFull');
    fileViewFull.empty();
    const embedPDFViewFull = document.createElement('embed');
    embedPDFViewFull.setAttribute('src', `/request/viewfile/${fileidSelected}`);
    embedPDFViewFull.setAttribute('width', '100%');
    embedPDFViewFull.setAttribute('height', '800px');
    fileViewFull.append(embedPDFViewFull);

    // get current role
    const role = $('#currentRole').val();
    console.log(role);

    var isDisabled = false;

    // if current role is Staff
    if (role == 'Staff') {
        // disable checkbox if status counter is within [2, 4, 5, 6, 7, 8]
        const statusCounter = parseInt($('#statusCounter').val());
        const statusListDisabled = [2, 4, 5, 6, 7, 8];

        console.log(statusCounter);

        if (statusListDisabled.includes(statusCounter)) {
            $('.is-reviewed').prop('disabled', true);

            $('#forLegalReviewBtn').prop('disabled', true);
            document.getElementById("forLegalReviewBtn").style.cursor = "not-allowed";

            $('#forRevisionBtn').prop('disabled', true);
            document.getElementById("forRevisionBtn").style.cursor = "not-allowed";

            isDisabled = true;
        }
    } else if (role == 'Attorney') {
        // disable checkbox if status counter is within [1, 2, 3, 5, 7, 8]
        const statusCounter = parseInt($('#statusCounter').val());
        const statusListDisabled = [1, 2, 3, 5, 7, 8];

        console.log(statusCounter);

        if (statusListDisabled.includes(statusCounter)) {
            $('.is-reviewed').prop('disabled', true);
            
            $('#approveBtn').prop('disabled', true);
            document.getElementById("approveBtn").style.cursor = "not-allowed";
            
            $('#forRevisionBtn').prop('disabled', true);
            document.getElementById("forRevisionBtn").style.cursor = "not-allowed";

            $('#routeAttorneyBtn').prop('disabled', true);
            document.getElementById("routeAttorneyBtn").style.cursor = "not-allowed";


            isDisabled = true;
        }
    }

    $.ajax({
        url: "/getcontractversions",
        method: "GET",
        contentType: "application/json",
        data: {fileid: fileidSelected},
        success: function(res) {

            console.log(res.contractversionslist);

            const contractversionslist = res.contractversionslist;
            var rowCount = $('#contractVersionsTable tr').length;
            var rows = $('#contractVersionsTable tr');
            $('#contractVersionsDiv').show();

            if (res.isContract == true) {
                rows.hide();
                $('#notContractText').attr('hidden', true);
                $('.version-note-card').hide();

                for(var i = 0; i < rowCount; i++) {
                    for (contractversion of contractversionslist) {
                        var contractversionrow = $('#contractVersionsTable tr:eq(' + i + ' )');
                        var contractversionrowid = contractversionrow.attr('id');
                        
                        if (contractversionrowid == contractversion._id) {
                            // filter contract version list
                            contractversionrow.show();
                        }

                        // if latest version of contract
                        if (contractversion.contract.latestversion == contractversion.version) {
                            $('#versionNote' + contractversion._id).show();
                        }
                    }
                }

            } else {
                $('#contractVersionsDiv').hide();
                $('#notContractText').attr('hidden', false);

            }

            console.log('SUCCESS');

        },
        error: function(err) {
            console.log(err);
        }
    });


    // for files tab
    var rowCount = $('#documentsAttachedTable tr').length;

    var allreviewed = true;

    for(var i = 0; i < rowCount; i++) {
        var documentattachedrow = $('#documentsAttachedTable tr:eq(' + i + ' )');
        var isreviewed = documentattachedrow.find('.is-reviewed').val();

        console.log(i + ' ' + isreviewed);

        if (isreviewed == 'false') {    // if not all reviewed
            allreviewed = false;
        }
    }

    console.log('isDisabled: ' + isDisabled);
    console.log('allreviewed: ' + allreviewed);
    console.log('role: ' + role);

    if (!isDisabled) {
        if (allreviewed == false) {
            $("#allReviewed").attr("hidden", true);
            $("#checkAll").prop("checked", false);
    
            if (role == 'Staff') {
                // disable for legal review button
                $("#forLegalReviewBtn").attr("disabled", true);
                document.getElementById("forLegalReviewBtn").style.cursor = "not-allowed";
                document.getElementById("forLegalReviewBtn").classList.remove("marked-complete-review-btn");
    
                // disable for revision button
                $("#forRevisionBtn").attr("disabled", true);
                document.getElementById("forRevisionBtn").style.cursor = "not-allowed";
            } else if (role == 'Attorney') {
                // disable for approve button
                $("#approveBtn").attr("disabled", true);
                document.getElementById("approveBtn").style.cursor = "not-allowed";
    
                // disable for revision button
                $("#forRevisionBtn").attr("disabled", true);
                document.getElementById("forRevisionBtn").style.cursor = "not-allowed";
    
            }
            
        } else {
            $("#allReviewed").attr("hidden", false);
            $("#checkAll").prop("checked", true);
    
            if (role == 'Staff') {
                // enable for legal review button
                $("#forLegalReviewBtn").attr("disabled", false);
                document.getElementById("forLegalReviewBtn").style.cursor = "pointer";
                document.getElementById("forLegalReviewBtn").style.background = "#0C8039";
                document.getElementById("forLegalReviewBtn").classList.add("marked-complete-review-btn");
    
                // enable for revision button
                $("#forRevisionBtn").attr("disabled", false);
                document.getElementById("forRevisionBtn").style.cursor = "pointer";
    
            } else if (role == 'Attorney') {
                // enable for approve button
                $("#approveBtn").attr("disabled", false);
                document.getElementById("approveBtn").style.cursor = "pointer";
    
                // enable for revision button
                $("#forRevisionBtn").attr("disabled", false);
                document.getElementById("forRevisionBtn").style.cursor = "pointer";
    
            }
            
        }
    } else { // if isDisabled is true
        if (role == 'Staff') {
            // disable for legal review button
            $("#forLegalReviewBtn").attr("disabled", true);
            document.getElementById("forLegalReviewBtn").style.cursor = "not-allowed";
            document.getElementById("forLegalReviewBtn").classList.remove("marked-complete-review-btn");

            // disable for revision button
            $("#forRevisionBtn").attr("disabled", true);
            document.getElementById("forRevisionBtn").style.cursor = "not-allowed";
        } else if (role == 'Attorney') {
            // disable for approve button
            $("#approveBtn").attr("disabled", true);
            document.getElementById("approveBtn").style.cursor = "not-allowed";

            // disable for revision button
            $("#forRevisionBtn").attr("disabled", true);
            document.getElementById("forRevisionBtn").style.cursor = "not-allowed";

            // disable for route attorney button
            $("#routeAttorneyBtn").attr("disabled", true);
            document.getElementById("routeAttorneyBtn").style.cursor = "not-allowed";

        }
    }
    
    
});

$(document).ready(() => {

    $('#fileSelected').change(function () {
        
        var fileid = $(this).val();

        // change file view
        const fileView = $('#fileView');
        const fileViewFull = $('#fileViewFull');
        
        fileView.empty();
        fileViewFull.empty();

        const embedPDFView = document.createElement('embed');
        embedPDFView.setAttribute('src', `/request/viewfile/${fileid}`);
        embedPDFView.setAttribute('width', '100%');
        embedPDFView.setAttribute('height', '600px');

        const embedPDFViewFull = document.createElement('embed');
        embedPDFViewFull.setAttribute('src', `/request/viewfile/${fileid}`);
        embedPDFViewFull.setAttribute('width', '100%');
        embedPDFViewFull.setAttribute('height', '800px');

        fileView.append(embedPDFView);
        fileViewFull.append(embedPDFViewFull);

        $.ajax({
            url: "/getcontractversions",
            method: "GET",
            contentType: "application/json",
            data: {fileid: fileid},
            success: function(res) {

                const contractversionslist = res.contractversionslist;
                var rowCount = $('#contractVersionsTable tr').length;
                var rows = $('#contractVersionsTable tr');
                $('#contractVersionsDiv').show();

                if (res.isContract == true) {
                    rows.hide();
                    $('#notContractText').attr('hidden', true);
                    $('.version-note-card').hide();

                    for(var i = 0; i < rowCount; i++) {
                        for (contractversion of contractversionslist) {
                            var contractversionrow = $('#contractVersionsTable tr:eq(' + i + ' )');
                            var contractversionrowid = contractversionrow.attr('id');

                            if (contractversionrowid == contractversion._id) {
                                // filter contract version list
                                contractversionrow.show();
                            }

                            // if latest version of contract
                            if (contractversion.contract.latestversion == contractversion.version) {
                                $('#versionNote' + contractversion._id).show();
                            }
                        }
                    }

                } else {
                    $('#contractVersionsDiv').hide();
                    $('#notContractText').attr('hidden', false);

                }

                console.log('SUCCESS');

            },
            error: function(err) {
                console.log(err);
            }
        });
    });
    $('.contract-version-row').click(function () {

        const contractversionid = $(this).attr('id');

        console.log(contractversionid);

        $('.version-note-card').hide();
        $('#versionNote' + contractversionid).show();

    });
    $('.forlegalreview').click(function () {
        // alert(this.id);
        $.ajax({
            url: "/request/forlegalreview",
            method: "GET",
            contentType: "application/json",
            data: { contractid: this.id },
            success: setTimeout(function () {
                console.log('SUCCESS');
                location.reload();
            }, 350),
            error: function (err) {
                console.log(err);
            }
        });

    });
    $('.markascleared').click(function () {
        // alert(this.id);
        $.ajax({
            url: "/request/approveRequest",
            method: "GET",
            contentType: "application/json",
            data: { contractid: this.id },
            success: setTimeout(function () {
                console.log('SUCCESS');
                location.reload();
            }, 350),
            error: function (err) {
                console.log(err);
            }
        });

    });
    $('#routeToAnotherAttorney').click(function () {
        
        const contractrequestid = $('#contractRequestId').val();

        const routedattorney = $('#routeAttorneySelect').find(':selected').val();

        $.ajax({
            url: "/request/routeattorney",
            method: "GET",
            contentType: "application/json",
            data: { 
                contractrequestid: contractrequestid,
                routedattorney: routedattorney
            },
            success: setTimeout(function () {
                console.log('SUCCESS');
                location.reload();
            }, 100),
            error: function (err) {
                console.log(err);
            }
        });

    });

    // $('.forrevision').click(function () {
    //     alert(this.id);
    //     $.ajax({
    //         url: "/request/forlegalreview",
    //         method: "GET",
    //         contentType: "application/json",
    //         data: { userid: this.id },
    //         success: setTimeout(function () {
    //             console.log('SUCCESS');
    //             location.reload();
    //         }, 350),
    //         error: function (err) {
    //             console.log(err);
    //         }
    //     });

    // });
    
    var sectionChanges = $(".changes-section");
    var sectionChangesText = $("#changes-section-text");
    var changesField = sectionChanges.val();

    if (changesField === "") {
        sectionChanges.css("display", "none");
        sectionChangesText.css("display", "none");
    }
    else {
        sectionChanges.css("display", "block");
        sectionChangesText.css("display", "block");
    }

});