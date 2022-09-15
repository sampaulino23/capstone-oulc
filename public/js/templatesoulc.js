$(document).ready(() => {

    $('.download-template').click(function () {
        
        var templateid = $(this).closest('tr').attr('id');

        $.ajax({
            url: "/staff/downloadtemplate",
            method: "GET",
            contentType: "application/json",
            data: { templateid: templateid },
            success: setTimeout(function () {
                console.log('SUCCESS');
                location.reload();
            }, 1000),
            error: function(err) {
                console.log(err);
            }
        });

    });

});