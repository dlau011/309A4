
// CSC309 A4
// Test cases for server.js using mocha.

// Run with: mocha tests.js
// Make sure npm install is run first to install supertest.

/* --CONFIG----------------------------------------- */
const SERVER_PORT = 24200; // This should be the same as PORT in server.js
/* ------------------------------------------------- */

var http = require('http');
var assert = require('assert');
var supertest = require('supertest');
var server = require('../server/server.js');

describe('HTTP Server Test', function() {

    var testUserLoginID = "invalid";
    var testRecipeID = "invalid";
    var testPlaylistID = "invalid";

    // The function passed to before() is called before running the test cases.
    before(function() {
        server.start();
    });

    // The function passed to after() is called after running the test cases.
    after(function() {
        server.stop();
    });

    /* Test to make sure the server is running. */
    describe('/', function() {
      	it('should be "Cookbook server is running!"', function(done) {
        		http.get('http://127.0.0.1:'+SERVER_PORT, function(response) {
          			assert.equal(response.statusCode, 200);
                var data = ''; // Accumulate the body
          			response.on('data', function(dat) {
          			     data += dat;
          			});

          			response.on('end', function() {
            				assert.equal(data, 'Cookbook server is running!');
            				done();
          			});

        		});
      	});
    });

    // Clear the database, and test to make sure it works.
    describe('/clear_database', function() {
      	it('should return success: true', function(done) {
        		http.get('http://127.0.0.1:'+SERVER_PORT+'/clear_database', function(response) {
          			assert.equal(response.statusCode, 200);
                var data = ''; // Accumulate the body
          			response.on('data', function(dat) {
          			     data += dat;
          			});

                var expected = {
                    success: true
                };

          			response.on('end', function() {
            				assert.equal(data, JSON.stringify(expected));
            				done();
          			});

        		});
      	});
    });

    /* Test /create_user works. */
    describe('/create_user', function() {
      	it('should give a login_id', function(done) {
            var req = {
                username: 'testuser',
                hashed_password: '1234',
                full_name: 'TEST USER',
                bio: 'I am a test user.'
            };
            supertest('http://127.0.0.1:'+SERVER_PORT)
              .post('/create_user').send(req).expect(200)
              .end(function(err, res) {
                if (err) {console.log(err);}
                var response = JSON.parse(res.text);
                assert.ok("login_id" in response);
                done();
              });
      	});
    });

    /* Check that we can log in with the test user. */
    describe('/authenticate_user', function() {
        it('should give a login_id', function(done) {
            var req = {
                username: 'testuser',
                hashed_password: '1234'
            };
            supertest('http://127.0.0.1:'+SERVER_PORT)
              .post('/authenticate_user').send(req).expect(200)
              .end(function(err, res) {
                if (err) {console.log(err);}
                var response = JSON.parse(res.text);

                if ("login_id" in response){ // Store the test user login_id
                                             // for checking things with a logged in user.
                    testUserLoginID = response.login_id;
                }

                assert.ok("login_id" in response);

                done();
              });
        });
    });

    /* Check that the login_id is valid and tied to the correct username. */
    describe('/get_logged_in_username', function() {
        it('should give username: testuser', function(done) {
            var req = {
                login_id: testUserLoginID
            };
            supertest('http://127.0.0.1:'+SERVER_PORT)
              .post('/get_logged_in_username').send(req).expect(200)
              .end(function(err, res) {
                if (err) {console.log(err);}
                var response = JSON.parse(res.text);

                assert.ok("username" in response);
                assert.equal(response.username, "testuser");

                done();
              });
        });
    });

    /* Test that change_bio works. */
    describe('/change_bio', function() {
        it('should give success: true', function(done) {
            var req = {
                login_id: testUserLoginID,
                new_bio: "this is a new bio"
            };
            supertest('http://127.0.0.1:'+SERVER_PORT)
              .post('/change_bio').send(req).expect(200)
              .end(function(err, res) {
                if (err) {console.log(err);}
                var response = JSON.parse(res.text);

                assert.ok("success" in response);

                done();
              });
        });
    });

    /* Test that change_password works. */
    describe('/change_password', function() {
        it('should give success: true', function(done) {
            var req = {
                login_id: testUserLoginID,
                old_hashed_password: "1234",
                new_hashed_password: "12345"
            };
            supertest('http://127.0.0.1:'+SERVER_PORT)
              .post('/change_password').send(req).expect(200)
              .end(function(err, res) {
                if (err) {console.log(err);}
                var response = JSON.parse(res.text);

                assert.ok("success" in response);

                done();
              });
        });
    });

    /* Test that change_profile_image works. */
    describe('/change_profile_image', function() {
        it('should give success: true', function(done) {
            var req = {
                login_id: testUserLoginID,
                new_image: "TEST"
            };
            supertest('http://127.0.0.1:'+SERVER_PORT)
              .post('/change_profile_image').send(req).expect(200)
              .end(function(err, res) {
                if (err) {console.log(err);}
                var response = JSON.parse(res.text);

                assert.ok("success" in response);

                done();
              });
        });
    });

    /* Test that get_user_profile works.
       Also tests that all the previous changes worked.
     */
    describe('/get_user_profile', function() {
        it('should give a user json', function(done) {
            var req = {
                login_id: testUserLoginID,
            };
            supertest('http://127.0.0.1:'+SERVER_PORT)
              .post('/get_user_profile').send(req).expect(200)
              .end(function(err, res) {
                if (err) {console.log(err);}
                var response = JSON.parse(res.text);

                assert.ok("username" in response);
                assert.ok("full_name" in response);
                assert.ok("profile_image" in response);
                assert.ok("bio" in response);
                assert.ok("rating" in response);
                assert.ok("number_of_subscribers" in response);
                assert.ok("subscribed_to" in response);
                assert.ok("most_used_tags" in response);
                assert.ok("favourite_recipes" in response);
                assert.ok("authored_recipes" in response);
                assert.ok("recipe_playlists" in response);

                assert.equal(response.username, "testuser");
                assert.equal(response.profile_image, "TEST");
                assert.equal(response.bio, "this is a new bio");

                done();
              });
        });
    });

    /* Make another user, so that we can check subscribe_to below. */
    describe('/create_user (again)', function() {
        it('should give a login_id', function(done) {
            var req = {
                username: 'testuser2',
                hashed_password: '1234',
                full_name: 'TEST USER 2',
                bio: 'I am another test user.'
            };
            supertest('http://127.0.0.1:'+SERVER_PORT)
              .post('/create_user').send(req).expect(200)
              .end(function(err, res) {
                if (err) {console.log(err);}
                var response = JSON.parse(res.text);
                assert.ok("login_id" in response);
                done();
              });
        });
    });

    /* Tests that subscribe_to works. */
    describe('/subscribe_to', function() {
        it('should give success: true', function(done) {
            var req = {
                login_id: testUserLoginID,
                username: "testuser2"
            };
            supertest('http://127.0.0.1:'+SERVER_PORT)
              .post('/subscribe_to').send(req).expect(200)
              .end(function(err, res) {
                if (err) {console.log(err);}
                var response = JSON.parse(res.text);
                assert.ok("success" in response);
                done();
              });
        });
    });

    /* Tests that add_recipe works. */
    describe('/add_recipe', function() {
        it('should give a recipe_id', function(done) {
            var req = {
                recipe_name: "test recipe",
                login_id: testUserLoginID,
                prep_time: "1min",
                serving_size: "1",
                tags: ["tag1", "tag2"],
                recipe_text: "sample description",
                main_image: "TEST",
                ingredients: ["ingredient1", "ingredient2"]
            };
            supertest('http://127.0.0.1:'+SERVER_PORT)
              .post('/add_recipe').send(req).expect(200)
              .end(function(err, res) {
                if (err) {console.log(err);}
                var response = JSON.parse(res.text);
                assert.ok("recipe_id" in response);
                done();
              });
        });
    });

    /* Tests that get_recipes works. */
    describe('/get_recipes', function() {
        it('should give a list of recipes', function(done) {
            var req = {
                sort_type: "MOST_RECENT",
                number_of_recipes: 1,
                page_number: 1,
                search_tags: ["tag1"],
                recipes_by_username: "testuser",
                search_query: "test recipe"
            };
            supertest('http://127.0.0.1:'+SERVER_PORT)
              .post('/get_recipes').send(req).expect(200)
              .end(function(err, res) {
                if (err) {console.log(err);}
                var response = JSON.parse(res.text);

                if ("recipe_id" in response[0]){ // Store the test recipe_id for later tests.
                    testRecipeID = response[0].recipe_id;
                }

                assert.equal(response[0].recipe_name, "test recipe");
                assert.equal(response[0].author_username, "testuser");
                done();
              });
        });
    });

    /* Tests that get_recipe_detail works. */
    describe('/get_recipe_detail', function() {
        it('should give the list of info for the test recipe', function(done) {
            var req = {
                recipe_id: testRecipeID
            };
            supertest('http://127.0.0.1:'+SERVER_PORT)
              .post('/get_recipe_detail').send(req).expect(200)
              .end(function(err, res) {
                if (err) {console.log(err);}
                var response = JSON.parse(res.text);

                assert.equal(response.recipe_name, "test recipe");
                assert.equal(response.author_username, "testuser");
                done();
              });
        });
    });

    /* Tests that add_comment works. */
    describe('/add_comment', function() {
        it('should give success: true', function(done) {
            var req = {
                recipe_id: testRecipeID,
                login_id: testUserLoginID,
                comment_text: "this is a test comment"
            };
            supertest('http://127.0.0.1:'+SERVER_PORT)
              .post('/add_comment').send(req).expect(200)
              .end(function(err, res) {
                if (err) {console.log(err);}
                var response = JSON.parse(res.text);
                assert.ok("success" in response);
                done();
              });
        });
    });

    /* Tests that rate_recipe works. */
    describe('/rate_recipe', function() {
        it('should give success: true', function(done) {
            var req = {
                recipe_id: testRecipeID,
                login_id: testUserLoginID,
                rating: 5
            };
            supertest('http://127.0.0.1:'+SERVER_PORT)
              .post('/rate_recipe').send(req).expect(200)
              .end(function(err, res) {
                if (err) {console.log(err);}
                var response = JSON.parse(res.text);
                assert.ok("success" in response);
                done();
              });
        });
    });

    /* Tests that /create_recipe_playlist works. */
    describe('/create_recipe_playlist', function() {
        it('should give a recipe_playlist_id', function(done) {
            var req = {
                recipe_id_list: [testRecipeID],
                login_id: testUserLoginID,
                recipe_playlist_name: "test playlist"
            };
            supertest('http://127.0.0.1:'+SERVER_PORT)
              .post('/create_recipe_playlist').send(req).expect(200)
              .end(function(err, res) {
                if (err) {console.log(err);}
                var response = JSON.parse(res.text);

                if ("recipe_playlist_id" in response){ // Store the test recipe_playlist_id for later tests.
                    testPlaylistID = response.recipe_playlist_id;
                }

                assert.ok("recipe_playlist_id" in response);
                done();
              });
        });
    });

    /* Tests that /get_recipe_playlist works. */
    describe('/get_recipe_playlist', function() {
        it('should give the info for the recipe playlist', function(done) {
            var req = {
                recipe_playlist_id: testPlaylistID
            };
            supertest('http://127.0.0.1:'+SERVER_PORT)
              .post('/get_recipe_playlist').send(req).expect(200)
              .end(function(err, res) {
                if (err) {console.log(err);}
                var response = JSON.parse(res.text);
                assert.equal(response.recipe_playlist_name, "test playlist");
                assert.equal(response.recipes[0], testRecipeID);
                done();
              });
        });
    });

    /* Tests that /delete_recipe_playlist works. */
    describe('/delete_recipe_playlist', function() {
        it('should give success: true', function(done) {
            var req = {
                recipe_playlist_id: testPlaylistID,
                login_id: testUserLoginID
            };
            supertest('http://127.0.0.1:'+SERVER_PORT)
              .post('/delete_recipe_playlist').send(req).expect(200)
              .end(function(err, res) {
                if (err) {console.log(err);}
                var response = JSON.parse(res.text);
                assert.ok("success" in response);
                done();
              });
        });
    });

});
