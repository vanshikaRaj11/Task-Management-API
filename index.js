const express = require("express");
const cors = require("cors");
const routes = require("./routes/user.route");
const taskRoutes = require("./routes/task.route");
const ApiError = require("./utils/ApiError");

const app = express();

require("dotenv").config();
const PORT = process.env.PORT || 8000;

app.use(express.json());

// Use CORS middleware
app.use(cors());

// Middleware to parse URL-encoded bodies
app.use(express.urlencoded({ extended: true }));

require("./config/database").dbconnect();

app.use("/v1/", routes);
app.use("/v1/task/", taskRoutes);

app.use((req, res, next) => {
  throw new ApiError(404, "Not Found!");
});

app.listen(PORT, () => {
  console.log(`App listen on ${PORT}`);
});
