const express=require('express')
const app = express()
app.listen(3000, ()=> console.log('listening at port 3000'))

//serve unspecified static pages from our public dir
app.use(express.static('public'))
//make express middleware for json available
app.use(express.json())

require('dotenv').config();
const mongoDBPassword=process.env.MYMONGOPASSWORD;

const mongoose=require('mongoose'); 
mongoose.connect(`mongodb+srv://CCO6005-01:${mongoDBPassword}@cluster0.lpfnqqx.mongodb.net/petAPP?retryWrites=true&w=majority`)


//imports data models
const postData=require('./models/post.js')

//allows us to process post info in urls
app.use(express.urlencoded({extended: false}));

const path = require('path');

//importing our own node module
const users=require('./users.js')

//consts to hold expiry times in ms
const threeMins = 1000 * 60 * 3;
const oneHour = 1000 * 60 * 60;

//use the sessions module and the cookie parser module
const sessions = require('express-session');
const cookieParser = require("cookie-parser");
const { request } = require('http')
const { response } = require('express')

//make cookie parser middleware available
app.use(cookieParser());

//load sessions middleware, with some config
app.use(sessions({
    secret: "a secret that only i know",
    saveUninitialized:true,
    cookie: { maxAge: threeMins },
    resave: false 
}));

//test that user is logged in with a valid session
function checkLoggedIn(request, response, nextAction){
    if(request.session){
        if(request.session.userid){
            nextAction()
        } else {
            request.session.destroy()
            return response.redirect('/notloggedin.html')
        }
    }
}

//controller for the main app view, depends on user logged in state
app.get('/app', checkLoggedIn, (request, response)=>{
    response.redirect('./application.html')
})


//controller for logout
app.post('/logout', (request, response)=>{
    
    users.setLoggedIn(request.session.userid,false)
    request.session.destroy()
    console.log(users.getUsers())
    response.redirect('./loggedout.html')
})

//controller for login
app.post('/login', (request, response)=>{
    console.log(request.body)
    let userData=request.body
    console.log(userData)
    if(users.findUser(userData.username)){
        console.log('user found')
        if(users.checkPassword(userData.username, userData.password)){
            console.log('password matches')
            request.session.userid=userData.username
            users.setLoggedIn(userData.username, true)
            response.redirect('/loggedin.html')
        } else {
            console.log('password wrong')
            response.redirect('/loginfailed.html')
        }
    }
    console.log(users.getUsers())
})



app.post('/newpost',(request, response) =>{
    console.log(request.body)
    console.log(request.session.userid)
    postData.addNewPost(request.session.userid, request.body)
    response.redirect('/postsuccessful.html')
})

app.get('/getposts',async (request, response)=>{
    response.json(
        {posts: await postData.getPosts(5)}
        
    )
})

//controller for registering a new user
app.post('/register', (request, response)=>{
    console.log(request.body)
    let userData=request.body
    // console.log(userData.username)
    if(users.findUser(userData.username)){
        console.log('user exists')
        response.json({
            status: 'failed',
            error:'user exists'
        })
    } else {
        users.newUser(userData.username, userData.password)
        response.redirect('/registered.html')
    }
    console.log(users.getUsers())
})