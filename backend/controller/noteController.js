import { validateNotes } from "../lib/utils.js";
import Note from "../model/Note.js";
import User from "../model/User.js";

// Add Note 
const createNote = async (req, res) => {
  try {

    validateNotes(req);

    const { title, description, category, isPinned } = req.body;

    const userId = req.userId;

    const user = await User.findById(userId).select("-password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized Access"
      });
    }

    const newNote = await Note.create({
      title,
      description,
      category,
      isPinned,
      user: user._id
    });

    res.status(201).json({
      success: true,
      data: newNote
    });

  } catch (error) {
    const statusCode = error.message === "Title and description are required." || error.name === "ValidationError" ? 400 : 500;
    return res.status(statusCode).json({
      success: false,
      message: error.message
    });
  }
};


const allnotes = async (req, res) => {
    try {
        
    const userId = req.userId;

    const user = await User.findById(userId).select("-password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized Access"
      });
    }

    const notes = await Note.find({ user: userId }).sort({ isPinned: -1, updatedAt: -1 });

     return res.status(200).json({
      success: true,
      count: notes.length,
      notes,
    });

    } catch (error) {
    return res.status(401).json({
      success: false,
      message: error.message
    });
    }
}

// Edit Note 
const updateNote = async (req, res) => {
    try {
     const {id} = req.params;
    const { title, description, category, isPinned, isArchived, isDeleted } = req.body;
     
    const userId = req.userId;

    const user = await User.findById(userId).select("-password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized Access"
      });
    }


    const updates = {};
    if (title !== undefined) updates.title = title;
    if (description !== undefined) updates.description = description;
    if (category !== undefined) updates.category = category;
    if (isPinned !== undefined) updates.isPinned = isPinned;
    if (isArchived !== undefined) updates.isArchived = isArchived;
    if (isDeleted !== undefined) updates.isDeleted = isDeleted;
    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ success: false, message: "Provide at least one note field to update." });
    }

    const note = await Note.findOneAndUpdate(
      { _id: id, user: userId },
      updates,
      { new: true, runValidators: true }
    );

    if (!note) {
      return res.status(404).json({
        success: false,
        message: "Note not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Note fetched for edit",
      note,
    });

    } catch (error) {
      const statusCode = error.name === "ValidationError" ? 400 : 500;
      res.status(statusCode).json({
      success: false,
      message: error.message,
    });
    }
}


// Delete Note 
// Delete Note
const deleteNote = async (req, res) => {
  try {

    const { id } = req.params;
    const userId = req.userId;

    const user = await User.findById(userId).select("-password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized Access"
      });
    }

    const note = await Note.findOne({ _id: id, user: userId, isDeleted: { $ne: true } });

    if (!note) {
      return res.status(404).json({
        success: false,
        message: "Note not found"
      });
    }

    note.isDeleted = true;
    note.isArchived = false;
    note.isPinned = false;
    await note.save();

    return res.status(200).json({
      success: true,
      message: "Note deleted successfully"
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const restoreNote = async (req, res) => {
  try {
    const note = await Note.findOneAndUpdate(
      { _id: req.params.id, user: req.userId, isDeleted: true },
      { isDeleted: false, isArchived: false },
      { new: true }
    );
    if (!note) {
      return res.status(404).json({ success: false, message: "Deleted note not found." });
    }
    return res.status(200).json({ success: true, message: "Note restored.", note });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const permanentlyDeleteNote = async (req, res) => {
  try {
    const note = await Note.findOneAndDelete({
      _id: req.params.id,
      user: req.userId,
      isDeleted: true,
    });
    if (!note) {
      return res.status(404).json({ success: false, message: "Deleted note not found." });
    }
    return res.status(200).json({ success: true, message: "Note permanently deleted." });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const emptyTrash = async (req, res) => {
  try {
    const result = await Note.deleteMany({ user: req.userId, isDeleted: true });
    return res.status(200).json({
      success: true,
      message: "Trash emptied.",
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export { createNote, allnotes, updateNote, deleteNote, restoreNote, permanentlyDeleteNote, emptyTrash };