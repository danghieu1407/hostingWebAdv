const Post = require('../Models/Post')

class Postcontrollers{
    create(req,res){
        new Post({
            content: req.body.content,
            creator: req.body.name,
            create_at: new Date(),
            update_at: new Date()
        }).save(function(err){
            if(err){
                console.log(err)
                res.json({success:'false'})
            }
            else{
                res.json({success:'true'})
            }
        })
    }
    async list(req, res){
        let page = parseInt(req.params.page)
        let limit = parseInt(req.params.limit)
        let skip = (page-1)*limit
        const posts = await Post.find().sort([['create_at', -1]]).skip(skip).limit(limit)
        res.json(posts)
    }
}

module.exports = new Postcontrollers