const express = require('express');
const { OpenAI } = require('openai');
const { Chat } = require('../models');
const router = express.Router();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// FAQ data for context
const faqData = [
  {
    question: 'What is AI-powered text-to-image generation?',
    answer: 'AI-powered text-to-image generation is a process that uses advanced algorithms and machine learning models to create visual images based on descriptive text provided by the user.'
  },
  {
    question: 'How does your service work?',
    answer: 'Our service utilizes AI models that analyze your text description and generate images that match your description. The process involves natural language processing and image generation using neural networks.'
  },
  {
    question: 'What kind of texts can I use to generate images?',
    answer: 'You can use any descriptive text that clearly outlines the scene, object, or concept you want to visualize. The more detailed and specific the description, the more accurate the resulting image will be.'
  },
  {
    question: 'How long does it take to generate an image?',
    answer: 'The time to generate an image can vary depending on the complexity of the description and the current load on our system. It typically takes a few minutes.'
  },
  {
    question: 'Are the generated images unique?',
    answer: 'Yes, each generated image is unique and created based on your specific text description. This ensures you receive an original image tailored to your requirements.'
  },
  {
    question: 'Can I use the generated images for commercial purposes?',
    answer: 'This depends on the licensing terms of our service. Please read our terms of use and licensing agreements for more information on commercial use.'
  },
  {
    question: 'What image formats are available?',
    answer: 'Images are generated in PNG or JPEG format, according to your preference.'
  },
  {
    question: 'What if I am not satisfied with the generated image?',
    answer: 'If you are not satisfied with the result, you can enter a new text description and generate a new image. You can also contact our customer support for assistance.'
  },
  {
    question: 'How can I contact support?',
    answer: 'You can reach our customer support via email on support@virtuartai.com.'
  },
  {
    question: 'Are my text descriptions and generated images stored?',
    answer: 'Your text descriptions and generated images are stored in accordance with our privacy policy. You can be assured that your data is securely protected.'
  },
  {
    question: 'Can you generate images for any type of description?',
    answer: 'Our AI can generate images for a wide range of descriptions, but it may have limitations with very abstract or vague descriptions. We recommend providing as specific and detailed descriptions as possible.'
  },
  {
    question: 'How can I start using your service?',
    answer: 'To get started, simply register on our website, enter your text description, and click the button to generate an image. It\'s easy and quick!'
  }
];

// Get all chat sessions for a user
router.get('/chats/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const chats = await Chat.find({ userId })
      .sort({ updatedAt: -1 })
      .select('_id title createdAt updatedAt messages')
      .lean();

    // Add message count to each chat
    const chatsWithCount = chats.map(chat => ({
      ...chat,
      messageCount: chat.messages ? chat.messages.length : 0
    }));

    res.json({ chats: chatsWithCount });
  } catch (error) {
    console.error('Error fetching chats:', error);
    res.status(500).json({ error: 'Failed to fetch chats' });
  }
});

// Get a specific chat with all messages
router.get('/chat/:chatId', async (req, res) => {
  try {
    const { chatId } = req.params;
    const chat = await Chat.findById(chatId).lean();
    
    if (!chat) {
      return res.status(404).json({ error: 'Chat not found' });
    }

    res.json({ chat });
  } catch (error) {
    console.error('Error fetching chat:', error);
    res.status(500).json({ error: 'Failed to fetch chat' });
  }
});

// Create a new chat session
router.post('/chat/new', async (req, res) => {
  try {
    const { userId, title = 'New Chat' } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    const newChat = new Chat({
      userId,
      title,
      messages: []
    });

    await newChat.save();
    res.json({ chat: newChat });
  } catch (error) {
    console.error('Error creating chat:', error);
    res.status(500).json({ error: 'Failed to create chat' });
  }
});

// Send a message in a chat
router.post('/chat/:chatId/message', async (req, res) => {
  try {
    const { chatId } = req.params;
    const { message, userId } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({ error: 'Chat not found' });
    }

    // Add user message
    const userMessage = {
      role: 'user',
      content: message,
      timestamp: new Date()
    };
    chat.messages.push(userMessage);

    // Prepare context for OpenAI
    const allMessages = chat.messages.map(msg => ({
      role: msg.role,
      content: msg.content
    }));

    const prompt = 'context:\n\n' + JSON.stringify(faqData) + 
      '\n\nbased on the following conversation, generate a response as if you are the assistant. \n\n' + 
      allMessages.map(msg => `${msg.role}: ${msg.content}`).join('\n');

    // Get AI response
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'assistant', content: prompt }]
    });

    // Add assistant message
    const assistantMessage = {
      role: 'assistant',
      content: completion.choices[0].message.content,
      timestamp: new Date()
    };
    chat.messages.push(assistantMessage);

    // Update chat title if it's the first message
    if (chat.messages.length === 2 && chat.title === 'New Chat') {
      chat.title = message.length > 50 ? message.substring(0, 50) + '...' : message;
    }

    chat.updatedAt = new Date();
    await chat.save();

    res.json({ 
      userMessage, 
      assistantMessage,
      chatTitle: chat.title
    });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

// Delete a chat
router.delete('/chat/:chatId', async (req, res) => {
  try {
    const { chatId } = req.params;
    const { userId } = req.body;

    const chat = await Chat.findOne({ _id: chatId, userId });
    if (!chat) {
      return res.status(404).json({ error: 'Chat not found' });
    }

    await Chat.findByIdAndDelete(chatId);
    res.json({ message: 'Chat deleted successfully' });
  } catch (error) {
    console.error('Error deleting chat:', error);
    res.status(500).json({ error: 'Failed to delete chat' });
  }
});

// Update chat title
router.put('/chat/:chatId/title', async (req, res) => {
  try {
    const { chatId } = req.params;
    const { title, userId } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ error: 'Title is required' });
    }

    const chat = await Chat.findOne({ _id: chatId, userId });
    if (!chat) {
      return res.status(404).json({ error: 'Chat not found' });
    }

    chat.title = title.trim();
    chat.updatedAt = new Date();
    await chat.save();

    res.json({ message: 'Chat title updated successfully', title: chat.title });
  } catch (error) {
    console.error('Error updating chat title:', error);
    res.status(500).json({ error: 'Failed to update chat title' });
  }
});

module.exports = router; 