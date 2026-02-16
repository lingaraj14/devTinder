const mongoose = require("mongoose");
const { Schema } = mongoose;

const connectionSchema = new Schema(
  {
    fromUserId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    toUserId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    status: {
      type: String,
      required: true,
      enum: {
        values: ["interested", "ignored", "accepted", "rejected"],
        message: "{VALUE} is not supported for status.",
      },
    },
  },
  { timeseries: true },
);

connectionSchema.pre("save", async function () {
  if (this.fromUserId.equals(this.toUserId)) {
    throw new Error("You can't sent connection request you yourself.");
  }
});

const connectionModel = mongoose.model("Connection", connectionSchema);
module.exports = connectionModel;
