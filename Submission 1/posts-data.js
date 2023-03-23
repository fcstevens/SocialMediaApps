const posts=[]

function addNewPost(userId, message) {
    let myPost={
        postedBy: userId,
        message: message,
        likes: 0,
        time: Date.now()
    }
    posts.unshift(myPost)
}

function getPosts(n) {
    return posts.slice(0,n)
}

module.exports={addNewPost, getPosts}
