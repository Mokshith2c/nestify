const mongoose = require("mongoose");
const { Schema } = mongoose;

const profileSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    bio: {
      type: String,
      default: "",
      maxlength: 500,
    },
    avatar: {
      url: {
        type: String,
        default:
            "https://images.unsplash.com/vector-1758589026240-001260402d98?q=80&w=1267&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
      },
      filename: {
        type: String,
        default: "profile-avatar",
      },
    },
  },
  { timestamps: true }
);

const Profile = mongoose.model("Profile", profileSchema);
module.exports = Profile;
