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
        $("#password").css("backgroundColor","#E34234");
        $("#cpwd").css("backgroundColor","#E34234");
        return false;
    }
    else
        return true;

});