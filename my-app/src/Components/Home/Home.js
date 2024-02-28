import React from 'react';
import './Home.css'; // Your CSS file for styling
import wsImage from '../../assets/workspace.jpg'; // Replace with your image path
import Navbar from '../Navbar/Navbar';

function Home() {
    return (
        <>
        <Navbar/>
            <div className="herosection" >
                <div className='content-herosection'>
                    <h1>You don't need eyes to see, You need vision.</h1>
                    <p>Your Vision Becomes Reality. Experience the breath taking AI tools while creating your digital art. Create stunning inspirations in architecture. Unleash your imagination and transform it into reality.</p>
                    <button className='home-button'>Learn More</button>
                </div>
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
                        <img src={wsImage} alt="Descriptive text" className="my-image-class" />
                        <br />
                        <h2>Video generator</h2>
                        <br />
                        <p>Generate videos from your images or text prompts. Use realistic virtual human avatars, or create your own custom character.</p>
                    </div>
                    <div className='items-grid-tools-section-2'>
                        <img src={wsImage} alt="Descriptive text" className="my-image-class" />
                        <br />
                        <h2>3D Object generator</h2>
                        <br />
                        <p>Using text prompts create 3D objects or interiors, download them and insert into your project.</p>
                    </div>                    <div className='items-grid-tools-section-2'>
                        <img src={wsImage} alt="Descriptive text" className="my-image-class" />
                        <br />
                        <h2>Image to sketch generator</h2>
                        <br />
                        <p>Upload images, photographs, portraits and transform them into beautiful pencil drawings, colored sketches or artistic paintings.</p>
                    </div>                    <div className='items-grid-tools-section-2'>
                        <img src={wsImage} alt="Descriptive text" className="my-image-class" />
                        <br />
                        <h2>Sketch to image generator</h2>
                        <br />
                        <p>Upload sketches and transform them into beautiful renderings, photographs, colored drawings or artistic idea</p>
                    </div>                    <div className='items-grid-tools-section-2'>
                        <img src={wsImage} alt="Descriptive text" className="my-image-class" />
                        <br />
                        <h2>Image variation</h2>
                        <br />
                        <p>Add variation to your images, improve colors, extend images, replace marked areas or remove background or elements.</p>
                    </div>

                </div>




            </div>
            <div className="clients-section-2">
                <div className='heading-clients-section-2'><h2>Our Clients</h2></div>
                <div className='content-clients-section-2'>
                    <div className='grid-clients-section-2'>
                        {/* <div className='items-grid-clients-section-2'> */}
                        <img src={wsImage} alt="Descriptive text" className="my-image-class" />
                        {/* </div> */}
                        {/* <div className='items-grid-clients-section-2'> */}
                        <img src={wsImage} alt="Descriptive text" className="my-image-class" />
                        {/* </div> */}
                        {/* <div className='items-grid-clients-section-2'> */}
                        <img src={wsImage} alt="Descriptive text" className="my-image-class" />
                        {/* </div> */}
                    </div>
                </div>
            </div>



            <div className='about-us-section'>
                <div className='content-about-us-section'>
                    <h1>About us</h1>
                    <p>Welcome to VirtuartAI, a leading digital development and design company based in Slovakia. With a focus on innovation and creativity, we strive to deliver exceptional solutions tailored to meet our clients' unique needs.</p>
                    <p>Our team of experts is dedicated to providing top-notch services that drive business growth and success. At VirtuartAI, we are committed to excellence in every project we undertake, ensuring client satisfaction and long-term partnerships.</p>

                </div>
                <div className='img-about-us-section'>
                    <img src={wsImage} alt="Descriptive text" className="my-image-class" />

                </div>
            </div>





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
            </div>




    
                <div className='content-footer'>
                    <h5>VirtuartAI</h5>

                </div>
        </>
    );
}

export default Home;
