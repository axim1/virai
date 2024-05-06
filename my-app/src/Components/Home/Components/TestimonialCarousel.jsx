import React from 'react';
import Slider from "react-slick";
import styles from './TestimonialCarousel.module.css';

const testimonials = [
  {
    name: "Jacob Daniels",
    position: "Engineer",
    quote: "Ignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti quos dolores et quas molestias excepturi.",
    image: "/path/to/image1.jpg"  // Replace with actual image path
  },
  {
    name: "Asim Daniels",
    position: "Engineer",
    quote: "Ignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti quos dolores et quas molestias excepturi.",
    image: "/path/to/image1.jpg"  // Replace with actual image path
  },
  // Add more testimonials as needed
];
function SampleNextArrow(props) {
    const { className, style, onClick } = props;
    return (
      <div
        className={className}
        style={{ ...style, display: "block", background: "grey" }}
        onClick={onClick}
      />
    );
  }
  
  function SamplePrevArrow(props) {
    const { className, style, onClick } = props;
    return (
      <div
        className={className}
        style={{ ...style, display: "block", background: "grey" }}
        onClick={onClick}
      />
    );
  }
  
function TestimonialCarousel() {
    const settings = {
      dots: true,  // Show dot indicators at the bottom
      infinite: true,  // Enable infinite looping
      speed: 500,  // Transition speed in milliseconds
      slidesToShow: 1,  // Show one slide at a time
      slidesToScroll: 1,  // Scroll one slide at a time
      autoplay: true,  // Enable autoplay
      autoplaySpeed: 2000,  // Delay in autoplay in milliseconds
    //   nextArrow: <SampleNextArrow />,  // Custom next arrow component
    //   prevArrow: <SamplePrevArrow />,  // Custom prev arrow component
    };
  
    return (
      <div className={styles.container}>
        <Slider {...settings}>
          {testimonials.map((testimonial, index) => (
            <div key={index} className={styles.testimonialItem}>
              {/* <img src={testimonial.image} alt={testimonial.name} className={styles.avatar} /> */}
              <blockquote className={styles.quote}>{testimonial.quote}</blockquote>
              <div className={styles.author}>
                {testimonial.name}
                <span className={styles.position}>{testimonial.position}</span>
              </div>
            </div>
          ))}
        </Slider>
      </div>
    );
  }
  

export default TestimonialCarousel;
