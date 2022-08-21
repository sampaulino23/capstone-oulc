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

    if ($("#flexSwitchCheckChecked").prop('checked', true)) {
        $('.cancel-useraccess').click(function () {
            $("#flexSwitchCheckChecked").prop('checked', true); 
        });
    }

    if ($("#flexSwitchCheckDefault").prop('checked', false)){
        $('.cancel-useraccess').click(function () {
            $("#flexSwitchCheckDefault").prop('checked', false); 
        });
    }


    $('.disable-useraccess').click(function () {
        //var id = $(this).data('id');
        // alert(this.id);

        $.ajax({
            url: "/admin/disableuser",
            method: "GET",
            contentType: "application/json",
            data: { userid: this.id },
            success: setTimeout (function () {
                console.log('SUCCESS');
                location.reload();
            }, 350),
            error: function (err) {
                console.log(err);
            }
        });
        

    });

    $('.enable-useraccess').click(function () {
        console.log(this);

        $.ajax({
            url: "/admin/enableuser",
            method: "GET",
            contentType: "application/json",
            data: { userid: this.id },
            success: setTimeout (function () {
                console.log('SUCCESS');
                location.reload();
            }, 350),
            error: function (err) {
                console.log(err);
            }
        });
         
    });

    $('.get-edit-user').click( function() {

        var userid = $(this).parents('tr').attr('id');
        console.log('userid: ' + userid);

        $.ajax({
            url: "/admin/edituser",
            method: "GET",
            contentType: "application/json",
            data: { userid: userid },
            success: function() {
                console.log('SUCCESS');
            },
            error: function(err) {
                console.log(err);
            }
        });
    });

});


