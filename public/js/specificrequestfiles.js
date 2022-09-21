$(document).ready(() => {

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
        var rowCount = $('#documentsAttachedTable tr').length;

        var allreviewed = true;

        for(var i = 0; i < rowCount; i++) {
            var documentattachedrow = $('#myOrderProductTable tr:eq(' + i + ' )');
            var isreviewed = documentattachedrow.find('.is-reviewed').val();

            if (isreviewed == 'false') {    // if not all reviewed
                allreviewed = false;
            }
        }

        if (allreviewed == false) {
            $("#allReviewed").attr("hidden", true);

            // disable for legal review button
            $("#forLegalReviewBtn").attr("disabled", true);
            document.getElementById("forLegalReviewBtn").style.cursor = "not-allowed";

            // disable for revision button
            $("#forRevisionBtn").attr("disabled", true);
            document.getElementById("forRevisionBtn").style.cursor = "not-allowed";
        }
    });
    $('.is-reviewed').change(function () {
        var currentval = $(this).val();

        if (currentval == 'true') {
            $(this).val(false);

        } else if (currentval == 'false') {
            $(this).val(true);
        }

        var rowCount = $('#documentsAttachedTable tr').length;

        var allreviewed = true;

        for(var i = 0; i < rowCount; i++) {
            var documentattachedrow = $('#documentsAttachedTable tr:eq(' + i + ' )');
            var isreviewed = documentattachedrow.find('.is-reviewed').val();

            if (isreviewed == 'false') {
                allreviewed = false;
            }
        }

        if (allreviewed == true) {
            $("#allReviewed").attr("hidden", false);

            // enable for legal review button
            $("#forLegalReviewBtn").attr("disabled", false);
            document.getElementById("forLegalReviewBtn").style.cursor = "pointer";
            document.getElementById("forLegalReviewBtn").style.background = "#0C8039";
            document.getElementById("forLegalReviewBtn").classList.add("marked-complete-review-btn");

            // enable for revision button
            $("#forRevisionBtn").attr("disabled", false);
            document.getElementById("forRevisionBtn").style.cursor = "pointer";
            

        } else if (allreviewed == false) {
            $("#allReviewed").attr("hidden", true);

            // disable for legal review button
            $("#forLegalReviewBtn").attr("disabled", true);
            document.getElementById("forLegalReviewBtn").style.cursor = "not-allowed";
            document.getElementById("forLegalReviewBtn").classList.remove("marked-complete-review-btn");

            // disable for revision button
            $("#forRevisionBtn").attr("disabled", true);
            document.getElementById("forRevisionBtn").style.cursor = "not-allowed";
        }

    });

});