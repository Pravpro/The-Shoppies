const mongoose 				= require("mongoose"),
	  passportLocalMongoose = require("passport-local-mongoose");

// User - email, pasword, nominations
const userSchema = new mongoose.Schema({
	username: String,
	password: String,
	nominations: { type: [String], default: [] }
});

userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", userSchema);