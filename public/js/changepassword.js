//Check if password and confirm password field are same
function checkpassword(password,cpwd){
    if(password != cpwd){
        alert("Password does not match.");
        return false;
    }
};

$("#submitbtn").click(function(){
    var password = $("#password").val();
    var cpwd = $("#cpwd").val();

    if (checkpassword(password,cpwd) == false)
    {
        $("#password").css("backgroundColor","red");
        $("#cpwd").css("backgroundColor","red");
        return false;
    }
    else
        return true;

});