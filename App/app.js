const express = require("express"),
	  app = express(),
	  mongoose = require("mongoose"),
	  bodyParser = require('body-parser');

mongoose.connect("mongodb://localhost:27017/shoppies", { useNewUrlParser: true, useUnifiedTopology: true } )
.then(() => console.log("Connected to shoppies DB!"))
.catch(err => console.log(err));
app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));

// User - email, pasword, nominations
const userSchema = new mongoose.Schema({
	email: String,
	password: String,
	nominations: { type: [String], default: [] },
	isDone: { type: Boolean, default: false }
});

const User = mongoose.model("User", userSchema);

// User.create({
// 	email: "luffy@gmail.com",
// 	password: "gumgumpistol"
// });

// Page will show login form, and Register button
app.get("/", (req, res) => {
	res.redirect("/login");
});

// Show login page
app.get("/login", (req, res) => {
	res.render("login", { attempted: false });
});

app.get("/login/incorrect", (req, res) => {
	res.render("/login", {attempted: true})
})

// Looks up user and if exists then displays movies page
app.get("/movies", (req, res) => {
	User.findOne(req.body.user)
	.then(user => res.render("movies", {user: user}))
	.catch(err => {res.send("Something went wrong!")});
})

app.post("/nominate", (req, res) => {
	User.findOne(req.body.userId)
	.then( user => {
		if(user.nominations.length >= 5){
			user.isDone = true;
		}
		else {
			user.nominations.push(req.body.movieId);
		}
		let nomsLeft = 5 - user.nominations.length;
		res.send({nomsLeft : nomsLeft.toString()});
	})
})

app.listen("3000", () => console.log("The Shoppies server started on port 3000!"));



