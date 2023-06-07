require('dotenv').config();

const express = require('express');
const session = require('express-session');
const app = express();
const ejs = require('ejs');
const path = require('path');
const User = require('./models/User');
const users = require('./users');

const postData = require('./models/Post');
const { changePassword } = require('./models/User');


const multer = require('multer');
const upload = multer({ dest: './public/uploads/' });

app.listen(3000, () => console.log('listening at port 3000'));

// Load environment variables
const sessionSecret = process.env.MYSESSIONSECRET;

// Configure view engine and views directory
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Serve unspecified static pages from the public directory
app.use(express.static('public'));

// Enable JSON parsing middleware
app.use(express.json());

// Enable URL-encoded form data parsing middleware
app.use(express.urlencoded({ extended: false }));

// Configure sessions middleware
app.use(session({
    secret: sessionSecret,
    saveUninitialized: true,
    cookie: { maxAge: 3600000 }, // 1 hour
    resave: false
}));

// Configure mongoose and connect to MongoDB
const mongoose = require('mongoose');
mongoose.connect(`mongodb+srv://CCO6005-01:black.D0g@cluster0.lpfnqqx.mongodb.net/petAPP?retryWrites=true&w=majority`),
{
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false
};

// Middleware to check if a user is logged in
function checkLoggedIn(request, response, nextAction) {
    if (request.session && request.session.userid) {
        nextAction();
    } else {
        response.redirect('/notloggedin.html');
    }
}

// Main app view controller, depends on user logged-in state
app.get('/app', checkLoggedIn, (request, response) => {
    response.redirect('/viewposts.html');
});

// Logout controller
app.post('/logout', async (request, response) => {
    await users.setLoggedIn(request.session.userid, false);
    request.session.destroy();
    response.redirect('/loggedout.html');
});

// Login controller
app.post('/login', async (request, response) => {
    const userData = request.body;
    const userExists = await users.findUser(userData.username);

    if (userExists) {
        const passwordMatches = await users.checkPassword(userData.username, userData.password);

        if (passwordMatches) {
            request.session.userid = userData.username; // Set the userid in the session
            await users.setLoggedIn(userData.username, true);
            response.redirect('/viewposts.html');
        } else {
            response.redirect('/loginfailed.html');
        }
    } else {
        response.redirect('/loginfailed.html');
    }
});

// New post controller
app.post('/newpost', upload.single('myImage'), async (request, response) => {
    let filename = null;
    if (request.file && request.file.filename) {
        filename = 'uploads/' + request.file.filename;
    }
    await postData.addNewPost(request.session.userid, request.body, filename);
    response.redirect('/viewposts.html');
});

// Get posts controller
app.get('/getposts', async (request, response) => {
    response.json({ posts: await postData.getPosts(5) });
});

// Like controller
app.post('/like', async (request, response) => {
    const likedPostID = request.body.likedPostID;
    const likedByUser = request.session.userid;
    await postData.likePost(likedPostID, likedByUser);
    response.json({ posts: await postData.getPosts(5) });
});

// Comment controller
app.post('/comment', async (request, response) => {
    const commentedPostID = request.body.postid;
    const comment = request.body.message;
    const commentByUser = request.session.userid;
    await postData.commentOnPost(commentedPostID, commentByUser, comment);
    response.redirect('/viewposts.html');
});

// Get one post controller
app.post('/getonepost', async (request, response) => {
    const postid = request.body.post;
    response.json({ post: await postData.getPost(postid) });
});

// Register controller
app.post('/register', async (request, response) => {
    const userData = request.body;

    if (await users.findUser(userData.username)) {
        response.json({ status: 'failed', error: 'user exists' });
    } else {
        users.newUser(userData.username, userData.password);
        response.redirect('/registered.html');
    }
});

// Change password controller
app.post('/changepassword', async (request, response) => {
    const currentPassword = request.body.currentPassword;
    const newPassword = request.body.newPassword;
    const confirmPassword = request.body.confirmPassword;
    const userId = request.session.userid;

    if (newPassword !== confirmPassword) {
        response.redirect('/passwordmismatch.html');
        return;
    }

    if (await users.checkPassword(userId, currentPassword)) {
        await users.changePassword(userId, newPassword);
        response.redirect('/passwordchanged.html');
    } else {
        response.redirect('/incorrectpassword.html');
    }
});

// Forgot password controller
app.post('/forgotpassword', async (request, response) => {
    const username = request.body.username;
    const newPassword = request.body.newPassword;
    const user = await users.findUser(username);

    if (user) {
        await users.changePassword(username, newPassword);
        response.redirect('/passwordchanged.html');
    } else {
        response.redirect('/passwordmismatch.html');
    }
});

// Change username controller
const { changeUsername } = require('./models/User');

app.post('/changeusername', async (request, response) => {
    const newUsername = request.body.newUsername;
    const password = request.body.password;
    const userId = request.session.userid;

    if (await users.checkPassword(userId, password)) {
        try {
            const updatedUser = await changeUsername(userId, newUsername);
            console.log(updatedUser);
            response.json({ status: 'success' });
        } catch (error) {
            console.log(error);
            response.status(500).json({ status: 'failed', error: 'Error updating username' });
        }
    } else {
        response.status(401).json({ status: 'failed', error: 'Incorrect password' });
    }
});

// Profile page controller
app.get('/profile.html', (request, response) => {
    const username = request.session.userid;
    response.render('profile', { username: username });
});

// Delete post controller
app.post("/deletepost/:postId", async (request, response) => {
    const postId = request.params.postId;
    const userId = request.session.userid; // Retrieve the user ID from the session

    if (!userId) {
        // User is not logged in, redirect or send an error response
        response.status(401).json({ success: false, error: 'Unauthorized' });
        return;
    }

    try {
        const deleted = await postData.deletePost(postId, userId); // Pass the userId to the deletePost function
        if (deleted) {
            response.json({ success: true });
        } else {
            response.json({ success: false });
        }
    } catch (error) {
        console.log(error);
        response.json({ success: false });
    }
});

// Get messages controller
app.get('/message', async (request, response) => {
    try {
        const messages = await postData.getMessages();
        response.render('message', { messages });
    } catch (error) {
        console.error('Error retrieving messages:', error);
        response.status(500).send('Internal Server Error');
    }
});

