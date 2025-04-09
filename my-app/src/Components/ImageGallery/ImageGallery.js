import React, { useState, useEffect } from 'react';
import styles from './ImageGallery.module.css';
import wsImage from '../../assets/images/texttoimage (7).png'; // Replace with your image path
import wsImage1 from '../../assets/images/texttoimage (1).png'; // Replace with your image path
import wsImage2 from '../../assets/images/texttoimage (2).png'; // Replace with your image path
import wsImage3 from '../../assets/images/texttoimage (3).png'; // Replace with your image path
import wsImage4 from '../../assets/images/texttoimage (4).png'; // Replace with your image path
import wsImage5 from '../../assets/images/texttoimage (5).png'; // Replace with your image path
import wsImage6 from '../../assets/images/texttoimage (6).png'; // Replace with your image path
import like from '../../assets/vector_icons/like.svg';
import fire from '../../assets/vector_icons/fire.svg';
import share from '../../assets/vector_icons/share.svg';
import view from '../../assets/vector_icons/view.svg';
import download from '../../assets/vector_icons/download.svg';
import more from '../../assets/vector_icons/more.svg';

import filterIcon from '../../assets/vector_icons/Filters 1.svg'
const apiUrl = process.env.REACT_APP_API_URL;


const ImageGallery = () => {
    const storedUser = localStorage.getItem('user');

    const [user, setUser] = useState(null);
    const [loggedIn, setLoggedIn] = useState(null);

    const [searchTerm, setSearchTerm] = useState('');
    const [category, setCategory] = useState('3D OBJECT');
    const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
    const [filter, setFilter] = useState("Newest");
    const [images, setImages] = useState([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
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
        "Owned by Me", // <== Added

    ];





    useEffect(() => {
        const fetchImages = async () => {
            try {
                let url = `${apiUrl}api/images?filter=${filter}&page=${page}&limit=${limit}`;
                if (filter === "Owned by Me" && user?._id) {
                    url += `&userId=${user._id}`;
                }

                const response = await fetch(url);
                const data = await response.json();
                setImages(data.images);
                setTotalPages(Math.ceil(data.total / limit));
            } catch (error) {
                console.error("Error fetching images:", error);
            }
        };

        fetchImages();
    }, [filter, page, user]);


    const handleFilterChange = (selectedFilter) => {
        setFilter(selectedFilter);
        setPage(1); // Reset page when filter changes
    };

    const handleNextPage = () => {
        if (page < totalPages) {
            setPage(page + 1);
        }
    };

    const handlePrevPage = () => {
        if (page > 1) {
            setPage(page - 1);
        }
    };

    const handleDownload = async (imageUrl, filename) => {
        try {
            const response = await fetch(imageUrl);
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);

            const a = document.createElement('a');
            a.href = url;
            a.download = filename || 'downloaded_image.png'; // Default name if not provided
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error("Error downloading image:", error);
        }
    };

    const handleLike = async (id) => {
        try {
            console.log('image id: ', id)
            const response = await fetch(`${apiUrl}api/images/${id}/like`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
            });

            if (!response.ok) {
                throw new Error(`Failed to like image: ${response.status}`);
            }

            const updatedImage = await response.json();

            // Update state to reflect new like count
            setImages((prevImages) =>
                prevImages.map((img) =>
                    img.id === id ? { ...img, likes: updatedImage.likes } : img
                )
            );
        } catch (error) {
            console.error("Error liking image:", error);
        }
    };
    const handleView = async (id) => {
        try {
            console.log('image id: ', id)
            const response = await fetch(`${apiUrl}api/images/${id}/view`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
            });

            if (!response.ok) {
                throw new Error(`Failed to like image: ${response.status}`);
            }

            const updatedImage = await response.json();

            // Update state to reflect new like count
            setImages((prevImages) =>
                prevImages.map((img) =>
                    img.id === id ? { ...img, views: updatedImage.views } : img
                )
            );
        } catch (error) {
            console.error("Error liking image:", error);
        }
    };


    const handleSearch = () => {
        console.log(`Searching for "${searchTerm}" in category "${category}"`);
        // Add your search logic here
    };
    return (
        <div className={styles.gallery}>
            <p className={styles.p2}>Gallery</p>
            <p className={styles.p3}>

                Where Creativity Meets Technology
            </p>
            <div className={styles.searchContainer}>
                <div className={styles.dropdownButton}>
                    {category} <span className={styles.dropdownArrow}>▼</span>
                </div>
                <div className={styles.inputWrapper}>
                    <input
                        type="text"
                        className={styles.searchInput}
                        placeholder={`Search All ${category.toLowerCase()}`}
                        value={searchTerm}
                        style={{
                            backgroundColor: 'transparent',
                            paddingRight: '120px',
                            color: 'white'
                            // border: '2px solid #999',
                            // height: '70px',
                        }}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <button className={styles.searchButton} onClick={handleSearch}>
                        SEARCH
                    </button>
                    <button className={styles.searchButtonSml } onClick={handleSearch}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 30 30" fill="none">
  <rect width="30" height="30" rx="15" fill="#2E8B57"/>
  <path d="M20.8524 22.9912C20.7018 22.9919 20.5526 22.9625 20.4135 22.9048C20.2744 22.847 20.1482 22.7622 20.0423 22.6551L16.9565 19.576C15.6528 20.4757 14.0599 20.8556 12.4905 20.6413C10.9211 20.4269 9.48847 19.6337 8.47382 18.4174C7.45916 17.201 6.93575 15.6494 7.00631 14.067C7.07687 12.4846 7.7363 10.9857 8.85519 9.86446C9.97408 8.74326 11.4716 8.08073 13.0539 8.00691C14.6361 7.93308 16.1889 8.45329 17.4073 9.46543C18.6257 10.4776 19.4219 11.9086 19.6395 13.4775C19.8571 15.0465 19.4804 16.6401 18.5834 17.9457L21.6726 21.0349C21.7792 21.1411 21.8638 21.2674 21.9215 21.4064C21.9792 21.5454 22.0088 21.6945 22.0088 21.845C22.0052 22.1496 21.8819 22.4407 21.6656 22.6552C21.4492 22.8697 21.1571 22.9904 20.8524 22.9912ZM13.363 10.3185C12.5652 10.3185 11.7853 10.555 11.122 10.9983C10.4586 11.4415 9.94163 12.0715 9.63632 12.8086C9.33101 13.5457 9.25113 14.3567 9.40678 15.1392C9.56242 15.9217 9.94659 16.6404 10.5107 17.2046C11.0749 17.7687 11.7936 18.1529 12.5761 18.3085C13.3586 18.4642 14.1696 18.3843 14.9067 18.079C15.6438 17.7737 16.2738 17.2566 16.717 16.5933C17.1602 15.9299 17.3968 15.1501 17.3968 14.3522C17.3968 13.8225 17.2925 13.298 17.0898 12.8086C16.887 12.3192 16.5899 11.8745 16.2153 11.4999C15.8408 11.1254 15.3961 10.8282 14.9067 10.6255C14.4173 10.4228 13.8928 10.3185 13.363 10.3185Z" fill="white"/>
</svg>
                    </button>
                </div>
            </div>





            <div className={styles.filterBar}>

                {isMobile ? (
                    <select className={styles.filterDropdownButton} onChange={(e) => handleFilterChange(e.target.value)}>
                        {filters.map((filter, index) => (
                            <option key={index} value={filter}>{filter}</option>
                        ))}
                    </select>
                ) : (
                    <div className={styles.filterItems}>
                        {filters.map((f, index) => (
                            <button key={index}
                                className={`${styles.filterItem} ${filter === f ? styles.activeFilter : ''}`}
                                onClick={() => handleFilterChange(f)}>
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


            <div className={styles.selectedFilterDiv}>
                {filter}
            </div>


            <div className={styles.imagesContainer}>
                {images.map((image) => {
                    console.log(image);  // Debugging: check if id exists
                    // const base64String = `data:image/png;base64,${Buffer.from(image.image.data).toString("base64")}`;

                    return (

                        <div key={image._id} className={styles.imageItem}>
                            <img src={image.image} alt={image.alt} className={styles.image}
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
                                    } else {
                                        console.error("Failed to open new tab. Check browser pop-up settings.");
                                    }
                                }}

                                style={{ cursor: 'pointer' }}

                            />
                            <div className={styles.overlay}
                            // onClick={() => window.open(image.image, '_blank')}
                            >
                                <div className={styles.actions}>
                                    <div style={{ display: 'flex', height: '100%', flexDirection: 'column', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <button className={styles.like} onClick={() => handleLike(image._id)}>
                                            <img src={like} alt="Like" />
                                            {loggedIn &&
                                                <>
                                                    <span>{image.likes}</span>

                                                </>
                                            }
                                        </button>
                                        <button className={styles.fire}><img src={fire} />

                                            {loggedIn &&
                                                <>
                                                    <span>{image.fires}</span>

                                                </>
                                            }
                                        </button>
                                        <button className={styles.share}><img src={share} />

                                            {loggedIn &&
                                                <>
                                                    <span>{image.shares}</span>

                                                </>
                                            }
                                        </button>

                                        <button className={styles.view}><img src={view} />

                                            {loggedIn &&
                                                <>
                                                    <span>{image.views}</span>

                                                </>
                                            }
                                        </button>
                                        <button className={styles.download} onClick={() => handleDownload(image.image, `image_${image._id}.png`)}>
                                            <img src={download} alt="Download" />
                                        </button>
                                        <button className={styles.more}><img src={more} />

                                            {loggedIn &&
                                                <>
                                                    <span>{image.more}</span>

                                                </>
                                            }
                                        </button>

                                    </div>

                                </div>
                                <div className={styles.userInfo}>
                                    {image.owner?.profilePic ? (
                                        <img src={image.owner.profilePic} className={styles.logo} alt="User Profile" />
                                    ) : (
                                        <img src={image.logo} className={styles.logo} />
                                    )}
                                    <span className={styles.userName}>
                                        {image.owner?.name || "Anonymous"}
                                    </span>
                                </div>

                            </div>
                        </div>
                    )
                }
                )}

            </div>


            <div className={styles.pagination}>
                <button onClick={handleNextPage} disabled={page >= totalPages} className={styles.nextPageButton}>NEXT PAGE >> </button>
                <div style={{ display: 'flex', gap: '5px', alignItems: 'center', justifyContent: 'center' }}>
                    <div className={styles.noOfPages}>{page} </div>
                    <div className={styles.totalPages}>of {totalPages}</div>
                    <div style={{ gap: '0px' }}>


                        <button onClick={handlePrevPage} disabled={page === 1} className={styles.prevButton}>                <svg width="8" height="18" viewBox="0 0 8 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M4.37114e-07 9L7.5 0.339745L7.5 17.6603L4.37114e-07 9Z" fill="white" />
                        </svg>
                        </button>

                        <button onClick={handleNextPage} disabled={page >= totalPages} className={styles.nextButton}><svg width="8" height="18" viewBox="0 0 8 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M8 9L0.499999 0.339745L0.5 17.6603L8 9Z" fill="white" />
                        </svg>
                        </button>
                    </div>

                </div>

            </div>
        </div>
    );
};

export default ImageGallery;
