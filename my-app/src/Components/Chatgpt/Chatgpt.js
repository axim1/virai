import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import cx from 'classnames';
import styles from './Chatgpt.module.css';

// Local image assets
import imgTexture from '../../assets/chatgpt-icons/texture.png';
import imgPricing011 from '../../assets/chatgpt-icons/Login/pricing-01 1.svg';
import imgPolygon3 from '../../assets/chatgpt-icons/Polygon 3.svg';
import imgVituartAiWordMarkVector1 from '../../assets/chatgpt-icons/VituartAI WordMark Vector 1.svg';
import imgNewChatIcon from '../../assets/chatgpt-icons/new chat icon.svg';
import imgVector from '../../assets/chatgpt-icons/Vector.svg';
import iconProjects from '../../assets/chatgpt-icons/Group-12.svg';
import iconTemplates from '../../assets/chatgpt-icons/Group-1.svg';
import iconDocuments from '../../assets/chatgpt-icons/Group-7.svg';
import iconCommunity from '../../assets/chatgpt-icons/Group-6.svg';
import iconSettings from '../../assets/chatgpt-icons/Group-5.svg';
import iconHelp from '../../assets/chatgpt-icons/Group-4.svg';
import iconUpgrade from '../../assets/chatgpt-icons/Group-2.svg';
import iconAttach from '../../assets/chatgpt-icons/Group-9.svg';
import iconVoice from '../../assets/chatgpt-icons/Group-8.svg';
import iconBrowse from '../../assets/chatgpt-icons/Group-3.svg';
import imgGroup10 from '../../assets/chatgpt-icons/Group-10.svg';
import imgGroup11 from '../../assets/chatgpt-icons/Group-11.svg';
import imgVector1 from '../../assets/chatgpt-icons/Vector-1.svg';
import imgEllipse6 from '../../assets/chatgpt-icons/Ellipse 6.svg';
import imgEllipse7 from '../../assets/chatgpt-icons/Ellipse 6-1.svg';
import imgGroup88 from '../../assets/chatgpt-icons/Group 88.svg';
import imgGroup91 from '../../assets/chatgpt-icons/Group 91.svg';
import imgCheckmark1 from '../../assets/chatgpt-icons/checkmark 1.svg';
import imgArrow2 from '../../assets/chatgpt-icons/Arrow 2.svg';

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
  const [promoState, setPromoState] = useState('enter'); // enter | idle | exit | hidden
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

  useEffect(() => {
    if (promoState === 'enter') {
      const timer = setTimeout(() => setPromoState('idle'), 40);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [promoState]);

  useEffect(() => {
    if (promoState === 'exit') {
      const timer = setTimeout(() => setPromoState('hidden'), 400);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [promoState]);

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

  const handlePromoDismiss = () => {
    if (promoState === 'exit' || promoState === 'hidden') return;
    setPromoState('exit');
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

  const promoIsRendered = promoState !== 'hidden';
  const mainGridClass = cx(
    styles.mainGrid,
    promoIsRendered ? styles.mainGridWithPromo : styles.mainGridNoPromo
  );
  const promoPanelClass = cx(
    styles.promoPanel,
    promoState === 'enter' && styles.promoEntering,
    promoState === 'exit' && styles.promoExiting
  );

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
      <main className={mainGridClass}>
        {/* LEFT SIDEBAR */}
        <aside className={cx(styles.sidebar, !sidebarOpen && styles.sidebarCollapsed)}>
          <button className={styles.newChat} onClick={createNewChat}>
            <span className={styles.newChatLabel}>New Chat</span>
            <span className={styles.newChatIcon}>
              <img src={imgNewChatIcon} alt="" />
            </span>
          </button>

          <div className={styles.sectionDivider} />

          <section className={styles.history}>
            <h3 className={styles.sectionTitle}>History</h3>

            <div className={styles.searchBox}>
              <input type="text" placeholder="Search chats" />
                <img src={imgVector1} alt="" />  

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


          <nav className={styles.quickNav} aria-label="Quick nav">
            <button className={styles.quickItem}><img src={iconProjects} alt="" />Projects</button>
            <button className={styles.quickItem}><img src={iconTemplates} alt="" />Templates</button>
            <button className={styles.quickItem}><img src={iconDocuments} alt="" />Documents</button>
            <button className={styles.quickItem}><img src={iconCommunity} alt="" />Community</button>
          </nav>


          <nav className={styles.quickNav} aria-label="Quick nav">
            <h3 className={styles.sectionTitle}>Settings &amp; Help</h3>
                      <div className={styles.sectionDivider} />

            <button className={styles.quickItem}><img src={iconSettings} alt="" />Settings</button>
            <button className={styles.quickItem}><img src={iconHelp} alt="" />Help</button>
          </nav>

        </aside>

        {/* CENTER CHAT */}
        <section className={styles.chatPanel}>
          <header className={styles.chatHeader}>
            <div className={styles.chatTitle}>
              {currentChat ? currentChat.title : 'VirtuartAI Assistant'}
            </div>
            <button className={styles.upgradeBtn}>
              <img src={iconUpgrade} alt="" />
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
                    className={styles.quickCard}
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
                <img src={imgVector} alt="" />
              </button>
            </div>

            <div className={styles.toolbar}>
              <button className={styles.toolBtn}><img src={iconAttach} alt="" />Attach</button>
              <button className={styles.toolBtn}><img src={iconVoice} alt="" />Voice Message</button>
              <button className={styles.toolBtn}><img src={iconBrowse} alt="" />Browse Prompts</button>
            </div>
          </footer>
        </section>

        {/* RIGHT PANEL */}
        {promoIsRendered && (
          <aside className={promoPanelClass}>
            <button
              className={styles.promoDismiss}
              type="button"
              onClick={handlePromoDismiss}
              aria-label="Hide promotional banner"
              title="Hide this offer"
            >
              ×
            </button>
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
        )}
      </main>
    </div>
  );
}

export default Chatgpt;
