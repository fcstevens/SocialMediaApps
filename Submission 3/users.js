// User Data
const users = [
    { username: 'user1', password: '123', loggedin: false },
    { username: 'user2', password: '123', loggedin: false },
    { username: 'user3', password: '321', loggedin: false }
];

// Add a new user to the users array.
function newUser(username, password) {
    const user = { username: username, password: password, loggedin: false };
    users.push(user);
}

// Get the list of all users.
function getUsers() {
    return users;
}

// Find a user by username.
function findUser(username) {
    return users.find(user => user.username === username);
}

// Check if the provided password matches the user's password.
function checkPassword(username, password) {
    let user = findUser(username);
    if (user) {
        return user.password === password;
    }
    return false;
}

// Set the logged-in state of a user.
function setLoggedIn(username, state) {
    let user = findUser(username);
    if (user) {
        user.loggedin = state;
    }
}

// Check if a user is logged in.
function isLoggedIn(username) {
    let user = findUser(username);
    if (user) {
        return user.loggedin;
    }
    return false;
}

// Update the username of a user.
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

// Change the password of a user.
async function changePassword(username, newPassword) {
    let user = await findUser(username);
    if (user) {
        user.password = newPassword;
        user.save();
    }
}

// Export functions
exports.newUser = newUser;
exports.getUsers = getUsers;
exports.findUser = findUser;
exports.checkPassword = checkPassword;
exports.setLoggedIn = setLoggedIn;
exports.isLoggedIn = isLoggedIn;
exports.updateUsername = updateUsername;
exports.changePassword = changePassword;
