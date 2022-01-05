const mongoose = require('mongoose')
const CommentShema = mongoose.Schema({
    IdOfPost:  String,
    content:   String,
    Commentor: String,
    create_at: Date,
    update_at: Date
})

const comment = mongoose.model('comment',CommentShema)
module.exports = comment