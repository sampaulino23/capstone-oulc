$(document).ready(() => {

    var role = document.getElementById("currentRole").value;
    var id = document.getElementById("currentId").value;
    
    if(role == "Attorney" && id != "6318a6b4c0119ed0b4b6bb82"){
        document.getElementById("reroutedTab").style.display = "none";
    }
    else {
        document.getElementById("reroutedTab").style.display = "";
    }

    $(window).on('load', function() {

        console.log('hello');
    })
});