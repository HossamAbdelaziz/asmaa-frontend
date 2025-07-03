// src/components/TestimonialsSection.jsx

import React, { useState } from "react";
import "../../styles/TestimonialsSection.css";
import testimonialsData from "../../data/testimonials.json";

export default function TestimonialsSection({ previewOnly = false }) {
    const [filter, setFilter] = useState("all");

    const filteredTestimonials =
        filter === "all"
            ? testimonialsData
            : testimonialsData.filter((t) => t.type === filter);

    const displayList = previewOnly ? filteredTestimonials.slice(0, 6) : filteredTestimonials;

    return (
        <section className="testimonials-section">
            <h2 className="section-title">What Clients Say</h2>
            {!previewOnly && (
                <div className="testimonial-filters">
                    <button
                        className={filter === "all" ? "active" : ""}
                        onClick={() => setFilter("all")}
                    >
                        All
                    </button>
                    <button
                        className={filter === "screenshot" ? "active" : ""}
                        onClick={() => setFilter("screenshot")}
                    >
                        Screenshots
                    </button>
                    <button
                        className={filter === "voice" ? "active" : ""}
                        onClick={() => setFilter("voice")}
                    >
                        Voice Notes
                    </button>
                </div>
            )}

            <div className="testimonials-grid">
                {displayList.map((t, i) => (
                    <div className="testimonial-card" key={i}>
                        <div className="flag">{t.flag}</div>
                        {t.type === "screenshot" ? (
                            <img src={t.imageUrl} alt={`Testimonial from ${t.country}`} />
                        ) : (
                            <audio controls>
                                <source src={t.audioUrl} type="audio/mpeg" />
                                Your browser does not support the audio element.
                            </audio>
                        )}
                    </div>
                ))}
            </div>

            {previewOnly && (
                <div className="view-all-link">
                    <a href="/testimonials" className="btn btn-outline-dark">
                        View All Testimonials
                    </a>
                </div>
            )}
        </section>
    );
}
