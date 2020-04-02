var bodyParser          = require("body-parser"),
    methodOverride      = require("method-override"),
    expressSanitizer    = require("express-sanitizer"),
    mongoose            = require("mongoose"),
    express             = require("express"),
    app                 = express();

require("dotenv").config()

//MONGOOSE CONFIG
const uri = process.env.MONGODB_URI;
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);
mongoose.set('useUnifiedTopology', true);
mongoose.connect(uri, {useNewUrlParser: true});
mongoose.connection.on('open',()=>{
    console.log("Connection Established.. ")
})

mongoose.connection.on('error',()=>{
    console.log("Connection Failed.. ")
})


//APP CONFIG
app.set("view engine", "ejs")
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended: true}))
app.use(expressSanitizer())
app.use(methodOverride("_method"))     //HTML doesnt support PUT


//MONGOOSE MODEL CONFIG
var blogSchema = new mongoose.Schema({
    title: String,
    image: String,
    body: String,
    created: {type: Date, default: Date.now}
})

var Blog = mongoose.model("Blog", blogSchema)

//RESTful Routes


//INDEX Route
app.get("/blogs", function(req, res){
    Blog.find({}, function(err, blogs){
        if(err){
            console.log("ERROR OCCURED!!!")
        }
        else{
            res.render("index", {blogs: blogs})
        }
    })
})

//NEW Route
app.get("/blogs/new", function(req, res){
    res.render("new")
})

//CREATE Route
app.post("/blogs", function(req, res){
    req.body.blog.body = req.sanitize(req.body.blog.body) //Sanitizing blog.body
    Blog.create(req.body.blog, function(err, newBlog){
        if(err)
            console.log("ERROR OCCURED!")
        else{
            console.log("Successfully Sent")
            res.redirect("/blogs")
        }
    })
})

//SHOW Route
app.get("/blogs/:id", function(req, res){
    Blog.findById(req.params.id, function(err, foundBlog){
        if(err)
            res.redirect("/blogs")
        else{
            res.render("show", {blog : foundBlog})
        }
    })
})

//EDIT Route
app.get("/blogs/:id/edit", function(req, res){
    Blog.findById(req.params.id, function(err, foundBlog){
        if(err)
            res.redirect("/blogs")
        else{
            res.render("edit", {blog : foundBlog})
        }
    })
})

//UPDATE Route
app.put("/blogs/:id", function(req, res){
    req.body.blog.body = req.sanitize(req.body.blog.body) //Sanitizing blog.body
    Blog.findByIdAndUpdate(req.params.id, req.body.blog, function(err, updatedBlog){
        if(err)
            res.redirect("/blogs")
        else{
            res.redirect("/blogs/"+req.params.id)
        }
    })
})

//DESTROY Route
app.delete("/blogs/:id", function(req, res){
    Blog.findByIdAndRemove(req.params.id,  function(err, updatedBlog){
        if(err)
            res.redirect("/blogs")
        else{
            res.redirect("/blogs")
        }
    })
})

app.get("/", function(req, res){
    res.redirect("/blogs")
})




app.listen(3000, function(){
    console.log("My Blogs are on FIRE!!!")
})

