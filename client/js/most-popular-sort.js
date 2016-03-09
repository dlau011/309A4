$(document).ready(function() {

    // Right now the sort is hardcoded:

    $("#popular-today").click(function(){
        $("#dropdownMenu1").html(function(){
            return "today <span class='caret'></span>";
        });
        $("#food-1").insertBefore("#food-2");
        $("#food-2").insertBefore("#food-3");
        $("#food-3").insertBefore("#food-4");
    });

    $("#popular-week").click(function(){
        $("#dropdownMenu1").html(function(){
            return "this week <span class='caret'></span>";
        });
        $("#food-2").insertBefore("#food-1");
        $("#food-3").insertBefore("#food-1");
        $("#food-4").insertBefore("#food-1");
    });

    $("#popular-month").click(function(){
        $("#dropdownMenu1").html(function(){
            return "this month <span class='caret'></span>";
        });
        $("#food-3").insertBefore("#food-4");
        $("#food-1").insertBefore("#food-3");
        $("#food-2").insertBefore("#food-1");
    });

    $("#popular-year").click(function(){
        $("#dropdownMenu1").html(function(){
            return "this year <span class='caret'></span>";
        });
        $("#food-4").insertBefore("#food-3");
        $("#food-3").insertBefore("#food-2");
        $("#food-2").insertBefore("#food-1");
    });

    $("#popular-alltime").click(function(){
        $("#dropdownMenu1").html(function(){
            return "all time <span class='caret'></span>";
        });
        $("#food-3").insertBefore("#food-4");
        $("#food-2").insertBefore("#food-3");
        $("#food-1").insertBefore("#food-4");
    });

});