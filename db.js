const mongoose = require('mongoose')
const connectionString =  "mongodb://mongo:DuPgfv5xCXgQSY3P7ZME@containers-us-west-21.railway.app:7297"
if (!connectionString){
    console.error('MongoDB connection string missing!')
    process.exit(1)
}

mongoose.connect(connectionString, {useNewUrlParser: true, useUnifiedTopology: true})
const db = mongoose.connection
db.on('error', err => {
    console.error('MongooseDB error: ' +err.message)
})

db.once('open', () => console.log('MongoDB connection established'))