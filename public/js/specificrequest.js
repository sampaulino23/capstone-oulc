$(document).ready(() => {

    $(window).on('load', function() {

        var fileidSelected = $('#fileSelected').find(":selected").val();

        const embedPDFView = document.createElement('embed');
        embedPDFView.setAttribute('src', `/request/viewfile/${fileidSelected}`);
        embedPDFView.setAttribute('width', '100%');
        embedPDFView.setAttribute('height', '600px');

        const embedPDFViewFull = document.createElement('embed');
        embedPDFViewFull.setAttribute('src', `/request/viewfile/${fileidSelected}`);
        embedPDFViewFull.setAttribute('width', '100%');
        embedPDFViewFull.setAttribute('height', '800px');
        
        fileView.append(embedPDFView);
        fileViewFull.append(embedPDFViewFull);

        $.ajax({
            url: "/getcontractversions",
            method: "GET",
            contentType: "application/json",
            data: {fileid: fileidSelected},
            success: function(res) {

                const contractversionslist = res.contractversionslist;
                var rowCount = $('#contractVersionsTable tr').length;
                var rows = $('#contractVersionsTable tr');
                $('#contractVersionsDiv').show();

                if (res.isContract == true) {
                    rows.show();
                    $('#notContractText').attr('hidden', true);

                    for(var i = 0; i < rowCount; i++) {
                        for (contractversion of contractversionslist) {
                            var contractversionrow = $('#contractVersionsTable tr:eq(' + i + ' )');
                            var contractversionrowid = contractversionrow.attr('id');
                            
                            if (contractversionrowid == contractversion._id) {
                                // filter contract version list
                                contractversionrow.hide();
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
        const fileViewFull = $('#fileView-full');
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
        fileViewFull.append(embedPDFViewFull)

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
                    rows.show();
                    $('#notContractText').attr('hidden', true);

                    for(var i = 0; i < rowCount; i++) {
                        for (contractversion of contractversionslist) {
                            var contractversionrow = $('#contractVersionsTable tr:eq(' + i + ' )');
                            var contractversionrowid = contractversionrow.attr('id');
                            
                            if (contractversionrowid == contractversion._id) {
                                // filter contract version list
                                contractversionrow.hide();
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