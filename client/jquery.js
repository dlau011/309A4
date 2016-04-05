$(document).ready(function() {
    $.ajaxSetup({
        contentType: "application/json; charset=utf-8"
    });

    $("#login_form").keypress(function(event) {
        if (event.which == 13) {
            event.preventDefault();
            login();
        }
    });
});

function add_comment() {
    //recipe_id login_id comment_text
    var requestJSON = new Object();
    requestJSON.recipe_id = localStorage.getItem("recipe_id");
    requestJSON.login_id = localStorage.getItem("login_id");
    requestJSON.comment_text = $("#comment").val();
    $.post("http://159.203.44.151:24200/add_comment", JSON.stringify(requestJSON))
        .done(function(data) {
            var object = JSON.parse(data);
            console.log(object);
            if (object.error) {
                console.log(object.error);
                return;
            }
            if (object.success) {
                $("#comment_success").empty().append("Comment posted");
                $("#comment").val("");
                return;
            }
        });
}
function add_recipe_to_playlist(playlist_id) {
    var requestJSON = new Object();
    requestJSON.recipe_id = localStorage.getItem("recipe_id");
    requestJSON.recipe_playlist_id = playlist_id;
    $.post("http://159.203.44.151:24200/add_recipe_to_playlist", JSON.stringify(requestJSON))
        .done(function(data) {
            var object = JSON.parse(data);
            if (object.error) {
                console.log(object.error);
                return object.error;
            }
            if (object.success) {
                console.log(object.success);
                $("#creation_alert").empty().append("Recipe playlist added");
                return;
            }
            else {
                console.log("error");
                return;
            }
        });
}
function create_recipe() {
    var requestJSON = new Object();
    // Handle tags input
    if ($("#tags").val() != "") {
        var tags = $("#tags").val().split(',');
        for (i = 0; i < tags.length; i++) {
            tags[i] = tags[i].trim();
            tags[i] = tags[i].replace(",",'');
        }
    }

    if ($("#ingredients").val() != "") {
        var ingredients = $("#ingredients").val().split(',');
        for (j = 0; j < ingredients.length; j++) {
            ingredients[j] = ingredients[j].trim();
            ingredients[j] = ingredients[j].replace(",", '');
        }
    }
    requestJSON.recipe_name = $("#recipe_name").val();
    requestJSON.login_id = localStorage.getItem("login_id");
    requestJSON.prep_time = $("#prep_time").val();
    requestJSON.serving_size = $("#serving_size").val();
    requestJSON.tags = tags;
    requestJSON.recipe_text = $("#description").val();
    requestJSON.main_image = $("#image").val();
    requestJSON.ingredients = ingredients;

    $.post("http://159.203.44.151:24200/add_recipe", JSON.stringify(requestJSON))
        .done(function(data) {
            var recipe_id = JSON.parse(data).recipe_id;
            if (recipe_id) { 
                console.log(recipe_id);
                view_recipe(recipe_id);
                return recipe_id;
            }
            else {
                $("#post_fail").empty().append(JSON.parse(data).error);
            }
        });
}
function create_recipe_playlist() {
    var name = prompt("What would you like to name your new Recipe Playlist?");
    var requestJSON = new Object();
    requestJSON.login_id = localStorage.getItem("login_id");
    if (name != null) {
        requestJSON.recipe_playlist_name = name;
    }
    $.post("http://159.203.44.151:24200/create_recipe_playlist", JSON.stringify(requestJSON))
        .done(function(data) {
            var object = JSON.parse(data);
            if (object.error) {
                console.log("Error creating playlist");
                return object.error;
            }
            if (object.recipe_playlist_id) {
                $("#recipe_lists").prepend("<li><a onclick='add_recipe_to_playlist(\"" + object.recipe_playlist_id + "\")'>" + name + "</a></li>");
                $("#creation_alert").empty().append("Reciple playlist created.");
                return object.recipe_playlist_id;
            }
            else {
                console.log("recipe list error");
                return;
            }

        });
}

function get_username() {
    var requestJSON = new Object();
    requestJSON.login_id = localStorage.getItem("login_id");
    $.post("http://159.203.44.151:24200/get_logged_in_username", JSON.stringify(requestJSON))
        .done(function(data) {
            var username = JSON.parse(data).username;
            if (username) {
                // whenever something needs username filled in, do it here
                $("#username").text(username);
                return username;
            }
            if (JSON.parse(data).error) {
                console.log(JSON.parse(data).error);
                return "JSON Error";
            }
            else {
                return "User Not Found";
            }

        });
}
function login() {
    var requestJSON = new Object();
    requestJSON.username = $("#username").val();
    requestJSON.hashed_password = hash($("#password").val());
    $.post("http://159.203.44.151:24200/authenticate_user", JSON.stringify(requestJSON))
        .done(function(data){
            var login_id = JSON.parse(data).login_id;
            if (login_id) {
                location.href = "index.html";
                localStorage.setItem("login_id", login_id);
            }
            else {
                $("#message").empty().append("Incorrect username or password");
            }
        });  
}
function rate_recipe(rating, recipe_id) {
    var requestJSON = new Object();
    requestJSON.login_id = localStorage.getItem("login_id");
    requestJSON.recipe_id = recipe_id;
    requestJSON.rating = rating;
    $.post("http://159.203.44.151:24200/rate_recipe", JSON.stringify(requestJSON))
        .done(function(data) {
            if (JSON.parse(data).error) {
                console.log(JSON.parse(data).error);
                return "JSON Error";
            }
            if (JSON.parse(data).success == true) {
                console.log("Rating success");
            }
            else {
                return "Recipe rate failure";
            }
        });
}
function register() {
    var requestJSON = new Object();
    // Make sure user typed the right password
    if ($("#password").val() != $("#password_check").val()) {
        $("#password_fail").empty().append("Passwords do not match");
        return;
    }
    requestJSON.username = $("#username").val();
    requestJSON.hashed_password = hash($("#password").val());
    requestJSON.full_name = $("#fullname").val();
    if ($("#bio").val() != "") {
        requestJSON.bio = $("#bio").val();
    }
    if ($("#profile_image").val() != "") {
        requestJSON.profile_image = $("#profile_image").val();
    }

    $.post("http://159.203.44.151:24200/create_user", JSON.stringify(requestJSON))
        .done(function(data) {
            var login_id = JSON.parse(data).login_id;
            // If user is successfuly registered, take them to index
            if (login_id) {
                localStorage.setItem("login_id", login_id);
                location.href = "index.html";
                console.log(login_id);
                return login_id;
            }
            else {
                $("#register_fail").empty().append(JSON.parse(data).error);
            }
        });
}
function subscribe_to() {
    var requestJSON = new Object();
    requestJSON.login_id = localStorage.getItem("login_id");
    requestJSON.username = localStorage.getItem("username");
    $.post("http://159.203.44.151:24200/subscribe_to", JSON.stringify(requestJSON))
        .done(function(data) {
            if (JSON.parse(data).success ) {
                return;
            }
            if (JSON.parse(data).error) {
                console.log(JSON.parse(data).error);
                return "JSON Error";
            }
        });
}
function toggle(div_id) {
    $("#" + div_id).toggle();
}

function display_favourite_recipes() {
    var requestJSON = new Object();
    requestJSON.recipe_id = localStorage.getItem("recipe_id");
    $.post("http://159.203.44.151:24200/get_recipe_detail", JSON.stringify(requestJSON))
        .done(function(data) {
            var object = JSON.parse(data);
            if (object.recipe_id) {
            }
        });
}
// Gets the intricate details of a recipe to display
function display_recipe_detail() {
    // Request to fill current recipe details
    var requestJSON = new Object();
    requestJSON.recipe_id = localStorage.getItem("recipe_id");
    $.post("http://159.203.44.151:24200/get_recipe_detail", JSON.stringify(requestJSON))
        .done(function(data) {
            var object = JSON.parse(data);
            if (object.recipe_id) {
                $("#title").text(object.recipe_name);
                $("#recipe_name").text(object.recipe_name);
                $("#recipe_by").append("<a onclick='view_profile(\"" + object.author_username + "\")'>" + object.author_username + "</a>");
                $("#rating").append(object.rating);
                $("#prep_time").append(object.prep_time);
                $("#serving_size").append(object.serving_size);
                for (i = 0; i < object.ingredients.length; i++) {
                    $("#ingredients").append("<li>" + object.ingredients[i] + "</li>");
                }
                for (j = 1; j <= 5; j++) {
                    // rating = 0? rating = 1? rating = 3.5? rating = 3.7?
                    // j = 1,2,3,4,5
                    if (object.rating >= j) {
                        $("#rating").append("<span class='glyphicon glyphicon-star' aria-hidden='true'></span");
                    }
                    else {
                        // check if you need whole star or half star
                        $("#rating").append("<span class='glyphicon glyphicon-star-empty' aria-hidden='true'></span>");
                    }
                }

                document.getElementById("main_image").style.background = "url('" + object.main_image + "') no-repeat center";
                $("#main_text").html(object.recipe_text);
                $("#num_comments").text(object.comments.length);
                for (k = 0; k < object.tags.length; k++) {
                    $("#tags").append("<a href='MAKEASEARCHFUNCTION'>#" + object.tags[k] + " </a>");
                }
                for (l = 0; l < object.comments.length; l++) {
                    $("#comment_list").append("<li>" + object.comments[l].author_username + ": " + object.comments[l].comment_text + "</li>");
                }

                return object;
            }
            if (object.error) {
                console.log(object.error);
                return object.error;
            }
        });
}

/* Main search function:
- div_id is a div you want to append your search results to
- sort_type is one of "MOST_RECENT", "POPULAR_TODAY", "POPULAR_WEEK", "POPULAR_MONTH", "POPULAR_YEAR", or "POPULAR_ALL_TIME".
- number_of_recipes is the number of recipes per page you want 
- page_number is the number of pages of recipes there will be
- search_query is a word to search by
- search_tags is a list of tags to search by
- similar_recipe is a recipe_id to search by
- recipes_by_username is a username to see recipes by a certain user
*/
function display_recipe_search(div_id, sort_type, number_of_recipes, page_number, search_query="",search_tags=[], similar_recipe="", recipes_by_username="") {
    // Request to fill related recipes at the bottom of a recipe's page
    // Mandatory: sort_type, number of recipes, page_number, div_id

    // Return: an array of {recipe_id, recipe_name, author_username, rating, prep_time, main_image}
    var requestJSON = new Object();
    requestJSON.sort_type = sort_type;
    requestJSON.number_of_recipes = number_of_recipes;
    requestJSON.page_number = page_number;
    // Optional: search_query, [search_tags], similar_recipe, recipes_by_username, login_id
    if (search_query != "") {
        requestJSON.search_query = search_query;
    }
    if (search_tags.length > 0) {
        requestJSON.search_tags = search_tags;
    }
    if (similar_recipe != "") {
        requestJSON.similar_recipe = similar_recipe;
    }
    if (recipes_by_username != "") {
        requestJSON.recipes_by_username = recipes_by_username;
    }

    $.post("http://159.203.44.151:24200/get_recipes", JSON.stringify(requestJSON))
        .done(function(data) {
            var object = JSON.parse(data);
            if (object.error) {
                console.log(object.error);
                return object.error;
            }
            var list = "";
            for (i = 0; i < object.length; i++) {
                var recipe_id = "\"" + object[i].recipe_id + "\"";
                list += 
                    "<div class='col-sm-6 col-md-3'><div class='thumbnail'>" +
                    "<img src='" + object[i].main_image + "' alt='...' class='img-rounded'>" +
                    "<div class='caption'><h4><a onclick=view_recipe(\"" + object[i].recipe_id + "\")>" + object[i].recipe_name + "</a></h4>" +
                    "<p>by <a onclick=view_profile(\"" + object[i].author_username + "\")>" + object[i].author_username +"</a></p><p>";
                for (j = 1; j <= 5; j++) {
                    // rating = 0? rating = 1? rating = 3.5? rating = 3.7?
                    // j = 1,2,3,4,5
                    if (object[i].rating >= j) {
                        list += "<span class='glyphicon glyphicon-star' aria-hidden='true'></span>";
                    }
                    else {
                    // check if you need whole star or half star
                        list +="<span class='glyphicon glyphicon-star-empty' aria-hidden='true'></span>";
                    }
                }
                list += "</p><p><span class='glyphicon glyphicon-time' aria-hidden='true'></span>" + object[i].prep_time + "</p></div></div></div>";              
            }

            $("#"+div_id).append(list);
        });
}

// Displays the recipe dropdown menu
function display_recipe_playlists() {
    // Request to fill recipe playlists
    var requestJSON = new Object();
    requestJSON.login_id = localStorage.getItem("login_id");
    $.post("http://159.203.44.151:24200/get_user_profile", JSON.stringify(requestJSON))
        .done(function(data) {
            var object = JSON.parse(data);
            if (object.error) {
                console.log("Error");
                return object.error;
            }
            // if this user has 1 or more recipe playlists
            if (object.recipe_playlists && object.recipe_playlists.length > 0) {
                for (i = 0; i < object.recipe_playlists.length; i++) {
                    var requestJSON2 = new Object();
                    requestJSON2.recipe_playlist_id = object.recipe_playlists[i];
                    $.post("http://159.203.44.151:24200/get_recipe_playlist", JSON.stringify(requestJSON2))
                        .done(function(data) {
                            var object2 = JSON.parse(data);
                            if (object2.error) {
                                console.log(object2.error);
                                return;
                            }
                            if (object2) {
                                $("#recipe_lists").prepend("<li><a onclick='add_recipe_to_playlist(\"" + object.recipe_playlists[i] + "\")'>" + object2.recipe_playlist_name + "</a></li>");
                            }
                        });
                }
                return;
            }
            else {
                console.log("recipe list error");
                return;
            }

        });
}

// Displays the intricate details of a profile
function display_profile_detail() {
    var requestJSON = new Object();
    requestJSON.username = localStorage.getItem("username");
    $.post("http://159.203.44.151:24200/get_user_profile", JSON.stringify(requestJSON))
        .done(function(data) {
            var object = JSON.parse(data);
            if (object.username) {
                $("#title").text(object.username + "'s Profile");
                if(object.profile_image){
                    document.getElementById("profilepic").src= object.profile_image;    
                }
                for (var i = 1; i <= 5; i++) {
                    if (object.rating >= i) {
                        $("#profilerat").append("<span class='glyphicon glyphicon-star' aria-hidden='true'></span");
                    }
                    else {
                        $("#profilerat").append("<span class='glyphicon glyphicon-star-empty' aria-hidden='true'></span>");
                    }
                    if(i == 5){
                        $("#profilerat").append(object.rating);
                    }
                }
                $("#profile_subs").append(object.number_of_subscribers);
                $("#profile_subed").append(object.subscribed_to.length);

                $("#profile_name").append(object.full_name);
                $("#profile_userid").append("<a href=\"#\">@"+ object.username +"</a>");
                $("#profile_bio").append(object.bio);

                for(var i = 0; i < 3; i ++){
                    $("#profile_tags").append("<li><a href=\"#\">#"+ object.most_used_tags[i] +"</a></li>");
                }
                // display favorite recipes
                var list = "";

                for (i = 0; i < object.favourite_recipes.length; i++) {
                    var requestJSON2 = new Object();
                    requestJSON2.recipe_id = object.favourite_recipes[i];
                    $.post("http://159.203.44.151:24200/get_recipe_detail", JSON.stringify(requestJSON2))
                        .done(function(data) {
                            var object2 = JSON.parse(data);
                            list += 
                                "<div class='col-sm-6 col-md-3'><div class='thumbnail'>" +
                                "<img src='" + object2.main_image + "' alt='...' class='img-rounded'>" +
                                "<div class='caption'><h4><a onclick=view_recipe(\"" + object2.recipe_id + "\")>" + object2.recipe_name + "</a></h4>" +
                                "<p>by <a onclick=view_profile(\"" + object2.author_username + "\")>" + object2.author_username +"</a></p><p>";
                            for (j = 1; j <= 5; j++) {
                                // rating = 0? rating = 1? rating = 3.5? rating = 3.7?
                                // j = 1,2,3,4,5
                                if (object2.rating >= j) {
                                    list += "<span class='glyphicon glyphicon-star' aria-hidden='true'></span>";
                                }
                                else {
                                // check if you need whole star or half star
                                    list +="<span class='glyphicon glyphicon-star-empty' aria-hidden='true'></span>";
                                }
                            }
                            list += "</p><p><span class='glyphicon glyphicon-time' aria-hidden='true'></span>" + object2.prep_time + "</p></div></div></div>";  
                            $("#favourites").append(list);           
                        }); 
                        
                }
            }
            if (object.error) {
                console.log(object.error);
            }
        });
}

// ---------Functions that call all the necessary helper functions to fill in a page-------
// MAIN FUNCTION TO DISPLAY PROFILE PAGE
function display_profile_page() {
    if (localStorage.getItem("login_id") == null) {
        alert("Please log in before continuing to use Cookbook");
        location.href="login.html";
    }
    get_username();//display nav bar
    display_profile_detail();
    display_recipe_search("recent","MOST_RECENT", 4, 1, "", [], "", localStorage.getItem("username"));
}
// MAIN FUNCTION TO DISPLAY RECIPE PAGE
function display_recipe_page() {
    if (localStorage.getItem("login_id") == null) {
        alert("Please log in before continuing to use Cookbook");
        location.href="login.html";
    }
    get_username();
    display_recipe_detail();
    display_recipe_playlists();
    //div_id, sort_type, number_of_recipes, page_number, search_query="",search_tags=[], similar_recipe="", recipes_by_username=""
    display_recipe_search("related", "POPULAR_WEEK", 4, 1, "", [], localStorage.getItem("recipe_id"));
}

// MAIN FUNCTION TO DISPLAY INDEX PAGE
function display_index_page() {
    if (localStorage.getItem("login_id") == null) {
        alert("Please log in before continuing to use Cookbook");
        location.href="login.html";
    }
}

// MAIN FUNCTION TO DISPLAY SEARCH PAGE
function display_searchpage(current_search) {
    if (localStorage.getItem("login_id") == null) {
        alert("Please log in before continuing to use Cookbook");
        location.href="login.html";
    }
    get_username();
 
}

// ----------- Functions to ensure you are on the right page before you try to instantiate anything ------------
function view_search(current_search) {
    localStorage.setItem("current_search", current_search);
    location.href="searchpage.html";
}
function view_recipe(recipe_id) {
    localStorage.setItem("recipe_id", recipe_id);
    location.href="recipe.html";
}

function view_profile(username) {
    localStorage.setItem("username", username);
    location.href = "profile.html";
}
function view_self_profile() {
    var requestJSON = new Object();
    requestJSON.login_id = localStorage.getItem("login_id");
    $.post("http://159.203.44.151:24200/get_logged_in_username", JSON.stringify(requestJSON))
        .done(function(data) {
            var username = JSON.parse(data).username;
            if (username) {
                // whenever something needs username filled in, do it here
                localStorage.setItem("username", username);
                location.href = "profile.html";
                return username;
            }
            if (JSON.parse(data).error) {
                console.log(JSON.parse(data).error);
                return "JSON Error";
            }
            else {
                return "User Not Found";
            }

        });

}
function view_index_page() {
    location.href = "index.html";
}
// ------------------------------------------------------------------------------

// hashes a password
function hash(password) {
    var hash = 0, i, chr, len;
    if (password.length === 0) {
        return hash;
    }
    for (i = 0, len = password.length; i < len; i++) {
        chr   = password.charCodeAt(i);
        hash  = ((hash << 5) - hash) + chr;
        hash |= 0; // Convert to 32bit integer
    }
    return hash;
}