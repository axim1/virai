import React, { useState, useEffect } from 'react';
import './Home.css'; // Your CSS file for styling
import wsImage from '../../assets/House_sketch to image.jpg'; // Replace with your image path
import wsImage1 from '../../assets/House_sketch-to-image_web.jpg'; // Replace with your image path
import wsImage2 from '../../assets/Organic shapes mansion on a cliff.jpg'; // Replace with your image path
import wsImage3 from '../../assets/3D object chair.jpg'; // Replace with your image path
import wsImage4 from '../../assets/3D object chair 02.jpg'; // Replace with your image path
import wsImage5 from '../../assets/House_sketch-to-image_web.jpg'; // Replace with your image path
// D:\virai\my-app\src\assets\House_sketch to image.jpg
import './Switcher.css'
// my-app\src\assets\House_sketch-to-image_web.jpg
// 
// my-app\src\assets\Organic shapes mansion on a cliff.jpg
import Navbar from '../Navbar/Navbar';
import ImageSlider from './Components/ImageSlider';
import FeaturesSection from './Components/FeaturesSection';
import Gallery from './Components/Gallery';
import TestimonialCarousel from './Components/TestimonialCarousel';
import ImageGenerator from './Components/ImageGenerator';
import ImageLibrary from '../ImageGenComp/ImageLibrary';
import PricingSection from './Components/PricingSection';
const username = JSON.parse(localStorage.getItem('user')) || {};
const userId = username._id;
function Home() {

    const [generatedImages, setGeneratedImages] = useState([]); // State to store generated images


    const generateImages = (images) => {
        setGeneratedImages(images);
      };
    

    const sliderImages = [
        { image: wsImage },
        { image: wsImage },
        { image: wsImage },
      ];
      






    return (
        <div style={{backgroundColor:"#13181d"}}>
        <Navbar/>
            <div className="herosection" >
                <div className='content-herosection'>
                    <h1 style={{fontSize:"70px"}}>Create beautiful art with Artificial Intelligence</h1>
                    <p>Be advised that image generation requires an active OpenAI, Stability AI or Stable Diffusion token.

</p>
                    {/* <h1 style={{color:"#ffde59", fontSize:"90px"}} >You need vision.</h1> */}
                    {/* <h1 style={{color:"#ffde59", fontSize:"25px"}}>Your Vision Becomes Reality. Experience the breath taking AI tools while creating your digital art. Create stunning inspirations in architecture. Unleash your imagination and transform it into reality.</h1> */}
                    {/* <button className='home-button'>CREATE</button> */}
                </div>
            </div>

            <div className="sc_switcher_controls">
			<div className="sc_switcher_controls_section1">
				<h3 className="sc_switcher_controls_section_title">Standard</h3>
			</div>
			<div className="sc_switcher_controls_toggle sc_switcher_controls_toggle_on">
				<span className="sc_switcher_controls_toggle_button"></span>
			</div>
			<div className="sc_switcher_controls_section2">
				<h3 className="sc_switcher_controls_section_title">Advanced</h3>
			</div>
		</div> 


        <div style={{ width:"100%",padding:" 50px 25%"}}>


<ImageGenerator onGenerateImage={generateImages}/>
</div> 
{userId &&
<div className="scrollableContainer" id="gallery-section">
        <ImageLibrary userId={userId} />
      </div>}
        <ImageSlider slides={sliderImages}/>

        <div className="huge-collection-section">
    <div className="content-container">
        <div className="text-block">
            <p className="subtitle">HUGE COLLECTION</p>
            <h2 className="title">More algorithms than anywhere else.</h2>
        </div>
        <div className="description-block">
            <p className="description">Adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco.</p>
            <p className="description">Adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam.</p>
        </div>
    </div>
</div>


<FeaturesSection/>
<div style={{ width:"100%",padding:"50px 20%"}}>
<Gallery/>
     
     
</div>

<div style={{ width:"100%",padding:" 50px 20%"}}>
<TestimonialCarousel/>
</div>
            <div className="tools-section-2" >
                <div className='content-tools-section-2'>
                    <h1>Try out the most amazing AI tools.</h1>
                    <br />
                    <p>Are you looking for inspirations in art, architecture, or design? Using our AI tools you can generate high-quality images, videos or 3D objects. Trust VirtuartAI to bring your digital vision to life.</p>
                    <br />
                    <br />
                    <br />
                    <br />
                    <br />

                </div>
                <div className='grid-tools-section-2'>
                    <div className='items-grid-tools-section-2'>
                        <img src={wsImage} alt="Descriptive text" className="my-image-class" />
                        <br />

                        <h2>Text to Image generator</h2>
                        <br />
                        <p>Convert your textual ideas into stunning images. Create art, architectural renderings or any other imagination.</p>
                    </div>
                    <div className='items-grid-tools-section-2'>
                        <img src={wsImage2} alt="Descriptive text" className="my-image-class" />
                        <br />
                        <h2>Video generator</h2>
                        <br />
                        <p>Generate videos from your images or text prompts. Use realistic virtual human avatars, or create your own custom character.</p>
                    </div>
                    <div className='items-grid-tools-section-2'>
                        <img src={wsImage1} alt="Descriptive text" className="my-image-class" />
                        <br />
                        <h2>3D Object generator</h2>
                        <br />
                        <p>Using text prompts create 3D objects or interiors, download them and insert into your project.</p>
                    </div>                    <div className='items-grid-tools-section-2'>
                        <img src={wsImage3} alt="Descriptive text" className="my-image-class" />
                        <br />
                        <h2>Image to sketch generator</h2>
                        <br />
                        <p>Upload images, photographs, portraits and transform them into beautiful pencil drawings, colored sketches or artistic paintings.</p>
                    </div>                    <div className='items-grid-tools-section-2'>
                        <img src={wsImage4} alt="Descriptive text" className="my-image-class" />
                        <br />
                        <h2>Sketch to image generator</h2>
                        <br />
                        <p>Upload sketches and transform them into beautiful renderings, photographs, colored drawings or artistic idea</p>
                    </div>                    <div className='items-grid-tools-section-2'>
                        <img src={wsImage5} alt="Descriptive text" className="my-image-class" />
                        <br />
                        <h2>Image variation</h2>
                        <br />
                        <p>Add variation to your images, improve colors, extend images, replace marked areas or remove background or elements.</p>
                    </div>

                </div>




            </div>
            <PricingSection/>
            {/* <div className="clients-section-2">
                <div className='heading-clients-section-2'><h2>Our Clients</h2></div>
                <div className='content-clients-section-2'>
                    <div className='grid-clients-section-2'>
                     <img src={wsImage} alt="Descriptive text" className="my-image-class" />
                       <img src={wsImage} alt="Descriptive text" className="my-image-class" />
                      <img src={wsImage} alt="Descriptive text" className="my-image-class" />
                      
                    </div>
                </div>
            </div> */}



            {/* <div className='about-us-section'>
                <div className='content-about-us-section'>
                    <h1>About us</h1>
                    <p>Welcome to VirtuartAI, a leading digital development and design company based in Slovakia. With a focus on innovation and creativity, we strive to deliver exceptional solutions tailored to meet our clients' unique needs.</p>
                    <p>Our team of experts is dedicated to providing top-notch services that drive business growth and success. At VirtuartAI, we are committed to excellence in every project we undertake, ensuring client satisfaction and long-term partnerships.</p>

                </div>
                <div className='img-about-us-section'>
                    <img src={wsImage} alt="Descriptive text" className="my-image-class" />

                </div>
            </div> */}



{/* 

            <div className='contact-us-section'>
                <div className='content-contact-us-section'>
                    <h1>Contact Us Now</h1>
                    <p>Fill out the form below to get in touch with us. We are here to help with all your digital development and design requirements.</p>
                </div>
                <div className='form-contact-us-section'>
                    <form>
                        <div className='form-input-top'>
                            <div className="form-group">
                                <label htmlFor="name" style={{color:"#2f2f2f"}}>Name</label>
                                <input type="text" id="name" name="name" placeholder="Your name.." />
                            </div>
                            <div className="form-group">
                                <label htmlFor="email" style={{color:"#2f2f2f"}}>E-mail</label>
                                <input type="email" id="email" name="email" placeholder="Your email.." />
                            </div>
                        </div>

                        <div className="form-group">
                            <label htmlFor="message" style={{color:"#2f2f2f"}}>Message</label>
                            <textarea id="message" name="message" placeholder="Write something.." />
                        </div>
                        <div style={{display:"flex", justifyContent:"flex-end"}}>
                        <button type="submit">Send</button>
                        </div>
                    </form>
                </div>
            </div> */}




    
                {/* <div className='content-footer'>
                    <h5>VirtuartAI</h5>

                </div> */}

                {/* <footer className="footer">
  <div className="footer-content">
    <h1>We develop & create digital future.</h1>
    <div className="footer-links">
      <div className="link-section">
        <p>About Us</p>
        <p>Services</p>
        <p>Contacts</p>
      </div>
      <div className="address-section">
        <h4>Address</h4>
        <p>Germany —</p>
        <p>785 15h Street, Office 478</p>
        <p>Berlin, De 81566</p>
      </div>
      <div className="contact-section">
        <h4>Say Hello</h4>
        <p>info@email.com</p>
        <p>+1 800 555 25 65</p>
      </div>
      <div className="social-links">
        <a href="#"><i className="fa fa-facebook"></i></a>
        <a href="#"><i className="fa fa-twitter"></i></a>
        <a href="#"><i className="fa fa-instagram"></i></a>
        <a href="#"><i className="fa fa-dribbble"></i></a>
      </div>
    </div>
  </div>
  <div className="footer-bottom">
    <p>AxiomThemes © 2024. All Rights Reserved.</p>
  </div>
</footer> */}
<footer className="footer">
  <div className="footer-top">
    <h1 style={{fontSize:"35px"}}>We develop & create digital future.</h1>
    {/* <div className="footer-links">
      <a href="#">About Us</a>
      <a href="#">Services</a>
      <a href="#">Contacts</a>
    </div> */}
    <div className="footer-address">
      <h1>Address</h1>
      <p>Germany —</p>
      <p>785 15h Street, Office 478</p>
      <p>Berlin, De 81566</p>
    </div>
    <div className="footer-contact">
      <h1>Say Hello</h1>
      <p>info@email.com</p>
      <p>+1 800 555 25 65</p>
    </div>
    <div className="footer-social">
      <a href="#"><i className="fa fa-facebook"></i></a>
      <a href="#"><i className="fa fa-twitter"></i></a>
      <a href="#"><i className="fa fa-instagram"></i></a>
    </div>
  </div>
  <div className="footer-bottom">
    <p>AxiomThemes © 2024. All Rights Reserved.</p>
  </div>
</footer>


        </div>
    );
}

export default Home;
