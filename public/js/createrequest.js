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
    $('#starteffectivity, #endeffectivity').change(() => {

        const start = $('#starteffectivity').val();
        const end = $('#endeffectivity').val();

        if (start != '' && end != '') {

            const startDate = new Date(start);
            const endDate = new Date(end);

            if (startDate < endDate) {
                const duration = dateDiffInDays(startDate, endDate);
                $('#duration').val(duration);
            } else {
                console.log('invalid');
            }
        }

    });
});