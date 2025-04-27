import React, { useState } from 'react';
import axios from 'axios';
import styles from './Chatgpt.module.css'; // Dark theme CSS module

const apiUrl = process.env.REACT_APP_API_URL;

function Chatgpt() {
  const [input, setInput] = useState('');
  const [chat, setChat] = useState([]);

  const sendMessage = async () => {
    if (!input.trim()) return; // prevent empty messages

    const newChat = [...chat, { role: 'user', content: input }];
    setChat(newChat);
    setInput('');

    try {
      const res = await axios.post(`${apiUrl}api/chat`, {
        messages: newChat,
      });
      setChat([...newChat, { role: 'assistant', content: res.data.reply }]);
    } catch (err) {
      console.error('Error:', err);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault(); // prevent adding a new line
      sendMessage();
    }
  };

  return (
    <div className={styles.chatContainer}>
      <div className={styles.chatMessages}>
        {chat.map((msg, i) => (
          <p key={i} className={styles.message}>
            <span className={msg.role === 'user' ? styles.user : styles.assistant}>
              {msg.role}:
            </span> {msg.content}
          </p>
        ))}
      </div>
      <div className={styles.inputArea}>
        <input
          className={styles.inputField}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown} // added here!
          placeholder="Ask something..."
        />
        <button className={styles.sendButton} onClick={sendMessage}>
          Send
        </button>
      </div>
    </div>
  );
}

export default Chatgpt;
