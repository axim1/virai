// ImageGallery.jsx with react-masonry-css and improved lazy loading
import React, { useState, useEffect, useCallback, useRef } from 'react';
import Masonry from 'react-masonry-css';
import styles from './ImageGallery.module.css';
import like from '../../assets/vector_icons/like.svg';
import fire from '../../assets/vector_icons/fire.svg';
import share from '../../assets/vector_icons/share.svg';
import view from '../../assets/vector_icons/view.svg';
import download from '../../assets/vector_icons/download.svg';
import more from '../../assets/vector_icons/more.svg';
import filterIcon from '../../assets/vector_icons/Filters 1.svg';
import ModelViewer from '../ImageGenerator/ModelViewer';
import placeholder3d from '../../assets/vector_icons/3D object generation-01 1.svg';

const apiUrl = process.env.REACT_APP_API_URL;
const API_BASE = process.env.REACT_APP_API_URL;

const mergeUniqueById = (existing, incoming) => {
  const merged = new Map();
  [...existing, ...incoming].forEach(item => {
    if (item?._id) {
      merged.set(item._id, item);
    }
  });
  return Array.from(merged.values());
};

// Lazy loading component for individual images
const LazyImage = ({ src, alt, className, onClick, type, style, fallbackSrc }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(src);
  const imgRef = useRef();

  useEffect(() => {
    const nextSrc = src || fallbackSrc || null;
    setCurrentSrc(nextSrc);
    setHasError(!nextSrc);
    setIsLoaded(!nextSrc);
  }, [src, fallbackSrc]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.unobserve(entry.target);
        }
      },
      {
        threshold: 0.1,
        rootMargin: '50px'
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => {
      if (imgRef.current) {
        observer.unobserve(imgRef.current);
      }
    };
  }, []);

  const handleLoad = () => {
    setIsLoaded(true);
  };

  const handleError = () => {
    if (fallbackSrc && currentSrc !== fallbackSrc) {
      setCurrentSrc(fallbackSrc);
      return;
    }
    setHasError(true);
    setIsLoaded(true);
  };

  return (
    <div ref={imgRef} className={styles.lazyImageContainer} style={style}>
      {!isLoaded && (
        <div className={styles.imagePlaceholder}>
          <div className={styles.placeholderShimmer}></div>
        </div>
      )}
      {isInView && !hasError && type === 'video' ? (
        <video
          src={currentSrc}
          className={`${className} ${isLoaded ? styles.imageLoaded : styles.imageLoading}`}
          controls={false}
          muted
          loop
          onClick={onClick}
          onLoadedData={handleLoad}
          onError={handleError}
          style={{ cursor: 'pointer' }}
        />
      ) : isInView && !hasError ? (
        <img
          src={currentSrc}
          alt={alt}
          loading="lazy"
          className={`${className} ${isLoaded ? styles.imageLoaded : styles.imageLoading}`}
          onClick={onClick}
          onLoad={handleLoad}
          onError={handleError}
          style={{ cursor: 'pointer' }}
        />
      ) : null}
      {hasError && (
        <div className={styles.errorPlaceholder}>
          <span>❌ Failed to load</span>
        </div>
      )}
    </div>
  );
};

const ImageGallery = () => {
  const loaderRef = useRef(null);
  const mobileFilterRef = useRef(null);
  const inFlightPagesRef = useRef(new Set());
  const activeRequestRef = useRef(0);
  const [loadError, setLoadError] = useState(false);

  const [user, setUser] = useState(null);
  const [loggedIn, setLoggedIn] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('3D OBJECT');
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const [filter, setFilter] = useState('Newest');
  const [images, setImages] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [loadingStates, setLoadingStates] = useState({});
  const [notifications, setNotifications] = useState([]);
  const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false);
  const limit = 8;

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (!isFilterMenuOpen) return;

    const handleClickOutside = event => {
      if (mobileFilterRef.current && !mobileFilterRef.current.contains(event.target)) {
        setIsFilterMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isFilterMenuOpen]);

  useEffect(() => {
    if (!isMobile) {
      setIsFilterMenuOpen(false);
    }
  }, [isMobile]);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
      setLoggedIn(true);
    } else {
      setUser(null);
      setLoggedIn(false);
    }
  }, [loggedIn]);

  const filters = ['Newest', 'Oldest', 'Most Liked', 'Shared', 'Trending', 'Most Viewed', 'Owned by Me'];

  // Notification system
  const showNotification = (message, type = 'success') => {
    const id = Date.now();
    const notification = { id, message, type };
    setNotifications(prev => [...prev, notification]);
    
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 3000);
  };

  const fetchImages = useCallback(async (pageNum = 1, append = false, requestId = activeRequestRef.current) => {
    const requestKey = `${filter}:${pageNum}`;
    if (inFlightPagesRef.current.has(requestKey)) {
      return;
    }

    inFlightPagesRef.current.add(requestKey);

    try {
      setIsLoading(true);
      setLoadError(false);

      let url = `${apiUrl}api/images?filter=${filter}&page=${pageNum}&limit=${limit}`;
      if (filter === 'Owned by Me') {
        const storedUser = JSON.parse(localStorage.getItem('user'));

        if (storedUser && storedUser._id) {
          url += `&userId=${storedUser._id}`;
        } else {
          console.warn('⚠️ User ID missing');
        }
      }

      const response = await fetch(url);
      if (!response.ok) throw new Error("Server responded with error");

      const data = await response.json();
      if (requestId !== activeRequestRef.current) {
        return;
      }

      if (data.images.length === 0) {
        setHasMore(false);
      } else {
        setHasMore(data.images.length === limit);
        setImages(prev => (
          append ? mergeUniqueById(prev, data.images) : mergeUniqueById([], data.images)
        ));
        setPage(pageNum);
      }
    } catch (error) {
      if (requestId === activeRequestRef.current) {
        setError(error.message);
        setLoadError(true);
        showNotification('Failed to load images', 'error');
      }
    } finally {
      inFlightPagesRef.current.delete(requestKey);
      if (requestId === activeRequestRef.current) {
        setIsLoading(false);
      }
    }
  }, [filter, limit]);

  useEffect(() => {
    const requestId = activeRequestRef.current + 1;
    activeRequestRef.current = requestId;
    inFlightPagesRef.current.clear();
    setPage(1);
    setHasMore(true);
    fetchImages(1, false, requestId);
  }, [filter, user, fetchImages]);

  const handleFilterChange = selectedFilter => {
    activeRequestRef.current += 1;
    inFlightPagesRef.current.clear();
    setFilter(selectedFilter);
    setImages([]);
    setPage(1);
    setHasMore(true);
    if (isMobile) {
      setIsFilterMenuOpen(false);
    }
  };

  useEffect(() => {
    if (isLoading || !hasMore || loadError) return;

    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting) {
          fetchImages(page + 1, true);
        }
      },
      { threshold: 1 }
    );

    const current = loaderRef.current;
    if (current) observer.observe(current);

    return () => {
      if (current) observer.unobserve(current);
    };
  }, [isLoading, hasMore, page, fetchImages, loadError]);

  const handleDownload = async (imageUrl, filename) => {
    try {
      showNotification('Download started...', 'info');
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      showNotification('Download completed!', 'success');
    } catch (error) {
      console.error('Error downloading:', error);
      showNotification('Download failed', 'error');
    }
  };

  // Enhanced interaction handlers with optimistic updates and error handling
  const handleInteraction = async (imageId, action, currentValue = 0) => {
    if (!user) {
      showNotification('Please login to interact with images', 'error');
      return;
    }

    const loadingKey = `${imageId}_${action}`;
    setLoadingStates(prev => ({ ...prev, [loadingKey]: true }));

    // Optimistic update
    const updateImages = (updateFn) => {
      setImages(prev => prev.map(img => 
        img._id === imageId ? updateFn(img) : img
      ));
      
      // Update selected image if it's the same
      if (selectedImage && selectedImage._id === imageId) {
        setSelectedImage(prev => updateFn(prev));
      }
    };

    let optimisticValue;
    let endpoint;
    let method = 'POST';

    switch (action) {
      case 'like':
        optimisticValue = currentValue + 1;
        endpoint = `${apiUrl}api/images/${imageId}/like`;
        updateImages(img => ({ ...img, likes: optimisticValue, userLiked: true }));
        break;
      case 'fire':
        optimisticValue = currentValue + 1;
        endpoint = `${apiUrl}api/images/${imageId}/fire`;
        updateImages(img => ({ ...img, fires: optimisticValue, userFired: true }));
        break;
      case 'share':
        optimisticValue = currentValue + 1;
        endpoint = `${apiUrl}api/images/${imageId}/share`;
        updateImages(img => ({ ...img, shares: optimisticValue }));
        showNotification('Link copied to clipboard!', 'success');
        // Copy image URL to clipboard
        try {
          const imageUrl = `${window.location.origin}/image/${imageId}`;
          await navigator.clipboard.writeText(imageUrl);
        } catch (e) {
          console.warn('Could not copy to clipboard');
        }
        break;
      case 'view':
        optimisticValue = currentValue + 1;
        endpoint = `${apiUrl}api/images/${imageId}/view`;
        updateImages(img => ({ ...img, views: optimisticValue, userViewed: true }));
        break;
      default:
        setLoadingStates(prev => ({ ...prev, [loadingKey]: false }));
        return;
    }

    try {
      const response = await fetch(endpoint, {
        method,
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token || ''}` // Add auth if available
        },
        body: JSON.stringify({ userId: user._id })
      });

      if (!response.ok) {
        throw new Error(`Failed to ${action} image: ${response.status}`);
      }

      const updatedImage = await response.json();
      
      // Update with actual server response
      updateImages(img => ({
        ...img,
        likes: updatedImage.likes || img.likes,
        views: updatedImage.views || img.views,
        fires: updatedImage.fires || img.fires,
        shares: updatedImage.shares || img.shares,
        ...(action === 'view' ? { userViewed: true } : {}),
        ...(action === 'like' ? { userLiked: true } : {}),
      }));

      showNotification(`${action.charAt(0).toUpperCase() + action.slice(1)} successful!`, 'success');

    } catch (error) {
      console.error(`Error ${action}ing image:`, error);
      
      // Rollback optimistic update
      const rollbackValue = currentValue;
      switch (action) {
        case 'like':
          updateImages(img => ({ ...img, likes: rollbackValue, userLiked: false }));
          break;
        case 'fire':
          updateImages(img => ({ ...img, fires: rollbackValue, userFired: false }));
          break;
        case 'share':
          updateImages(img => ({ ...img, shares: rollbackValue }));
          break;
        case 'view':
          updateImages(img => ({ ...img, views: rollbackValue, userViewed: false }));
          break;
      }
      
      showNotification(`Failed to ${action} image`, 'error');
    } finally {
      setLoadingStates(prev => ({ ...prev, [loadingKey]: false }));
    }
  };

  const handleLike = async (id, currentLikes = 0) => {
    await handleInteraction(id, 'like', currentLikes);
  };

  const handleFire = async (id, currentFires = 0) => {
    await handleInteraction(id, 'fire', currentFires);
  };

  const handleShare = async (id, currentShares = 0) => {
    await handleInteraction(id, 'share', currentShares);
  };

  const handleView = async (id, currentViews = 0) => {
    await handleInteraction(id, 'view', currentViews);
  };

  // Enhanced image selection with view tracking
  const handleImageSelect = async (image) => {
    setSelectedImage(image);
    // Track view when image is opened in modal
    await handleView(image._id, image.views || 0);
  };

  const renderContent = image => {
    if (image.type === '3d_model') {
      return (
        <div className={styles.modelContainer} onClick={() => handleImageSelect(image)}>
          <LazyImage
            src={image.image || placeholder3d}
            alt={`3D Model ${image._id}`}
            className={styles.galleryImage}
            onClick={() => handleImageSelect(image)}
            type="image"
            fallbackSrc={placeholder3d}
          />
          <div className={styles.modelBadge}>3D Model</div>
        </div>
      );
    }

    return (
      <LazyImage
        src={image.image}
        alt={`Generated ${image._id}`}
        className={styles.galleryImage}
        onClick={() => handleImageSelect(image)}
        type={image.type}
      />
    );
  };

  const breakpointColumnsObj = {
    default: 4,
    1200: 3,
    900: 2,
    600: 1,
  };

  const getProfilePicUrl = (picPath) => {
    if (!picPath) return "https://via.placeholder.com/100x100.png?text=User";
    const filename = picPath.split("\\").pop().split("/").pop();
    return `${API_BASE}api/uploads/profilepic/${filename}`;
  };

  return (
    <div className={styles.gallery}>
      {/* Notification System */}
      {notifications.length > 0 && (
        <div className={styles.notificationContainer}>
          {notifications.map(notification => (
            <div 
              key={notification.id} 
              className={`${styles.notification} ${styles[notification.type]}`}
            >
              {notification.message}
            </div>
          ))}
        </div>
      )}

      {/* <p className={styles.p3}>Gallery</p> */}

      <div className={styles.filterBar}>
        {isMobile ? (
          <div className={styles.mobileControlBar} ref={mobileFilterRef}>
            <div className={styles.mobileDropdownSegment}>
              <button
                type="button"
                className={`${styles.mobileSelectedFilter} ${isFilterMenuOpen ? styles.mobileSelectedFilterOpen : ''}`}
                onClick={() => setIsFilterMenuOpen(prev => !prev)}
                aria-haspopup="listbox"
                aria-expanded={isFilterMenuOpen}
                aria-controls="mobile-filter-menu"
              >
                <span>{filter}</span>
                <span className={`${styles.mobileCaret} ${isFilterMenuOpen ? styles.mobileCaretOpen : ''}`} />
              </button>
              {isFilterMenuOpen && (
                <div
                  id="mobile-filter-menu"
                  className={styles.mobileDropdownList}
                  role="listbox"
                >
                  {filters.map(option => (
                    <button
                      type="button"
                      key={option}
                      role="option"
                      aria-selected={filter === option}
                      className={`${styles.mobileDropdownOption} ${filter === option ? styles.mobileDropdownOptionActive : ''}`}
                      onClick={() => handleFilterChange(option)}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className={styles.mobileDivider} />
            
            <button type="button" className={styles.mobileFiltersButton}>
              <img src={filterIcon} alt="" aria-hidden="true" />
              <span>Filters</span>
            </button>
            {/* <button type="button" className={styles.mobileSearchButton} aria-label="Search gallery (coming soon)">
              <span className={styles.mobileSearchGlyph}></span>
            </button> */}
          </div>
        ) : (
          <div className={styles.filterItems}>
            {filters.map((f, index) => (
              <button key={index} className={`${styles.filterItem} ${filter === f ? styles.activeFilter : ''}`} onClick={() => handleFilterChange(f)}>
                {f}
              </button>
            ))}
          </div>
        )}
        {!isMobile && (
          <div className={styles.rightIconCont}>
            <img src={filterIcon} className={styles.filterIcon} alt="Filter" /> Filters
          </div>
        )}
      </div>

      {!isMobile && <div className={styles.selectedFilterDiv}>{filter}</div>}

      <Masonry
        breakpointCols={breakpointColumnsObj}
        className={styles.masonryGrid}
        columnClassName={styles.masonryColumn}
      >
        {images.map((image, index) => (
          <div key={`image-${image._id || index}`} className={styles.imageItem}>
            {renderContent(image)}
            <div className={styles.userInfo}>
              <img src={getProfilePicUrl(image.owner?.profilePic || '')} className={styles.logo} alt="User Profile" />
              <span className={styles.userName}>{image.owner?.name || 'Anonymous'}</span>
            </div>
            
            {/* Quick action overlay */}
            <div className={`${styles.quickActions} ${isMobile ? styles.quickActionsVisible : ''}`}>
              <button 
                className={`${styles.quickActionBtn} ${styles.likeButton} ${image.userLiked ? styles.likeActive : ''}`}
                onClick={(e) => {
                  e.stopPropagation();
                  handleLike(image._id, image.likes || 0);
                }}
                disabled={loadingStates[`${image._id}_like`]}
              >
                <img src={like} alt="Like" className={styles.quickActionIcon} />
                <span className={styles.quickActionCount}>{image.likes || 0}</span>
              </button>
              <button 
                className={`${styles.quickActionBtn} ${styles.viewButton} ${image.userViewed ? styles.viewActive : ''}`}
                onClick={(e) => {
                  e.stopPropagation();
                  handleView(image._id, image.views || 0);
                }}
                disabled={loadingStates[`${image._id}_view`]}
              >
                <img src={view} alt="View" className={styles.quickActionIcon} />
                <span className={styles.quickActionCount}>{image.views || 0}</span>
              </button>
            </div>
          </div>
        ))}
        {isLoading && Array(limit).fill(null).map((_, index) => (
          <div key={`loading-${index}`} className={styles.imageItem}>
            <div className={styles.imagePlaceholder}>
              <div className={styles.placeholderShimmer}></div>
            </div>
          </div>
        ))}
      </Masonry>

      {selectedImage && (
        <div className={styles.modal} onClick={() => setSelectedImage(null)}>
          <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <button className={styles.closeButton} onClick={() => setSelectedImage(null)}>×</button>
            <div className={styles.modalImageWrapper}>
              {selectedImage.type === '3d_model' ? (
                <div className={styles.modalModelViewer}>
                  <ModelViewer modelPath={selectedImage.modelUrl} interactive autoRotate={false} showGround />
                </div>
              ) : selectedImage.type === 'video' ? (
                <video
                  src={selectedImage.image}
                  controls
                  autoPlay
                  loop
                  className={styles.modalImage}
                />
              ) : (
                <img src={selectedImage.image} alt="Full View" className={styles.modalImage} />
              )}
            </div>

            <div className={styles.imageMetadata}>
              <div className={styles.metadataSection}>
                <h3>Image Details</h3>
                <ul>
                  {selectedImage.prompt && <li><strong>Prompt:</strong> {selectedImage.prompt}</li>}
                  {selectedImage.negativePrompt && <li><strong>Negative Prompt:</strong> {selectedImage.negativePrompt}</li>}
                  <li><strong>Type:</strong> {selectedImage.type === '3d_model' ? '3D Model' : selectedImage.type === 'video' ? 'Video' : 'Image'}</li>
                  <li><strong>Dimensions:</strong> {selectedImage.width || 512} × {selectedImage.height || 512}</li>
                  <li><strong>Steps:</strong> {selectedImage.steps || 25}</li>
                  <li><strong>Guidance Scale:</strong> {selectedImage.guidanceScale || 7.5}</li>
                  <li><strong>Seed:</strong> {selectedImage.seed ?? '—'}</li>
                  <li><strong>Scheduler:</strong> {selectedImage.scheduler || 'normal'}</li>
                  <li><strong>Clip Skip:</strong> {selectedImage.clipSkip || 0}</li>
                  <li><strong>Style:</strong> {selectedImage.style || 'default'}</li>
                  <li><strong>Model:</strong> {selectedImage.model || 'default'}</li>
                  {selectedImage.modelUrl && <li><strong>File:</strong> GLB</li>}
                  <li><strong>Created:</strong> {new Date(selectedImage.createdAt).toLocaleString()}</li>
                </ul>
              </div>
              <div className={styles.actions}>
                <button 
                  onClick={() => handleLike(selectedImage._id, selectedImage.likes || 0)} 
                  className={`${styles.actionButton} ${selectedImage.userLiked ? styles.active : ''} ${loadingStates[`${selectedImage._id}_like`] ? styles.loading : ''}`}
                  disabled={loadingStates[`${selectedImage._id}_like`]}
                >
                  <img src={like} alt="Like" />
                  <span>{selectedImage.likes || 0}</span>
                </button>
                <button 
                  onClick={() => handleFire(selectedImage._id, selectedImage.fires || 0)}
                  className={`${styles.actionButton} ${selectedImage.userFired ? styles.active : ''} ${loadingStates[`${selectedImage._id}_fire`] ? styles.loading : ''}`}
                  disabled={loadingStates[`${selectedImage._id}_fire`]}
                >
                  <img src={fire} alt="Fire" />
                  <span>{selectedImage.fires || 0}</span>
                </button>
                <button 
                  onClick={() => handleShare(selectedImage._id, selectedImage.shares || 0)}
                  className={`${styles.actionButton} ${loadingStates[`${selectedImage._id}_share`] ? styles.loading : ''}`}
                  disabled={loadingStates[`${selectedImage._id}_share`]}
                >
                  <img src={share} alt="Share" />
                  <span>{selectedImage.shares || 0}</span>
                </button>
                <button 
                  onClick={() => handleView(selectedImage._id, selectedImage.views || 0)}
                  className={`${styles.actionButton} ${loadingStates[`${selectedImage._id}_view`] ? styles.loading : ''}`}
                  disabled={loadingStates[`${selectedImage._id}_view`]}
                >
                  <img src={view} alt="View" />
                  <span>{selectedImage.views || 0}</span>
                </button>
                <button 
                  onClick={() => handleDownload(selectedImage.type === '3d_model' ? selectedImage.modelUrl : selectedImage.image, `image_${selectedImage._id}.${selectedImage.type === '3d_model' ? 'glb' : 'png'}`)}
                  className={styles.actionButton}
                >
                  <img src={download} alt="Download" />
                  <span>Download</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {loadError ? (
        <div style={{ textAlign: 'center', margin: '2rem 0' }}>
          <p style={{ color: 'red' }}>⚠️ Error loading images.</p>
          <button onClick={() => fetchImages(page + 1, true)} className={styles.loadMoreButton}>
            Try Again
          </button>
        </div>
      ) : (
        <div ref={loaderRef} style={{ height: '50px', textAlign: 'center' }}>
          {isLoading && <p>Loading more images...</p>}
        </div>
      )}

      {!hasMore && images.length > 0 && (
        <div className={styles.endMessage}>
          <span>✓</span> You've reached the end. No more images to load.
        </div>
      )}
    </div>
  );
};

export default ImageGallery;
