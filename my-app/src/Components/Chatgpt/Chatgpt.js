import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import styles from './Chatgpt.module.css';

// Image assets (Figma export)
const imgTexture = "http://localhost:3845/assets/a94c83d1539778b55baf631c6aea127af3ff4bab.png";
const imgDownloadapp1 = "http://localhost:3845/assets/a399d8e3dcbbee80ec30544fad106ada678825b1.png";
const imgVituartAiWordMarkVector1 = "http://localhost:3845/assets/83dc0e4c52fe83ab4b5094f07ce3d5a251dbba84.svg";
const imgPricing011 = "http://localhost:3845/assets/0007086edb27dbb802e01f50d55c69f8f779b9eb.svg";
const imgPolygon3 = "http://localhost:3845/assets/008cce32b90973ec1dbe244e70cfee8bc2307f27.svg";
const imgNewChatIcon = "http://localhost:3845/assets/89cfb4b6af555971af1bab48287fcd45c7d4756c.svg";
const imgGroup = "http://localhost:3845/assets/2e73036addfdb9c305eb9b667ee929c8ac10360e.svg";
const imgGroup1 = "http://localhost:3845/assets/75b635b62abb72d385cb09f812bda73ddffdd085.svg";
const imgGroup2 = "http://localhost:3845/assets/9a4856d8f163142fbc6f34089b0899b8f74aa1a4.svg";
const imgGroup3 = "http://localhost:3845/assets/414f3f61ead6a2ac6f9ee6fdddc98a46a7adbf82.svg";
const imgGroup4 = "http://localhost:3845/assets/b38a222fbd5b55013406900471e00440724cc06a.svg";
const imgGroup5 = "http://localhost:3845/assets/9305822bc81ee3029103920ff9a61e5b46cf53c2.svg";
const imgGroup6 = "http://localhost:3845/assets/70bf581384bf53147e7b6802601eff55d6c3e10b.svg";
const imgVector = "http://localhost:3845/assets/e18085e76b3c562b6cb2da170805c9f098ca3138.svg";
const imgGroup7 = "http://localhost:3845/assets/1b4af2a0d20dcb84929fdc7a9aa119f00532f252.svg";
const imgGroup8 = "http://localhost:3845/assets/aab2c68b1d9dba187c18fa0fbdd22679ff9534c4.svg";
const imgVector1 = "http://localhost:3845/assets/a65c85a9ce7d6909ec69714c25d51efaa35fba17.svg";
const imgGroup9 = "http://localhost:3845/assets/2bc973069a5967b8b3fa8d3895216de0afe26a47.svg";
const imgVituartAiWordMarkVector2 = "http://localhost:3845/assets/76fd1b23a8a42ca91b354f19ec82842578fe9e44.svg";
const imgLine7 = "http://localhost:3845/assets/48bc0c22c4b809d20edf273c81acfd46253b7726.svg";
const imgLine8 = "http://localhost:3845/assets/80a6592340a2fc69f05c4f82411867caffa776d9.svg";
const imgLine9 = "http://localhost:3845/assets/acaad94ca68876a2f371449201fc6c3b887980c1.svg";
const imgLine24 = "http://localhost:3845/assets/39e3dce783a41a0aad18e366332606376405cf1b.svg";
const imgCheckmark1 = "http://localhost:3845/assets/7f1ce1a710ffa00a474a8d2d823f968aba98c9bf.svg";
const imgArrow2 = "http://localhost:3845/assets/5b576b90578aa41c1639ff6bf377e04595d41ca4.svg";
const imgEllipse6 = "http://localhost:3845/assets/f4a89a9066001e0be74e140166bb289b565c410c.svg";
const imgGroup88 = "http://localhost:3845/assets/30d16caf5140e55b9db3dbe0c4da8666ee1eeb90.svg";
const imgGroup10 = "http://localhost:3845/assets/9b0b9fdd031f6fcf9bcb1177b7b144e1c075af76.svg";
const imgEllipse7 = "http://localhost:3845/assets/b3ebe70060b10455266854f8ff5f6f6991a42a71.svg";
const imgGroup11 = "http://localhost:3845/assets/81853a9114e49420254b06b9e82479f08399f185.svg";
const imgGroup91 = "http://localhost:3845/assets/9ced641531769791108b261cfc4eaa5b02a31d21.svg";
const imgLine29 = "http://localhost:3845/assets/dbc49e3123c4f615ef5bb5c555cb4d5e208ba440.svg";
const imgGroup12 = "http://localhost:3845/assets/d3ca43e139547a8bb6d2b12f19fbd7fad3d7f9d8.svg";

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

  // Replace the return with the Figma desktop layout as main render
  return (
    <div style={{ position: 'relative', minHeight: '100vh', background: '#000' }} data-name="Chat Page Desktop">
      {/* HEADER */}
      <div style={{ position: 'absolute', left: 0, top: 0, right: 0, height: 70, background: '#181818', boxShadow: '0px 4px 4px 0px rgba(0,0,0,0.25)', zIndex: 100 }}> {/* Header bar */}
        {/* Logo */}
        <div style={{ position: 'absolute', left: 32, top: 22, height: 26, width: 225.332 }}>
          <img src={imgVituartAiWordMarkVector1} alt="VituartAI" style={{ height: '100%' }} />
        </div>
        {/* Center nav */}
        <div style={{ position: 'absolute', left: 'calc(50% - 332px)', top: 23, color: '#999', fontWeight: 400, fontFamily: 'Poppins, Inter, sans-serif', fontSize: 16, textTransform: 'uppercase', letterSpacing: 1.6 }}>
          <span>Home&nbsp;AI Tools&nbsp;Creation&nbsp;Gallery&nbsp;Pricing&nbsp;FAQ&nbsp;</span><span style={{ color: 'seagreen' }}>Chat AI</span>
        </div>
        {/* Right - My Account */}
        <div style={{ position: 'absolute', top: 0, right: 32, display: 'flex', alignItems: 'center', height: 70 }}>
          <div style={{color: 'seagreen', fontFamily: 'Poppins, sans-serif', fontSize: 16, marginRight: 24, textTransform: 'uppercase'}}>MY ACCOUNT</div>
          <div style={{color: '#999', fontFamily: 'Poppins, sans-serif', fontSize: 16, marginRight: 8, textTransform: 'uppercase'}}>100</div>
          <img src={imgPricing011} alt="pricing" style={{height: 17, width: 24.933, marginRight: 10, objectFit: 'contain'}} />
          <img src={imgPolygon3} alt="dropdown" style={{width: 14, height: 7, display: 'block'}} />
        </div>
      </div>

      {/* LEFT SIDEBAR */}
      <div style={{ position: 'absolute', top: 102, left: 32, width: 300, height: 634, borderRadius: 7, background: '#333', zIndex: 10, padding: '15px 20px' }}>
        {/* New Chat */}
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 20, cursor: 'pointer' }} onClick={createNewChat}>
          <img src={imgNewChatIcon} alt="new chat" style={{ width: 20, height: 20, marginRight: 12, objectFit: 'contain' }} />
          <div style={{ color: '#fff', fontFamily: 'Poppins, sans-serif', fontSize: 16 }}>New Chat</div>
        </div>
        <div style={{ borderBottom: '1px solid #666', marginBottom: 20 }} />

        {/* History Section */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ color: '#fff', fontFamily: 'Poppins, sans-serif', fontSize: 16, marginBottom: 12 }}>History</div>
          <div style={{ background: '#666', borderRadius: 7, padding: '8px 12px', marginBottom: 12, display: 'flex', alignItems: 'center' }}>
            <img src={imgVector} alt="search" style={{ width: 18, height: 18, marginRight: 10, objectFit: 'contain' }} />
            <input 
              type="text" 
              placeholder="Search chats" 
              style={{ 
                background: 'transparent', 
                border: 'none', 
                color: '#333', 
                fontSize: 12, 
                fontFamily: 'Poppins, sans-serif',
                flex: 1,
                outline: 'none'
              }} 
            />
          </div>
          
          {/* Chat History List */}
          <div style={{ maxHeight: 280, overflowY: 'auto' }}>
            {chatHistory.map((chat) => (
              <div
                key={chat._id}
                onClick={() => loadChat(chat._id)}
                style={{
                  padding: '8px 0',
                  borderBottom: '1px solid rgba(102,102,102,0.5)',
                  cursor: 'pointer',
                  color: currentChat && currentChat._id === chat._id ? '#2E8B57' : '#999'
                }}
              >
                <div style={{ fontSize: 12, fontFamily: 'Poppins, sans-serif', marginBottom: 4 }}>
                  {chat.title.length > 25 ? chat.title.substring(0, 25) + '...' : chat.title}
                </div>
                <div style={{ fontSize: 10, color: '#2E8B57', fontFamily: 'Poppins, sans-serif' }}>
                  {formatDate(chat.updatedAt)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Projects, Templates, etc. */}
        <div style={{ marginBottom: 20 }}>
          <div style={{display:'flex',alignItems:'center',marginBottom:12, color: '#999', fontSize: 12, fontFamily: 'Poppins, sans-serif', cursor: 'pointer'}}>
            <img src={imgGroup} alt="Projects" style={{width: 18, height: 18, marginRight: 8, objectFit: 'contain'}} />Projects
          </div>
          <div style={{display:'flex',alignItems:'center',marginBottom:12, color: '#999', fontSize: 12, fontFamily: 'Poppins, sans-serif', cursor: 'pointer'}}>
            <img src={imgGroup1} alt="Templates" style={{width: 18, height: 18, marginRight: 8, objectFit: 'contain'}} />Templates
          </div>
          <div style={{display:'flex',alignItems:'center',marginBottom:12, color: '#999', fontSize: 12, fontFamily: 'Poppins, sans-serif', cursor: 'pointer'}}>
            <img src={imgGroup2} alt="Documents" style={{width: 18, height: 18, marginRight: 8, objectFit: 'contain'}} />Documents
          </div>
          <div style={{display:'flex',alignItems:'center',marginBottom:12, color: '#999', fontSize: 12, fontFamily: 'Poppins, sans-serif', cursor: 'pointer'}}>
            <img src={imgGroup3} alt="Community" style={{width: 18, height: 18, marginRight: 8, objectFit: 'contain'}} />Community
          </div>
        </div>

        <div style={{ borderTop: '1px solid #666', paddingTop: 12 }} />
        
        {/* Settings & Help */}
        <div style={{ marginTop: 12 }}>
          <div style={{ color: '#fff', fontSize: 16, fontFamily: 'Poppins, sans-serif', marginBottom: 12 }}>Settings & Help</div>
          <div style={{display:'flex',alignItems:'center',marginBottom:12, color: '#999', fontSize: 12, fontFamily: 'Poppins, sans-serif', cursor: 'pointer'}}>
            <img src={imgGroup4} alt="Settings" style={{width: 18, height: 18, marginRight: 8, objectFit: 'contain'}} />Settings
          </div>
          <div style={{display:'flex',alignItems:'center',marginBottom:12, color: '#999', fontSize: 12, fontFamily: 'Poppins, sans-serif', cursor: 'pointer'}}>
            <img src={imgGroup5} alt="Help" style={{width: 18, height: 18, marginRight: 8, objectFit: 'contain'}} />Help
          </div>
        </div>
      </div>

      {/* CENTER CHAT PANEL AREA */}
      <div style={{ position: 'absolute', top: 102, left: 364, width: 712, height: 634, borderRadius: 7, background: '#333', zIndex: 10, display: 'flex', flexDirection: 'column' }}>
        {/* Chat Header */}
        <div style={{background: '#333', borderRadius: '7px 7px 0 0', height: 50, display:'flex', alignItems:'center', justifyContent: 'space-between', padding: '0 20px'}}>
          <div style={{color:'#fff',fontFamily:'Poppins',fontSize:16}}>{currentChat ? currentChat.title : 'VirtuartAI Assistant'}</div>
          <div style={{background: '#2E8B57', borderRadius: 7, padding: '6px 16px', display: 'flex', alignItems: 'center', cursor: 'pointer'}}>
            <img src={imgGroup12} alt="upgrade" style={{width: 16, height: 16, marginRight: 6, objectFit: 'contain'}} />
            <span style={{color: '#fff', fontSize: 12, fontFamily: 'Poppins', fontWeight: 600}}>Upgrade</span>
          </div>
        </div>
        
        {/* MESSAGES AREA */}
        <div className="messagesContainer" style={{ flex: 1, overflowY: 'auto', padding: '40px 20px', background: '#000' }}>
          {!currentChat ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', textAlign: 'center' }}>
              <div style={{ fontSize: 36, color: '#999', fontFamily: 'Poppins', fontWeight: 300, marginBottom: 16 }}>Welcome to VirtuartAI!</div>
              <div style={{ fontSize: 16, color: '#666', fontFamily: 'Poppins', marginBottom: 32, maxWidth: 600 }}>
                <span style={{color: '#666'}}>Get started by giving VirtuartAI a task — and let Chat take care of the rest. </span>
                <span style={{color: '#2E8B57'}}>Not sure where to begin?</span>
              </div>
              
              {/* Sample Questions */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, maxWidth: 680, width: '100%' }}>
                <div 
                  onClick={() => setInput("How does AI image generation work?")}
                  style={{ 
                    border: '1px solid #666', 
                    borderRadius: 7, 
                    padding: 16, 
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    background: 'rgba(51,51,51,0)'
                  }}
                >
                  <img src={imgEllipse6} alt="icon" style={{width: 35, height: 35, marginRight: 12, objectFit: 'contain'}} />
                  <img src={imgGroup88} alt="gear" style={{width: 20, height: 20, marginRight: 12, objectFit: 'contain'}} />
                  <span style={{color: '#666', fontSize: 13, fontFamily: 'Poppins'}}>How does AI image generation work?</span>
                </div>
                <div 
                  onClick={() => setInput("What image formats do you support?")}
                  style={{ 
                    border: '1px solid #666', 
                    borderRadius: 7, 
                    padding: 16, 
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    background: 'rgba(51,51,51,0)'
                  }}
                >
                  <img src={imgEllipse6} alt="icon" style={{width: 35, height: 35, marginRight: 12, objectFit: 'contain'}} />
                  <img src={imgGroup91} alt="image" style={{width: 20, height: 20, marginRight: 12, objectFit: 'contain'}} />
                  <span style={{color: '#666', fontSize: 13, fontFamily: 'Poppins'}}>What image formats do you support?</span>
                </div>
                <div 
                  onClick={() => setInput("How can I get started?")}
                  style={{ 
                    border: '1px solid #666', 
                    borderRadius: 7, 
                    padding: 16, 
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    background: 'rgba(51,51,51,0)'
                  }}
                >
                  <img src={imgEllipse6} alt="icon" style={{width: 35, height: 35, marginRight: 12, objectFit: 'contain'}} />
                  <img src={imgGroup10} alt="question" style={{width: 20, height: 20, marginRight: 12, objectFit: 'contain'}} />
                  <span style={{color: '#666', fontSize: 13, fontFamily: 'Poppins'}}>How can I get started?</span>
                </div>
                <div 
                  onClick={() => {
                    const inputField = document.querySelector('input[placeholder="Ask me anything else..."]');
                    if (inputField) inputField.focus();
                  }}
                  style={{ 
                    border: '1px solid #2E8B57', 
                    borderRadius: 7, 
                    padding: 16, 
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    background: 'rgba(51,51,51,0)'
                  }}
                >
                  <img src={imgEllipse7} alt="icon" style={{width: 35, height: 35, marginRight: 12, objectFit: 'contain'}} />
                  <img src={imgGroup11} alt="chat" style={{width: 20, height: 20, marginRight: 12, objectFit: 'contain'}} />
                  <span style={{color: '#2E8B57', fontSize: 13, fontFamily: 'Poppins'}}>Ask me anything else...</span>
                </div>
              </div>
            </div>
          ) : (
            <>
              {messages.map((msg, i) => (
                <div key={i} style={{ 
                  marginBottom: 24, 
                  display: 'flex', 
                  justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' 
                }}>
                  <div style={{
                    maxWidth: '75%',
                    padding: '18px 22px',
                    borderRadius: msg.role === 'user' ? '18px 18px 8px 18px' : '18px 18px 18px 8px',
                    background: msg.role === 'user' ? '#2E8B57' : '#555',
                    color: '#fff',
                    fontFamily: 'Poppins',
                    fontSize: 14,
                    lineHeight: 1.6
                  }}>
                    {msg.content}
                    <div style={{ fontSize: 11, opacity: 0.7, marginTop: 8, textAlign: msg.role === 'user' ? 'right' : 'left' }}>
                      {formatTime(msg.timestamp)}
                    </div>
                  </div>
                </div>
              ))}
              
              {isLoading && (
                <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: 24 }}>
                  <div style={{ padding: '18px 22px', background: '#555', borderRadius: '18px 18px 18px 8px' }}>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#2E8B57', animation: 'typing 1.4s infinite ease-in-out' }}></span>
                      <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#2E8B57', animation: 'typing 1.4s infinite ease-in-out', animationDelay: '0.2s' }}></span>
                      <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#2E8B57', animation: 'typing 1.4s infinite ease-in-out', animationDelay: '0.4s' }}></span>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </>
          )}
        </div>
        
        {/* INPUT BAR */}
        <div style={{ border: '1px solid #666', borderRadius: '0 0 7px 7px', padding: '20px', background: 'rgba(51,51,51,0)' }}>
          <div style={{ border: '1px solid #666', borderRadius: 7, padding: '12px 16px', display: 'flex', alignItems: 'center', marginBottom: 10 }}>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask me anything else..."
              disabled={isLoading}
              style={{
                flex: 1,
                background: 'transparent',
                border: 'none',
                color: '#666',
                fontSize: 13,
                fontFamily: 'Poppins',
                outline: 'none'
              }}
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 8 }}>
            <div style={{ display: 'flex', gap: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                <img src={imgGroup9} alt="attach" style={{width: 18, height: 18, marginRight: 6, objectFit: 'contain'}} />
                <span style={{color: '#666', fontSize: 13, fontFamily: 'Poppins'}}>Attach</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                <img src={imgGroup8} alt="voice" style={{width: 18, height: 18, marginRight: 6, objectFit: 'contain'}} />
                <span style={{color: '#666', fontSize: 13, fontFamily: 'Poppins'}}>Voice Message</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                <img src={imgGroup7} alt="prompts" style={{width: 18, height: 18, marginRight: 6, objectFit: 'contain'}} />
                <span style={{color: '#666', fontSize: 13, fontFamily: 'Poppins'}}>Browse Prompts</span>
              </div>
            </div>
            <img 
              src={imgVector1} 
              alt="send" 
              onClick={sendMessage}
              style={{width: 24, height: 24, cursor: 'pointer', objectFit: 'contain'}} 
            />
          </div>
        </div>
      </div>

      {/* RIGHT PROMO PANEL */}
      <div style={{ position: 'absolute', top: 102, right: 32, width: 300, height: 634, background: '#a77e01', borderRadius: 7, zIndex: 10, overflow: 'hidden' }}>
        {/* Texture BG */}
        <img src={imgTexture} alt="Texture" style={{ position: 'absolute', left: 0, top: 0, width: '100%', height: '100%', opacity: .5, objectFit: 'cover', zIndex: 0 }} />
        {/* Pro Plan info + Free Trial button, center/lay out text/images as in Figma */}
        <div style={{ position: 'absolute', top: 80, left: 32, right: 32 }}>
          <div style={{ fontWeight: 600, color: '#222', fontFamily: 'Poppins', fontSize: 16, marginBottom: 12, textAlign:'center' }}>Start your 7-day free trial</div>
          <div style={{ fontFamily: 'Poppins', lineHeight: '30px', textAlign: 'center', color: '#333', fontSize: 15 }}>
            AI-powered creative toolkit for<br/><span style={{ fontWeight: 'bold', fontSize: 24 }}>individuals & teams.</span>
          </div>
          <div style={{ marginTop: 24, color: '#222', fontWeight: 'bold', fontSize: 24, fontFamily: 'Poppins', textAlign: 'center' }}>PRO</div>
          <div style={{ color: '#222', fontSize: 16, textAlign:'center',fontFamily:'Poppins'}}>Maximize creative efficiency</div>
          <div style={{ color: '#222', fontSize: 36, fontFamily: 'Poppins', textAlign: 'center', margin: "15px 0" }}>€150/mo.</div>
          {/* Perk bulleted list with checkmark */}
          <div style={{ marginLeft: 16, color: '#333', fontSize: 14, fontFamily: 'Poppins', marginBottom: 16 }}>
            <div style={{display:'flex',alignItems:'center'}}><img src={imgCheckmark1} alt="✔" style={{height: 14,marginRight:6}} />Standard photo and video editing tools</div>
            <div style={{display:'flex',alignItems:'center'}}><img src={imgCheckmark1} alt="✔" style={{height: 14,marginRight:6}} />5 credits per week to use on generative AI tools</div>
            <div style={{display:'flex',alignItems:'center'}}><img src={imgCheckmark1} alt="✔" style={{height: 14,marginRight:6}} />Selection of free images, videos, and customization templates</div>
            <div style={{display:'flex',alignItems:'center'}}><img src={imgCheckmark1} alt="✔" style={{height: 14,marginRight:6}} />Access on web and mobile app</div>
            <div style={{display:'flex',alignItems:'center'}}><img src={imgCheckmark1} alt="✔" style={{height: 14,marginRight:6}} />100 MB of cloud storage</div>
          </div>
          {/* Try for Free button */}
          <div style={{ display: 'flex', justifyContent: 'center', margin: '28px 0 0 0' }}>
            <button style={{ background: '#000', color: '#a77e01', border: '2px solid #000', borderRadius: '100px', height: 40, width: 180, fontSize: 16, fontFamily: 'Poppins', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              Try for free <img src={imgArrow2} alt="arrow" style={{width: 25, height: 21, marginLeft: 8, objectFit: 'contain'}}/>
            </button>
          </div>
        </div>
      </div>

      {/* Footer will be rendered by App.js, so we don't need it here */}
    </div>
  );
}

export default Chatgpt;
