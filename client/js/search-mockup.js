$(document).ready(function() {

    // This is a mockup search, it only shows/hides elements from the frontend.
    // Search terms are hardcoded.

    $("#search-food-1").hide();
    $("#search-food-2").hide();
    $("#search-food-3").hide();
    $("#search-food-4").hide();

    var urlParams = window.location.href.split("?");
    if (urlParams.length > 0){
        dummySearch(urlParams[1]);
    }

    $("#search-button").click(function(){
        var query = $("#search-input").val().toLowerCase();
        dummySearch(query);
    });

    $("#ext-search-button").click(function(){
        var query = $("#ext-search-input").val().toLowerCase();
        window.location.assign("./searchpage.html?"+query); 
    });

});

function dummySearch(query){
    if (query !== undefined && query.length > 0){
        if ("okonomiyaki".indexOf(query) > -1){
            $("#search-food-1").show();
        } else {
            $("#search-food-1").hide();
        }

        if ("carne asada tacos".indexOf(query) > -1){
            $("#search-food-2").show();
        } else {
            $("#search-food-2").hide();
        }

        if ("ratatouille".indexOf(query) > -1){
            $("#search-food-3").show();
        } else {
            $("#search-food-3").hide();
        }

        if ("spaghetti carbonara".indexOf(query) > -1){
            $("#search-food-4").show();
        } else {
            $("#search-food-4").hide();
        }
    }
}