$(document).ready(() => {

    var notif = $(".notifcount").text();
    //alert(notif);
    if(notif == 2){
        document.getElementById("dropdown-item").style.display="none";
    }
});