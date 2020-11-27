 // load .env data into process.env
require('dotenv').config();

// Web server config
const PORT       = process.env.PORT || 3001;
const ENV        = process.env.ENV || "development";
const express    = require("express");
const bodyParser = require("body-parser");
const sass       = require("node-sass-middleware");
const app        = express();
const morgan     = require('morgan');
const cookieSession = require('cookie-session');
const bcrypt = require('bcrypt');

app.use(cookieSession({
  name: 'session',
  keys: ['12fasf5ywefgd']
}));

// PG database client/connection setup
const { Pool } = require('pg');
const dbParams = require('./lib/db.js');
const db = new Pool(dbParams);
db.connect();

// Load the logger first so all (static) HTTP requests are logged to STDOUT
// 'dev' = Concise output colored by response status for development use.
//         The :status token will be colored red for server error codes, yellow for client error codes, cyan for redirection codes, and uncolored for all other codes.
app.use(morgan('dev'));

app.set("view engine", "ejs");

// This is for regular form submission. Not for JSON.
app.use(bodyParser.urlencoded({ extended: true }));

// this is required for Ajax request
app.use(bodyParser.json());

app.use("/styles", sass({
  src: __dirname + "/styles",
  dest: __dirname + "/public/styles",
  debug: true,
  outputStyle: 'expanded'
}));
app.use(express.static("public"));

// Separated Routes for each Resource
// Note: Feel free to replace the example routes below with your own
const usersRoutes = require("./routes/usersRouter");
const resourceRoutes = require("./routes/resourcesRouter");
const authRoutes = require("./routes/authRouter");
// Mount all resource routes
// Note: Feel free to replace the example routes below with your own
app.use("/users", usersRoutes(db));
app.use("/resources", resourceRoutes(db));
app.use("/", authRoutes(db));
// Note: mount other resources here, using the same pattern above

app.get("/", (req, res) => {
  let user = req.session.userId;
  let username = req.params.username;
  res.render("homepage", {user, username});
});

app.post("/", (req, res) => {
  const category = req.body.categories;
  console.log('aAHHHHH', category)
  res.redirect(`/resources/categories/${category}`)
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});
