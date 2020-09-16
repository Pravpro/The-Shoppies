const express 				= require("express"),
	  mongoose 				= require("mongoose"),
	  User 					= require("./models/user"),
	  bodyParser 			= require('body-parser'),
	  methodOverride 		= require("method-override"),
	  passport 				= require("passport"),
	  LocalStrategy 		= require("passport-local"),
	  passportLocalMongoose = require("passport-local-mongoose"),
	  session 				= require('express-session'),
	  app = express();

// App configuratons
mongoose.connect("mongodb://localhost:27017/shoppies", { useNewUrlParser: true, useUnifiedTopology: true } )
.then(() => console.log("Connected to shoppies DB!"))
.catch(err => console.log(err));
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(methodOverride('_method'));
app.use(session({
	secret: "The Shoppies is the best platform to nominate movies",
	resave: false,
	saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser()); // Does encoding of the user for us (user is defined as userSchema)
passport.deserializeUser(User.deserializeUser()); // Allows passport to deserialize user as the per the userSchema

// =================
//      ROUTES
// =================

// Page will show login form, and Register button
app.get("/", (req, res) => {
	res.redirect("/login");
});

// Show Register form
app.get("/register", (req, res) => {
	res.render("register");
});

app.post("/register", (req, res) => {
	User.register(new User({username: req.body.username}), req.body.password, (err, user) => {
		if(err){
			console.log(err);
			return res.render("register");
		}
		passport.authenticate("local")(req, res, () => {
			res.redirect("/movies");
		});
	});
});

// Show login page
app.get("/login", (req, res) => {
	res.render("login");
});

// Login the user
app.post("/login", passport.authenticate("local", {
	successRedirect: "/movies",
	failureRedirect: "/login"
}), (req, res) => {
	
})

// Looks up user and if exists then displays movies page
app.get("/movies", (req, res) => {
	res.render("movies", {currentUser: req.user});
})

app.post("/movies/:imdbId/nominate", isLoggedIn, (req, res) => {
	console.log("Shold not make it here")
	if(req.user.nominations.length < 5){
		req.user.nominations.push(req.params.imdbId);
		req.user.save().then(user => console.log(user)).catch(err => console.log(err));
	}
	let nomsLeft = 5 - req.user.nominations.length;
	res.send({nomsLeft : nomsLeft.toString()});
})

app.delete("/movies/:imdbId/nominate", isLoggedIn, (req, res) => {
	let currentUser = req.user;
	let imdbId = req.params.imdbId;
	console.log(currentUser);
	console.log("The movie id: " + imdbId);
	let i = currentUser.nominations.indexOf(imdbId);
	if(i != -1) {
		currentUser.nominations.splice(i,1);
		currentUser.save()
		.then(user => {
			res.send(currentUser);
		})
		.catch( err => console.log(err));
	} else{
		res.status(404).send("Error Occured: Could not find nomination to delete.");
	}
});

function isLoggedIn(req, res, next){
	if(req.isAuthenticated()){
		console.log("User is authenticated.");
		return next();
	}
	switch (req.accepts(['html', 'json'])) { //possible response types, in order of preference
		case 'html':
			res.redirect("/login");
			break;
		case 'json':
			res.send({redirect: "/login"});
			break;
		default:
			// if the application requested something we can't support
			res.status(400).send('Bad Request');
			return;
	}
}

app.listen("3000", () => console.log("The Shoppies server started on port 3000!"));



