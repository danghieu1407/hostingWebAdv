const mongoose = require('mongoose')
const FacultySchema = mongoose.Schema({
  authId: String,
  name: String,
  email: String,
  password: String,
  role: String,
  Class : String,
  Faculty: String,
  created: Date,
  updated: Date,
  avatar: String
})
const Faculty = mongoose.model('Faculty', FacultySchema)
module.exports = Faculty;