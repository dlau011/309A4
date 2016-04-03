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
                return recipe_id;
            }
            else {
                $("#post_fail").empty().append(JSON.parse(data).error);
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

function get_username() {
    var requestJSON = new Object();
    requestJSON.login_id = localStorage.getItem("login_id");
    //console.log(requestJSON.login_id);
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

//MATTHEW TODO: The Subcribe button .onclick should call this function
function subscribe_to() {
    // you had some code for this already. 
    // get username by localStorage.getItem("current_profile")
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

// MATTHEW TODO: make .posts to fill in all the parts of a profile page. See display_recipe_page as an example
// profile.htm body.onload = display_profile_page()
function display_profile_page() {
    var requestJSON = new Object();
    requestJSON.username = localStorage.getItem("username");
    $.post("http://159.203.44.151:24200/get_user_profile", JSON.stringify(requestJSON))
        .done(function(data) {
            var object = JSON.parse(data);
            // you have access to this information now: 
            //{username, full_name, profile_image, bio, rating, number_of_subscribers, [subscribed_to], [most_used_tags], [favourite_recipes], [authored_recipes]}
            // fill in $("tags") = "whatever"
            //$("username").text(localStorage.getItem("username"));
            if (object.username) {
                console.log(object);
            }
            if (object.error) {
                console.log(object.error);
            }
            else {
                console.log("EOF");
            }
        });
}

// recipe.html body.onload = display_recipe_page()
function display_recipe_page() {
    var requestJSON = new Object();
    requestJSON.recipe_id = localStorage.getItem("recipe_id");
         //--> Return: {recipe_id, recipe_name, author_username, main_image, rating, num_ratings, prep_time, serving_size,[tags], recipe_text, [comments], views, [ingredients]}
    $.post("http://159.203.44.151:24200/get_recipe_detail", JSON.stringify(requestJSON))
        .done(function(data) {
            var object = JSON.parse(data);
            if (object.recipe_id) {
                $("#title").text(object.recipe_name);
                $("#recipe_name").text(object.recipe_name);
                $("#recipe_by").append("<a onclick='view_profile(\"" + object.author_username + "\")'>" + object.author_username + "</a>");
                $("#rating").append(object.rating);
                $("#prep_time").append(object.prep_time);
                $("#serving_size").append("Serves " + object.serving_size);
                var ing_list = "";
                for (i = 0; i < object.ingredients.length; i++) {
                    ing_list += "<li>" + object.ingredients[i] + "</li>";
                }
                $("#ingredients").append(ing_list);
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
                var tag_list = "";
                for (k = 0; k < object.tags.length; k++) {
                    tag_list += "<a href='MAKEASEARCHFUNCTION'>#" + object.tags[k] + " </a>";
                }
                $("#tags").append(tag_list);
                /*            var list = "";
            for (i = 0; i < recipe.length; i++) {
                var recipe_id = "\"" + recipe[i].recipe_id + "\"";
                list += "<li><a style='cursor: pointer; cursor: hand;' onclick='view_recipe(" + recipe_id + ")'>" + recipe[i].recipe_name + "</a></li>";
            }
            $("#popular_recipes").append(list);*/
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
                list += "<li><a style='cursor: pointer; cursor: hand;' onclick='view_recipe(" + recipe_id + ")'>" + object[i].recipe_name + "</a></li>";
            }
            $("#related_recipes").append(list);
        });
    return;
}

// Functions to display pages
// index.html body.onload = display_index_page()
function display_index_page() {
    //$("#username").text(localStorage.getItem("username"));
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