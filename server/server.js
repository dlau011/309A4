/* ================================================= 
        Cookbook Server
        CSC309 - Assignment 4
   ================================================= */

/* --CONFIG----------------------------------------- */
const PORT = 24200;
const MONGODB_PORT = 27017;
/* ------------------------------------------------- */

var mongoose = require('mongoose');
var express = require('express');
var app = express();

// Connect to MongoDB:
mongoose.connect('mongodb://localhost:'+MONGODB_PORT);
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', function() {
    console.log("Connected to MongoDB.");
});

app.get('/', function (req, res) {
  res.send('Hello World!');
});

// Start the server:
app.listen(PORT, function () {
  console.log("Cookbook server now running on port: " + PORT);
});