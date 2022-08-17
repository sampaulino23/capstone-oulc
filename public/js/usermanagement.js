$(document).ready(() => {

    $(window).on('load', () => {
        var newlyAddedUserId = $('#newly-added-user-id').html();
        console.log('newlyAddedUserId: ' + newlyAddedUserId);

        if (newlyAddedUserId) {
            $("#add-user-toast").toast({
                delay: 5000
            });

            // Show toast  
            $("#add-user-toast").toast("show");
        }
    });



    $('.disable-useraccess').click(function () {
        //var id = $(this).data('id');
        // alert(this.id);

        $.ajax({
            url: "/admin/disableuser",
            method: "GET",
            contentType: "application/json",
            data: { userid: this.id },
            success: function () {
                console.log('SUCCESS');
            },
            error: function (err) {
                console.log(err);
            }
        });
        location.reload();

    });




});

function disableUser(id) {

    $.ajax({
        url: "/admin/disableuser",
        method: "GET",
        contentType: "application/json",
        data: { userid: id },
        success: function () {
            console.log('SUCCESS');
        },
        error: function (err) {
            console.log(err);
        }
    });
    location.reload();
}


function enableUser(id) {

    $.ajax({
        url: "/admin/enableuser",
        method: "GET",
        contentType: "application/json",
        data: { userid: id },
        success: function () {
            console.log('SUCCESS');
        },
        error: function (err) {
            console.log(err);
        }
    });
    location.reload();
}






