const express = require("express");

const dotenv = require('dotenv');
dotenv.config();

const app = express();

const adminRoute = require("./routes/admin");

app.set("view engine", "ejs");
app.set("views", 'views');

app.use(express.urlencoded({ extended: false }));

app.use(adminRoute);

app.listen(3000, (req, res, next) => {
	console.log("Listening to localhost PORT 3000...");
})