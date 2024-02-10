const { Schema, model } = require("mongoose");

const imgSchema = new Schema(
  {
    userId: {
      type: String,
    },
    name: { type: String },
    prompt: {
      type: String,
    },
    imageData: {
      type: String,
    },
    price: {
      type: Number,
      default: 0,
    },
    share: {
      type: Boolean,
      default: false,
    },
    forSale: {
      type: Boolean,
      default: false,
    },
    user: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  {
    // this second object adds extra properties: `createdAt` and `updatedAt`
    timestamps: true,
  }
);

const ImageStore = model("ImageData", imgSchema);

module.exports = ImageStore;
