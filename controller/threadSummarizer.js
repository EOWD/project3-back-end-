const openai = require('openai');
const mongoose = require('mongoose');
const openaiApi = new openai.OpenAI();
const axios =require( "axios")
const NoteEntry =require('../models/drive/addNote.model');

async function threadSummarizer(message) {
  const completion = await openaiApi.chat.completions.create({
    messages: [{"role": "user", "content": "Summarize the next Message in max. 40 characters (It will be the chat Title):"},
        {"role": "user", "content": message}],
    model: "gpt-3.5-turbo",
  });

  return completion.choices[0].message.content;
}
async function GenDis (message) {
  const completion = await openaiApi.chat.completions.create({
    messages: [{"role": "user", "content": "convert the next message into a detail photo description add details as you see fit in max. 500 characters (It will be the image generation prompt):"},
        {"role": "user", "content": message}],
    model: "gpt-3.5-turbo",
  });

  return completion.choices[0].message.content;
}
async function createNoteEntry(user, date, entry ,entryKind,time,entryName) {
  try {
    const newEntry = await NoteEntry.create({
      user,
      date,
      entry,
      entryKind,
     time,
     entryName
    });
   
    console.log('Diary entry created successfully:', newEntry);
    return newEntry;
  } catch (error) {
    console.error('Error creating diary entry:', error);
    throw error; // Or handle the error as needed
  }
}
async function find(date) {
  try {
    const eventFound = await NoteEntry.find({date: date});
   
    console.log('Diary entry created successfully:', eventFound);
    const eventsObject=eventFound.filter((one)=>{one.entrykind==="calendar"})
    return eventsObject;
  } catch (error) {
    console.error('Error creating diary entry:', error);
    throw error; // Or handle the error as needed
  }
}
const getVoices = async () => {
  const API_URL = 'https://api.elevenlabs.io/v1/voices';
  const apiKey = process.env.TTS;
console.log(apiKey)
  try {
// This will log the response from the API
  } catch (error) {
    console.error('Error fetching voice IDs:', error);
  }
};

getVoices();
module.exports = {
  find,
  threadSummarizer,
  GenDis,
  createNoteEntry,
};