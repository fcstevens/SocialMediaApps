
const mongoose = require('mongoose');
const { Schema, model } = mongoose;

const userSchema = new Schema({
    username: String,
    password: String,
    loggedin: Boolean
});

const User = model('User', userSchema);

async function newUser(username, password) {
    const user = { username: username, password: password, loggedin: false };
    await User.create(user).catch(err => {
        console.log('Error:' + err);
    });
}

async function getUsers() {
    let data = [];
    await User.find({})
        .exec()
        .then(mongoData => {
            data = mongoData;
        })
        .catch(err => {
            console.log('Error:' + err);
        });
    return data;
}

async function findUser(username) {
    let user = null;
    await User.findOne({ username: username })
        .exec()
        .then(mongoData => {
            user = mongoData;
        })
        .catch(err => {
            console.log('Error:' + err);
        });
    return user;
}

async function checkPassword(username, password) {
    let user = await findUser(username);
    if (user) {
        return user.password == password;
    }
    return false;
}

async function changePassword(username, newPassword) {
    let user = await findUser(username);
    if (user) {
        user.password = newPassword;
        user.save();
    }
}

async function setLoggedIn(username, state) {
    let user = await findUser(username);
    if (user) {
        user.loggedin = state;
        user.save();
    }
}

async function isLoggedIn(username) {
    let user = await findUser(username);
    if (user) {
        return user.loggedin;
    }
    return false;
}

exports.newUser = newUser;
exports.getUsers = getUsers;
exports.findUser = findUser;
exports.checkPassword = checkPassword;
exports.setLoggedIn = setLoggedIn;
exports.isLoggedIn = isLoggedIn;
exports.changePassword = changePassword;
