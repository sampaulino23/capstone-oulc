$(document).ready( () => {

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
});