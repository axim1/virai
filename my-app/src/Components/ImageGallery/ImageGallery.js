import React, { useState, useEffect, useCallback } from 'react';
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

const ImageGallery = () => {
    const [user, setUser] = useState(null);
    const [loggedIn, setLoggedIn] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [category, setCategory] = useState('3D OBJECT');
    const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
    const [filter, setFilter] = useState("Newest");
    const [images, setImages] = useState([]);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [selectedModel, setSelectedModel] = useState(null);
    const limit = 8;

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 1024);
        };

        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
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

    const filters = [
        "Newest",
        "Oldest",
        "Most Liked",
        "Shared",
        "Trending",
        "Most Viewed",
        "Owned by Me",
    ];

    const fetchImages = useCallback(async (pageNum = 1, append = false) => {
        try {
            setIsLoading(true);
            let url = `${apiUrl}api/images?filter=${filter}&page=${pageNum}&limit=${limit}`;
            if (filter === "Owned by Me" && user?._id) {
                url += `&userId=${user._id}`;
            }

            console.log("📡 Fetching from:", url);
            const response = await fetch(url);
            const data = await response.json();
            
            console.log("📦 Received data:", {
                totalImages: data.images.length,
                firstImageType: data.images[0]?.type,
                firstImageModelUrl: data.images[0]?.modelUrl
            });

            if (data.images.length === 0) {
                setHasMore(false);
            } else {
                setHasMore(data.images.length === limit);
                setImages(prev => append ? [...prev, ...data.images] : data.images);
                setPage(pageNum);
            }
        } catch (error) {
            console.error("Error fetching images:", error);
            setError(error.message);
        } finally {
            setIsLoading(false);
        }
    }, [filter, user, limit]);

    useEffect(() => {
        setPage(1);
        setHasMore(true);
        fetchImages(1, false);
    }, [filter, user]);

    const handleFilterChange = (selectedFilter) => {
        setFilter(selectedFilter);
        setImages([]);
        setPage(1);
        setHasMore(true);
    };

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
            console.error("Error downloading:", error);
        }
    };

    const handleLike = async (id) => {
        try {
            const response = await fetch(`${apiUrl}api/images/${id}/like`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
            });
            if (!response.ok) throw new Error(`Failed to like image: ${response.status}`);

            const updatedImage = await response.json();
            setImages((prevImages) =>
                prevImages.map((img) =>
                    img._id === id ? { ...img, likes: updatedImage.likes } : img
                )
            );
        } catch (error) {
            console.error("Error liking image:", error);
        }
    };

    const handleView = async (id) => {
        try {
            const response = await fetch(`${apiUrl}api/images/${id}/view`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
            });
            if (!response.ok) throw new Error(`Failed to view image: ${response.status}`);

            const updatedImage = await response.json();
            setImages((prevImages) =>
                prevImages.map((img) =>
                    img._id === id ? { ...img, views: updatedImage.views } : img
                )
            );
        } catch (error) {
            console.error("Error viewing image:", error);
        }
    };

    const handleSearch = () => {
        console.log(`Searching for "${searchTerm}" in category "${category}"`);
    };

    const renderContent = (image) => {
        console.log("🎨 Rendering content for image:", {
            id: image._id,
            type: image.type,
            hasModelUrl: !!image.modelUrl,
            hasImage: !!image.image
        });

        if (image.type === '3d_model') {
            return (
                <div className={styles.modelContainer}>
                    <img
                        src={placeholder3d}
                        alt={`3D Model ${image._id}`}
                        className={styles.galleryImage}
                        onClick={() => {
                            handleView(image._id);
                            setSelectedModel({
                                ...image,
                                modelUrl: image.image
                            });
                        }}
                        style={{ cursor: 'pointer' }}
                    />
                </div>
            );
        }

        return (
            <img
                src={image.image}
                alt={`Generated ${image._id}`}
                className={styles.galleryImage}
                onClick={() => {
                    handleView(image._id);
                    const newTab = window.open();
                    if (newTab) {
                        newTab.document.write(`
                            <html>
                                <head><title>Image</title></head>
                                <body style="margin: 0; display: flex; align-items: center; justify-content: center; height: 100vh; background:black">
                                    <img src="${image.image}" style="max-width: 100%; height: auto;" />
                                </body>
                            </html>
                        `);
                        newTab.document.close();
                    }
                }}
                style={{ cursor: 'pointer' }}
            />
        );
    };

    return (
        <div className={styles.gallery}>
            <p className={styles.p3}>Gallery</p>

            <div className={styles.filterBar}>
                {isMobile ? (
                    <select
                        className={styles.filterDropdownButton}
                        onChange={(e) => handleFilterChange(e.target.value)}
                        value={filter}
                    >
                        {filters.map((filter, index) => (
                            <option key={index} value={filter}>{filter}</option>
                        ))}
                    </select>
                ) : (
                    <div className={styles.filterItems}>
                        {filters.map((f, index) => (
                            <button
                                key={index}
                                className={`${styles.filterItem} ${filter === f ? styles.activeFilter : ''}`}
                                onClick={() => handleFilterChange(f)}
                            >
                                {f}
                            </button>
                        ))}
                    </div>
                )}
                <div className={styles.rightIconCont}>
                    <img src={filterIcon} className={styles.filterIcon} alt="Filter" />
                    Filters
                </div>
            </div>

            <div className={styles.selectedFilterDiv}>{filter}</div>

            <div className={styles.imagesContainer}>
                {images.map((image, index) => (
                    <div key={`${image._id}-${index}`} className={styles.imageItem}>
                        {renderContent(image)}
                        <div className={styles.overlay}>
                            <div className={styles.actions}>
                                <div style={{ display: 'flex', height: '100%', flexDirection: 'column', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <button className={styles.like} onClick={() => handleLike(image._id)}>
                                        <img src={like} alt="Like" />
                                        {loggedIn && <span>{image.likes}</span>}
                                    </button>
                                    <button className={styles.fire}>
                                        <img src={fire} alt="Fire" />
                                        {loggedIn && <span>{image.fires}</span>}
                                    </button>
                                    <button className={styles.share}>
                                        <img src={share} alt="Share" />
                                        {loggedIn && <span>{image.shares}</span>}
                                    </button>
                                    <button className={styles.view}>
                                        <img src={view} alt="View" />
                                        {loggedIn && <span>{image.views}</span>}
                                    </button>
                                    <button className={styles.download} onClick={() => handleDownload(image.type === '3d_model' ? image.modelUrl : image.image, `image_${image._id}.${image.type === '3d_model' ? 'glb' : 'png'}`)}>
                                        <img src={download} alt="Download" />
                                    </button>
                                    <button className={styles.more}>
                                        <img src={more} alt="More" />
                                        {loggedIn && <span>{image.more}</span>}
                                    </button>
                                </div>
                            </div>
                            <div className={styles.userInfo}>
                                {image.owner?.profilePic ? (
                                    <img src={image.owner.profilePic} className={styles.logo} alt="User Profile" />
                                ) : (
                                    <img src={image.logo} className={styles.logo} alt="Logo" />
                                )}
                                <span className={styles.userName}>
                                    {image.owner?.name || "Anonymous"}
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

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

            {isLoading && (
                <div className={styles.loadingIndicator}>
                    <div className={styles.spinner}></div>
                    <p>Loading images...</p>
                </div>
            )}

            {!isLoading && hasMore && (
                <div style={{ textAlign: 'center', margin: '2rem 0' }}>
                    <button
                        onClick={() => fetchImages(page + 1, true)}
                        className={styles.loadMoreButton}
                    >
                        Load More
                    </button>
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
