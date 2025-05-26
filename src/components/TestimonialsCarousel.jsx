import React, { useState, useRef } from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import testimonials from "../data/testimonials.json";
import "../styles/TestimonialsCarousel.css";

function TestimonialsCarousel() {
    const [modalSrc, setModalSrc] = useState(null);
    const currentAudioRef = useRef(null);
    const sliderRef = useRef(null); // ✅ Reference to control the carousel
    // ✅ Pause videos on manual swipe
    const handleBeforeChange = () => {
        const videos = document.querySelectorAll(".testimonial-video");
        videos.forEach((video) => {
            if (!video.paused) {
                video.pause();
            }
        });
    };

    const settings = {
        dots: true,
        infinite: true,
        speed: 600,
        slidesToShow: 3,
        slidesToScroll: 1,
        autoplay: true,
        autoplaySpeed: 8000,
        pauseOnHover: true,
        beforeChange: handleBeforeChange, // ✅ Trigger on swipe
        responsive: [
            {
                breakpoint: 1024,
                settings: {
                    slidesToShow: 2,
                },
            },
            {
                breakpoint: 768,
                settings: {
                    slidesToShow: 1,
                },
            },
        ],
    };


    const getFlag = (code) =>
        `https://flagcdn.com/w40/${code.toLowerCase()}.png`;

    const handleAudioPlay = (e) => {
        if (currentAudioRef.current && currentAudioRef.current !== e.target) {
            currentAudioRef.current.pause();
        }
        currentAudioRef.current = e.target;
    };

    // ✅ Pause carousel when video plays
    const handleVideoPlay = () => {
        if (sliderRef.current) {
            sliderRef.current.slickPause();
        }
    };



    // ✅ Resume carousel when video ends or is paused
    const handleVideoEnd = () => {
        if (sliderRef.current) {
            sliderRef.current.slickPlay();
        }
    };

    return (
        <div className="testimonials-carousel-container">
            <h2 className="carousel-title">What Clients Say</h2>
            <Slider ref={sliderRef} {...settings}>
                {testimonials.map((item, index) => (
                    <div key={index} className="testimonial-slide">
                        {item.type === "image" ? (
                            <div
                                className="testimonial-media-wrapper"
                                onClick={() => setModalSrc(item.src)}
                            >
                                <img
                                    src={item.src}
                                    alt={`testimonial-${index}`}
                                    className="testimonial-img"
                                />
                            </div>
                        ) : (
                            <div className="testimonial-media-wrapper">
                                <video
                                    controls
                                    className="testimonial-video"
                                    onPlay={(e) => {
                                        handleAudioPlay(e);
                                        handleVideoPlay();
                                    }}
                                    onPause={handleVideoEnd}
                                    onEnded={handleVideoEnd}
                                    poster={item.poster || "/assets/default-thumbnail.jpg"} // ✅ Custom thumbnail fallback
                                >
                                    <source src={item.src} type="video/mp4" />
                                    Your browser does not support the video tag.
                                </video>
                            </div>
                        )}
                        <img
                            src={getFlag(item.country)}
                            className="testimonial-flag"
                            alt={item.country}
                        />
                    </div>
                ))}
            </Slider>

            {modalSrc && (
                <div className="testimonial-modal" onClick={() => setModalSrc(null)}>
                    <img src={modalSrc} alt="Zoomed testimonial" />
                </div>
            )}
        </div>
    );
}

export default TestimonialsCarousel;
