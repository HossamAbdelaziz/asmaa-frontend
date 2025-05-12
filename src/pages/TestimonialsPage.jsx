// src/pages/TestimonialsPage.jsx

import React from "react";
import TestimonialsCarousel from "../components/TestimonialsCarousel";
import "../styles/TestimonialsPage.css";

function TestimonialsPage() {
    return (
        <div className="testimonials-page">
            <section className="testimonials-hero">
                <h1>🌟 Real Words From Real People</h1>
                <p>
                    Hear directly from clients around the world who experienced Coach Asmaa’s recovery journey.
                </p>
            </section>

            <TestimonialsCarousel />
        </div>
    );
}

export default TestimonialsPage;
