// Array to store posts
const posts = [];

// Add a new post to the posts array.
function addNewPost(userID, post) {
    const myPost = {
        postedBy: userID,
        message: post.message,
        likes: 0,
        time: Date.now(),
    };
    posts.unshift(myPost);
}

// Get the latest posts, up to a specified number.
function getPosts(n = 3) {
    return posts.slice(0, n);
}

// Get all messages from the MessageModel.
async function getMessages() {
    try {
        const messages = await MessageModel.find().exec();
        return messages;
    } catch (error) {
        console.error('Error retrieving messages:', error);
        throw error;
    }
}

// Export functions
module.exports = {
    addNewPost,
    getPosts,
    getMessages,
};
