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
mongoose.connect("mongodb+srv://pravpro:TheShoppiesUser!@cluster0.j2xos.mongodb.net/the_shoppies?retryWrites=true&w=majority", { 
	useNewUrlParser: true, 
	useUnifiedTopology: true 
})
.then(() => console.log("Connected to shoppies DB!"))
.catch(err => console.log("ERROR:", err.message));
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
	res.redirect("/movies");
});

// Show Register form
app.get("/register", isLoggedOut, (req, res) => {
	res.render("register", {currentUser: req.user});
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
app.get("/login", isLoggedOut, (req, res) => {
	res.render("login", {currentUser: req.user} );
});

// Login the user
app.post("/login", passport.authenticate("local", {
	successRedirect: "/movies",
	failureRedirect: "/login"
}), (req, res) => {
	
})

// Display movies page
app.get("/movies", (req, res) => {
	res.render("movies", {currentUser: req.user});
})

// Add a movie nomination to user
app.post("/movies/:imdbId/nominate", isLoggedIn, (req, res) => {
	console.log("Shold not make it here")
	if(req.user.nominations.length < 5){
		req.user.nominations.push(req.params.imdbId);
		req.user.save().then(user => console.log(user)).catch(err => console.log(err));
	}
	let nomsLeft = 5 - req.user.nominations.length;
	res.send({nomsLeft : nomsLeft.toString()});
})

// Delete nomination by user
app.delete("/movies/:imdbId/nominate", isLoggedIn, (req, res) => {
	let i = req.user.nominations.indexOf(req.params.imdbId);
	if(i != -1) {
		req.user.nominations.splice(i,1);
		req.user.save()
		.then( user => res.send(req.user))
		.catch( err => console.log(err));
	} else{
		res.status(404).send("Error Occured: Could not find nomination to delete.");
	}
});

// Handle User Logout
app.get("/logout", (req, res) => {
	req.logout();
	res.redirect("/");
})

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

function isLoggedOut(req, res, next){
	if(req.isAuthenticated()){
		switch (req.accepts(['html', 'json'])) { //possible response types, in order of preference
			case 'html':
				res.redirect("/movies");
				break;
			case 'json':
				res.send({redirect: "/movies"});
				break;
			default:
				// if the application requested something we can't support
				res.status(400).send('Bad Request');
				return;
		}
	} else {
		console.log("User is not authenticated.");
		return next();	
	}
	
}

// Run the server
let port = process.env.PORT || 3000;
app.listen(port, () => console.log("The Shoppies server started on port 3000!"));



