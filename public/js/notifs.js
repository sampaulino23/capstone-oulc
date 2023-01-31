$(document).ready(() => { //TO REVISE FOR HIDING OF 0 

    var notif = $("#notif").text();
    var notif1 = $("#notif1").text();
    //alert(notif1);
    if(notif == 0){
        document.getElementById("dropdown-item1").style.display="none";
    }
    if(notif1 == 0){
        document.getElementById("dropdown-item2").style.display="none";
    }
   
});