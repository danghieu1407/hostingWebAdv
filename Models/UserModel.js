const mongoose = require('mongoose')
const userSchema = mongoose.Schema({
    authId: String,
    name: String,
    email: String,
    password: String,
    role: String,
    Class: String,
    Faculty: String,
    created: Date,
    updated: Date,
    avatar: String
})
const UserTDTU = mongoose.model('UserTDTU', userSchema)
module.exports = UserTDTU;