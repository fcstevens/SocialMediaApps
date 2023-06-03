require('dotenv').config();
//const mongoDBPassword=process.env.MYMONGODBPASSWORD
const sessionSecret = process.env.MYSESSIONSECRET


const express = require('express')
const app = express()
app.listen(3000, () => console.log('listening at port 3000'))


//serve unspecified static pages from our public dir
app.use(express.static('public'))
//make express middleware for json available
app.use(express.json())

//allows us to process post info in urls
app.use(express.urlencoded({ extended: false }));

const path = require('path');

//multer allows processing multipart forms with images
const multer = require('multer');

const upload = multer({ dest: './public/uploads/' })


//consts to hold expiry times in ms
const threeMins = 1000 * 60 * 3;
const oneHour = 1000 * 60 * 60;

//use the sessions module and the cookie parser module
const sessions = require('express-session');
const cookieParser = require("cookie-parser");

//make cookie parser middleware available
app.use(cookieParser());

//load sessions middleware, with some config
app.use(sessions({
    secret: sessionSecret,
    saveUninitialized: true,
    cookie: { maxAge: oneHour },
    resave: false
}));

//load mongoose module and connect to MongoDB instance and database

const mongoose = require('mongoose');
mongoose.connect(`mongodb+srv://CCO6005-01:black.D0g@cluster0.lpfnqqx.mongodb.net/petAPP?retryWrites=true&w=majority`)

//importing our own node module
const users = require('./models/User')

//load our Post model
const postData = require('./models/Post');

//test that user is logged in with a valid session
function checkLoggedIn(request, response, nextAction) {
    if (request.session) {
        if (request.session.userid) {
            nextAction()
        } else {
            request.session.destroy()
            return response.redirect('/notloggedin.html')
        }
    }
}

//controller for the main app view, depends on user logged in state
app.get('/app', checkLoggedIn, (request, response) => {
    // response.redirect('./application.html')
    response.redirect('./viewposts.html')
})


//controller for logout
app.post('/logout', async (request, response) => {

    await users.setLoggedIn(request.session.userid, false)
    request.session.destroy()
    await console.log(users.getUsers())
    response.redirect('./loggedout.html')
})

//controller for login
app.post('/login', async (request, response) => {
    console.log(request.body)
    let userData = request.body
    console.log(userData)

    if (await users.findUser(userData.username)) {
        console.log('user found')
        if (await users.checkPassword(userData.username, userData.password)) {
            console.log('password matches')
            request.session.userid = userData.username
            await users.setLoggedIn(userData.username, true)
            response.redirect('/viewposts.html')
        } else {
            console.log('password wrong')
            response.redirect('/loginfailed.html')
        }
    } else {
        console.log('no such user')
        response.redirect('/loginfailed.html')
    }
})


app.post('/newpost', upload.single('myImage'), async (request, response) => {
    // console.log(request.file)
    let filename = null
    if (request.file && request.file.filename) { //check that a file was passes with a valid name
        filename = 'uploads/' + request.file.filename
    }
    await postData.addNewPost(request.session.userid, request.body, filename)
    response.redirect('/viewposts.html')
})




// async/await version of /getposts controller using Mongo
app.get('/getposts', async (request, response) => {
    response.json(
        { posts: await postData.getPosts(5) }
    )
})


//controller for handling a post being liked
app.post('/like', async (request, response) => {
    //function to deal with a like button being pressed on a post
    likedPostID = request.body.likedPostID
    likedByUser = request.session.userid
    await postData.likePost(likedPostID, likedByUser)
    // console.log(likedByUser+" liked "+likedPostID)
    response.json(
        { posts: await postData.getPosts(5) }
    )
})

app.post('/comment', async (request, response) => {
    //function to deal with a like button being pressed on a post
    let commentedPostID = request.body.postid
    let comment = request.body.message
    let commentByUser = request.session.userid
    await postData.commentOnPost(commentedPostID, commentByUser, comment)
    // response.json({post: await postData.getPost(commentedPostID)})
    response.redirect('/viewposts.html')
})

app.post('/getonepost', async (request, response) => {
    // console.log(request.file)
    let postid = request.body.post
    console.log(request.body)
    response.json({ post: await postData.getPost(request.body.post) })
})

//controller for registering a new user
app.post('/register', async (request, response) => {
    console.log(request.body)
    let userData = request.body
    // console.log(userData.username)
    if (await users.findUser(userData.username)) {
        console.log('user exists')
        response.json({
            status: 'failed',
            error: 'user exists'
        })
    } else {
        users.newUser(userData.username, userData.password)
        response.redirect('/registered.html')
    }
    console.log(users.getUsers())
})


// Route to handle the change password form submission
app.post('/changepassword', async (request, response) => {
    let currentPassword = request.body.currentPassword;
    let newPassword = request.body.newPassword;
    let confirmPassword = request.body.confirmPassword;
    let userId = request.session.userid;

    // Check if the new password matches the confirm password
    if (newPassword !== confirmPassword) {
        response.redirect('/passwordmismatch.html');
        return;
    }

    // Check if the current password is correct
    if (await users.checkPassword(userId, currentPassword)) {
        // Update the user's password
        await users.changePassword(userId, newPassword);
        response.redirect('/passwordchanged.html');
    } else {
        response.redirect('/incorrectpassword.html');
    }
});

