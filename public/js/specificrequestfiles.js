$(document).ready(() => {

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

    // Listen for click on toggle checkbox
    $('#select-all').click(function(event) {
        if(this.checked) {
            // Iterate each checkbox
            $(':checkbox').each(function() {
                this.checked = true;
            });
        } else {
            $('.checkbox').each(function() {
                this.checked = false;       
            });
        }
    });

});