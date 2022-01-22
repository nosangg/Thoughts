const express = require('express')
const mongoose = require("mongoose");
const passport = require("passport")
const session = require("express-session")
const passportLocalMongoose = require("passport-local-mongoose");
const req = require('express/lib/request');


const app = express()
const port = 3000


app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(express.urlencoded({
    extended: false
}));

app.use(session({
    secret: "THISISASECRET",
    resave: false,
    saveUninitialized: false
}))

app.use(passport.initialize())
app.use(passport.session())

mongoose.connect("mongodb://localhost:27017/userBlogsDB");

const userSchema = new mongoose.Schema({
    email: String,
    password: String
})

userSchema.plugin(passportLocalMongoose)

const User = mongoose.model("User", userSchema)

passport.use(User.createStrategy());

passport.serializeUser(function (user, done) {
    done(null, user.id);
});

passport.deserializeUser(function (id, done) {
    User.findById(id, function (err, user) {
        done(err, user);
    });
});

app.get("/blog",(req, res)=>{
    if(req.isAuthenticated){
        res.render("blog")
    }else{
        res.redirect("/login")
    }
})

app.get("/", (req, res) => {
    res.render("index")
})

app.get("/login", (req, res) => {
    res.render("login");
})
app.get("/register", (req, res) => {
    res.render("register");
})

app.post("/register",(req, res)=>{
    User.register({username: req.body.username},req.body.password, (err, user)=>{
        if(err){
            console.log(err);
        }
        else{
            passport.authenticate("local")(req, res, ()=>{
                res.redirect("/blog")
            })
        }
    })
})

app.post("/login", (req, res)=>{
    const user = new User({
        username: req.body.username,
        passport: req.body.passport
    })

    req.login(user, (err)=>{
        if(err){
            console.log(err);
        }else{
            passport.authorize("local")(req, res, ()=>{
                res.redirect("/blog")
            })
        }
    })
})
app.listen(port, () => console.log(`Example app listening on port ${port}!`))