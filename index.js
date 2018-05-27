const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const pug = require("pug");
const session = require("express-session");
const MongoStore = require("connect-mongo")(session);

// Only used in development mode to set environment variables
require("dotenv").config();

const app = express();

// Configuration settings on the app
app.set("view engine", "pug");
app.set("views", "templates");
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: true,
    saveUninitialized: false,
    store: new MongoStore({ mongooseConnection: mongoose.connection }),
    cookies: { maxAge: 60 * 60 * 24 }
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.resolve(__dirname, "public")));
mongoose.connect(process.env.MONGO_URI, { autoReconnect: true }, err => {
  if (err) return console.log("Database connection error");
  return console.log("Database connected successfully");
});
require("./models");

app.use((req, res, next) => {
  if (req.session.userId) res.locals.user = req.session.userId;
  return next();
});

// route Handler
require("./routes")(app);

// 404 handler
app.use((req, res, next) => {
  const error = new Error("Page not found");
  error.status = 404;
  return next(error);
});

// Error Handler
app.use((error, req, res, next) => {
  res.status(error.status || 500).render("error", { error });
});

const PORT = process.env.PORT || 3003;
app.listen(PORT, () => {
  console.log(`server running on PORT ${PORT}`);
});