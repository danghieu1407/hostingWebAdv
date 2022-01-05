const mongoose = require('mongoose')
const ErrorSchema = mongoose.Schema({

    errorId: String,
    message: String
})
const Error = mongoose.model('Error', ErrorSchema)
module.exports = Error;