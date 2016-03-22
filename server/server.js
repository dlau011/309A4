/* ================================================= 
        Cookbook Server
        CSC309 - Assignment 4
   ================================================= */

/* --CONFIG----------------------------------------- */
const PORT = 24200;
const MONGODB_PORT = 27017;
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
  // TODO (Hunter)
});

/*
    This is a convenience function so it's easier to show the user's username just by having the login_id cookie.
    --> Input: login_id
    --> Return: username
*/
app.post('/get_loggged_in_username', function (req, res) {
  // TODO (Hunter)
});

/*
    --> Input: username, hashed_password, full_name, (optional) bio, (optional) profile_image
    --> Return: a login_id on success, or a string with an appropriate error message on failure (eg. "Username already taken").
*/
app.post('/create_user', function (req, res) {
  // TODO (Hunter)
});

/*
    --> Input: login_id, new_bio
    --> Return: True on success, false otherwise
*/
app.post('/change_bio', function (req, res) {
  // TODO (Becky)
});

/*
    Checks to make sure old_hashed_password matches the stored password for the user, then changes it.
    --> Input: login_id, old_hashed_password, new_hashed_password
    --> Return: True on success, false otherwise
*/
app.post('/change_password', function (req, res) {
  // TODO (Becky)
});

/*
    --> Input: login_id, new_image
    --> Return: True on success, false otherwise
*/
app.post('/change_profile_image', function (req, res) {
  // TODO (Becky)
});

/*
    Retrieves a user profile, either for the current user if login_id is specified, or for any user if not.
        subscribed_to is a list of usernames that this user is subscribed to.
        number_of_subscribers is how many users are subscribed to this user.
        most_used_tags is a list of tags
        favourite_recipes is a list of recipe_id
        rating is the average rating of all their dishes.

    --> Input: username, (optional) login_id
    --> Return: {username, full_name, profile_image, bio, rating, number_of_subscribers, [subscribed_to], [most_used_tags],
               [favourite_recipes]}
*/
app.post('/get_user_profile', function (req, res) {
  // TODO (Hunter)
});

/*
    Subscribe to the user given by username. 
    Adds that user to the current user's list of subscriptions, and adds the current user to
    the other user's list of subscribers.
    --> Input: login_id, username
    --> Return True on success, False otherwise.
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
  // TODO (Hunter)
});

/*
    Returns the detailed info for a recipe. Use this for when the user clicks on a recipe.
    Includes a list of tags and comments. recipe_id is from one of the /get_recipes results.
    comments is a list of {author_username, comment_text}

        --> Input: recipe_id
        --> Return: {recipe_id, recipe_name, author_username, rating, num_ratings, prep_time, serving_size,
                     [tags], recipe_text, [comments]}

            Notes: recipe_text should support html, so make sure to use $('...').html(...) to set it on the
                   frontend instead of $('...').text(...), this will allow it to have embedded images and formatting.
*/
app.post('/get_recipe_detail', function (req, res) {
  // TODO (Hunter)
});

/*
    Adds a comment to recipe_id. 
        --> Input: recipe_id, login_id, comment_text
        --> Return: True on success, False otherwise.
*/
app.post('/add_comment', function (req, res) {
  // TODO (Becky)
});

/*
    Add a recipe with the info below, pass the users login_id.
    Note that recipe_text can have html formatting (including images if they're hosted elsewhere).

    --> Input: recipe_name, login_id, prep_time, serving_size, [tags], recipe_text
    --> Return: True on success, False otherwise.
*/
app.post('/add_recipe', function (req, res) {
  // TODO (Hunter)
});

/*
    rating is an integer from 1-5
    If the user rates a recipe 5 stars, it will show up on their favourite_recipes as returned by /get_user_profile
    --> Input: recipe_id, rating
    --> Return: True on success, False otherwise.
*/
app.post('/rate_recipe', function (req, res) {
  // TODO (Hunter)
});

/*
    This is a GET request, it kills the db.
*/
app.get('/clear_database', function (req, res) {
  // TODO (Hunter)
});

// Start the server:
app.listen(PORT, function () {
  console.log("Cookbook server now running on port: " + PORT);
});


// Internal functions: -------------------------------------------

function getUsernameByLoginID(login_id){
  // TODO (Hunter)
}


// Database schema: ----------------------------------------------

var userSchema = mongoose.Schema({
    "login_id": String,
    "username": String,
    "hashed_password": String,
    "bio": String,
    "profile_image": String,
    "full_name": String,
    "subscribers": [String],
    "subscriptions": [String]
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
    "comments": [{"author_username": String, "comment_text": String}]
});
var Recipe = mongoose.model('Recipe', recipeSchema);