const mongoose = require('mongoose')
const connectionString =  "mongodb://mongo:cYt2QhLtqyfAmTvuRlpp@containers-us-west-22.railway.app:6391"
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