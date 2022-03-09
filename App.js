require("dotenv").config();
var express = require('express');
var bodyParser = require('body-parser')
var app = express();

var authRouter = require('./Routes/auth');
// var UserRouter        = require('./Routes/user');
var IndexRouter = require('./Routes/index');
const bp = require('body-parser')
const socketio = require('socket.io')


const expressLayouts = require('express-ejs-layouts');
app.set("layout", "./Layout/layout");
app.set('view engine', 'ejs');
app.set("layout extractScripts", true)

app.use(bp.urlencoded({ extended: false }))
app.use(bp.json())
app.use(express.static("public"));
app.use(bodyParser.json())

app.use(expressLayouts);
app.use("", IndexRouter);
app.use('/auth', authRouter);
// app.use("/user",UserRouter);



const port = process.env.PORT || 8080;
const httpSever = app.listen(port);
const io = socketio(httpSever)

console.log("Server started on port" + port);

io.on('connection',client =>{
    console.log('client connected')

    client.on('disconnect', ()=> console.log(`${client.id} has left`))
    client.send('hello tui la dang hieu')

    client.on('postnontification',  postnontificationfromsever =>{
        console.log(postnontificationfromsever)
        client.broadcast.emit('sendatatouser',postnontificationfromsever )
    })
    
})