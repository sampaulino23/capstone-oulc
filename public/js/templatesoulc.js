$(document).ready(() => {

    $('tr').click(function () {
        
        var templateid = $(this).attr('id');

        $.ajax({
            url: "/staff/viewtemplate",
            method: "GET",
            contentType: "application/json",
            data: { templateid: templateid },
            success: function (res) {

                const templateView = $('#templateView');
                const templateViewFullSize = $('#templateViewFullSize');

                templateView.empty();
                templateViewFullSize.empty();

                const embedPDFView = document.createElement('embed');
                embedPDFView.setAttribute('src', `/staff/template/${res.pdfFileId}`);
                embedPDFView.setAttribute('width', '100%');
                embedPDFView.setAttribute('height', '600px');

                const embedPDFViewFullSize = document.createElement('embed');
                embedPDFViewFullSize.setAttribute('src', `/staff/template/${res.pdfFileId}`);
                embedPDFViewFullSize.setAttribute('width', '100%');
                embedPDFViewFullSize.setAttribute('height', '800px');

                templateView.append(embedPDFView);
                templateViewFullSize.append(embedPDFViewFullSize)

                $(".full-size-btn").css("display", "block");

                console.log('SUCCESS');
            },
            error: function(err) {
                console.log(err);
            }
        });

    });

    $('.action-cell').click(function(event){
        event.stopPropagation();
    });

});