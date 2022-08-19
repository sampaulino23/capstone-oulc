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

    $('.enable-useraccess').click(function () {
        //var id = $(this).data('id');
        // alert(this.id);

        $.ajax({
            url: "/admin/enableuser",
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


function viewAllUsers(){
    alert ("VIEW ALL");
}

function viewActiveUsers(){
    alert ("VIEW ACTIVE");
   // $("#nav-viewUsers-start").("{{#compare isActive '==' true}}");
   // $("#nav-viewUsers-end").append("{{/compare}}");
   // document.getElementById("nav-viewUsers-start").innerHTML = "{{#compare isActive '==' true}}";
   // document.getElementById("nav-viewUsers-end").innerHTML = "/{{/compare}}";
}



function viewInactiveUsers(){
    alert ("VIEW Inactive");
}



