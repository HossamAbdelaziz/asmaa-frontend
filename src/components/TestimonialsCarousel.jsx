import React, { useState, useRef } from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import testimonials from "../data/testimonials.json";
import "../styles/TestimonialsCarousel.css";

function TestimonialsCarousel() {
    const [modalSrc, setModalSrc] = useState(null);
    const currentAudioRef = useRef(null);

    const settings = {
        dots: true,
        infinite: true,
        speed: 500,
        slidesToShow: 3,
        slidesToScroll: 1,
        autoplay: true,
        autoplaySpeed: 4000,
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

    const getFlag = (code) => `https://flagcdn.com/w40/${code.toLowerCase()}.png`;

    const handleAudioPlay = (e) => {
        if (currentAudioRef.current && currentAudioRef.current !== e.target) {
            currentAudioRef.current.pause();
        }
        currentAudioRef.current = e.target;
    };

    return (
        <div className="testimonials-carousel-container">
            <h2 className="carousel-title">What Clients Say</h2>
            <Slider {...settings}>
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
                                    onPlay={handleAudioPlay}
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
