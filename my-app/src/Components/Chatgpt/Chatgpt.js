import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import styles from './Chatgpt.module.css';

const apiUrl = process.env.REACT_APP_API_URL;

function Chatgpt() {
  const [input, setInput] = useState('');
  const [currentChat, setCurrentChat] = useState(null);
  const [chatHistory, setChatHistory] = useState([]);
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [editingTitle, setEditingTitle] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const messagesEndRef = useRef(null);

  // Get user from localStorage
  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user'));
    if (storedUser && storedUser._id) {
      setUser(storedUser);
      loadChatHistory(storedUser._id);
    }
  }, []);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    // Only scroll if there are messages and the messagesEndRef exists
    if (messagesEndRef.current && messages.length > 0) {
      const messagesContainer = messagesEndRef.current.closest('.messagesContainer');
      if (messagesContainer) {
        // Scroll the messages container, not the entire page
        messagesContainer.scrollTo({
          top: messagesContainer.scrollHeight,
          behavior: 'smooth'
        });
      } else {
        // Fallback to the ref method but with more control
        messagesEndRef.current.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'end',
          inline: 'nearest'
        });
      }
    }
  };

  const loadChatHistory = async (userId) => {
    try {
      const response = await axios.get(`${apiUrl}api/chats/${userId}`);
      setChatHistory(response.data.chats);
    } catch (error) {
      console.error('Error loading chat history:', error);
    }
  };

  const createNewChat = async () => {
    if (!user) return;

    try {
      const response = await axios.post(`${apiUrl}api/chat/new`, {
        userId: user._id,
        title: 'New Chat'
      });
      
      const newChat = response.data.chat;
      setCurrentChat(newChat);
      setMessages([]);
      setChatHistory(prev => [newChat, ...prev]);
    } catch (error) {
      console.error('Error creating new chat:', error);
    }
  };

  const loadChat = async (chatId) => {
    try {
      const response = await axios.get(`${apiUrl}api/chat/${chatId}`);
      const chat = response.data.chat;
      setCurrentChat(chat);
      setMessages(chat.messages || []);
    } catch (error) {
      console.error('Error loading chat:', error);
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || isLoading || !user) return;

    // If no current chat, create one
    if (!currentChat) {
      await createNewChat();
      return;
    }

    const messageText = input.trim();
    setInput('');
    setIsLoading(true);

    // Add user message to UI immediately
    const userMessage = {
      role: 'user',
      content: messageText,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);

    try {
      const response = await axios.post(`${apiUrl}api/chat/${currentChat._id}/message`, {
        message: messageText,
        userId: user._id
      });

      const { assistantMessage, chatTitle } = response.data;
      
      // Add assistant message
      setMessages(prev => [...prev, assistantMessage]);

      // Update chat title in history if it changed
      if (chatTitle !== currentChat.title) {
        setCurrentChat(prev => ({ ...prev, title: chatTitle }));
        setChatHistory(prev => 
          prev.map(chat => 
            chat._id === currentChat._id 
              ? { ...chat, title: chatTitle, updatedAt: new Date() }
              : chat
          )
        );
      }

    } catch (error) {
      console.error('Error sending message:', error);
      // Remove the user message on error
      setMessages(prev => prev.slice(0, -1));
    } finally {
      setIsLoading(false);
    }
  };

  const deleteChat = async (chatId, e) => {
    e.stopPropagation();
    if (!user) return;

    try {
      await axios.delete(`${apiUrl}api/chat/${chatId}`, {
        data: { userId: user._id }
      });
      
      setChatHistory(prev => prev.filter(chat => chat._id !== chatId));
      
      if (currentChat && currentChat._id === chatId) {
        setCurrentChat(null);
        setMessages([]);
      }
    } catch (error) {
      console.error('Error deleting chat:', error);
    }
  };

  const startEditingTitle = (chat, e) => {
    e.stopPropagation();
    setEditingTitle(chat._id);
    setEditTitle(chat.title);
  };

  const saveTitle = async (chatId) => {
    if (!user || !editTitle.trim()) return;

    try {
      await axios.put(`${apiUrl}api/chat/${chatId}/title`, {
        title: editTitle.trim(),
        userId: user._id
      });

      setChatHistory(prev =>
        prev.map(chat =>
          chat._id === chatId
            ? { ...chat, title: editTitle.trim() }
            : chat
        )
      );

      if (currentChat && currentChat._id === chatId) {
        setCurrentChat(prev => ({ ...prev, title: editTitle.trim() }));
      }

      setEditingTitle(null);
      setEditTitle('');
    } catch (error) {
      console.error('Error updating title:', error);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    return date.toLocaleDateString();
  };

  if (!user) {
    return (
      <div className={styles.loginPrompt}>
        <h2>Please log in to use the chat feature</h2>
        <p>You need to be logged in to save and access your chat history.</p>
      </div>
    );
  }

  return (
    <div className={styles.chatContainer}>
      {/* Sidebar */}
      <div className={`${styles.sidebar} ${sidebarOpen ? styles.sidebarOpen : styles.sidebarClosed}`}>
        <div className={styles.sidebarHeader}>
          <button 
            className={styles.toggleSidebar}
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? '←' : '→'}
          </button>
          {sidebarOpen && (
            <button className={styles.newChatBtn} onClick={createNewChat}>
              + New Chat
            </button>
          )}
        </div>

        {sidebarOpen && (
          <div className={styles.chatHistoryList}>
            {chatHistory.map((chat) => (
              <div
                key={chat._id}
                className={`${styles.chatHistoryItem} ${
                  currentChat && currentChat._id === chat._id ? styles.activeChatItem : ''
                }`}
                onClick={() => loadChat(chat._id)}
              >
                {editingTitle === chat._id ? (
                  <input
                    className={styles.titleEdit}
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    onBlur={() => saveTitle(chat._id)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') saveTitle(chat._id);
                      if (e.key === 'Escape') {
                        setEditingTitle(null);
                        setEditTitle('');
                      }
                    }}
                    autoFocus
                    onClick={(e) => e.stopPropagation()}
                  />
                ) : (
                  <>
                    <div className={styles.chatInfo}>
                      <div className={styles.chatTitle}>{chat.title}</div>
                      <div className={styles.chatDate}>{formatDate(chat.updatedAt)}</div>
                    </div>
                    <div className={styles.chatActions}>
                      <button
                        className={styles.editBtn}
                        onClick={(e) => startEditingTitle(chat, e)}
                        title="Edit title"
                      >
                        ✏️
                      </button>
                      <button
                        className={styles.deleteBtn}
                        onClick={(e) => deleteChat(chat._id, e)}
                        title="Delete chat"
                      >
                        🗑️
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Main Chat Area */}
      <div className={styles.mainChatArea}>
        <div className={styles.chatHeader}>
          <h2>{currentChat ? currentChat.title : 'VirtAI Assistant'}</h2>
          {!sidebarOpen && (
            <button 
              className={styles.toggleSidebar}
              onClick={() => setSidebarOpen(true)}
            >
              →
            </button>
          )}
        </div>

        <div className={`${styles.messagesContainer} messagesContainer`}>
          {!currentChat ? (
            <div className={styles.welcomeMessage}>
              <div className={styles.welcomeIcon}>🤖</div>
              <h3>Welcome to VirtAI Assistant</h3>
              <p>I'm here to help you with questions about our AI-powered image generation services. Start a conversation by typing your question below!</p>
              <div className={styles.sampleQuestions}>
                <div className={styles.sampleQuestion} onClick={() => setInput("How does AI image generation work?")}>
                  How does AI image generation work?
                </div>
                <div className={styles.sampleQuestion} onClick={() => setInput("What image formats do you support?")}>
                  What image formats do you support?
                </div>
                <div className={styles.sampleQuestion} onClick={() => setInput("How can I get started?")}>
                  How can I get started?
                </div>
              </div>
            </div>
          ) : (
            <>
              {messages.map((msg, i) => (
                <div key={i} className={`${styles.message} ${styles[msg.role]}`}>
                  <div className={styles.messageContent}>
                    <div className={styles.messageText}>{msg.content}</div>
                    <div className={styles.messageTime}>
                      {formatTime(msg.timestamp)}
                    </div>
                  </div>
                </div>
              ))}
              
              {isLoading && (
                <div className={`${styles.message} ${styles.assistant}`}>
                  <div className={styles.messageContent}>
                    <div className={styles.typingIndicator}>
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        <div className={styles.inputArea}>
          <div className={styles.inputContainer}>
            <textarea
              className={styles.inputField}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={currentChat ? "Type your message..." : "Start a conversation..."}
              rows={1}
              disabled={isLoading}
            />
            <button 
              className={styles.sendButton} 
              onClick={sendMessage}
              disabled={!input.trim() || isLoading}
            >
              {isLoading ? '⏳' : '➤'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Chatgpt;
