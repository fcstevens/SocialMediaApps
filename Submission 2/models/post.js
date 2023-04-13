//const posts=[]
const mongoose=require('mongoose');
const {Schema, model} = mongoose;

const postSchema=new Schema({
    postedBy: String,
    message: String,
    likes: Number,
    time: Date,
    tags: [String],
    comments: [
        {
            commentBy: String,
            comment: String,
            time: Date
        }
    ]
})

//const posts[]
const Post = model('Post', postSchema);

function addNewPost(userId, message) {
     let myPost={
        postedBy: userId,
        message: post.message,
        likes: 0,
        time: Date.now()
    }
// posts.unshift(myPost)
Post.create(myPost)
    .catch(err=>{
        console.log("Error: " +err);
    })
}

async function getPosts(n=3) {
    let data=[];
    await Post.find({})
        .sort({'time': -1})
        .limit(n)
        .exec()
        .then(mongoDaata=>{
            data=mongoData;
        })
        .catch(err=> {
            console.log('Error:' +err)
        });
        return data;
}

module.exports={addNewPost, getPosts}
