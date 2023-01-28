$(document).ready(() => {
    $('#searchPolicyInput').keyup(() => {
        console.log('search policy');

        var input, filter, table, tr, td, i;
        input = document.getElementById("searchPolicyInput");
        filter = input.value.toUpperCase();
        table = document.getElementById("myPolicyTable");
        tr = table.getElementsByTagName("tr");
        
        for (i = 0; i < tr.length; i++) {
            td = tr[i].getElementsByTagName("td")[0]; // for column one
        
        if (td) {
            if ( (td.innerHTML.toUpperCase().indexOf(filter) > -1) )  {            
                    tr[i].style.display = "";
                } else {
                    tr[i].style.display = "none";
                }
            }
        }
    })
});