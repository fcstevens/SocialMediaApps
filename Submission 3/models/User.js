const mongoose = require('mongoose');
const { Schema, model } = mongoose;

const userSchema = new Schema({
    username: String,
    password: String,
    loggedin: Boolean,
    messages: [{
        sender: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        pet: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Pet',
            required: true
        },
        action: {
            type: String,
            enum: ['Meet', 'Walk', 'Pet-sit'],
            required: true
        },
        message: {
            type: String,
            required: true
        },
        isRead: {
            type: Boolean,
            default: false
        }
    }]
});

const User = model('User', userSchema);
module.exports = mongoose.model('User', userSchema);

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
        await user.save(); // Save the changes to the database
    }
}

async function isLoggedIn(username) {
    let user = await findUser(username);
    if (user) {
        return user.loggedin;
    }
    return false;
}

// Function to change the username of a user
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
    changeUsername
};

