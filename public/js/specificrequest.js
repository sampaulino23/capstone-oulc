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
        },
        error: function(err) {
            console.log(err);
        }
    });

    // for feedback
    const role = $('#currentRole').val();

    if (role == 'Staff') {
        // disable checkbox if status counter is within [2, 4, 5, 6, 7, 8]
        const statusCounter = parseInt($('#statusCounter').val());
        const statusListDisabled = [2, 4, 5, 6, 7, 8];

        if (!(statusListDisabled.includes(statusCounter))) {
            var comments = [];

            $('div.comments-container>div.pending-feedback').each(function(){
                var contractversionid = $(this).attr('id');
                var content = $(this).find('.pending-feedback-textarea').val();
        
                let comment = {
                    contractversionid: contractversionid,
                    content: content
                }
        
                comments.push(comment);
            });
        
            $.ajax({
                url: "/savependingfeedbackchanges",
                method: "GET",
                contentType: "application/json",
                data: {comments: comments},
                success: function() {
                },
                error: function(err) {
                    console.log(err);
                }
            });
        }
    } else if (role == 'Attorney') {
        const statusCounter = parseInt($('#statusCounter').val());
        const statusListDisabled = [1, 2, 3, 5, 7, 8];

        // also disable checkbox if assignedAttorney is not the same as current user
        const assignedAttorney = $('#assignedAttorneyId').val();
        const currentUser = $('#currentUserId').val();

        if (!(statusListDisabled.includes(statusCounter) || currentUser != assignedAttorney)) {
            var comments = [];

            $('div.comments-container>div.pending-feedback').each(function(){
                var contractversionid = $(this).attr('id');
                var content = $(this).find('.pending-feedback-textarea').val();
        
                let comment = {
                    contractversionid: contractversionid,
                    content: content
                }
        
                comments.push(comment);
            });
        
            $.ajax({
                url: "/savependingfeedbackchanges",
                method: "GET",
                contentType: "application/json",
                data: {comments: comments},
                success: function() {
                },
                error: function(err) {
                    console.log(err);
                }
            });
        }
    }
});

$(window).on('load', function() {

    var fileidSelected = $('#fileSelected').find(":selected").val();

    // change contractFileId for revision history feature
    $('#contractFileId').val(fileidSelected);

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

    // change file selected text under feedback tab
    $('#fileSelectedForFeedback').html('File: ' + $('#fileSelected option:selected').text());
    $('#fileIdSelectedForFeedback').val(fileidSelected);

    // get pending feedbacks
    var pendingFeedbacksFileIds = [];

    function checkPendingFeedbacks() {

        $('.pending-feedback').each(function() {
            pendingFeedbacksFileIds.push($(this).attr('id'));
        });
    }

    checkPendingFeedbacks();

    $.ajax({
        url: "/getpendingfeedbacks",
        method: "GET",
        contentType: "application/json",
        data: {
            pendingFeedbacksFileIds: pendingFeedbacksFileIds,
        },
        success: function(res) {
            for (pendingFeedback of res.pendingFeedbacks) {

                if (pendingFeedback) {
                    var cvId = 'cvId' + pendingFeedback.contractVersion;
    
                    $('#' + cvId).find('textarea.pending-feedback-textarea').val(pendingFeedback.content);
                }
                
            }

        },
        error: function(err) {
            console.log(err);
        }
    });

    var pendingRowCount = $("#stagingUploadsTable tr").length;
    if (pendingRowCount != 0) {
        $("#pendingNote").show();
        $("#changesLength").append(pendingRowCount);
        $("#changesCircle").show();
    }

    // get current role
    const role = $('#currentRole').val();

    var isDisabled = false;

    // if current role is Staff
    if (role == 'Staff') {
        // disable checkbox if status counter is within [2, 4, 5, 6, 7, 8]
        const statusCounter = parseInt($('#statusCounter').val());
        const statusListDisabled = [2, 4, 5, 6, 7, 8];

        const assignedStaff = $('#assignedStaffId').val();
        const currentUser = $('#currentUserId').val();

        if (statusListDisabled.includes(statusCounter) || currentUser != assignedStaff || !assignedStaff) {
            $('.is-reviewed').prop('disabled', true);
            $('#checkAll').prop('disabled', true);

            $('#forLegalReviewBtn').prop('disabled', true);
            document.getElementById("forLegalReviewBtn").style.cursor = "not-allowed";

            $('#forRevisionBtn').prop('disabled', true);
            document.getElementById("forRevisionBtn").style.cursor = "not-allowed";

            isDisabled = true;

            // disable feedback textarea
            $('textarea.pending-feedback-textarea').prop('disabled', true);
        }
    } else if (role == 'Attorney') {
        // disable checkbox if status counter is within [1, 2, 3, 5, 7, 8]
        const statusCounter = parseInt($('#statusCounter').val());
        const statusListDisabled = [1, 2, 3, 5, 7, 8];

        // also disable checkbox if assignedAttorney is not the same as current user
        const assignedAttorney = $('#assignedAttorneyId').val();
        const currentUser = $('#currentUserId').val();

        if (statusListDisabled.includes(statusCounter) || currentUser != assignedAttorney || !assignedAttorney) {
            $('.is-reviewed').prop('disabled', true);
            $('#checkAll').prop('disabled', true);
            
            $('#approveBtn').prop('disabled', true);
            document.getElementById("approveBtn").style.cursor = "not-allowed";
            
            $('#forRevisionBtn').prop('disabled', true);
            document.getElementById("forRevisionBtn").style.cursor = "not-allowed";

            $('#routeAttorneyBtn').prop('disabled', true);
            document.getElementById("routeAttorneyBtn").style.cursor = "not-allowed";
            

            isDisabled = true;

            // disable feedback textarea
            $('textarea.pending-feedback-textarea').prop('disabled', true);
        }
    } else if (role == 'Requester') {
        // disable checkbox if status counter is within [1, 2, 3, 4, 8]
        const statusCounter = parseInt($('#statusCounter').val());
        const statusListDisabled = [1, 2, 3, 7, 8];

        if (statusListDisabled.includes(statusCounter)) {
            $('#addThirdPartyBtn').attr('hidden', true);
        }
    }

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

        },
        error: function(err) {
            console.log(err);
        }
    });

    $.ajax({
        url: "/getfeedbackhistory",
        method: "GET",
        contentType: "application/json",
        data: {fileid: fileidSelected},
        success: function(res) {

            const feedbacklist = res.feedbacklist;

            var cards = $('.feedback-card');
            var cardCount = $('.feedback-card').length;

            cards.hide();

            for (var i = 0; i < cardCount; i++) {
                
                for (feedback of feedbacklist) {

                    if (feedback) {
                        var feedbackrow = $('.feedback-card:eq(' + i + ' )');
                        var feedbackrowid = feedbackrow.attr('id');
                        
                        if (feedbackrowid == feedback._id) {
                            // filter feedback history list
                            feedbackrow.show();
                        }
                    }
                    
                }

            }

        },
        error: function(err) {
            console.log(err);
        }
    });

    $.ajax({
        url: "/getfeedbackinput",
        method: "GET",
        contentType: "application/json",
        data: {
            fileid: fileidSelected,
        },
        success: function(res) {

            const contractVersion = res.contractVersion;

            $('.pending-feedback').hide();

            if (contractVersion) {
                var cvId = 'cvId' + contractVersion._id;
                $('#' + cvId).show();
            }

        },
        error: function(err) {
            console.log(err);
        }
    });

    $.ajax({
        url: "/getcurrentfeedback",
        method: "GET",
        contentType: "application/json",
        data: {
            fileid: fileidSelected,
        },
        success: function(res) {

            const feedback = res.feedback;

            var cards = $('.current-feedback');
            var cardCount = $('.current-feedback').length;

            cards.hide();

            if (feedback) {
                for (var i = 0; i < cardCount; i++) {
                
                    var feedbackrow = $('.current-feedback:eq(' + i + ' )');
                    var feedbackrowid = feedbackrow.find('#currentFeedbackId').val();
                    
                    if (feedbackrowid == feedback._id) {
                        // filter feedback history list
                        feedbackrow.show();
                    }
    
                }
            }

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

        if (isreviewed == 'false') {    // if not all reviewed
            allreviewed = false;
        }
    }

    if (!isDisabled) {
        if (allreviewed == false) {
            $("#allReviewed").attr("hidden", true);
            $("#checkAll").prop("checked", false);
    
            if (role == 'Staff') {
                // disable for legal review button
                $("#forLegalReviewBtn").attr("disabled", true);
                document.getElementById("forLegalReviewBtn").style.cursor = "not-allowed";
    
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
                document.getElementById("forLegalReviewBtn").classList.add("marked-complete-review-btn");
    
                // enable for revision button
                $("#forRevisionBtn").attr("disabled", false);
                document.getElementById("forRevisionBtn").style.cursor = "pointer";
                document.getElementById("forRevisionBtn").classList.add("mark-as-for-revision");
    
            } else if (role == 'Attorney') {
                // enable for approve button
                $("#approveBtn").attr("disabled", false);
                document.getElementById("approveBtn").style.cursor = "pointer";
                document.getElementById("approveBtn").classList.add("marked-complete-review-btn");
    
                // enable for revision button
                $("#forRevisionBtn").attr("disabled", false);
                document.getElementById("forRevisionBtn").style.cursor = "pointer";
                document.getElementById("forRevisionBtn").classList.add("mark-as-for-revision");
    
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

    var contractTypeCode = $("#signedInstitutionalFile-div").attr("class"); // show file upload for institutional moa if type selected involves institutional moa
    if (contractTypeCode != "B1") {
        $("#signedInstitutionalFile-div").prop('hidden', true);
        $("#signedContractFiles").prop('required',true);
        $("#signedInstitutionalFiles").prop('required',false);
    }

    if ($("#statusTextDiv").text() == "Cleared" || $("#statusTextDiv").text() == "Cancelled") {
        document.getElementById("approveBtn").style.display = "none";
        // hide for revision button
        document.getElementById("forRevisionBtn").style.display = "none";
        // hide for route attorney button
        document.getElementById("routeAttorneyBtn").style.display = "none";
    }
    
    $('#uploadNewVersion').click(function () {
        const fileid = $('#fileSelected').val();

        $.ajax({
            url: "/requester/checkstagingcontractversion",
            method: "GET",
            contentType: "application/json",
            data: { fileid: fileid },
            success: function (res) {

                if (res.hasStaging) {
                    // show replace confirmation modal
                    $('#pendingVersionConfirmationModal').modal('show');
                } else {
                    $('#uploadNewVersionModal').modal('show');
                }

                $('#contractVersionIdForNewVersion').val(res.contractVersion);
            },
            error: function (err) {
                console.log(err);
            }
        });
    });
    $('#fileSelected').change(function () {
        
        var fileid = $(this).val();

        // change contractFileId for revision history feature
        $('#contractFileId').val(fileid);

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
                $('#feedback-history').show();

                $('#uploadNewVersion').prop('hidden', true);

                if (res.isContract == true) {
                    // show or hide 'upload new version' button depending on file selected
                    $('#uploadNewVersion').prop('hidden', false);
                    
                    // manipulate contract versions information
                    rows.hide();
                    $('#notContractText').attr('hidden', true);
                    $('#isReferenceFileText').attr('hidden', true);
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
                    $('#feedback-history').hide();
                    $('#isReferenceFileText').attr('hidden', false);
                }

            },
            error: function(err) {
                console.log(err);
            }
        });

        $.ajax({
            url: "/getfeedbackhistory",
            method: "GET",
            contentType: "application/json",
            data: {fileid: fileid},
            success: function(res) {
    
                const feedbacklist = res.feedbacklist;
    
                var cards = $('.feedback-card');
                var cardCount = $('.feedback-card').length;
    
                cards.hide();
    
                for (var i = 0; i < cardCount; i++) {
                    
                    for (feedback of feedbacklist) {

                        if (feedback) {
                            var feedbackrow = $('.feedback-card:eq(' + i + ' )');
                            var feedbackrowid = feedbackrow.attr('id');
                            
                            if (feedbackrowid == feedback._id) {
                                // filter feedback history list
                                feedbackrow.show();
                            }
                        }
                    }
    
                }
    
            },
            error: function(err) {
                console.log(err);
            }
        });

        $.ajax({
            url: "/getfeedbackinput",
            method: "GET",
            contentType: "application/json",
            data: {
                fileid: fileid,
            },
            success: function(res) {
    
                const contractVersion = res.contractVersion;

                $('.pending-feedback').hide();

                if (contractVersion) {
                    var cvId = 'cvId' + contractVersion._id;
                    $('#' + cvId).show();
                }
    
            },
            error: function(err) {
                console.log(err);
            }
        });

        $.ajax({
            url: "/getcurrentfeedback",
            method: "GET",
            contentType: "application/json",
            data: {
                fileid: fileid,
            },
            success: function(res) {
    
                const feedback = res.feedback;

                var cards = $('.current-feedback');
                var cardCount = $('.current-feedback').length;
    
                cards.hide();
    
                if (feedback) {
        
                    for (var i = 0; i < cardCount; i++) {
                        
                        var feedbackrow = $('.current-feedback:eq(' + i + ' )');
                        var feedbackrowid = feedbackrow.find('#currentFeedbackId').val();
                        
                        if (feedbackrowid == feedback._id) {
                            // filter feedback history list
                            feedbackrow.show();
                        }
                    }
                }
                
            },
            error: function(err) {
                console.log(err);
            }
        });
    });
    $('.contract-version-row').click(function () {

        const contractversionid = $(this).attr('id');

        $('.version-note-card').hide();
        $('#versionNote' + contractversionid).show();

    });
    $('.forlegalreview').click(function () {
        $(window).unbind('beforeunload');
        // alert(this.id);
        $.ajax({
            url: "/request/forlegalreview",
            method: "GET",
            contentType: "application/json",
            data: { contractid: this.id },
            success: setTimeout(function () {
                sessionStorage.setItem("action", "forlegalreview");
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
                sessionStorage.setItem("action", "cleared");
                location.reload();
            }, 350),
            error: function (err) {
                console.log(err);
            }
        });

    });

    $('.cancelRequestBtn').click(function () {
        $.ajax({
            url: "/request/cancelRequest",
            method: "GET",
            contentType: "application/json",
            data: { contractid: this.id },
            success: setTimeout(function () {
                location.reload();
            }, 350),
            error: function (err) {
                console.log(err);
            }
        });

    });

    
    $('.assignStaffBtn').click(function () {
        $.ajax({
            url: "/request/assignStaff",
            method: "GET",
            contentType: "application/json",
            data: { contractid: this.id },
            success: setTimeout(function () {
                location.reload();
            }, 350),
            error: function (err) {
                console.log(err);
            }
        });
    });

    $('.assignAttorneyBtn').click(function () {
        $.ajax({
            url: "/request/assignAttorney",
            method: "GET",
            contentType: "application/json",
            data: { contractid: this.id },
            success: setTimeout(function () {
                location.reload();
            }, 350),
            error: function (err) {
                console.log(err);
            }
        });
    });

    $('#forRevisionBtn').click(function() {

        var hasFeedback = false;
        var comments = [];

        $('div.comments-container>div.pending-feedback').each(function(){
            var contractversionid = $(this).attr('id');
            var content = $(this).find('.pending-feedback-textarea').val();
    
            let comment = {
                contractversionid: contractversionid,
                content: content
            }
    
            comments.push(comment);
        });

        console.log(comments);
    
        $.ajax({
            url: "/savependingfeedbackchanges",
            method: "GET",
            contentType: "application/json",
            data: {comments: comments},
            success: function() {
                for (comment of comments) {
                    
                }
                console.log('12');
            },
            error: function(err) {
                console.log(err);
            }
        });

        for (comment of comments) {
            if (comment.content || comment.content != '') {
                hasFeedback = true;
            }
        }

        setTimeout(function() {
            if (hasFeedback) {
                $('#forRevisionModal').modal('show'); 
    
            } else {
                $('#noFeedbackModal').modal('show');
            }
        }, 800);
    });

    $('#routeToAnotherAttorney').click(function () {
        $(window).unbind('beforeunload');
        
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
                sessionStorage.setItem("action", "rerouted");
                location.reload();
            }, 100),
            error: function (err) {
                console.log(err);
            }
        });

    });

    $('.forrevision').click(function () {
        sessionStorage.setItem("action", "forrevision");
    });

    $('.submit-revised').click(function () {
        sessionStorage.setItem("action", "submit-revised");
    });
    
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