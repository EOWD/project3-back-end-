const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const diaryEntrySchema = new Schema({
    user:{
        type:String,
        required:true
    },
  date: {
    type: String,
    required: true
  },
  entry: {
    type: String,
    required: true
  },
  time: {
    type: String,
    
  },
  entryName: {
    type: String,
    
  },
  entryKind: {
    type: String,
    required: true,
    enum: ['note', 'diary', 'calendar']
  }
}, { timestamps: true });

const NoteEntry = mongoose.model('NoteEntry', diaryEntrySchema);

module.exports = NoteEntry;
