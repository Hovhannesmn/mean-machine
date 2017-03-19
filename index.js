var express = require('express');
var app
    = express();
var adminRouter = express.Router();

var path = require('path');
// send our index.html file to the user for the home page

adminRouter.use(function(req, res, next) {
// log each request to the console
    console.log(req.method, req.url);
// continue doing what we were doing and go to the route
    next();
});

app.route('/login')
// show the form (GET http://localhost:1337/login)
    .get(function(req, res) {
        res.send('this is the login form');
    })
    // process the form (POST http://localhost:1337/login)
    .post(function(req, res) {
        console.log('processing');
        res.send('processing the login form!');
    });


// route middleware to validate :name
adminRouter.param('name', function(req, res, next, name) {
// do validation on name here
// blah blah validation
// log something so we know its working
    console.log('doing name validations on ' + name);
// once validation is done save the new item in the req
    req.name = 'sassssss';
// go to the next thing
    next();
});
// route with parameters (http://localhost:1337/admin/users/:name)
adminRouter.get('/users/:name', function(req, res) {
    res.send('hello ' + req.name + '!');
});

// admin main page. the dashboard (http://localhost:1337/admin)
adminRouter.get('/', function(req, res) {
    res.send('I am the dashboard!');
});
// users page (http://localhost:1337/admin/users)
adminRouter.get('/users', function(req, res) {
    res.send('I show all the users!');
});
// posts page (http://localhost:1337/admin/posts)
adminRouter.get('/posts', function(req, res) {
    res.send('I show all the posts!');
});
app.use('/admin', adminRouter);
// start the server
app.listen(1337);
console.log('1337 is the magic port!');