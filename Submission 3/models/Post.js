const mongoose = require('mongoose');
const { Schema, model } = mongoose;

// Define the schema for the post
const postSchema = new Schema({
    postedBy: String,
    message: String,
    likes: Number,
    time: Date,
    imagePath: String,
    tags: [String],
    comments: [{
        user: String,
        message: String,
        likes: Number
    }]
});

// Create a model based on the schema
const Post = model('MyPost', postSchema);

// Add a new post
function addNewPost(userID, post, imageFile) {
    let myPost = {
        postedBy: userID,
        message: post.message,
        imagePath: imageFile,
        likes: 0,
        time: Date.now()
    };
    Post.create(myPost)
        .catch(err => {
            console.log('Error:' + err);
        });
}

// Get a specified number of posts
async function getPosts(n = 3) {
    let data = [];
    await Post.find({})
        .sort({ 'time': -1 })
        .limit(n)
        .exec()
        .then(mongoData => {
            data = mongoData;
        })
        .catch(err => {
            console.log('Error:' + err);
        });
    return data;
}

// Get a specific post by its ID
async function getPost(postid) {
    let data = null;
    await Post.findById(postid)
        .exec()
        .then(mongoData => {
            data = mongoData;
        })
        .catch(err => {
            console.log('Error:' + err);
        });
    return data;
}

// Like a post
async function likePost(likedPostID, likedByUser) {
    let found;
    await Post.findByIdAndUpdate(likedPostID, { $inc: { likes: 1 } }).exec()
        .then(foundData => found = foundData);
}

// Comment on a post
async function commentOnPost(commentedPostID, commentByUser, comment) {
    let found;
    let newComment = {
        user: commentByUser,
        message: comment,
        likes: 0
    };
    await Post.findByIdAndUpdate(commentedPostID, { $push: { comments: newComment } }).exec()
        .then(foundData => found = foundData);
}

// Delete a post
const deletePost = async (postId, userId) => {
    try {
        const post = await Post.findOne({ _id: postId });

        if (!post) {
            return false; // Post not found
        }

        if (post.postedBy !== userId) {
            throw new Error('Unauthorized'); // User is not authorized to delete the post
        }

        await Post.deleteOne({ _id: postId });
        return true; // Post deleted successfully
    } catch (error) {
        throw new Error('Error deleting post: ' + error.message);
    }
};

module.exports = {
    addNewPost,
    getPosts,
    getPost,
    likePost,
    commentOnPost,
    deletePost
};
