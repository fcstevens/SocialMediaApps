const users = [
    { username: 'user1', password: '123', loggedin: false },
    { username: 'user2', password: '123', loggedin: false },
    { username: 'user3', password: '321', loggedin: false }
];

function newUser(username, password) {
    const user = { username: username, password: password, loggedin: false };
    users.push(user);
}

function getUsers() {
    return users;
}

function findUser(username) {
    return users.find(user => user.username === username);
}

function checkPassword(username, password) {
    let user = findUser(username);
    if (user) {
        return user.password === password;
    }
    return false;
}

function setLoggedIn(username, state) {
    let user = findUser(username);
    if (user) {
        user.loggedin = state;
    }
}

function isLoggedIn(username) {
    let user = findUser(username);
    if (user) {
        return user.loggedin;
    }
    return false;
}

async function updateUsername(username, newUsername) {
    try {
        const user = findUser(username);
        if (user) {
            user.username = newUsername;
            console.log(user); // Log the updated user details

            // Perform the necessary operations to update the username in the database
            // For example, you can call a function from the models/User.js module to update the username in the database.
            await changeUsername(user._id, newUsername);
        } else {
            throw new Error('User not found');
        }
    } catch (error) {
        console.log('Error updating username:', error);
    }
}

exports.newUser = newUser;
exports.getUsers = getUsers;
exports.findUser = findUser;
exports.checkPassword = checkPassword;
exports.setLoggedIn = setLoggedIn;
exports.isLoggedIn = isLoggedIn;
exports.updateUsername = updateUsername;
