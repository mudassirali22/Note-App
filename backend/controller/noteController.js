import { validateNotes } from "../lib/utils.js";
import Note from "../model/Note.js";
import User from "../model/User.js";

// Add Note 
const createNote = async (req, res) => {
  try {

    validateNotes(req);

    const { title, description } = req.body;

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
      user: user._id
    });

    res.status(201).json({
      success: true,
      data: newNote
    });

  } catch (error) {
    return res.status(500).json({
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

    const notes = await Note.find({user: userId}).sort({createdAt: -1});

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
    const { title, description } = req.body;
     
    const userId = req.userId;

    const user = await User.findById(userId).select("-password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized Access"
      });
    }


    const note = await Note.findByIdAndUpdate(
      id,
      { title, description },
      { new: true }
    );


    res.status(200).json({
      success: true,
      message: "Note fetched for edit",
      note,
    });

    } catch (error) {
      res.status(500).json({
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

    // Check if note belongs to user
    const note = await Note.findOne({ _id: id, user: userId });

    if (!note) {
      return res.status(404).json({
        success: false,
        message: "Note not found"
      });
    }

    await Note.findByIdAndDelete(id);

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





export { createNote , allnotes , updateNote , deleteNote};