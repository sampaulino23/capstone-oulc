$(document).ready(() => {

    $('tr').click(function () {
        
        var templateid = $(this).closest('tr').attr('id');

        console.log(templateid);

        $.ajax({
            url: "/staff/viewtemplate",
            method: "GET",
            contentType: "application/json",
            data: { templateid: templateid },
            success: function (res) {
                console.log(res.pdfFileName);

                const templateView = $('#templateView');

                templateView.empty();

                const embedPDFView = document.createElement('embed');
                embedPDFView.setAttribute('src', `/staff/template/${res.pdfFileName}`);
                embedPDFView.setAttribute('width', '100%');
                embedPDFView.setAttribute('height', '600px');

                templateView.append(embedPDFView);

                console.log('SUCCESS');
            },
            error: function(err) {
                console.log(err);
            }
        });

    });

});