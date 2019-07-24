// imports
const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const app = express();

// require all the routes
const uploadfile = require('./routes/api/uploadfile');
const addCategory = require('./routes/api/addCategory');
const search = require('./routes/api/search');
const index = require('./routes/api/index');

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.use('/', express.static("public"));
app.use(express.static("public"));
app.use(express.static(path.join(__dirname, "/node_modules/bootstrap/dist/css")));

// templating engine ejs
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "public/views"));

app.use('/', index);
app.use('/api', uploadfile);
app.use('/api', addCategory);
app.use('/api', search);

// basic config
const listener = app.listen(process.env.PORT || 3000, () => {
  console.log(`Your app is listening on port ${listener.address().port}`);
});

mongoose.connect(
  process.env.MLAB || "mongodb://localhost/cafe-docs-db",
  { useNewUrlParser: true },
  () => {
    console.log("successfully connected to mongodb");
  }
);
