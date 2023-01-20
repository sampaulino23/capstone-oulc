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

    $("#contractingpartyojt").change(function() {
        if ($("#contractingpartyojt").val() == "Others") {
            $("#contractingparty-div").prop('hidden', false);
            $("#contractingparty").prop('required',true);
        } else {
            $("#contractingparty-div").prop('hidden', true);
            $("#contractingparty").prop('required',false);
        }
    })

    $("#documenttype").change(function() {
        if ($("#documenttype").find('option:selected').text() == "OJT/Internship Agreements - Student MOA" || 
        $("#documenttype").find('option:selected').text() == "OJT/Internship Agreements - w/ Institutional MOA") {
            $("#contractingpartyojt-div").prop('hidden', false);
            $("#contractingparty").prop('required',false);
            $("#contractingparty-div").prop('hidden', true);
            // $("#contractingparty").removeAttr('required');​​​​​
        } else {
            $("#contractingpartyojt-div").prop('hidden', true);
            $("#contractingparty-div").prop('hidden', false);
            $("#contractingparty").prop('required',true);
        }
    })

    $(".amtdate").change(function() { 
        var amount = document.getElementById("amount").value;
        var duration = document.getElementById("duration").value;

        if(amount <= 100000){
            if(duration <= 365){
                $('#signatorylevel').val(5);
            }
            if(duration > 365 && duration <= 1095){
                $('#signatorylevel').val(3);
            }
            if(duration > 1095){
                $('#signatorylevel').val(2);
            }
        } 
        if(amount > 100000 && amount <= 500000){
            if(duration <= 1095){
                $('#signatorylevel').val(3);
            }
            if(duration > 1095){
                $('#signatorylevel').val(2);
            }
        }
        if(amount > 500000 && amount <= 1000000){
            if(duration < 1095){
                $('#signatorylevel').val(2);
            }
            if(duration > 1095){
                $('#signatorylevel').val(2);
            }
        }
        if(amount > 1000000){
            $('#signatorylevel').val(1);
        }
    });

});

