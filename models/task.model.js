const mongoose = require("mongoose");
const { type } = require("os");
const paginate = require("mongoose-paginate-v2");

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      required: true,
      enum: ["completed", "pending"],
      default: "pending",
    },
    isDelete: {
      type: Boolean,
      default: false,
    },
    },
  {
    timestamps: true,
  }
);

taskSchema.plugin(paginate);
const Task = mongoose.model("Task", taskSchema);
module.exports = Task;
