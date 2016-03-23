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
  // TODO (Becky)
});

/*
    Checks to make sure old_hashed_password matches the stored password for the user, then changes it.
    --> Input: login_id, old_hashed_password, new_hashed_password
    --> Return: {"success": True} on success, or an error on failure.
*/
app.post('/change_password', function (req, res) {
  // TODO (Becky)
});

/*
    --> Input: login_id, new_image
    --> Return: {"success": True} on success, or an error on failure.
*/
app.post('/change_profile_image', function (req, res) {
  // TODO (Becky)
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
  // TODO (Becky)
});

/*
    Returns an array of recipes to display from a search query, similar recipe, or just a sort function.
    login_id, search_query, search_tags, recipes_by_username, and similar_recipe are all optional.
        search_tags is an array of tags to filter by.
        similar_recipe is a recipe_id to filter results to be similar to.
        recipes_by_username will filter results to recipes by a certain username.
            - Use this field to get recipes to display on user profiles.
        login_id is the current users login_id, optionally send this to get personalized suggestions.
    number_of_recipes is how many recipes to get, and page number is what slice of the array.
    sort_type is one of "MOST_RECENT", "POPULAR_TODAY", "POPULAR_WEEK", "POPULAR_MONTH", "POPULAR_YEAR", "POPULAR_ALL_TIME"

        --> Input: sort_type, (optional) search_query, (optional) [search_tags], (optional) similar_recipe,
                 (optional) recipes_by_username, (optional) login_id, number_of_recipes, page_number
        --> Return: an array of {recipe_id, recipe_name, author_username, rating, prep_time, image}
*/
app.post('/get_recipes', function (req, res) {
    try {
        if (req.body.sort_type != undefined && req.body.number_of_recipes != undefined
            && req.body.page_number != undefined){

            var searchQuery = "";
            var searchTags = [];
            var byUsername = "";

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
                // TODO: Append this recipes tags to search_tags.
            }
            if ("login_id" in req.body){
                // TODO: For each recipe in this user's favourites, append their tags to search_tags
            }

            // TODO: Query the db for recipes restricted to the above queries.
            //       shouldn't be restricted if a query is empty.
            //       Return the right number of elements at the right slice in the list.
            //       Sort according to sort type. For popular sort by views. and restrict to within that time period.

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
        --> Return: {recipe_id, recipe_name, author_username, rating, num_ratings, prep_time, serving_size,
                     [tags], recipe_text, [comments], views}

            Notes: recipe_text should support html, so make sure to use $('...').html(...) to set it on the
                   frontend instead of $('...').text(...), this will allow it to have embedded images and formatting.
*/
app.post('/get_recipe_detail', function (req, res) {
    try {
        if (req.body.recipe_id != undefined){

            // Lookup the recipe:
            try {
                Recipe.findOne({recipe_id: req.body.recipe_id}, function (err, recipe) {
                    try {

                        var recipeJSON = {
                            recipe_id: req.body.recipe_id,
                            recipe_name: recipe.name,
                            author_username: recipe.author_username,
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
            } catch (err){
                res.send(makeErrorJSON(err));
            }

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
  // TODO (Becky)
});

/*
    Add a recipe by the user with login_id.
    Note that recipe_text can have html formatting (including images if they're hosted elsewhere).

    --> Input: recipe_name, login_id, prep_time, serving_size, [tags], recipe_text
    --> Return: recipe_id on success, or an error on failure.
*/
app.post('/add_recipe', function (req, res) {
    try {
        if (req.body.recipe_name != undefined && req.body.login_id != undefined
            && req.body.prep_time != undefined && req.body.serving_size != undefined
            && req.body.tags != undefined && req.body.tags instanceof Array && req.body.recipe_text != undefined){

            // Lookup the user's username from login_id:
            try {
                User.findOne({login_id: req.body.login_id}, function (err, user) {
                    try {

                        var newRecipeID = generateID();

                        // Create a new recipe:
                        var newRecipeJSON = {
                            unix_time_added: Date.now(),
                            recipe_id: newRecipeID,
                            recipe_name: req.body.recipe_name,
                            author_username: user.username,
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
            } catch (err){
                res.send(makeErrorJSON(err));
            }

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
            try {
                Recipe.findOne({recipe_id: req.body.recipe_id}, function (err, recipe) {
                    try {

                        // Lookup the user:
                        try {
                            User.findOne({user_id: req.body.user_id}, function (err, user) {
                                try {

                                    newRating = recipe.rating * recipe.num_ratings;
                                    newRating = newRating + req.body.rating;
                                    recipe.num_ratings++;
                                    recipe.rating = newRating / recipe.num_ratings;

                                    if (req.body.rating == 5){
                                        user.fav_recipes.push(req.body.recipe_id);
                                    }

                                    user.save(function(err){
                                        if (err){ res.send(makeErrorJSON(err)); }
                                    });

                                    recipe.save(function(err){
                                        if (err){ res.send(makeErrorJSON(err)); }
                                    });

                                    res.send(makeSuccessJSON());

                                } catch (err){
                                    res.send(makeErrorJSON("User does not exist."));    
                                }
                            });
                        } catch (err){
                            res.send(makeErrorJSON(err));
                        }

                    } catch (err){
                        res.send(makeErrorJSON("Recipe does not exist."));    
                    }
                });
            } catch (err){
                res.send(makeErrorJSON(err));
            }

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
                console.log(user.tags_by_usage)
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