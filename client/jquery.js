
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
        })
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
    requestJSON.prep_time = $("#prep_time").val();
    requestJSON.serving_size = $("#serving_size").val();
    requestJSON.tags = tags;
    requestJSON.recipe_text = $("#description").val();
    requestJSON.main_image = $("#image").val();
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

function get_popular_recipes() {
    var requestJSON = new Object();
    requestJSON.sort_type = "MOST_RECENT";
    requestJSON.number_of_recipes = 4;
    requestJSON.page_number = 1;
    $.post("http://159.203.44.151:24200/get_recipes", JSON.stringify(requestJSON))
        .done(function(data) {
            if (JSON.parse(data).error) {
                console.log(JSON.parse(data).error);
            }

            var recipe = JSON.parse(data);
            var list = "";
            for (i = 0; i < recipe.length; i++) {
                var recipe_id = "\"" + recipe[i].recipe_id + "\"";
                list += "<li><a style='cursor: pointer; cursor: hand;' onclick='view_recipe(" + recipe_id + ")'>" + recipe[i].recipe_name + "</a></li>";
            }
            $("#popular_recipes").append(list);
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
                return;
            }
            else {
                console.log("get_username error");
                return;
            }

        });
}
/* get_subscriptions returns the list of recipes id*/
function get_subscriptions() {
    var requestJSON = new Object();
    requestJSON.login_id = localStorage.getItem("login_id");
    $.post("http://159.203.44.151:24200/get_user_profile", JSON.stringify(requestJSON))
        .done(function(data) {
            var subscriptions = JSON.parse(data).authored_recipes;
            if (authored_recipes){// authored_recipes[] or authored_recipes to check ?
                return authored_recipes;//two cases, list could me empty or not
            }
            if (JSON.parse(data).error){
                console.log(JSON.parse(data).error);
                return "JSON Error";
            }
            else{
                return "Authored Recipes Not Found";
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

function get_user_profile(username) {
    var requestJSON = new Object();
    requestJSON.username = username;
    $.post("http://159.203.44.151:24200/get_recipe_detail", JSON.stringify(requestJSON))
        .done(function(data) {
            var object = JSON.parse(data);
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
    console.log("Shouldn't see this");
}
function get_recipe_detail(recipe_id) {
    var requestJSON = new Object();
    requestJSON.recipe_id = recipe_id;
    //--> Return: {recipe_id, recipe_name, author_username, main_image, rating, num_ratings, prep_time, serving_size, [tags], recipe_text, [comments], views}
    $.post("http://159.203.44.151:24200/get_recipe_detail", JSON.stringify(requestJSON))
        .done(function(data) {
            var object = JSON.parse(data);
            if (object.recipe_id) {
                $("#recipe_name").text(object.recipe_name);
                $("#recipe_by").append("<a onclick='view_profile(\'" + object.author_username + "\')'>" + object.author_username + "</a>");
                $("#rating").append(object.rating);
                $("#prep_time").append(object.prep_time);
                $("#serving_size").append("Serves " + object.serving_size);
                return object;
            }
            if (object.error) {
                console.log(object.error);
            }
            else {
                console.log("Recipe not found");
            }
        });
}
// Functions to display pages
// link with onclick = display_recipe_page(this.recipe_id)
function display_index_page() {
    //display_most_popular()
    get_username();
    //$("#username").text(localStorage.getItem("username"));
}

// any time you click on a recipe, call this function
function view_recipe(recipe_id) {
    localStorage.setItem("recipe_id", recipe_id);
    location.href="recipe.html";
    display_recipe_page();
}

function view_profile(username) {
    location.href="profile.html";
    display_profile_page(username);
}
function display_authored_recipes(){
    var login_id = localStorage.getItem("login_id");

    if(authored_recipes.length == 0){
        //display something like "you haven't save any recipes"
    }
    else{
        //need to make a helper function
    }
}

function display_profile_page(username) {
    get_username();
    get_user_profile(username);
}

// from clicking a recipe i display its page
function display_recipe_page() {
    //console.log(recipe_id); OK
    get_username();
    get_recipe_detail(localStorage.getItem("recipe_id"));
    //var recipe = JSON.parse(get_recipe_detail(localStorage.getItem("recipe_id")));
    //console.log(recipe);
    //$("#recipe_by").text(recipe.author_username);
    //console.log(recipe);
}

function hash(password) {
      var hash = 0, i, chr, len;
      if (password.length === 0) return hash;
      for (i = 0, len = password.length; i < len; i++) {
        chr   = password.charCodeAt(i);
        hash  = ((hash << 5) - hash) + chr;
        hash |= 0; // Convert to 32bit integer
      }
      return hash;
};

//clicking recipe link onclick=/recipe.html
//how to get recipe id to recipe.html?
//recipe.html onload = display_recipe_page