// ℹ️ Gets access to environment variables/settings
// https://www.npmjs.com/package/dotenv
require("dotenv").config();

const passport = require("passport");
const { Strategy } = require("passport-facebook");

// ℹ️ Connects to the database
require("./db");

// Handles http requests (express is node js framework)
// https://www.npmjs.com/package/express
const express = require("express");

const app = express();

// ℹ️ This function is getting exported from the config folder. It runs most pieces of middleware
require("./config")(app);
// Passport configuration

app.use(passport.initialize());

// 👇 Start handling routes here
const indexRoutes = require("./routes/index.routes");
app.use("/api", indexRoutes);
const subPlan = require("./routes/auth/subscribePlan.routes");
app.use("/plan", subPlan);
// auth routes
const authRoutes = require("./routes/auth/auth.routes");
app.use("/auth", authRoutes);

const drive = require("./routes/cloudDrive/drive.routes");
app.use("/drive", drive);

const Buddy = require("./routes/RunCrudmModel/crudAssistant.routes");
app.use("/buddy", Buddy);
const AiTools = require("./routes/cloudDrive/AiTools.routes");
app.use("/AiTools", AiTools);

const assistantRun = require("./routes/RunCrudmModel/assistantRun.routes");
app.use("/call", assistantRun);
// ❗ To handle errors. Routes that don't exist or errors that you handle in specific routes
require("./error-handling")(app);

module.exports = app;
