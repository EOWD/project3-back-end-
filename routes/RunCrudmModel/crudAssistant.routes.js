const express = require("express");
const router = express.Router();
const threadClass = require("../../classes/assistant/drive/threads.js");
const threadMessages = require("../../models/assistantAndThreads/ThreadMessages.model.js");
const Thread = require("../../models/assistantAndThreads/Thread.model.js");
const VanillaAssistant = require("../../classes/assistant/drive/Assistant.class.js");
const Assistant = require("../../models/assistantAndThreads/Assistant.model.js");
const File = require("../../classes/assistant/drive/Files.class.js");
const mongoose = require("mongoose");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const {threadSummarizer} = require("../../controller/threadSummarizer.js");
const mapTools = require("../../controller/mapAssitantTool.js");
const User = require("../../models/User.model.js");
const STT = require("../../classes/assistant/drive/STT.js");
const axios = require("axios");
const TTS = require("../../classes/assistant/drive/TTS.js");
const openaiApikey = process.env.CLOUDAI;
const assistantInstance = new VanillaAssistant(openaiApikey);
let userId = "";
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
// Configure multer to save files to disk
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // replace 'temp_uploads/' with the path to your temporary directory
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage: storage });
const filer = new File(openaiApikey);

router.post("/create", upload.array("files", 20), async (req, res, next) => {
  try {
    const userId = req.body;
    
    const id = req.body.id;
    console.log(id)
    const user=await User.findById(id);
    console.log(user.username,user._id)
    console.log;
    const toolsFormatted = mapTools(req.body.tools);

    let fileIds = [];
    if (req.files && req.files.length > 0) {
      const uploadPromises = req.files.map((file) => {
        const filePath = file.path;

        return filer
          .uploadFile(filePath, "assistants")
          .then((uploadSingleFile) => {
            // Delete file from temp_files folder after upload
            fs.unlink(filePath, (err) => {
              if (err) console.error("Error deleting temp file:", err);
            });
            return uploadSingleFile;
          });
      });

      const uploadedFiles = await Promise.all(uploadPromises);
      fileIds = uploadedFiles.map((file) => file.id);

      // if one fails
      for (const result of uploadedFiles) {
        if (result.status === "rejected") {
          console.log("error", { error: result.reason });
        }
      }
    }


    
    const str = id.toString();
    console.log(typeof id);
    console.log();
    const thread = new threadClass();
    let message = "you are to assist on any given domain or topic ";
    let threadTitle = await threadSummarizer(message);
    threadTitle = threadTitle.replace(/^"|"$/g, "");

    console.log(threadTitle);
    const createRun = await thread.createThreadAndRun(
      createAssistantResponse.id,
      message
    );

    const newThread = await Thread.create({
      threadId: createRun.thread_id,
      assistantId: createAssistantResponse.id,
      threadTitle: threadTitle,
      userId: id,
    });

    await threadMessages.create({
      thread_db_reference_id: newThread._id,
      role: "user",
      message: message,
      userId: id,
    });

    await Assistant.create({
      assistantId: createAssistantResponse.id,
      name: createAssistantResponse.name,
      model: createAssistantResponse.model,
      description: createAssistantResponse.description,
      instructions: createAssistantResponse.instructions,
      file_ids: fileIds,
      image_url: req.body.image_url,
      thread: createRun.thread_id,
      runId: createRun.id,
      userId: id,
    });
    const allThreadMessages = await thread.listMessages(createRun.thread_id);
    console.log(allThreadMessages.data[0].content[0].text.value);
await User.findByIdAndUpdate(id,{ createdAssistant: true } )

    res.status(200).json({ status: "created successfully" });
  } catch (error) {
    console.log("error", { error });
  }
});


//done 
router.post("/assistant/edit", async (req, res) => {
  try {
   const name= req.body.name
    const description= req.body.description
    const instructions = req.body.instructions
    const user = req.body.id;
    const assistant = await Assistant.findOne({ userId: user });
    const { thread, assistantId, runId, userId } = assistant;
   console.log(assistantId)
    

    await assistantInstance.modifyAssistant(assistantId, name, description, instructions) 
  
  
    
    
    // Update the assistant in your database
    console.log('done');
    //modifyAssistant()

    // Redirect to a confirmation page or back to the assistant edit page
    
  } catch (error) {
    console.error("Error updating assistant:", error);
    res.render("error", { error });
  }
});

router.get("/assistant/delete/:id", async (req, res, next) => {
  const assistantId = req.params.id;

  try {
    // Retrieve the assistant to get the file IDs
    const assistant = await Assistant.findOne({ assistantId: assistantId });
    if (!assistant) {
      throw new Error("Assistant not found");
    }

    // Delete each file associated with the assistant
    if (assistant.file_ids && assistant.file_ids.length > 0) {
      for (const fileId of assistant.file_ids) {
        await filer.deleteFile(fileId);
      }
    }

    // Now delete the assistant from OpenAI and your database
    await assistantInstance.deleteAssistant(assistantId);
    await Assistant.findOneAndDelete({ assistantId: assistantId });

    res.redirect("/assistant");
  } catch (error) {
    res.render("error", { error });
  }
});

router.get("/assistant", async (req, res) => {
  try {
    userId = req.session.currentUser._id;
    const listAllAssistants = await assistantInstance.listAssistants();
    const selectedAssistant = listAllAssistants[0]
      ? listAllAssistants[0].id
      : "";
    const listOpenaiAssistants = await assistantInstance.listOpenaiAssistants();
    //console.log(listAllAssistants)
    res.render("profile/assistant", {
      listAll: listAllAssistants,
      selectedAssistant,
      listOpenaiAssistants,
    });
  } catch (error) {
    res.render("error", { error });
  }
});

module.exports = router;
