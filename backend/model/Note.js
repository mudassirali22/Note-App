import mongoose from "mongoose";

const noteSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      minLength: 3,
      maxLength: 50,
      trim: true,
      lowercase: true,
    },

    description: {
      type: String,
      required: true,
      minLength: 10,
      maxLength: 500,
      trim: true,
    },

    category: {
      type: String,
      enum: ["Personal", "Work", "Ideas", "Study"],
      default: "Personal",
    },

    isPinned: {
      type: Boolean,
      default: false,
    },

    isArchived: {
      type: Boolean,
      default: false,
    },

    isDeleted: {
      type: Boolean,
      default: false,
    },

    image: {
      type: String,
      default: null,
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Note = mongoose.model("Note", noteSchema);

export default Note;