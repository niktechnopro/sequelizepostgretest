console.log('loading router module')
var express = require('express');
var router = express.Router();
const pg = require('pg');//to deal with database module(just like mysql with our stuff)
const format = require('pg-format');
//format is some sort of helper to help with formatting correct queries

// configuration for database
const config = {
    host: 'localhost',
    user: 'niktechnopro', //user name
    database: 'niktechnopro' //name of database
    // max: 10 //max number of clients in the pool if pool used instead of client
}
//connection to DB - if we using pool it reduces overhead(Pool is a construnctor for Pool object)
var pool = new pg.Pool(config); //defining the pool of clients
//now we can connec to database
pool.connect(function(error, done){
    (error)?console.log('we got an error',error):console.log('successful connect to database');
    // console.log('client', client)
})

// middleware that is specific to this router
router.use(function timeLog (req, res, next) {
    let d = new Date();
    console.log('Time: ', d.toString())//just to log request time
    next()
})
// define the home page route(we using handler function chaining for one route)
router.route('/')
    .get((req, res)=>{
        req.session.name = 'Nik';
        let test = req.session.name;
        console.log('sessions ', test)
        console.log('serving a login page')
        res.render('login',{
            message: "if you are ready to login - fill in the info below",
            title: "hi there"
        })
    })
    .post((req, res)=>{
        let email = req.body.email;
        let password = req.body.password;
        console.log('someone is trying to login', email, password)
        let ourQeury = format(`select * from test_table where email=$1 and password=$2`);// note diff placeholder in postgre
            let myClient = pool.query(ourQeury, [email, password], (error, result)=>{
            if (error){
                console.log("oops", error);
            }else{
                if (result.rows != 0){
                    console.log('succesful read from database')
                    // res.json({
                    //     result: result.rows
                    // })
                    // req.session.name = result.rows[0].name;
                    res.render('successlogin',{
                        name: result.rows[0].name
                    })
                }else{
                    console.log('try again or register')
                    res.render('login', {
                        message: 'try again, or please register'
                    })
                }
            }
        })

    })
    .delete((req, res)=>{
        res.send("let's delete your account")//we'll use ajax request for it
    })

//registering routes info
router.route('/register')
    .get((req, res)=>{
        console.log('serving register page');
        res.render('register', {
            message: "be honest here"
        })
    })
    .post((req, res)=>{
        let name = req.body.name;
        let email = req.body.email;
        let password = req.body.password;
        console.log('reading from register form: ', name, email, password)
        //let's check if record in the database
        let checkQuery = format(`SELECT * FROM test_table where email=$1 and password=$2;`);
        pool.query(checkQuery, [email, password], (error, result)=>{
            if(!error){
                if(result.rows === 0){
                    let insertQeury = format(`INSERT INTO test_table (email, password, name) VALUES ($1,$2,$3);`);   //note diff placeholders from sql  
                    let ourQeury = pool.query(insertQeury, [email, password, name], (error)=>{
                    if (error){
                        console.log('oops', error)
                    }else{
                        console.log('successful insertion into table');
                        res.render('login',{
                        message: "now you can login"
                        })
                    }
                })
            }else{
                res.render('login', {
                    message: "you are already in database, now login"
                })
            }
        }
    })
})


module.exports = router;
