const express = require("express");
const router = express.Router();
const multer = require("multer");
const mongoose = require("mongoose");
const { GridFsStorage } = require("multer-gridfs-storage");
const crypto = require("crypto");
const path = require("path");
const Images = require("../../models/drive/image.store.model.model.js");
const threadMessages = require("../../models/assistantAndThreads/ThreadMessages.model.js");

const  addNote = require("../../models/drive/addNote.model.js");

router.post("/chatlog", async (req, res) => {
    try {
    const userId = await req.body.id;
    const conversation = await threadMessages.find({
        userId: userId,
      });
      res.status(200).send({ data: conversation });
    console.log('Success');
} catch (err) {
    res.status(500).send({ data:err})
  
  }
    
  });

router.post("/explore", async (req, res) => {
    try {
  const userId = await req.body.id;
  const images = await Images.find();
  res.status(200).send({ data: images });
  console.log(images);
} catch (err) {
    res.status(500).send({ data:err})
  
  }
});

router.post("/user/images", async (req, res) => {
  try {
    const userId = await req.body.id;
    console.log ('image retrivals')
    const images = await Images.find({ userId: userId });
    res.status(200).send({ data: images });
  } catch (err) {
    res.status(500).send({ data:err})
  
  }
});
router.post("/explore", async (req, res) => {
  try {
   
    const images = await Images.find();
    res.status(200).send({ data: images });
  } catch (err) {
    res.status(500).send({ data:err})
  
  }
});
router.post("/user/images/delete", async (req, res) => {
    try {
      const imageId = req.body.imageId; 
      const deletionResult = await Images.deleteOne({ _id: imageId }); 

      if (deletionResult.deletedCount === 0) {
        return res.status(404).send({ message: "Image not found or already deleted" });
      }
  
      res.status(200).send({ message: "Image deleted successfully" });
    } catch (err) {
      res.status(500).send({ message: "Error deleting image", error: err });
    }
  });

  router.post("/image/share", async (req, res) => {
    try {
      const imageId = req.body.imageId; 
      let state
      if(req.body.share==='true') {
        state=true
      }else if (req.body.share==='false'){
        state=false
      }
      const deletionResult = await Images.findByIdAndUpdate( imageId, {share:state}); 

      if (deletionResult.deletedCount === 0) {
        return res.status(404).send({ message: "Image not found " });
      }
  
      res.status(200).send({ message: " share status updated " });
    } catch (err) {
      res.status(500).send({ message: "Error updating image share status image", error: err });
    }
  });


  
router.post("/user/entry", async (req, res) => {
    try {
      const userId = await req.body.id;
      const entry = await addNote.find({ user: userId });
      console.log(entry);
      res.status(200).send({ data: entry });
    } catch (err) {
      res.status(500).send({ data:err})
    
    }
  });

  router.post("/user/entry/delete", async (req, res) => {
    try {
      const imageId = req.body.entryId;
      const deletionResult = await addNote.deleteOne({ _id: entryId }); 
  
      if (deletionResult.deletedCount === 0) {
        return res.status(404).send({ message: "entry not found or already deleted" });
      }
  
      res.status(200).send({ message: " deleted successfully" });
    } catch (err) {
      res.status(500).send({ message: "Error deleting ", error: err });
    }
  });



module.exports = router;
