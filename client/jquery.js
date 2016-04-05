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


// HELPER FUNCTIONS
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
                alert("Recipe playlist added");
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
    requestJSON.recipe_id_list = 
    $.post("http://159.203.44.151:24200/create_recipe_playlist", JSON.stringify(requestJSON))
        .done(function(data) {
            var object = JSON.parse(data);
            if (object.error) {
                console.log("Error creating playlist");
                return object.error;
            }
            if (object.recipe_playlist_id) {
                $("#recipe_lists").prepend("<li><a onclick='add_recipe_to_playlist(\"" + object.recipe_playlist_id + "\")'>" + name + "</a></li>");
                alert("Reciple playlist created.");
                return object.recipe_playlist_id;
            }
            else {
                console.log("recipe list error");
                return;
            }

        });
}
function toggle_comments() {
    $("#comment_list").toggle();
}
function get_recipe_playlist(playlist_id) {
    var requestJSON = new Object();
    requestJSON.recipe_playlist_id = playlist_id;
    $.post("http://159.203.44.151:24200/get_recipe_playlist", JSON.stringify(requestJSON))
        .done(function(data) {
            var object = JSON.parse(data);
            if (object.error) {
                console.log(object.error);
                return object.error;
            }
            if (object.recipe_playlist_name) {
                console.log(object);
                return object;
            }
            else {
                console.log("error");
                return "error";
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
function display_recipes (div_id, recipe_list) {
    
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


function display_profile_page() {
    get_username();//display nav bar

    var requestJSON = new Object();
    requestJSON.username = localStorage.getItem("username");
    $.post("http://159.203.44.151:24200/get_user_profile", JSON.stringify(requestJSON))
        .done(function(data) {
            var object = JSON.parse(data);
            if (object.username) {
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
                //console.log(object);
                //funciton display recent recipes
                //funciton display favourite recipes
            }
            if (object.error) {
                console.log(object.error);
            }
        });
}

// recipe.html body.onload = display_recipe_page()
function display_recipe_page() {
    // Request to fill current recipe details
    var requestJSON = new Object();
    requestJSON.recipe_id = localStorage.getItem("recipe_id");
    $.post("http://159.203.44.151:24200/get_recipe_detail", JSON.stringify(requestJSON))
        .done(function(data) {
            var object = JSON.parse(data);
            get_username();
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
    // Request to fill related recipes at the bottom of a recipe's page
    var requestJSON2 = new Object();
    requestJSON2.sort_type = "POPULAR_WEEK";
    requestJSON2.similar_recipe = localStorage.getItem("recipe_id");
    requestJSON2.number_of_recipes = 4;
    requestJSON2.page_number = 1;
    $.post("http://159.203.44.151:24200/get_recipes", JSON.stringify(requestJSON2))
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
                        list += "<span class='glyphicon glyphicon-star' aria-hidden='true'></span";
                    }
                    else {
                    // check if you need whole star or half star
                        list +="<span class='glyphicon glyphicon-star-empty' aria-hidden='true'></span>";
                    }
                }
                list += "</p><p><span class='glyphicon glyphicon-time' aria-hidden='true'></span>" + object[i].prep_time + "</p></div></div></div>";              
            }
            $("#related").append(list);
        });
    // Request to fill recipe playlists
    var requestJSON3 = new Object();
    requestJSON3.login_id = localStorage.getItem("login_id");
    $.post("http://159.203.44.151:24200/get_user_profile", JSON.stringify(requestJSON3))
        .done(function(data) {
            var object = JSON.parse(data);
            if (object.error) {
                console.log("Error");
                return object.error;
            }
            // if this user has 1 or more recipe playlists
            if (object.recipe_playlists && object.recipe_playlists.length > 0) {
                for (i = 0; i < object.recipe_playlists.length; i++) {
                    var requestJSON4 = new Object();
                    requestJSON4.recipe_playlist_id = object.recipe_playlists[i];
                    $.post("http://159.203.44.151:24200/get_recipe_playlist", JSON.stringify(requestJSON4))
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
    return;
}

// Functions to display pages
// index.html body.onload = display_index_page()
function display_index_page() {
}

function display_searchpage() {

}
function view_search(current_search) {
    localStorage.setItem("current_search", current_search);
    location.href="searchpage.html";
}
// any time you click on a recipe, call this function
function view_recipe(recipe_id) {
    localStorage.setItem("recipe_id", recipe_id);
    location.href="recipe.html";
}

// any time you click a username or go to your own profile, call this function
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
// any time you go to the index page, call this function
function view_index_page() {
    location.href = "index.html";
}

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