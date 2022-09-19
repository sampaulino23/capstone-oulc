$(document).ready(() => {

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