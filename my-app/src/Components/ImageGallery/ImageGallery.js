// ImageGallery.jsx with react-masonry-css
import React, { useState, useEffect, useCallback,useRef } from 'react';
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

const ImageGallery = () => {
  const loaderRef = useRef(null);
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
  const [selectedModel, setSelectedModel] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const limit = 8;

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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

  const fetchImages = useCallback(async (pageNum = 1, append = false) => {
    try {
  setIsLoading(true);
  setLoadError(false); // reset before new attempt

  let url = `${apiUrl}api/images?filter=${filter}&page=${pageNum}&limit=${limit}`;
  if (filter === 'Owned by Me' && user?._id) {
    url += `&userId=${user._id}`;
  }

  const response = await fetch(url);
  if (!response.ok) throw new Error("Server responded with error");

  const data = await response.json();

  if (data.images.length === 0) {
    setHasMore(false);
  } else {
    setHasMore(data.images.length === limit);
    setImages(prev => (append ? [...prev, ...data.images] : data.images));
    setPage(pageNum);
  }
} catch (error) {
  setError(error.message);
  setLoadError(true); // this disables auto-load
} finally {
  setIsLoading(false);
}

  }, [filter, user, limit]);

  useEffect(() => {
    setPage(1);
    setHasMore(true);
    fetchImages(1, false);
  }, [filter, user]);

  const handleFilterChange = selectedFilter => {
    setFilter(selectedFilter);
    setImages([]);
    setPage(1);
    setHasMore(true);
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
    } catch (error) {
      console.error('Error downloading:', error);
    }
  };

  const handleLike = async id => {
    try {
      const response = await fetch(`${apiUrl}api/images/${id}/like`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!response.ok) throw new Error(`Failed to like image: ${response.status}`);
      const updatedImage = await response.json();
      setImages(prevImages => prevImages.map(img => (img._id === id ? { ...img, likes: updatedImage.likes } : img)));
    } catch (error) {
      console.error('Error liking image:', error);
    }
  };

  const handleView = async id => {
    try {
      const response = await fetch(`${apiUrl}api/images/${id}/view`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!response.ok) throw new Error(`Failed to view image: ${response.status}`);
      const updatedImage = await response.json();
      setImages(prevImages => prevImages.map(img => (img._id === id ? { ...img, views: updatedImage.views } : img)));
    } catch (error) {
      console.error('Error viewing image:', error);
    }
  };



  const renderContent = image => {
  if (image.type === '3d_model') {
    return (
      <div className={styles.modelContainer} onClick={() => setSelectedModel({ ...image, modelUrl: image.image })}>
        <img src={placeholder3d} alt={`3D Model ${image._id}`} className={styles.galleryImage} style={{ cursor: 'pointer' }} />
      </div>
    );
  }

  if (image.type === 'video') {
    return (
      <video
        src={image.image}
        className={styles.galleryImage}
        controls={false}
        muted
        loop
        onClick={() => setSelectedImage(image)}
        style={{ cursor: 'pointer' }}
      />
    );
  }

  return (
    <img
      src={image.image}
      alt={`Generated ${image._id}`}
      className={styles.galleryImage}
      onClick={() => setSelectedImage(image)}
      style={{ cursor: 'pointer' }}
    />
  );
};



  // const renderContent = image => {
  //   if (image.type === '3d_model') {
  //     return (
  //       <div className={styles.modelContainer} onClick={() => setSelectedModel({ ...image, modelUrl: image.image })}>
  //         <img src={placeholder3d} alt={`3D Model ${image._id}`} className={styles.galleryImage} style={{ cursor: 'pointer' }} />
  //       </div>
  //     );
  //   }
  //   return (
  //     <img
  //       src={image.image}
  //       alt={`Generated ${image._id}`}
  //       className={styles.galleryImage}
  //       onClick={() => setSelectedImage(image)}
  //       style={{ cursor: 'pointer' }}
  //     />
  //   );
  // };

  const breakpointColumnsObj = {
    default: 4,
    1200: 3,
    900: 2,
    600: 1,
  };
  const getProfilePicUrl = (picPath) => {
    if (!picPath) return "https://via.placeholder.com/100x100.png?text=User";
    const filename = picPath.split("\\").pop().split("/").pop(); // Handle both slashes
    return `${API_BASE}api/uploads/profilepic/${filename}?t=${Date.now()}`;
  };
//   test
  return (
    <div className={styles.gallery}>
      <p className={styles.p3}>Gallery</p>

      <div className={styles.filterBar}>
        {isMobile ? (
          <select className={styles.filterDropdownButton} onChange={e => handleFilterChange(e.target.value)} value={filter}>
            {filters.map((filter, index) => (
              <option key={index} value={filter}>{filter}</option>
            ))}
          </select>
        ) : (
          <div className={styles.filterItems}>
            {filters.map((f, index) => (
              <button key={index} className={`${styles.filterItem} ${filter === f ? styles.activeFilter : ''}`} onClick={() => handleFilterChange(f)}>
                {f}
              </button>
            ))}
          </div>
        )}
        <div className={styles.rightIconCont}>
          <img src={filterIcon} className={styles.filterIcon} alt="Filter" /> Filters
        </div>
      </div>

      <div className={styles.selectedFilterDiv}>{filter}</div>

      <Masonry
        breakpointCols={breakpointColumnsObj}
        className={styles.masonryGrid}
        columnClassName={styles.masonryColumn}
      >
        {[...images, ...(isLoading ? Array(limit).fill({ loading: true }) : [])].map((image, index) => (
          <div key={`image-${index}`} className={styles.imageItem}>
            {image.loading ? (
              <div className={styles.imagePlaceholder}></div>
            ) : (
              <>
                {renderContent(image)}
                <div className={styles.userInfo}>
                  <img           src={getProfilePicUrl(image.owner?.profilePic || '')}
 className={styles.logo} alt="User Profile" />
                  <span className={styles.userName}>{image.owner?.name || 'Anonymous'}</span>
                </div>
              </>
            )}
          </div>
        ))}
      </Masonry>

      {selectedImage && (
        <div className={styles.modal} onClick={() => setSelectedImage(null)}>
          <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <button className={styles.closeButton} onClick={() => setSelectedImage(null)}>&times;</button>
              <div className={styles.modalImageWrapper}>
                {selectedImage.type === 'video' ? (
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
              <div>
                <h3>Image Details</h3>
                <ul>
                  {selectedImage.prompt && <li><strong>Prompt:</strong> {selectedImage.prompt}</li>}
                  {selectedImage.negativePrompt && <li><strong>Negative Prompt:</strong> {selectedImage.negativePrompt}</li>}
                  <li><strong>Dimensions:</strong> {selectedImage.width || 512} × {selectedImage.height || 512}</li>
                  <li><strong>Steps:</strong> {selectedImage.steps || 25}</li>
                  <li><strong>Guidance Scale:</strong> {selectedImage.guidanceScale || 7.5}</li>
                  <li><strong>Seed:</strong> {selectedImage.seed ?? '—'}</li>
                  <li><strong>Scheduler:</strong> {selectedImage.scheduler || 'normal'}</li>
                  <li><strong>Clip Skip:</strong> {selectedImage.clipSkip || 0}</li>
                  <li><strong>Style:</strong> {selectedImage.style || 'default'}</li>
                  <li><strong>Model:</strong> {selectedImage.model || 'default'}</li>
                  <li><strong>Created:</strong> {new Date(selectedImage.createdAt).toLocaleString()}</li>
                </ul>
              </div>
              <div className={styles.actions}>
                <button onClick={() => handleLike(selectedImage._id)}><img src={like} alt="Like" /></button>
                <button><img src={fire} alt="Fire" /></button>
                <button><img src={share} alt="Share" /></button>
                <button><img src={view} alt="View" /></button>
                <button onClick={() => handleDownload(selectedImage.type === '3d_model' ? selectedImage.modelUrl : selectedImage.image, `image_${selectedImage._id}.${selectedImage.type === '3d_model' ? 'glb' : 'png'}`)}>
                  <img src={download} alt="Download" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedModel && (
        <div className={styles.modal} onClick={() => setSelectedModel(null)}>
          <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <button className={styles.closeButton} onClick={() => setSelectedModel(null)}>×</button>
            <div className={styles.modelViewerContainer}>
              <ModelViewer modelPath={selectedModel.modelUrl} />
            </div>
          </div>
        </div>
      )}
      {/* {!isLoading && hasMore && (
        <div style={{ textAlign: 'center', margin: '2rem 0' }}>
          <button onClick={() => fetchImages(page + 1, true)} className={styles.loadMoreButton}>
            Load More
          </button>
        </div>
      )} */}
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
