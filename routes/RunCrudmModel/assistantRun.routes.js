// Import necessary modules
const express = require("express");
const router = express.Router();
const multer = require("multer");
const TTS = require("../../classes/assistant/drive/TTS.js");
const threadMessages = require("../../models/assistantAndThreads/ThreadMessages.model.js");
const fs = require("fs");
const STT = require("../../classes/assistant/drive/STT.js");
const dall = require("../../classes/assistant/drive/ImgGeneration.class.js");
const ImgStore = require("../../models/drive/image.store.model.model.js");
const openaiApikey = process.env.CLOUDAI;
const OpenAI = require("openai");
const openAi = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});
const {
  find,
  threadSummarizer,
  GenDis,
  createNoteEntry,
} = require("../../controller/threadSummarizer.js");
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
    cb(null, "uploads/"); // Files will be saved in the 'uploads' directory. Make sure this directory exists.
  },
  filename: function (req, file, cb) {
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  },
});

const upload = multer({ storage: storage });

router.post("/assistant", upload.single("myFile"), async (req, res) => {
  const user = req.body.id;

  console.log("userId", user);
  const assistant = await Assistant.findOne({ userId: user });
  const currentUser = await User.findById(user);
  const { username, tokens } = currentUser;
  console.log(`toke num : ${tokens}`);
  const { thread, assistantId, runId, userId } = assistant;
  const dbId = await Thread.findOne({ threadId: thread });
  console.log(assistantId);
  console.log(dbId);
  console.log(thread);

  if (tokens < 1) {
    const resIn = `Hey Buddy ${username}, how about you load up some tokens `;
    try {
      const apiKey = process.env.TTS;
      const voiceID = "pNInz6obpgDQGcFmaJgB";
      const tts = new TTS(apiKey);

      const text = "start";
      console.log("Converting response to audio...");
      const audioStream = await tts.generateSpeech(resIn, voiceID);

      const chunks = [];
      audioStream.on("data", (chunk) => chunks.push(chunk));
      audioStream.on("end", async () => {
        const audioBuffer = Buffer.concat(chunks);

        const base64Audio = await audioBuffer.toString("base64");

        // console.log(base64Audio); list CHAT
        const conversation = await threadMessages.find({ userId: user });
        // console.log(conversation);
        return res.send({
          message: "Conversion and saving successful",
          Stream: base64Audio,
        });
      });

      audioStream.on("error", (error) => {
        console.error("Error in audio stream:", error);
        return res.status(500).send("Error in generating speech");
      });
    } catch (error) {
      console.error("Error in route:", error);
      return res.status(500).send("Error in processing request");
    }
  } else {
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
            Authorization: `Bearer ${process.env.OPENAI_API_KEY}`, // Replace with your OpenAI API key
            ...formData.getHeaders(),
          },
        }
      );
      console.log(response.data.text);

      const dataIn = response.data.text;

const date=Date()
console.log(date)
inputIf=`todays date and time ${date} don´t for get the year is 2024 in case if reference needed`


      await threadMessages.create({
        thread_db_reference_id: dbId,
        role: "user",
        message: dataIn,
        userId: user,
      });

      const threadRun = new threadClass();

      try {
        let action;
        let result;
        let resIn;
        let fName;
        let Image;
        await threadRun.createMessage(thread, inputIf);
        await threadRun.createMessage(thread, dataIn);

        const runThread = await threadRun.runThread(thread, assistantId);
        let status = await threadRun.retrieveRun(thread, runThread.id);
        console.log(status);
        while (status.status !== "completed" && status.status !== "failed") {
          await sleep(500);
          status = await threadRun.retrieveRun(thread, runThread.id);
          console.log(status.status);
          //Action RUN

        
          
            // After processing all actions, submit all outputs together
            try {
              const submissionResult = await openAi.beta.threads.runs.submitToolOutputs(thread, runThread.id, {
                tool_outputs: toolOutputs
              });
              console.log("Submission result:", submissionResult);
            } catch (e) {
              console.error("Error submitting tool outputs:", e.message);
              // Handle error appropriately
            }
          }
          
        }

        if (status.status === "completed") {
          try {
            const allThreadMessages = await threadRun.listMessages(thread);

            console.log(allThreadMessages.data[0].content[0].text.value);
            if (fName === "generate_image") {
              resIn =
                "SHAZAM... Don't Forget, you can always recycle your prompt";
            } else {
              resIn = allThreadMessages.data[0].content[0].text.value;
            }

            await threadMessages.create({
              thread_db_reference_id: dbId,
              role: "assistant",
              message: resIn,
              userId: user,
            });

            //stt

            try {
              const apiKey = process.env.TTS;
              const voiceID = "pNInz6obpgDQGcFmaJgB";
              const tts = new TTS(apiKey);

              const text = "start";
              console.log("Converting response to audio...");
              const audioStream = await tts.generateSpeech(resIn, voiceID);

              const chunks = [];
              audioStream.on("data", (chunk) => chunks.push(chunk));
              audioStream.on("end", async () => {
                const audioBuffer = Buffer.concat(chunks);

                const base64Audio = await audioBuffer.toString("base64");
                //console.log(base64Audio);

                //list Chat
                const conversation = await threadMessages.find({
                  userId: user,
                });
                // console.log(conversation);

                res.send({
                  message: "Conversion and saving successful",
                  Stream: base64Audio,
                  image: Image,
                });
              });

              audioStream.on("error", (error) => {
                console.error("Error in audio stream:", error);
                res.status(500).send("Error in generating speech");
              });
            } catch (error) {
              console.error("Error in route:", error);
              res.status(500).send("Error in processing request",error);
            }
          } catch (error) {
            console.log(error);
          }
        } else if (status.status === "failed") {
          res.status(500).send({message:" please try again"});
          console.log(error);
        }
      } catch (error) {
        console.log(error);
      }
    } catch (error) {
      console.error("Error:", error);
      res.status(500).send("Error transcribing audio.");
    } finally {
      // Cleanup: delete the uploaded file from the server
      fs.unlinkSync(req.file.path);
    }
  }
});

router.post("/cancel", async (req, res) => {
  try {
    runid=req.body.runid
    const run = await openAi.beta.threads.runs.cancel(
      "thread_TAOpwnNWziMHECD2GuicYXNv",
      runid,
    );
  } catch (err) {
    console.log(err);
  }
});

module.exports = router;
