const Task = require("../models/task.model");
const User = require("../models/user.model");

const createTask = async (req, res) => {
  const { title, description } = req.body;
  if ([title, description].some((field) => field?.trim() === "")) {
    throw new Error(400, "All fields are required");
  }
  const existingTask = await Task.findOne({ $or: [{ title }] });
  if (existingTask) {
   return res.status(200).send({
     code: 404,
     message: "Task already exists",
   });
  }

  const task = await Task.create({
    title,
    description,
  });
  await task.save();
  const user = await User.findById(req.user._id);
  if (!user) {
    return res.status(200).send({
      code: 404,
      message: "User not found",
    });
  }
  user.tasks.push(task._id);
  await user.save();
  return res.status(200).send({
    data: task,
    code: 200,
    message: "Task created Successfully",
  });
};

const getTask = async (req, res) => {
  const id = req.params.id;
  const task = await Task.findOne({ _id: id, isDelete: false });
  if (!task) {
    return res.status(200).send({
      code: 404,
      message: "Task not found",
    });
  }
  return res.status(200).send({
    data: task,
    code: 200,
    message: "Task created Successfully",
  });
};

const deleteTask = async (req, res) => {
  const id = req.params.id;
  const task = await Task.findById(id);
  if (!task) {
    return res.status(200).send({
      code: 404,
      message: "Task not found",
    });
  }
  if (task.isDelete === true) {
    return res.status(200).send({
      code: 404,
      message: "Task already deleted",
    });
  }
  task.isDelete = true;
  await task.save();
  return res.status(200).send({
    code: 200,
    message: "Task deleted Successfully",
  });
};

const updateTask = async (req, res) => {
  const { title, description, status } = req.body;
  const id = req.params.id;
  const task = await Task.findById(id);
  if (!task) {
    return res.status(200).send({
      code: 404,
      message: "Task not found",
    });
  }
  Object.assign(task, { title, description, status });
  await task.save();
  return res.status(200).send({
    data: task,
    code: 200,
    message: "Task updated Successfully",
  });
};

const queryTasks = async (req, res) => {
  const status = req.query.status;
  const page = req.query.page || 1;
  const limit = req.query.limit || 10;
  let condition = { isDelete: false };
  if (status && status !== undefined) {
    condition.status = status;
  }
  const tasks = await Task.paginate(condition, { page, limit });
  if (!tasks) {
    return res.status(200).send({
      code: 404,
      message: "Tasks not found",
    });
  }
  return res.status(200).send({
    data: tasks,
    code: 200,
    message: "Tasks fetched Successfully",
  });
};

module.exports = {
  createTask,
  getTask,
  deleteTask,
  updateTask,
  queryTasks,
};
