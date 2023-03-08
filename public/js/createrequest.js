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
            $(".company-list-note").css("display", "none");
        } else {
            $("#contractingparty-div").prop('hidden', true);
            $("#contractingparty").prop('required',false);
            $(".company-list-note").css("display", "block");
        }
    })

    $("#documenttype").change(function() {
        if ($("#documenttype").find('option:selected').text() == "OJT/Internship Agreements - Student MOA") {
            $("#contractingpartyojt-div").prop('hidden', false); // div part with dropdown
            $("#contractingparty").prop('required',false); // original input field of the div will not be required anymore
            $("#contractingparty-div").prop('hidden', true); // original div
            $(".company-list-note").css("display", "block");
            // $("#contractingparty").removeAttr('required');​​​​​
            $("#company-other").prop('hidden', true);
            $(".company-list-note").css("display", "block");
            $(".student-ojt-reminder").css("display", "block");
            $("#optionNone").prop('selected', true);
        } else {
            $("#company-other").prop('hidden', false);
            $(".company-list-note").css("display", "block");
            $("#contractingpartyojt-div").prop('hidden', true);
            $("#contractingparty-div").prop('hidden', false);
            $("#contractingparty").prop('required',true);
            $(".company-list-note").css("display", "none");
            $(".student-ojt-reminder").css("display", "none");
        }
        
        if ($("#documenttype").find('option:selected').text() == "MOA/TOR/Contracts for purchases, services, venue, and other piece of work") {
            $(".tor-reminder").css("display", "block");
        }
        else {
            $(".tor-reminder").css("display", "none");
        }

        if ($("#documenttype").find('option:selected').text() == "OJT/Internship Agreements - Student MOA and Institutional MOA") {
            $(".institutional-moa-reminder").css("display", "block");
            $("#contractingpartyojt-div").prop('hidden', false);
            $("#company-other").prop('selected', true);
        }
        else {
            $(".institutional-moa-reminder").css("display", "none");
        }
    });

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

        $(".signatory-change-note").css("display", "block");
        $('.signatory-change-note').delay(3000).hide(0);
    });

    $('#setCustomSignatoryLevel').click(() => {
        // change isCustomSignatoryLevel to true
        $('#isCustomSignatoryLevel').val(true);

        $('#signatorylevel').prop('readonly', false);
        $('#signatorylevel').removeClass('read-only');
        $('#signatorylevel').removeClass('default-read-only');

        $('.amtdate').off('change');

        $('#setCustomSignatoryLevel').prop('hidden', true);
        $('#setAutomaticSignatoryLevel').prop('hidden', false);
    });

    $('#setAutomaticSignatoryLevel').click(() => {
        // change isCustomSignatoryLevel to false
        $('#isCustomSignatoryLevel').val(false);
        $('#signatorylevel').prop('readonly', true);
        $('#signatorylevel').addClass('read-only');
        $('#signatorylevel').addClass('default-read-only');

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


        $('.amtdate').on('change', function() { 
            console.log('amt date working');
    
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
    
            $(".signatory-change-note").css("display", "block");
            $('.signatory-change-note').delay(3000).hide(0); 
        });

        $('#setCustomSignatoryLevel').prop('hidden', false);
        $('#setAutomaticSignatoryLevel').prop('hidden', true);
    });

    $('#signatorylevel').on('change', function() {
        $(".signatory-change-note").css("display", "block");
        $('.signatory-change-note').delay(3000).hide(0); 
    });

});