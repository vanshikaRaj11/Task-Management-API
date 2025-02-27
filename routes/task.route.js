const express = require("express");
const router = express.Router();
const taskController = require("../controllers/task.controller");
const verifyJwt = require("../middleware/verifyjwt");

router
  .route("/")
  .post(verifyJwt, taskController.createTask)
  .get(verifyJwt, taskController.queryTasks);
router
  .route("/:id")
  .get(verifyJwt, taskController.getTask)
  .delete(verifyJwt, taskController.deleteTask)
  .patch(verifyJwt, taskController.updateTask);

module.exports = router;
