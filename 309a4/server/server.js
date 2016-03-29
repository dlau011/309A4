/* ================================================= 
        Cookbook Server
        CSC309 - Assignment 4
   ================================================= */

/* --CONFIG----------------------------------------- */
const PORT = 24200;
const MONGODB_PORT = 27017;

const DEFAULT_USER_BIO = "No bio yet.";
const DEFAULT_USER_PROFILE_IMAGE = "";
/* ------------------------------------------------- */

// Init: ---------------------------------------------------------

var mongoose = require('mongoose');
var express = require('express');
var bodyParser = require('body-parser');
var app = express();
app.use(bodyParser.json());

// Connect to MongoDB:
mongoose.connect('mongodb://localhost:'+MONGODB_PORT);
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', function() {
    console.log("Connected to MongoDB.");
});


// REST API: -----------------------------------------------------
// All input and output data is a JSON.

/*
    --> Input: username, hashed_password.
    --> Return: a login_id to store as a cookie in the browser, or an error if no such user.

        Notes: Send this login_id along with some of our other REST requests to do stuff as a logged in user.
               Logout is handled on the client side, just delete the cookie.
               Make sure to hash the password on the frontend before you send it.
*/
app.post('/authenticate_user', function (req, res) {
    try {
        User.findOne({username: req.body.username}, function (err, user) {
            try {
                if (user.hashed_password != req.body.hashed_password){
                    res.send(makeErrorJSON("Incorrect password."));
                } else {
                    var login_idJSON = {"login_id": user.login_id};
                    res.send(JSON.stringify(login_idJSON));
                }
            } catch (err){
                res.send(makeErrorJSON("User does not exist."));    
            }
        });
    } catch (err){
        res.send(makeErrorJSON(err))
    }
});

/*
    This is a convenience function so it's easier to show the user's username just by having the login_id cookie.
    --> Input: login_id
    --> Return: username
*/
app.post('/get_logged_in_username', function (req, res) {
    try {
        User.findOne({login_id: req.body.login_id}, function (err, user) {
            try {
                var usernameJSON = {"username": user.username};
                res.send(JSON.stringify(usernameJSON));
            } catch (err){
                res.send(makeErrorJSON("User does not exist."));    
            }
        });
    } catch (err){
        res.send(makeErrorJSON(err))
    }
});

/*
    --> Input: username, hashed_password, full_name, (optional) bio, (optional) profile_image
    --> Return: a login_id on success, or an error on failure.
*/
app.post('/create_user', function (req, res) {
    try {
        if (req.body.username != undefined && req.body.hashed_password != undefined
            && req.body.full_name != undefined){

            // Check to see if username exists:
            User.findOne({username: req.body.username}, function (err, user) {
                try {
                    if (!user){ // Username is free.

                        // Create a new user:
                        var bio = DEFAULT_USER_BIO;
                        var profile_image = DEFAULT_USER_PROFILE_IMAGE;
                        if ("bio" in req.body){ bio = req.body.bio; }
                        if ("profile_image" in req.body){ profile_image = req.body.profile_image; }

                        var newUserJSON = {
                            login_id: generateID(),
                            username: req.body.username,
                            hashed_password: req.body.hashed_password,
                            bio: bio,
                            profile_image: profile_image,
                            full_name: req.body.full_name,
                            subscribers: [],
                            subscriptions: [],
                            avg_rating: 0,
                            num_ratings: 0,
                            tags_by_usage: [],
                            fav_recipes: [],
                            authored_recipes: []
                        };

                        var newUser = new User(newUserJSON);
                        newUser.save(function(err){
                            if (err){ res.send(makeErrorJSON(err)); }
                        });

                        var login_idJSON = {"login_id": newUser.login_id};
                        res.send(JSON.stringify(login_idJSON));

                    } else { // Username does exist.
                        res.send(makeErrorJSON("Username has been taken."));    
                    }
                } catch (err){
                    res.send(makeErrorJSON("Username has been taken."));
                }
            });

        } else {
            res.send(makeErrorJSON("Invalid request."))   
        }
    } catch (err){
        res.send(makeErrorJSON(err)) 
    }
});

/*
    --> Input: login_id, new_bio
    --> Return: {"success": True} on success, or an error on failure.
*/
app.post('/change_bio', function (req, res) {
  try {
    if (req.body.login_id != undefined && req.body.new_bio != undefined){
        User.findOne({login_id: req.body.login_id}, function (err, user) {
            try {
                user.bio = req.body.new_bio;
                user.save(function(err){
                    if (err){ res.send(makeErrorJSON(err)); }
                    else { res.send(makeSuccessJSON()); }
                });
            } catch (err) {
                res.send(makeErrorJSON(err));
            }
        });
    } else {
        res.send(makeErrorJSON("Invalid request."));
    }
  } catch (err){
    res.send(makeErrorJSON(err));
  }
});

/*
    Checks to make sure old_hashed_password matches the stored password for the user, then changes it.
    --> Input: login_id, old_hashed_password, new_hashed_password
    --> Return: {"success": True} on success, or an error on failure.
*/
app.post('/change_password', function (req, res) {
  try {
    if (req.body.login_id != undefined && req.body.old_hashed_password != undefined
        && req.body.new_hashed_password != undefined) {
        User.findOne({login_id: req.body.login_id}, function (err, user) {
            try {
                if (user.hashed_password != req.body.old_hashed_password){
                    res.send(makeErrorJSON("Incorrect password."));
                } else {
                    user.hashed_password = req.body.new_hashed_password;
                    user.save(function(err){
                        if (err){ res.send(makeErrorJSON(err)); }
                        else { res.send(makeSuccessJSON()); }
                    });
                }
            } catch (err){
                res.send(makeErrorJSON(err));    
            }
        });
    } else {
        res.send(makeErrorJSON("Invalid request."));
    }
  } catch (err){
    res.send(makeErrorJSON(err));
  }
});

/*
    --> Input: login_id, new_image
    --> Return: {"success": True} on success, or an error on failure.
*/
app.post('/change_profile_image', function (req, res) {
  try {
    if (req.body.login_id != undefined && req.body.new_image != undefined){
        User.findOne({login_id: req.body.login_id}, function (err, user) {
            try {
                user.profile_image = req.body.new_image;
                user.save(function(err){
                    if (err){ res.send(makeErrorJSON(err)); }
                    else { res.send(makeSuccessJSON()); }
                });
            } catch (err) {
                res.send(makeErrorJSON(err));
            }
        });
    } else {
        res.send(makeErrorJSON("Invalid request."));
    }
  } catch (err){
    res.send(makeErrorJSON(err));
  }
});

/*
    Retrieve a user profile either by username or by login_id (for the currently logged in user).
        subscribed_to is a list of usernames that this user is subscribed to.
        number_of_subscribers is how many users are subscribed to this user.
        most_used_tags is a list of tags
        favourite_recipes and authored_recipes are a list of recipe_id
        rating is the average rating of all their dishes.

    --> Input: (optional) username, (optional) login_id
    --> Return: {username, full_name, profile_image, bio, rating, number_of_subscribers, [subscribed_to], [most_used_tags],
               [favourite_recipes], [authored_recipes]}
*/
app.post('/get_user_profile', function (req, res) {
    try {

        if ("login_id" in req.body){ // Get current user's profile.
            User.findOne({login_id: req.body.login_id}, function (err, user) {
                try {
                    getProfileByUsernameCallback(user.username, res)
                } catch (err){
                    res.send(makeErrorJSON("User does not exist."));    
                }
            });
        } else if ("username" in req.body){ // Get username's profile.
            getProfileByUsernameCallback(req.body.username, res);
        } else {
            res.send(makeErrorJSON("No username or login_id specified."));
        }
    } catch (err){
        res.send(makeErrorJSON(err));
    }
});

/*
    Subscribe to the user given by username. 
    Adds that user to the current user's list of subscriptions, and adds the current user to
    the other user's list of subscribers.
    --> Input: login_id, username
    --> Return: {"success": True} on success, or an error on failure.
*/
app.post('/subscribe_to', function (req, res) {
    try {
        if (req.body.login_id != undefined && req.body.username != undefined){
            User.findOne({login_id: req.body.login_id}, function (err, current_user){
                User.findOne({username: req.body.username}, function (err, other_user){
                    try {

                        current_user.subscriptions.push(other_user.username);
                        other_user.subscribers.push(current_user.username);

                        current_user.save(function(err){
                            if (err){ res.send(makeErrorJSON(err)); }
                        });
                        other_user.save(function(err){
                            if (err){ res.send(makeErrorJSON(err)); }
                        });

                    } catch (err){
                        res.send(makeErrorJSON("User does not exist.")); // Or invalid login_id.
                    }
                });    
            });
        } else {
            res.send(makeErrorJSON("Invalid request."));   
        }
    } catch (err){
        res.send(makeErrorJSON(err));
    }
});

/*
    This is the main recipe searching/sorting/suggesting function.
    It returns an array of recipes to display from a search query, similar recipe, tags, by a user, 
    personalized suggestion, or just the most recent/popular.

    It will return a basic list of the newest or most popular recipes if the optional args are left out.
    You can include any combination of the optional args including all of them at once.

    - login_id, search_query, search_tags, recipes_by_username, and similar_recipe are all optional:
        - search_tags is an array of tags to filter by.
        - similar_recipe is a recipe_id to filter results to be similar to.
        - recipes_by_username will filter results to recipes by a certain username.
            - Use this field to get recipes to display on user profiles.
        - login_id is the current user's login_id, optionally send this to get personalized suggestions.
        - search_query is a string to get recipes matching.

    - number_of_recipes is how many recipes to get, and page number is what slice of the array.
        - page_number is 1 for the first page (not 0!), number_of_recipes is how many recipes per page.
    - sort_type is one of "MOST_RECENT", "POPULAR_TODAY", "POPULAR_WEEK", "POPULAR_MONTH", "POPULAR_YEAR", or "POPULAR_ALL_TIME".

        --> Input: sort_type,  number_of_recipes, page_number, 
                   (optional) search_query, (optional) [search_tags], (optional) similar_recipe,
                   (optional) recipes_by_username, (optional) login_id
        --> Return: an array of {recipe_id, recipe_name, author_username, rating, prep_time, main_image}
*/
app.post('/get_recipes', function (req, res) {
    try {
        if (req.body.sort_type != undefined && req.body.number_of_recipes != undefined
            && req.body.page_number != undefined){

            var searchQuery = "";
            var searchTags = [];
            var byUsername = "";
            var similarRecipes = [];
            var originalSimilarRecipeID = ""; // Used to prevent a recipe from showing
                                              // as similar to itself.
            var loginID;

            if ("search_query" in req.body){
                searchQuery = req.body.search_query;
            }
            if ("search_tags" in req.body){
                searchTags = req.body.search_tags;
            }
            if ("recipes_by_username" in req.body){
                byUsername = req.body.recipes_by_username;
            }
            if ("similar_recipe" in req.body){
                similarRecipes = [req.body.similar_recipe];
                originalSimilarRecipeID = req.body.similar_recipe;
            }
            if ("login_id" in req.body){
                loginID = req.body.login_id;
            }

            /*
                Helper function, find all recipes in user specified by loginID's favourites.
                All other args get passed along through the call chain.
            */
            function getUserFavsAsync(searchQuery, searchTags, byUsername, listOfRecipeID, loginID, req, res){
                try {
                    if (loginID){
                        User.findOne({login_id: loginID}, function (err, user){
                            // Call the next function:
                            getRecipeTagsAsync(searchQuery, searchTags, byUsername, listOfRecipeID.concat(user.fav_recipes), req, res);    
                        });
                    } else { // LoginID not specified.
                        // Call the next function:
                        getRecipeTagsAsync(searchQuery, searchTags, byUsername, listOfRecipeID, req, res);
                    }
                } catch (err){
                    res.send(makeErrorJSON(err));
                }
            }

            /*
                Helper function. find all tags in recipes in recipeID list.
                All other args get passed along through the call chain.
            */
            function getRecipeTagsAsync(searchQuery, searchTags, byUsername, listOfRecipeID, req, res){
                try {
                    Recipe.find({ recipe_id: { $in: listOfRecipeID }}, function(err, recipes){

                        var tags = [];
                        for (var i = 0; i < recipes.length; i++){
                            for (var j = 0; j < recipes[i].tags.length; j++){
                                if (tags.indexOf(recipes[i].tags[j]) == -1){
                                    tags.push(recipes[i].tags[j]);
                                }
                            }
                        }

                        // Call the next function:
                        getFilteredRecipes(searchQuery, searchTags.concat(tags), byUsername, req, res);

                    });
                } catch (err){
                    res.send(makeErrorJSON(err));
                }
            }

            /*
                Helper function. Send the final list of recipes filtered accordingly.
            */
            function getFilteredRecipes(searchQuery, searchTags, byUsername, req, res){
                try {

                    // Build the query:
                    var query = {};
                    if (searchQuery){
                        // Find where recipe_name contains searchQuery.
                        query.recipe_name = { $regex: searchQuery, $options: "i" };
                    }
                    if (searchTags.length > 0){
                        // Find where tags contains at least one of searchTags.
                        query.tags = { $in: searchTags };
                    }
                    if (byUsername){
                        query.author_username = byUsername;
                    }
                    if (req.body.sort_type == "POPULAR_TODAY"){
                        var yesterday = Date.now() - (24 * 60 * 60 * 1000);
                        query.unix_time_added = { $gt: yesterday };
                    }
                    if (req.body.sort_type == "POPULAR_WEEK"){
                        var lastWeek = Date.now() - (7 * 24 * 60 * 60 * 1000);
                        query.unix_time_added = { $gt: lastWeek };
                    }
                    if (req.body.sort_type == "POPULAR_MONTH"){
                        var lastMonth = Date.now() - (30 * 24 * 60 * 60 * 1000);
                        query.unix_time_added = { $gt: lastMonth };
                    }
                    if (req.body.sort_type == "POPULAR_YEAR"){
                        var lastYear = Date.now() - (365 * 24 * 60 * 60 * 1000);
                        query.unix_time_added = { $gt: lastYear };
                    }

                    // Build the sort:
                    var sort = "";
                    var invalid = false;
                    if (req.body.sort_type == "MOST_RECENT"){
                        sort = "-unix_time_added";
                    } else if (req.body.sort_type == "POPULAR_TODAY" || 
                               req.body.sort_type == "POPULAR_WEEK" ||
                               req.body.sort_type == "POPULAR_MONTH" ||
                               req.body.sort_type == "POPULAR_YEAR" ||
                               req.body.sort_type == "POPULAR_ALL_TIME"){
                        sort = "-views";
                    } else {
                        invalid = true;
                        res.send(makeErrorJSON("Invalid sort type."))
                    }

                    // Build skip amount:
                    var skipAmount = (req.body.page_number - 1) * req.body.number_of_recipes;
                    if (skipAmount < 0){
                        invalid = true;
                        res.send(makeErrorJSON("Invalid page number or number of recipes."));
                    }

                    if (!invalid){
                        // Make the query and send back only appropriate info:
                        Recipe.find(query).sort(sort).skip(skipAmount).limit(req.body.number_of_recipes)
                            .exec(function(err, recipes){
                                var recipesToReturn = [];
                                for (var i = 0; i < recipes.length; i++){
                                    if (recipes[i].recipe_id != originalSimilarRecipeID){
                                        recipesToReturn.push({
                                            recipe_id: recipes[i].recipe_id,
                                            recipe_name: recipes[i].recipe_name,
                                            author_username: recipes[i].author_username,
                                            rating: recipes[i].rating,
                                            prep_time: recipes[i].prep_time,
                                            main_image: recipes[i].main_image
                                        });
                                    }
                                }
                                res.send(JSON.stringify(recipesToReturn));
                            });
                    }

                } catch (err){
                    res.send()
                }
            }

            // Waterfall:
            getUserFavsAsync(searchQuery, searchTags, byUsername, similarRecipes, loginID, req, res);

        } else {
            res.send(makeErrorJSON("Invalid request."));
        }
    } catch (err){
        res.send(makeErrorJSON(err));
    }
});

/*
    Returns the detailed info for a recipe. Use this for when the user clicks on a recipe.
    Includes a list of tags and comments. recipe_id is from one of the /get_recipes results.
    comments is a list of {author_username, comment_text}

        --> Input: recipe_id
        --> Return: {recipe_id, recipe_name, author_username, main_image, rating, num_ratings, prep_time, serving_size,
                     [tags], recipe_text, [comments], views}

            Notes: recipe_text should support html, so make sure to use $('...').html(...) to set it on the
                   frontend instead of $('...').text(...), this will allow it to have embedded images and formatting.
*/
app.post('/get_recipe_detail', function (req, res) {
    try {
        if (req.body.recipe_id != undefined){
            // Lookup the recipe:
            Recipe.findOne({recipe_id: req.body.recipe_id}, function (err, recipe) {
                try {

                    var recipeJSON = {
                        recipe_id: req.body.recipe_id,
                        recipe_name: recipe.name,
                        author_username: recipe.author_username,
                        main_image: recipe.main_image,
                        rating: recipe.rating,
                        num_ratings: recipe.num_ratings,
                        prep_time: recipe.prep_time,
                        serving_size: recipe.serving_size,
                        tags: recipe.tags,
                        recipe_text: recipe.recipe_text,
                        comments: recipe.comments,
                        views: recipe.views
                    };

                    recipe.views++;
                    recipe.save(function(err){
                        if (err){ res.send(makeErrorJSON(err)); }
                    });

                    res.send(JSON.stringify(recipeJSON));

                } catch (err){
                    res.send(makeErrorJSON("Recipe does not exist."));    
                }
            });
        } else {
            res.send(makeErrorJSON("Invalid request."));   
        }
    } catch (err){
        res.send(makeErrorJSON(err));
    }
});

/*
    Adds a comment to recipe_id. 
        --> Input: recipe_id, login_id, comment_text
        --> Return: {"success": True} on success, or an error on failure.
*/
app.post('/add_comment', function (req, res) {
  try {
    if (req.body.recipe_id != undefined && req.body.login_id != undefined
        && req.body.comment_text != undefined){
        // Find user
        User.findOne({login_id: req.body.login_id}, function (err, user) {
            // Find recipe
            Recipe.findOne({recipe_id: req.body.recipe_id}, function (err, recipe) {
                try {
                    recipe.comments.push({"author_username": user.username,
                        "comment_text": req.body.comment_text});
                    recipe.save(function(err){
                        if (err){ res.send(makeErrorJSON("here2")); }
                        else { res.send(makeSuccessJSON()); }
                    });
                } catch (err) {
                    res.send(makeErrorJSON("here"));
                }
            });
        });
    } else {
        res.send(makeErrorJSON("Invalid request."));
    }
  } catch (err){
    res.send(makeErrorJSON("here3"));
  }
});

/*
    Add a recipe by the user with login_id.
    Note that recipe_text can have html formatting (including images if they're hosted elsewhere).

    --> Input: recipe_name, login_id, prep_time, serving_size, [tags], recipe_text, main_image
    --> Return: recipe_id on success, or an error on failure.
*/
app.post('/add_recipe', function (req, res) {
    try {
        if (req.body.recipe_name != undefined && req.body.login_id != undefined
            && req.body.prep_time != undefined && req.body.serving_size != undefined
            && req.body.tags != undefined && req.body.tags instanceof Array 
            && req.body.recipe_text != undefined && req.body.main_image != undefined){

            // Lookup the user's username from login_id:
            User.findOne({login_id: req.body.login_id}, function (err, user) {
                try {

                    var newRecipeID = generateID();

                    // Create a new recipe:
                    var newRecipeJSON = {
                        unix_time_added: Date.now(),
                        recipe_id: newRecipeID,
                        recipe_name: req.body.recipe_name,
                        author_username: user.username,
                        main_image: req.body.main_image,
                        recipe_text: req.body.recipe_text,
                        rating: 0,
                        num_ratings: 0,
                        prep_time: req.body.prep_time,
                        serving_size: req.body.serving_size,
                        tags: req.body.tags,
                        comments: [],
                        views: 1
                    };

                    var newRecipe = new Recipe(newRecipeJSON);
                    newRecipe.save(function(err){
                        if (err){ res.send(makeErrorJSON(err)); }
                    });

                    // Add this to the user's list of authored recipes:
                    user.authored_recipes.push(newRecipeID);

                    // Update user's tags_by_usage data structure:
                    for (var i = 0; i < req.body.tags.length; i++){
                        var broke = false;
                        for (var j = 0; j < user.tags_by_usage.length; j++){
                            if (req.body.tags[i] == user.tags_by_usage[j].tag){
                                user.tags_by_usage[j].times_used++;
                                broke = true;
                                break;
                            }
                        }
                        if (!broke){
                            user.tags_by_usage.push({"tag": req.body.tags[i], "times_used": 1});
                        }
                    }

                    user.save(function(err){
                        if (err){ res.send(makeErrorJSON(err)); }
                    });

                    var recipe_idJSON = {"recipe_id": newRecipeID};
                    res.send(JSON.stringify(recipe_idJSON));

                } catch (err){
                    res.send(makeErrorJSON("User does not exist."));    
                }
            });

        } else {
            res.send(makeErrorJSON("Invalid request."));
        }
    } catch (err){
        res.send(makeErrorJSON(err));
    }
});

/*
    rating is an integer from 1-5
    If the user rates a recipe 5 stars, it will show up on their favourite_recipes as returned by /get_user_profile
    Send the current user's login_id, the recipe_id of the recipe to rate, and the rating: an integer from 1-5.
    --> Input: recipe_id, rating, login_id
    --> Return: {"success": True} on success, or an error on failure.
*/
app.post('/rate_recipe', function (req, res) {
    try {
        if (req.body.recipe_id != undefined && req.body.rating != undefined
            && req.body.login_id != undefined){

            // Lookup the recipe:
            Recipe.findOne({recipe_id: req.body.recipe_id}, function (err, recipe) {
                // Lookup the user:
                User.findOne({login_id: req.body.login_id}, function (err, user) {
                    try {

                        newRating = recipe.rating * recipe.num_ratings;
                        newRating = newRating + req.body.rating;
                        recipe.num_ratings++;
                        recipe.rating = newRating / recipe.num_ratings;

                        // Add recipe to user's favourites.
                        if (user){
                            if (req.body.rating == 5){
                                // Do not add if recipe already in favourites.
                                alreadyFav = false;
                                for (var i = 0; i < user.fav_recipes.length; i++){
                                    if (user.fav_recipes[i] == req.body.recipe_id){
                                        alreadyFav = true;
                                        break;
                                    }
                                }
                                if (!alreadyFav){
                                    user.fav_recipes.push(req.body.recipe_id);
                                }
                            }
                        }

                        user.save(function(err){
                            if (err){ res.send(makeErrorJSON(err)); }
                        });

                        recipe.save(function(err){
                            if (err){ res.send(makeErrorJSON(err)); }
                        });

                        res.send(makeSuccessJSON());

                    } catch (err){
                        res.send(makeErrorJSON("User or recipe is invalid."));    
                    }
                });
            });

        } else {
            res.send(makeErrorJSON("Invalid request."));   
        }
    } catch (err){
        res.send(makeErrorJSON(err));
    }
});

/*
    This is a GET request, it kills the db.
*/
app.get('/clear_database', function (req, res) {
    try {
        mongoose.connection.db.dropDatabase();
        res.send(makeSuccessJSON());
    } catch (err){
        res.send(makeErrorJSON(err));
    }
});

// Start the server:
app.listen(PORT, function () {
  console.log("Cookbook server now running on port: " + PORT);
});


// Internal functions: -------------------------------------------

/*
    Return a stringified JSON of err.
*/
function makeErrorJSON(err){
    var errorJSON = {"error": err};
    return JSON.stringify(errorJSON);
}

/*
    Return a stringified success JSON.
*/
function makeSuccessJSON(){
    var successJSON = {"success": true};
    return JSON.stringify(successJSON);
}

/*
    Generate a new unique id and return it. Can be used for login_id or recipe_id.
*/
function generateID(){
    return "" + Date.now() + "-" + Math.floor((Math.random() * 1000000) + 1);
}

/*
    Async helper for /get_user_profile. This function does the hard work and 
    retrieves the actual profile by username.
*/
function getProfileByUsernameCallback(username, res){
    try {
        User.findOne({username: username}, function (err, user) {
            try {

                // Compute most used tags:
                var tagsCopy = user.tags_by_usage.slice();
                tagsCopy.sort(function(a, b){
                    return a.times_used - b.times_used;
                });
                mostUsedTags = []
                for (var i = 0; i < Math.min(10, tagsCopy.length); i++){
                    mostUsedTags.push(tagsCopy[i].tag);
                }
                mostUsedTags.reverse();

                var userProfileJSON = {
                    username: user.username,
                    full_name: user.full_name,
                    profile_image: user.profile_image,
                    bio: user.bio,
                    rating: user.avg_rating,
                    number_of_subscribers: user.subscribers.length,
                    subscribed_to: user.subscriptions,
                    most_used_tags: mostUsedTags,
                    favourite_recipes: user.fav_recipes,
                    authored_recipes: user.authored_recipes
                };

                res.send(JSON.stringify(userProfileJSON));

            } catch (err){
                res.send(makeErrorJSON("User does not exist."));    
            }
        });
    } catch (err){
        res.send(makeErrorJSON(err))
    }
}

// Database schema: ----------------------------------------------

var userSchema = mongoose.Schema({
    "login_id": String,
    "username": String,
    "hashed_password": String,
    "bio": String,
    "profile_image": String,
    "full_name": String,
    "authored_recipes": [String],   // List of recipe_id
    "subscribers": [String],    // List of username
    "subscriptions": [String],  // List of username

    "avg_rating": Number,   // Every time someone rates a dish by this user, update these.
    "num_ratings": Number,  // 

    "tags_by_usage": [{"tag": String, "times_used": Number}], // When user adds a dish, update this.

    "fav_recipes": [String]  // Add recipe_id to this list whenever a user rates a recipe 5 stars.
});
var User = mongoose.model('User', userSchema);

var recipeSchema = mongoose.Schema({
    "unix_time_added": Number,
    "recipe_id": String,
    "recipe_name": String,
    "main_image": String,
    "author_username": String,
    "recipe_text": String,
    "rating": Number,
    "num_ratings": Number,
    "prep_time": String,
    "serving_size": String,
    "tags": [String],
    "views": Number,
    "comments": [{"author_username": String, "comment_text": String}]
});
var Recipe = mongoose.model('Recipe', recipeSchema);