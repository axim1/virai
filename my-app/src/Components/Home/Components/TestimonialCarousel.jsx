import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import styles from "./TestimonialCarousel.module.css";

const testimonials = [
  { rating: 5, text: "VirtuartAI is simple to use and provided excellent results.", user: "John D." },
  { rating: 4, text: "Great service, very helpful and reliable.", user: "Sarah L." },
  { rating: 5, text: "Best AI tool I've used so far!", user: "Michael W." },
  { rating: 5, text: "Seamless experience with great features.", user: "Emily R." },
  { rating: 4, text: "Impressive results, I highly recommend it.", user: "David P." },
];

export default function TestimonialCarousel() {
  return (
    <div className={styles.carouselContainer}>
      <p className={styles.p1}>Reviews
      </p>
      <p className={styles.p2}>Real Stories, Real Results</p>
      <Swiper
        modules={[Pagination]}
        spaceBetween={20}
        loop={true}
        slidesPerView="auto"
        pagination={{
          el: ".customPagination", // Removed hyphen
          clickable: true,
        }}
        breakpoints={{
          320: { slidesPerView: 1 },
          768: { slidesPerView: 2 },
          1024: { slidesPerView: 3 },
          1200: { slidesPerView: 4 },
        }}
        className={styles.swiper}
      >
        {testimonials.map((testimonial, index) => (
          <SwiperSlide key={index} className={styles.slide}>
            <div className={styles.testimonialCard}>
              <div className={styles.Quotes}>
            <svg xmlns="http://www.w3.org/2000/svg" width="34" height="29" viewBox="0 0 34 29" fill="none">
  <g clip-path="url(#clip0_195_348)">
    <path d="M15.44 18.01C15.4347 20.7375 14.3489 23.3517 12.4203 25.2803C10.4917 27.2089 7.87745 28.2947 5.14999 28.3H3.85999C3.52041 28.2948 3.19636 28.1569 2.95715 27.9158C2.71794 27.6748 2.58256 27.3496 2.57999 27.01V24.44C2.57998 24.0996 2.71452 23.773 2.95428 23.5314C3.19405 23.2897 3.51959 23.1527 3.85999 23.15H5.14999C6.51239 23.1474 7.81825 22.605 8.78162 21.6416C9.74498 20.6783 10.2874 19.3724 10.29 18.01V17.36C10.29 16.8481 10.0866 16.3572 9.7247 15.9953C9.36276 15.6334 8.87185 15.43 8.35999 15.43H3.85999C3.35356 15.4313 2.85186 15.3327 2.38361 15.1398C1.91535 14.9469 1.48973 14.6635 1.13116 14.3059C0.772599 13.9483 0.488112 13.5234 0.294006 13.0557C0.0999007 12.5879 -1.7083e-06 12.0864 0 11.58V3.86002C0 2.83628 0.406664 1.85448 1.13055 1.13058C1.85444 0.406694 2.83625 0 3.85999 0H11.58C12.6037 0 13.5855 0.406694 14.3094 1.13058C15.0333 1.85448 15.44 2.83628 15.44 3.86002V18.01ZM33.44 18.01C33.4321 20.7367 32.3454 23.3494 30.4174 25.2774C28.4894 27.2054 25.8766 28.2921 23.15 28.3H21.86C21.5195 28.2949 21.1944 28.1573 20.9536 27.9165C20.7127 27.6757 20.5752 27.3505 20.57 27.01V24.44C20.5726 24.0987 20.7094 23.7721 20.9507 23.5307C21.1921 23.2894 21.5187 23.1526 21.86 23.15H23.15C24.5124 23.1474 25.8183 22.605 26.7816 21.6416C27.745 20.6783 28.2874 19.3724 28.29 18.01V17.36C28.29 16.8481 28.0866 16.3572 27.7247 15.9953C27.3628 15.6334 26.8719 15.43 26.36 15.43H21.86C21.3536 15.4313 20.8519 15.3327 20.3836 15.1398C19.9153 14.9469 19.4897 14.6635 19.1312 14.3059C18.7726 13.9483 18.4881 13.5234 18.294 13.0557C18.0999 12.5879 18 12.0864 18 11.58V3.86002C18 2.83628 18.4067 1.85448 19.1306 1.13058C19.8544 0.406694 20.8363 0 21.86 0H29.58C30.6037 0 31.5855 0.406694 32.3094 1.13058C33.0333 1.85448 33.44 2.83628 33.44 3.86002V18.01Z" fill="#2E8B57"/>
  </g>
  <defs>
    <clipPath id="clip0_195_348">
      <rect width="33.44" height="28.3" fill="white"/>
    </clipPath>
  </defs>
</svg>
</div>
              <div className={styles.rating}>
                {Array.from({ length: testimonial.rating }, (_, i) => (
                  <span key={i} className={styles.star}>★</span>
                ))}
              </div>
              <p className={styles.text}>{testimonial.text}</p>
              <hr className={styles.separator} />
              <p className={styles.user}>{testimonial.user}</p>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      {/* ✅ Make sure the pagination container is inside JSX */}
      {/* <div className={styles.customPagination}></div> */}
    </div>
  );
}
