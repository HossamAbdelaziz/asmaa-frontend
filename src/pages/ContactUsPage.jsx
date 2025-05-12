// src/pages/ContactUsPage.jsx

import React, { useState } from "react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";
import "../styles/ContactUsPage.css";

function ContactUsPage() {
    const [formData, setFormData] = useState({ name: "", email: "", message: "" });
    const [status, setStatus] = useState("");

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus("Sending...");

        try {
            await addDoc(collection(db, "messages"), {
                ...formData,
                createdAt: serverTimestamp(),
            });
            setFormData({ name: "", email: "", message: "" });
            setStatus("✅ Message sent successfully!");
        } catch (err) {
            console.error(err);
            setStatus("❌ Something went wrong. Please try again.");
        }
    };

    return (
        <div className="contact-container">
            <h1 className="contact-title">📬 Contact Us</h1>
            <p className="contact-description">
                We'd love to hear from you. Fill out the form and we'll respond shortly.
            </p>

            <form className="contact-form" onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="name">Name</label>
                    <input
                        type="text"
                        name="name"
                        placeholder="Your Name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div>
                    <label htmlFor="email">Email</label>
                    <input
                        type="email"
                        name="email"
                        placeholder="Your Email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div>
                    <label htmlFor="message">Message</label>
                    <textarea
                        name="message"
                        placeholder="Your Message"
                        rows="5"
                        value={formData.message}
                        onChange={handleChange}
                        required
                    ></textarea>
                </div>

                <button type="submit" className="submit-button">Send Message</button>
                {status && <p className="status-msg">{status}</p>}
            </form>

            <a
                href="https://wa.me/16476130760"
                target="_blank"
                rel="noopener noreferrer"
                className="whatsapp-button"
            >
                💬 Chat with us on WhatsApp
            </a>
        </div>
    );
}

export default ContactUsPage;
