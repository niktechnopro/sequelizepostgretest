const express = require('express');
const app = express();
const path = require('path');
// const sessions = require('express-sessions');
const router = require('./router/router');//loading router from routes folder
const bodyParser = require('body-parser');
const handleBars = require('express-handlebars');// we are going to use handlebars as view engine
var cookieParser = require('cookie-parser');
const session = require('express-session'); //for sessions
// var RedisStore = require('connect-redis')(session);//session store

const port = 3000;

// middleware
//this is to read from form with method post
app.use(express.static(__dirname + '/public')); //dirname here refers to root forlder where app lives
app.use(bodyParser.urlencoded({ extended: false }));
// very important - the following three must be in that order or sessions won't work
app.use(cookieParser());
app.use(session({//setting up session
    secret: "supersecretsessionstring", 
    resave: false, 
    saveUninitialized: true }))//saveUninitialized - saves uninitialized objects in the session
// router middleware must be after session otherwise it would not work
app.use(router);//must tell to node to use router(we are loading on top) instead of app for routing

// let's setup the view engine and directory for templates
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));
app.engine('hbs', handleBars({defaultLayout: 'main', extname: 'hbs', layoutsDir: __dirname + '/views/layouts'}));


app.listen(port, (error)=>{
    (!error) ? console.log('listening on port ', port) : console.log('something  went wrong')
})
