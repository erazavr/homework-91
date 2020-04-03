const express = require('express');

const auth = require('../middleware/auth');
const Message = require('../models/Message');

const router = express.Router();
router.get('/', async (req,res) => {
   const messages = await Message.find().populate('user');
   res.send(messages)
});
router.post('/', [auth],async (req, res) => {
   const messageData = req.body;
   if (!messageData.user) {
       messageData.user = req.user._id
   }
   const message = new Message(messageData);
   try {
       await message.save();
       return res.send(message)
   } catch (error) {
       res.status(400).send({error})
   }
});

module.exports = router;