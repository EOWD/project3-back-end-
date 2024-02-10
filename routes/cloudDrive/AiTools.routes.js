// Import necessary modules
const express = require("express");
const router = express.Router();
const multer = require("multer");
const TTS = require("../../classes/assistant/drive/TTS.js");
const threadMessages = require("../../models/assistantAndThreads/ThreadMessages.model.js");
const fs = require("fs");
const STT = require("../../classes/assistant/drive/STT.js");
const openaiApikey = process.env.CLOUDAI;
const OpenAI = require("openai");
const openAi = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});
const Thread = require("../../models/assistantAndThreads/Thread.model.js");
const voice = require("elevenlabs-node");
const FormData = require("form-data");
const path = require("path");
const threadClass = require("../../classes/assistant/drive/threads.js");
const VanillaAssistant = require("../../classes/assistant/drive/Assistant.class.js");
const Assistant = require("../../models/assistantAndThreads/Assistant.model.js");
const mongoose = require("mongoose");
const User = require("../../models/User.model.js");
const axios = require("axios");
const assistantInstance = new VanillaAssistant(openaiApikey);
let userId = "";
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Set up multer with memory storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/"); 
  },
  filename: function (req, file, cb) {
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  },
});

const upload = multer({ storage: storage });

router.post("/stt", upload.single("myFile"), async (req, res) => {
  if (!req.file) {
    return res.status(400).send("No file uploaded.");
  }

  const formData = new FormData();
  formData.append("file", fs.createReadStream(req.file.path));
  formData.append("model", "whisper-1");

  try {
    const response = await axios.post(
      "https://api.openai.com/v1/audio/transcriptions",
      formData,
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`, 
          ...formData.getHeaders(),
        },
      }
    );
    console.log(response.data.text);
    res.json(response.data);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Error transcribing audio.");
  } finally {
    // Cleanup: delete the uploaded file from the server
    fs.unlinkSync(req.file.path);
  }
});

router.post("/tts", async (req, res, next) => {
  try {
    const userId =req.body.id
    const text=req.body.text
    const apiKey = process.env.TTS;
    const voiceID = "21m00Tcm4TlvDq8ikWAM";
    const tts = new TTS(apiKey);

    //const text = "start";
    console.log("Converting response to audio...");
    const audioStream = await tts.generateSpeech(text, voiceID);

    const chunks = [];
    audioStream.on("data", (chunk) => chunks.push(chunk));
    audioStream.on("end", async () => {
      const audioBuffer = Buffer.concat(chunks);

      const base64Audio = await audioBuffer.toString("base64");
      //console.log(base64Audio);



      res.send({ audio: base64Audio });
    });

    audioStream.on("error", (error) => {
      console.error("Error in audio stream:", error);
      res.status(500).send("Error in generating speech");
    });
  } catch (error) {
    console.error("Error in route:", error);
    res.status(500).send("Error in processing request");
  }
});

router.get("/test1", async (req, res, next) => {
  try {
   
   
  } catch (error) {
    console.error("Error in route:", error);
    res.status(500).send("Error in processing request");
  }
});
module.exports = router;
