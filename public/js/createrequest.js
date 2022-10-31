$(window).on('load', function() {
    $('#duration').val(0);
});

$(document).ready(() => {
    // a and b are javascript Date objects
    function dateDiffInDays(a, b) {
        const _MS_PER_DAY = 1000 * 60 * 60 * 24;
        // Discard the time and time-zone information.
        const utc1 = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
        const utc2 = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());
      
        return Math.floor((utc2 - utc1) / _MS_PER_DAY);
    }

    $('input[name="daterange"]').daterangepicker({
        opens: 'left'
    }, function(start, end, label) {
        console.log("A new date selection was made: " + start.format('YYYY-MM-DD') + ' to ' + end.format('YYYY-MM-DD'));

        const startDate = new Date(start);
        const endDate = new Date(end);

        const duration = dateDiffInDays(startDate, endDate);
        $('#duration').val(duration);
    });
    $("input[name='templateused']").click(() => {
        
        if ($('#radioTemplateUsed3').is(':checked')) {
            $('#sectionChangesDiv').prop('hidden', false);
        } else {
            $('#sectionChangesDiv').prop('hidden', true);
        }
    });
});

function lockChanges() {
    $("#requestForm :input").prop('readonly', true);
}

document.getElementById("continueBtn").addEventListener("click", function(event){
    event.preventDefault()
});