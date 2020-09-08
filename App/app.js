const express = require("express"),
	  app = express(),
	  mongoose = require("mongoose");

mongoose.connect("mongodb://localhost:27017/shoppies", { useNewUrlParser: true, useUnifiedTopology: true } )
.then(() => console.log("Connected to shoppies DB!"))
.catch(err => console.log(err));


// 
app.get("/", (req, res) => {
	res.send("Home");
})

// Look up user and redirect to movies page
app.get("/login", (req, res) => {
	res.send("Login!");
})

app.

app.listen("3000", () => console.log("The Shoppies server started on port 3000!"));