const mongoose = require('mongoose');
const { Schema, model } = mongoose;

// Define the schema for the user
const userSchema = new Schema({
    username: String,
    password: String,
    loggedin: Boolean,
    messages: [{
        sender: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        pet: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Pet',
            required: true,
        },
        action: {
            type: String,
            enum: ['Meet', 'Walk', 'Pet-sit'],
            required: true,
        },
        message: {
            type: String,
            required: true,
        },
        isRead: {
            type: Boolean,
            default: false,
        },
    }],
});

// Create a model based on the schema
const User = model('User', userSchema);

// Add a new user
async function newUser(username, password) {
    const user = { username: username, password: password, loggedin: false };
    await User.create(user).catch((err) => {
        console.log('Error:' + err);
    });
}

// Get all users
async function getUsers() {
    let data = [];
    await User.find({})
        .exec()
        .then((mongoData) => {
            data = mongoData;
        })
        .catch((err) => {
            console.log('Error:' + err);
        });
    return data;
}

// Find a user by username
async function findUser(username) {
    let user = null;
    await User.findOne({ username: username })
        .exec()
        .then((mongoData) => {
            user = mongoData;
        })
        .catch((err) => {
            console.log('Error:' + err);
        });
    return user;
}

// Check if the password matches the user's password
async function checkPassword(username, password) {
    let user = await findUser(username);
    if (user) {
        return user.password == password;
    }
    return false;
}

// Change the password of a user
async function changePassword(username, newPassword) {
    let user = await findUser(username);
    if (user) {
        user.password = newPassword;
        user.save();
    }
}

// Set the logged-in state of a user
async function setLoggedIn(username, state) {
    let user = await findUser(username);
    if (user) {
        user.loggedin = state;
        await user.save(); // Save the changes to the database
    }
}

// Check if a user is logged in
async function isLoggedIn(username) {
    let user = await findUser(username);
    if (user) {
        return user.loggedin;
    }
    return false;
}

// Change the username of a user
async function changeUsername(userId, newUsername) {
    try {
        const user = await User.findOneAndUpdate(
            { _id: userId },
            { username: newUsername },
            { new: true }
        );

        if (!user) {
            throw new Error('User not found');
        }

        await user.save(); // Save the changes to the database

        return user;
    } catch (error) {
        throw new Error('Error updating username');
    }
}

module.exports = {
    newUser,
    getUsers,
    findUser,
    checkPassword,
    setLoggedIn,
    isLoggedIn,
    changePassword,
    changeUsername,
};
