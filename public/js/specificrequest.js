$(document).ready(() => {

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

        // get current user id
        const role = $('#currentRole').val();
        console.log(role);

        // if current role is Staff
        if (role == 'Staff') {
            // disable checkbox if status counter is within [2, 4, 5, 6, 7, 8]
            const statusCounter = parseInt($('#statusCounter').val());
            const statusListDisabled = [2, 4, 5, 6, 7, 8];

            if (statusListDisabled.includes(statusCounter)) {
                $('.is-reviewed').prop('disabled', true);
            }
        } else if (role == 'Attorney') {
            // disable checkbox if status counter is within [1, 2, 3, 5, 7, 8]
            const statusCounter = parseInt($('#statusCounter').val());
            const statusListDisabled = [1, 2, 3, 5, 7, 8];

            if (statusListDisabled.includes(statusCounter)) {
                $('.is-reviewed').prop('disabled', true);
            }
        }

        console.log(statusCounter);

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
    });
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
            data: { userid: this.id },
            success: setTimeout(function () {
                console.log('SUCCESS');
                location.reload();
            }, 350),
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