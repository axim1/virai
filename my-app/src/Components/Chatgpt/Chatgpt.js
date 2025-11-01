import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import cx from 'classnames';
import styles from './Chatgpt.module.css';

// Image assets (Figma export)
const imgTexture = "http://localhost:3845/assets/a94c83d1539778b55baf631c6aea127af3ff4bab.png";
const imgPricing011 = "http://localhost:3845/assets/0007086edb27dbb802e01f50d55c69f8f779b9eb.svg";
const imgPolygon3 = "http://localhost:3845/assets/008cce32b90973ec1dbe244e70cfee8bc2307f27.svg";
const imgVituartAiWordMarkVector1 = "http://localhost:3845/assets/83dc0e4c52fe83ab4b5094f07ce3d5a251dbba84.svg";

const imgNewChatIcon = "http://localhost:3845/assets/89cfb4b6af555971af1bab48287fcd45c7d4756c.svg";
const imgVector = "http://localhost:3845/assets/e18085e76b3c562b6cb2da170805c9f098ca3138.svg";

const imgGroup = "http://localhost:3845/assets/2e73036addfdb9c305eb9b667ee929c8ac10360e.svg";
const imgGroup1 = "http://localhost:3845/assets/75b635b62abb72d385cb09f812bda73ddffdd085.svg";
const imgGroup2 = "http://localhost:3845/assets/9a4856d8f163142fbc6f34089b0899b8f74aa1a4.svg";
const imgGroup3 = "http://localhost:3845/assets/414f3f61ead6a2ac6f9ee6fdddc98a46a7adbf82.svg";
const imgGroup4 = "http://localhost:3845/assets/b38a222fbd5b55013406900471e00440724cc06a.svg";
const imgGroup5 = "http://localhost:3845/assets/9305822bc81ee3029103920ff9a61e5b46cf53c2.svg";
const imgGroup6 = "http://localhost:3845/assets/70bf581384bf53147e7b6802601eff55d6c3e10b.svg";
const imgGroup7 = "http://localhost:3845/assets/1b4af2a0d20dcb84929fdc7a9aa119f00532f252.svg";
const imgGroup8 = "http://localhost:3845/assets/aab2c68b1d9dba187c18fa0fbdd22679ff9534c4.svg";
const imgGroup9 = "http://localhost:3845/assets/2bc973069a5967b8b3fa8d3895216de0afe26a47.svg";
const imgGroup10 = "http://localhost:3845/assets/9b0b9fdd031f6fcf9bcb1177b7b144e1c075af76.svg";
const imgGroup11 = "http://localhost:3845/assets/81853a9114e49420254b06b9e82479f08399f185.svg";
const imgGroup12 = "http://localhost:3845/assets/d3ca43e139547a8bb6d2b12f19fbd7fad3d7f9d8.svg";

const imgVector1 = "http://localhost:3845/assets/a65c85a9ce7d6909ec69714c25d51efaa35fba17.svg";
const imgEllipse6 = "http://localhost:3845/assets/f4a89a9066001e0be74e140166bb289b565c410c.svg";
const imgEllipse7 = "http://localhost:3845/assets/b3ebe70060b10455266854f8ff5f6f6991a42a71.svg";
const imgGroup88 = "http://localhost:3845/assets/30d16caf5140e55b9db3dbe0c4da8666ee1eeb90.svg";
const imgGroup91 = "http://localhost:3845/assets/9ced641531769791108b261cfc4eaa5b02a31d21.svg";
const imgCheckmark1 = "http://localhost:3845/assets/7f1ce1a710ffa00a474a8d2d823f968aba98c9bf.svg";
const imgArrow2 = "http://localhost:3845/assets/5b576b90578aa41c1639ff6bf377e04595d41ca4.svg";

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

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user'));
    if (storedUser && storedUser._id) {
      setUser(storedUser);
      loadChatHistory(storedUser._id);
    }
  }, []);

  useEffect(() => {
    // Only scroll if there are messages and the messagesEndRef exists
    if (messagesEndRef.current && messages.length > 0) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }, [messages]);

  const loadChatHistory = async (userId) => {
    try {
      const { data } = await axios.get(`${apiUrl}api/chats/${userId}`);
      setChatHistory(data.chats || []);
    } catch (error) {
      console.error('Error loading chat history:', error);
    }
  };

  const createNewChat = async () => {
    if (!user) return;
    try {
      const { data } = await axios.post(`${apiUrl}api/chat/new`, {
        userId: user._id,
        title: 'New Chat',
      });
      const newChat = data.chat;
      setCurrentChat(newChat);
      setMessages([]);
      setChatHistory(prev => [newChat, ...prev]);
    } catch (error) {
      console.error('Error creating new chat:', error);
    }
  };

  const loadChat = async (chatId) => {
    try {
      const { data } = await axios.get(`${apiUrl}api/chat/${chatId}`);
      const chat = data.chat;
      setCurrentChat(chat);
      setMessages(chat.messages || []);
    } catch (error) {
      console.error('Error loading chat:', error);
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || isLoading || !user) return;
    if (!currentChat) {
      await createNewChat();
      return;
    }

    const messageText = input.trim();
    setInput('');
    setIsLoading(true);

    const userMessage = {
      role: 'user',
      content: messageText,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMessage]);

    try {
      const { data } = await axios.post(`${apiUrl}api/chat/${currentChat._id}/message`, {
        message: messageText,
        userId: user._id,
      });

      const { assistantMessage, chatTitle } = data;
      setMessages(prev => [...prev, assistantMessage]);

      if (chatTitle && chatTitle !== currentChat.title) {
        setCurrentChat(prev => ({ ...prev, title: chatTitle }));
        setChatHistory(prev =>
          prev.map(c => (c._id === currentChat._id ? { ...c, title: chatTitle, updatedAt: new Date() } : c))
        );
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev => prev.slice(0, -1)); // revert optimistic add
    } finally {
      setIsLoading(false);
    }
  };

  const deleteChat = async (chatId, e) => {
    e.stopPropagation();
    if (!user) return;
    try {
      await axios.delete(`${apiUrl}api/chat/${chatId}`, { data: { userId: user._id } });
      setChatHistory(prev => prev.filter(c => c._id !== chatId));
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
        userId: user._id,
      });
      setChatHistory(prev => prev.map(c => (c._id === chatId ? { ...c, title: editTitle.trim() } : c)));
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

  const formatTime = (timestamp) =>
    new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

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
    <div className={styles.appShell} data-name="Chat Page Desktop">
      {/* HEADER */}
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <img src={imgVituartAiWordMarkVector1} alt="VituartAI" className={styles.brand} />
        </div>

        <nav className={styles.headerCenter} aria-label="Primary">
          <button className={styles.navLink}>Home</button>
          <button className={styles.navLink}>AI Tools</button>
          <button className={styles.navLink}>Creation</button>
          <button className={styles.navLink}>Gallery</button>
          <button className={styles.navLink}>Pricing</button>
          <button className={styles.navLink}>FAQ</button>
          <span className={styles.navCurrent}>Chat AI</span>
        </nav>

        <div className={styles.headerRight}>
          <button
            className={styles.accountBtn}
            onClick={() => setSidebarOpen(o => !o)}
            aria-pressed={sidebarOpen}
            title={sidebarOpen ? 'Hide sidebar' : 'Show sidebar'}
          >
            {sidebarOpen ? 'Hide' : 'Show'} Sidebar
          </button>
          <span className={styles.creditCount}>100</span>
          <img src={imgPricing011} alt="Credits" className={styles.creditIcon} />
          <img src={imgPolygon3} alt="Open" className={styles.caret} />
        </div>
      </header>

      {/* MAIN GRID */}
      <main className={styles.mainGrid}>
        {/* LEFT SIDEBAR */}
        <aside className={cx(styles.sidebar, !sidebarOpen && styles.sidebarCollapsed)}>
          <button className={styles.newChat} onClick={createNewChat}>
            <img src={imgNewChatIcon} alt="" />
            <span>New Chat</span>
          </button>

          <div className={styles.sectionDivider} />

          <section className={styles.history}>
            <h3 className={styles.sectionTitle}>History</h3>

            <div className={styles.searchBox}>
              <img src={imgVector} alt="" />
              <input type="text" placeholder="Search chats" />
            </div>

            <div className={styles.historyList}>
              {chatHistory.map(chat => {
                const isActive = currentChat && currentChat._id === chat._id;
                const title =
                  chat.title?.length > 40 ? `${chat.title.slice(0, 40)}…` : chat.title || 'Untitled';

                return (
                  <div
                    key={chat._id}
                    className={cx(styles.historyItem, isActive && styles.historyItemActive)}
                    onClick={() => loadChat(chat._id)}
                  >
                    <div className={styles.historyMeta}>
                      <span className={styles.historyTitle}>
                        {editingTitle === chat._id ? (
                          <input
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && saveTitle(chat._id)}
                            onBlur={() => saveTitle(chat._id)}
                            autoFocus
                          />
                        ) : (
                          title
                        )}
                      </span>
                      <time className={styles.historyDate}>{formatDate(chat.updatedAt)}</time>
                    </div>
                    <div className={styles.historyActions}>
                      <button
                        className={styles.iconBtn}
                        onClick={(e) => startEditingTitle(chat, e)}
                        title="Rename"
                        aria-label="Rename chat"
                      >
                        ✎
                      </button>
                      <button
                        className={styles.iconBtn}
                        onClick={(e) => deleteChat(chat._id, e)}
                        title="Delete"
                        aria-label="Delete chat"
                      >
                        ⓧ
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          <div className={styles.sectionDivider} />

          <nav className={styles.quickNav} aria-label="Quick nav">
            <button className={styles.quickItem}><img src={imgGroup} alt="" />Projects</button>
            <button className={styles.quickItem}><img src={imgGroup1} alt="" />Templates</button>
            <button className={styles.quickItem}><img src={imgGroup2} alt="" />Documents</button>
            <button className={styles.quickItem}><img src={imgGroup3} alt="" />Community</button>
          </nav>

          <div className={styles.sectionDivider} />

          <section>
            <h3 className={styles.sectionTitle}>Settings &amp; Help</h3>
            <button className={styles.quickItem}><img src={imgGroup4} alt="" />Settings</button>
            <button className={styles.quickItem}><img src={imgGroup5} alt="" />Help</button>
          </section>
        </aside>

        {/* CENTER CHAT */}
        <section className={styles.chatPanel}>
          <header className={styles.chatHeader}>
            <div className={styles.chatTitle}>
              {currentChat ? currentChat.title : 'VirtuartAI Assistant'}
            </div>
            <button className={styles.upgradeBtn}>
              <img src={imgGroup12} alt="" />
              Upgrade
            </button>
          </header>

          <div className={styles.messagesArea}>
            {!currentChat ? (
              <div className={styles.emptyState}>
                <h1 className={styles.emptyTitle}>Welcome to VirtuartAI!</h1>
                <p className={styles.emptySubtitle}>
                  Get started by giving VirtuartAI a task — and let Chat take care of the rest.
                  <span className={styles.linkish}> Not sure where to begin?</span>
                </p>

                <div className={styles.quickGrid}>
                  <button
                    className={styles.quickCard}
                    onClick={() => setInput('How does AI image generation work?')}
                  >
                    <span className={styles.quickIcon}>
                      <img src={imgEllipse6} alt="" />
                      <img src={imgGroup88} alt="" className={styles.quickIconInner} />
                    </span>
                    <span>How does AI image generation work?</span>
                  </button>

                  <button
                    className={styles.quickCard}
                    onClick={() => setInput('What image formats do you support?')}
                  >
                    <span className={styles.quickIcon}>
                      <img src={imgEllipse6} alt="" />
                      <img src={imgGroup91} alt="" className={styles.quickIconInner} />
                    </span>
                    <span>What image formats do you support?</span>
                  </button>

                  <button
                    className={styles.quickCard}
                    onClick={() => setInput('How can I get started?')}
                  >
                    <span className={styles.quickIcon}>
                      <img src={imgEllipse6} alt="" />
                      <img src={imgGroup10} alt="" className={styles.quickIconInner} />
                    </span>
                    <span>How can I get started?</span>
                  </button>

                  <button
                    className={cx(styles.quickCard, styles.quickPrimary)}
                    onClick={() => {
                      const el = document.querySelector('input[placeholder="Ask me anything else..."]');
                      if (el) el.focus();
                    }}
                  >
                    <span className={styles.quickIcon}>
                      <img src={imgEllipse7} alt="" />
                      <img src={imgGroup11} alt="" className={styles.quickIconInner} />
                    </span>
                    <span>Ask me anything else...</span>
                  </button>
                </div>
              </div>
            ) : (
              <>
                {messages.map((msg, i) => (
                  <div
                    key={i}
                    className={cx(
                      styles.messageRow,
                      msg.role === 'user' ? styles.messageRight : styles.messageLeft
                    )}
                  >
                    <div
                      className={cx(
                        styles.messageBubble,
                        msg.role === 'user' ? styles.userBubble : styles.assistantBubble
                      )}
                    >
                      {msg.content}
                      <div className={styles.timeStamp}>{formatTime(msg.timestamp)}</div>
                    </div>
                  </div>
                ))}

                {isLoading && (
                  <div className={styles.messageLeft}>
                    <div className={styles.assistantBubble}>
                      <span className={styles.dot} />
                      <span className={styles.dot} />
                      <span className={styles.dot} />
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          <footer className={styles.inputBar}>
            <div className={styles.inputWrap}>
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask me anything else..."
                disabled={isLoading}
              />
              <button
                className={styles.sendBtn}
                onClick={sendMessage}
                aria-label="Send message"
                title="Send"
              >
                <img src={imgVector1} alt="" />
              </button>
            </div>

            <div className={styles.toolbar}>
              <button className={styles.toolBtn}><img src={imgGroup9} alt="" />Attach</button>
              <button className={styles.toolBtn}><img src={imgGroup8} alt="" />Voice Message</button>
              <button className={styles.toolBtn}><img src={imgGroup7} alt="" />Browse Prompts</button>
            </div>
          </footer>
        </section>

        {/* RIGHT PANEL */}
        <aside className={styles.promoPanel}>
          <img src={imgTexture} alt="" className={styles.promoTexture} />
          <div className={styles.promoInner}>
            <h3 className={styles.promoKick}>Start your 7-day free trial</h3>
            <p className={styles.promoLead}>
              AI-powered creative toolkit for<br />
              <strong>individuals &amp; teams.</strong>
            </p>
            <div className={styles.promoPlan}>PRO</div>
            <div className={styles.promoSub}>Maximize creative efficiency</div>
            <div className={styles.promoPrice}>€150/mo.</div>

            <ul className={styles.promoList}>
              <li><img src={imgCheckmark1} alt="" />Standard photo and video editing tools</li>
              <li><img src={imgCheckmark1} alt="" />5 credits per week for generative AI tools</li>
              <li><img src={imgCheckmark1} alt="" />Free assets & customization templates</li>
              <li><img src={imgCheckmark1} alt="" />Access on web & mobile</li>
              <li><img src={imgCheckmark1} alt="" />100 MB cloud storage</li>
            </ul>

            <button className={styles.promoCTA}>
              Try for free <img src={imgArrow2} alt="" />
            </button>
          </div>
        </aside>
      </main>
    </div>
  );
}

export default Chatgpt;
