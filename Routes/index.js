const { response } = require('express');
const express = require('express');
const bodyParser = require('body-parser')
const router = express.Router();
var session = require('express-session');
var passport = require('passport');
var ObjectId = require('mongodb').ObjectID;
const http = require('http');
const socketio = require('socket.io');
const db = require('../db')
var Error = require('../Models/Error')
var multer = require('multer')
const uuid = require('short-uuid')
var alert = require('alert')

const emailValidator = require('email-validator')
router.use(session({
    resave: false,
    saveUninitialized: true,
    secret: 'SECRET'
}));

var storage = multer.diskStorage({
    destination: function(req, file, callback) {
        callback(null, './uploads');
    },
    filename: function(req, file, callback) {
        callback(null, file.originalname);
    }
});

var upload = multer({ storage: storage });


router.use(passport.initialize());
router.use(passport.session());
router.use(bodyParser.json())

var UserTDT = require('../Models/UserModel')
var Post = require('../Models/Post');
var Comment = require('../Models/Comment');
var Notification = require('../Models/nontification')
const { start } = require('repl');
const { Passport } = require('passport');
const e = require('express');

let userTDTU; /* Biến Local để lấy thông tin sinh viên cho cột left - right */
let post; /*Lấy tất cả bài post trong moongose */
let skip;
let tempcc;


// Quài Bẻo thêm dô từ khúc này
router.get('/login', (req, res, next) => {

    Error.findOne({ 'errorId': '01' })
        .then(user => {
            let error = ''
            if (user) {

                error = user.message
                Error.deleteOne({ 'errorId': '01' }, function(err, result) {
                    if (err) throw err;
                });
            }
            if (error.length > 0) {
                res.render('./Layout/login', {
                    layout: `./Layout/login`,
                    errorMessage: error
                })

            } else {
                res.render('Layout/login', { layout: `./Layout/login` })
            }
        })
})
temp = false




router.post('/login', (req, res, next) => {
    let error = ''
    body = req.body
    let emailbt = body.email
    let passwordbt = body.password
    UserTDT.findOne({ email: emailbt })
        .then(user => {
            if (!emailbt) {
                error = 'Vui lòng nhập email!'
            } else if (!emailbt.includes('@')) {
                error = 'Email không hợp lệ!'
            } else if (!user) {
                error = 'Tài khoản không tồn tại!'
            } else if (!passwordbt) {
                error = 'Vui lòng nhập mật khẩu'
            } else if (passwordbt.length < 6) {
                error = 'Mật khẩu phải từ 6 kí tự'
            } else if (passwordbt !== user.password) {
                error = 'Mật khẩu không chính xác'
            }
            if (error.length > 0) {
                res.render('./Layout/login', {
                    layout: `./Layout/login`,
                    errorMessage: error
                })
            } else {
                temp = true
                body.authId = user.authId
                body.role = user.role
                body.name = user.name
                body.created = user.created
                body.updated = user.updated
                body.avatar = user.avatar

                const obj = JSON.parse(JSON.stringify(body));

                tempcc = obj
                req.session.email = req.body.email
                return res.redirect('/')
            }
        })
})
router.get('/', isLoggedIn, (req, res, next) => {
    // res.sendFile(__dirname + "/Pages/index");
    skip = 10;
    if (!req.user) {
        userTDTU = tempcc

    } else {
        userTDTU = req.user;
    }
    Post.aggregate([{
            $lookup: {
                from: "usertdtus",
                localField: "creator",
                foreignField: "authId",
                as: "user"
            }
        }, { "$unwind": "$user" },
        { $sort: { _id: -1 } },
        { $limit: 10 },
    ]).then((result) => {
        post = result;
        res.render('./Pages/index', { user: userTDTU, post: result });
    }).catch((error) => {
        console.log(error);
    });
});




router.post('/', isLoggedIn, (req, res, next) => {
    new Post({
        creator: userTDTU.authId,
        content: req.body.content,
        create_at: new Date(),
        update_at: new Date(),
        image: req.body.image
    }).save(function(err, data) {
        if (err) return console.error(err);

        result = { post: data, user: userTDTU };
        res.send(result);
    });



});

router.post('/nontification', (req, res) => {
    console.log(req.body)
    new Notification({
        creator: userTDTU.role,
        content: req.body.msg,
        title: req.body.title,
        create_at: new Date(),
        update_at: new Date(),
    }).save(function(err, data) {
        if (err) return console.error(err);

        result = { post: data, user: userTDTU };
        res.send(result);
    })
});
router.get('/logout', function(req, res, next) {
    if (req.session) {
        // delete session object
        req.session.destroy(function(err) {
            temp = false
            if (err) {
                return next(err);
            } else {
                return res.redirect('/');
            }
        });
    }

});
router.post('/DeletePost', function(req, res) {

    query = { _id: ObjectId((req.body.IDPost)) }
    Post.deleteOne(query, function(err, result) {
        if (err) console.log(err);
        else {
            Comment.deleteMany({ IdOfPost: ObjectId((req.body.IDPost)) }, function(err, result) {
                if (err) console.log(err);
                res.send(req.body);
            });
        }
    })
});
router.post("/EditPost", function(req, res) {
    query = { _id: ObjectId(req.body.IDPost) }
    Post.findOneAndUpdate(query, { $set: { content: req.body.content, update_at: new Date() } }, { new: true }, function(err, result) {
        if (err) console.log(err);
        else {
            res.send(result);
        }
    })
})
router.get("/UserProfile", isLoggedIn, (req, res, next) => {
    skip = 10
    Post.find({ creator: userTDTU.authId }).sort({ _id: -1 }).limit(10).then((result) => {
        res.render('./Pages/UserProfile', { user: userTDTU, post: result });
    })

});
router.post("/UserProfile", isLoggedIn, (req, res, next) => {
    const { name, Class, Faculty } = req.body;
    query = { authId: req.user.authId };
    var data = { name: name, Class: Class, Faculty: Faculty };
    UserTDT.findOneAndUpdate(query, { $set: data }, { new: true }, (err, doc) => {
        if (err) {
            console.log("Something wrong when updating data!");
        } else {
            userTDTU = doc;
            Post.find({ creator: userTDTU.authId }).sort({ _id: -1 }, ).then((result) => {
                res.render('./Pages/UserProfile', { user: userTDTU, post: result });
            })
        }
    })

});
router.get('/createaccount', isLoggedIn, (req, res) => {
    if (!req.user) {
        userTDTU = tempcc

    } else {
        userTDTU = req.user;
    }

    res.render('./Pages/createaccount', { user: userTDTU });
})

router.post('/createaccount', isLoggedIn, (req, res) => {
    if (!req.user) {
        userTDTU = tempcc

    } else {
        userTDTU = req.user;
    }
    const { email } = req.body
    const { password } = req.body
    const { name } = req.body
    let success;
    UserTDT.findOne({ email: email })
        .then(user => {
            if (user) {
                error = 'Tài khoản đã tồn tại'
                res.render('./Pages/createaccount', { user: userTDTU, errorMessage: error })
            } else if (!name) {
                error = 'Nhập tên người dùng'
                res.render('./Pages/createaccount', { user: userTDTU, errorMessage: error })
            } else if (email === '') {
                error = 'Nhập email'
                res.render('./Pages/createaccount', { user: userTDTU, errorMessage: error })
            } else if (!email.includes('@tdtu.edu.vn')) {
                error = 'Email không hợp lệ'
                res.render('./Pages/createaccount', { user: userTDTU, errorMessage: error })
            } else if (!password) {
                error = 'Nhập mật khẩu'
                res.render('./Pages/createaccount', { user: userTDTU, errorMessage: error })
            } else if (password.length < 6) {
                error = 'Mật khẩu phải nhiều hơn 6 kí tự'
                res.render('./Pages/createaccount', { user: userTDTU, errorMessage: error })
            } else {
                new UserTDT({
                    authId: req.body.email + 'authidne',
                    name: req.body.name,
                    email: req.body.email,
                    password: req.body.password,
                    Faculty: req.body.faculty,
                    role: req.body.role,
                    created: new Date(),
                    avatar: req.body.avatar
                }).save()
                success = 'Tạo tài khoản thành công'
                res.render('./Pages/createaccount', { user: userTDTU, successMessage: success })
            }
        })


})
router.post('/loadComment', (req, res) => {
    Comment.find({ IdOfPost: req.body.IDPost }).sort({ _id: 1 }, ).then((result) => {
        UserTDT.find({}, (err, doc) => {
            if (err) {
                console.log(err);
            } else {
                res.send({ data: result, user: doc, OwnerComment: userTDTU.authId });
            }
        })
    })
})
router.post("/SendComment", (req, res) => {
    new Comment({
        IdOfPost: req.body.IDPost,
        content: req.body.comment,
        Commentor: req.body.authID,
        create_at: new Date(),
        update_at: new Date()
    }).save(function(err, data) {
        if (err) { return console.error(err); } else {
            UserTDT.findOne({ authId: req.body.authID }, (err, doc) => {
                if (err) { return console.error(err); }
                res.send({ data: data, user: doc })
            })
        }

    });
})
router.post("/DeleteComment", function(req, res) {

    Comment.findOneAndDelete({ _id: ObjectId(req.body.IDComment) }, function(err, result) {
        if (err) console.log(err);
        else {
            res.send(req.body);
        }
    })
})

router.get("/PageOfUser", isLoggedIn, (req, res, next) => {
    skip = 10;
    IdOtherUser = req.query.authId;
    if (userTDTU.authId == IdOtherUser) {
        Post.find({ creator: userTDTU.authId }).sort({ _id: -1 }, ).limit(10).then((result) => {
            res.render('./Pages/UserProfile', { user: userTDTU, post: result });
        })
    } else {
        UserTDT.findOne({ authId: IdOtherUser }, (err, userother) => {
            if (err) console.log(err);
            else {
                Post.find({ creator: IdOtherUser }).sort({ _id: -1 }, ).limit(10).then((post) => {
                    res.render('./Pages/PageUser', { userother: userother, post: post, user: userTDTU });
                })
            }
        })
    }

})

router.post("/LoadMoreEvent", (req, res) => {
    let code = req.body.code
    if (code == 1) {
        Post.aggregate([{
                $lookup: {
                    from: "usertdtus",
                    localField: "creator",
                    foreignField: "authId",
                    as: "user"
                }
            }, { "$unwind": "$user" },
            { $sort: { _id: -1 } },
            { $skip: skip },
            { $limit: 10 },
        ]).then((result) => {
            skip = skip + 10;
            res.send({ result: result, code: 1 });
        }).catch((error) => {
            console.log(error);
        });
    } else if (code == 2) {
        let userotherIdforLoadmore = req.body.id
        UserTDT.findOne({ authId: userotherIdforLoadmore }, (err, userother) => {
            if (err) console.log(err);
            else {
                Post.find({ creator: userotherIdforLoadmore })
                    .sort({ _id: -1 })
                    .skip(skip)
                    .limit(10)
                    .then((post) => {
                        skip = skip + 10;
                        res.send({ userother: userother, post: post, });
                    })
            }
        })
    }
})

router.get("/Notification", isLoggedIn, (req, res) => {
    let page = req.query.Page || 1;
    let Type = req.query.Type || null;
    if (Type === null) {
        Notification.find({}).sort({ _id: -1 }, )
            .skip((10 * page) - 10)
            .limit(10)
            .then((result) => {
                Notification.countDocuments({}).then((count) => {
                    res.render('./Pages/Newsofuser', { user: userTDTU, result: result, Pages: Math.ceil(count / 10), page: page, Type: null });
                })
            })
    } else {
        Notification.find({ creator: Type }).sort({ _id: -1 }, )
            .skip((10 * page) - 10)
            .limit(10)
            .then((result) => {
                Notification.countDocuments({ creator: Type }).then((count) => {
                    res.render('./Pages/Newsofuser', { user: userTDTU, result: result, Pages: Math.ceil(count / 10), page: page, Type: Type });
                })
            })
    }

})
router.get('/adminmanager', isLoggedIn, (req, res) => {
        if (!req.user) {
            userTDTU = tempcc

        } else {
            userTDTU = req.user;
        }
        if (userTDTU.role !== "Admin") {
            return res.redirect('/')
        }

        UserTDT.find({}, (err, doc) => {
            if (err) {
                console.log(err);
            } else {

                res.render('./Pages/adminmanager', { user: userTDTU, userList: doc });
            }
        })

    })
    // router.post('/DeletePost', function(req, res) {

//     query = { _id: ObjectId((req.body.IDPost)) }
//     Post.deleteOne(query, function(err, result) {
//         if (err) console.log(err);
//         else {
//             Comment.deleteMany({ IdOfPost: ObjectId((req.body.IDPost)) }, function(err, result) {
//                 if (err) console.log(err);
//                 res.send(req.body);
//             });
//         }
//     })
// });
router.post('/deleteaccount', isLoggedIn, function(req, res) {
    if (!req.user) {
        userTDTU = tempcc

    } else {
        userTDTU = req.user;
    }
    query = { authId: req.body.authId }

    UserTDT.deleteOne(query, function(err, result) {
        if (err) console.log(err);
        else {
            res.send(req.body)
        }
    })

});
router.get('/editaccount', isLoggedIn, (req, res) => {
    if (!req.user) {
        userTDTU = tempcc

    } else {
        userTDTU = req.user;
    }

    if (userTDTU.role !== "Admin" && userTDTU.role !== "Law" && userTDTU.role !== "CNTT" && userTDTU.role !== "TCNH") {
        return res.redirect('/')
    }
    res.render('./Pages/editaccount', { user: userTDTU });
})
let tempccc;
router.post('/editaccount', isLoggedIn, (req, res) => {
    if (!req.user) {
        userTDTU = tempcc

    } else {
        userTDTU = req.user;
    }
    const body = req.body
    UserTDT.findOne({ authId: userTDTU.authId })
        .then(user => {
            let error = '';
            if (body.password != user.password) {
                error = 'Mật khẩu cũ không chính xác'
            } else if (!body.newPassword) {
                error = 'Mật khẩu mới không được bỏ trống'
            } else if (body.newPassword === body.password) {
                error = 'Mật khẩu mới không được trùng'
            } else if (body.newPassword.length < 6) {
                error = 'Mật khẩu mới phải dài hơn 6 kí tự'
            } else if (!body.confirmPassword) {
                error = 'Nhập xác nhận mật khẩu'
            } else if (body.confirmPassword !== body.newPassword) {
                error = 'Mật khẩu xác nhận không chính xác'
            }
            if (error.length > 0) {
                res.render('./Pages/editaccount', {
                    user: userTDTU,
                    errorMessage: error
                })
            } else {
                UserTDT.findOneAndUpdate({ authId: userTDTU.authId }, { $set: { password: body.newPassword } }, { new: true }, (err, doc) => {

                    if (err) {
                        console.log("Something wrong when updating data!");
                    }
                    success = 'Đổi mật khẩu thành công'
                    res.render('./Pages/editaccount', { user: userTDTU, successMessage: success })

                });

            }
        })

})
router.post('/editaccountByAdmin', isLoggedIn, (req, res) => {
    const body = req.body
    UserTDT.findOne({ authId: body.authId })
        .then(user => {
            let error = '';
            if (body.password != user.password) {
                error = 'Mật khẩu cũ không chính xác'
            } else if (!body.newPassword) {
                error = 'Mật khẩu mới không được bỏ trống'
            } else if (body.newPassword === body.password) {
                error = 'Mật khẩu mới không được trùng'
            } else if (body.newPassword.length < 6) {
                error = 'Mật khẩu mới phải dài hơn 6 kí tự'
            } else if (!body.confirmPassword) {
                error = 'Nhập xác nhận mật khẩu'
            } else if (body.confirmPassword !== body.newPassword) {
                error = 'Mật khẩu xác nhận không chính xác'
            }
            if (error.length > 0) {
                body.error = error
                alert(error)
                res.send(req.body)

            } else {
                UserTDT.findOneAndUpdate({ authId: body.authId }, { $set: { password: body.newPassword } }, { new: true }, (err, doc) => {

                });
                let success = "Đổi mật khẩu thành công"
                alert(success)
                res.send(req.body)
            }
        })
})
router.get("/fakerdata", (req, res) => {
    for (let i = 11; i <= 20; i++) {
        new Notification({
            content: "Day la notification " + i,
            title: "Day la title " + i,
            creator: "Law",
            create_at: new Date(),
            update_at: new Date(),
        }).save(function(err, data) {
            if (err) return console.error(err);
            result = { post: data };
            console.log(JSON.stringify(result));
        });
    }
})

router.get('/DELETEALL', function(req, res) {
    Notification.deleteMany({}, function(err, result) {});
});

function isLoggedIn(req, res, next) {
    if (req.isAuthenticated() || temp === true)
        return next();
    res.redirect('/login');
}


module.exports = router;