const { Schema, model } = require("mongoose");

// TODO: Please make sure you edit the User model to whatever makes sense in this case
const userSchema = new Schema(
  {
    username: {
      type: String,
      required: [true, "username is required."],
      unique: true,
      trim: true,
    },

    email: {
      type: String,
      required: [true, "email is required."],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please use a valid email address."],
    },

    password: {
      type: String,
      required: [true, "Password is required."],
      trim: true,
    },
    phoneNumber: {
      type: Number,
      required: [true, "Phone number is required"],
      unique: true,
    },
    subscription:{
      type:Boolean,
      required: true,
      default:false,

    },tokens:{
      type:Number,
      required:true,
      default:10,

    },
    createdAssistant:{
      type:Boolean,
      required:true,
      default:false,

    },
  },
  {
    // this second object adds extra properties: `createdAt` and `updatedAt`
    timestamps: true,
  }
);

const User = model("User", userSchema);

module.exports = User;