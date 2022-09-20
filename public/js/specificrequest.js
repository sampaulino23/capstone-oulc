$(document).ready(() => {

    $(window).on('load', function() {

        var fileidSelected = $('#fileSelected').find(":selected").val();

        console.log(fileidSelected);
        
        const embedPDFView = document.createElement('embed');
        embedPDFView.setAttribute('src', `/request/viewfile/${fileidSelected}`);
        embedPDFView.setAttribute('width', '100%');
        embedPDFView.setAttribute('height', '600px');

        fileView.append(embedPDFView);
    });
    $('#fileSelected').change(function () {
        
        var fileid = $(this).val();
        console.log(fileid);

        const fileView = $('#fileView');
        fileView.empty();

        const embedPDFView = document.createElement('embed');
        embedPDFView.setAttribute('src', `/request/viewfile/${fileid}`);
        embedPDFView.setAttribute('width', '100%');
        embedPDFView.setAttribute('height', '600px');

        fileView.append(embedPDFView);
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