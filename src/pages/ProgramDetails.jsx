import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../firebase/firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";
import "../styles/ProgramDetails.css";

const ProgramDetails = () => {
    const { slug } = useParams();
    const navigate = useNavigate();
    const { t, i18n } = useTranslation();

    const allPrograms = t("program_details", { returnObjects: true });
    const program = allPrograms[slug];

    const [currentUser, setCurrentUser] = useState(null);
    const [userSubscription, setUserSubscription] = useState(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            setCurrentUser(firebaseUser);
            if (firebaseUser) {
                const userSnap = await getDoc(doc(db, "users", firebaseUser.uid));
                const userData = userSnap.data();
                setUserSubscription(userData?.subscription || null);
            }
        });
        return () => unsubscribe();
    }, []);

    if (!program || !program.title) {
        return (
            <div className="container py-5 text-center">
                <h2>{i18n.language === "ar" ? "البرنامج غير موجود" : "Program Not Found"}</h2>
            </div>
        );
    }

    const handleStartJourney = () => {
        if (!currentUser) {
            localStorage.setItem("redirectAfterAuth", program.stripeLink);
            navigate("/login");
        } else {
            window.open(program.stripeLink, "_blank");
        }
    };

    return (
        <div className="program-detail container py-5">
            {/* 🧐 Hero Section */}
            <div className="detail-hero row align-items-center mb-5">
                <div className="col-lg-6">
                    <img
                        src={`/programs/${program.image}`}
                        alt={program.title}
                        className="img-fluid rounded shadow-sm detail-image"
                    />
                </div>
                <div className="col-lg-6 text-center text-lg-start">
                    <h1 className="detail-title">{program.title}</h1>
                    {program.tagline && (
                        <p className="detail-tagline">{program.tagline}</p>
                    )}
                </div>
            </div>

            {/* 🔍 Description Section */}
            {program.description && (
                <div className="program-description-section mb-5">
                    <p className="detail-description">{program.description}</p>
                </div>
            )}

            <div className="program-section-row">
                <div className="program-box">
                    <h4 className="highlight-heading">
                        {i18n.language === "ar" ? "ما الذي يقدمه هذا البرنامج؟" : "What this program offers"}
                    </h4>
                    <ul className="highlight-list">
                        {program.offers?.map((item, index) => (
                            <li key={index} className="highlight-item">{item}</li>
                        ))}
                    </ul>
                </div>

                <div className="program-box">
                    <h4 className="highlight-heading">
                        {i18n.language === "ar" ? "لمن هذا البرنامج؟" : "Who this program is for"}
                    </h4>
                    <ul className="highlight-list">
                        {program.audience?.map((item, index) => (
                            <li key={index} className="highlight-item">{item}</li>
                        ))}
                    </ul>
                </div>
            </div>

            {/* 🌟 Results Section */}
            {program.results && (
                <div className="expected-box program-box mt-4">
                    <h4 className="highlight-heading">
                        {i18n.language === "ar" ? "النتائج المتوقعة" : "Expected Results"}
                    </h4>
                    <ul className="highlight-list">
                        {program.results.map((result, index) => (
                            <li key={index} className="highlight-item">{result}</li>
                        ))}
                    </ul>
                </div>
            )}

            {/* 🔧 Features Section */}
            {program.features && (
                <div className="program-box mt-4">
                    <h4 className="highlight-heading">
                        {i18n.language === "ar" ? "مميزات البرنامج" : "What Makes This Program Unique"}
                    </h4>
                    <ul className="highlight-list">
                        {program.features.map((feature, index) => (
                            <li key={index} className="highlight-item">{feature}</li>
                        ))}
                    </ul>
                </div>
            )}

            {/* 💸 Investment Section */}
            <div className="investment-wrapper mt-5">
                <div className="investment-box shadow-sm">
                    <h4 className="investment-heading">
                        💼 {i18n.language === "ar" ? "قيمة الاستثمار" : "Your Investment"}
                    </h4>

                    <p className="investment-price">
                        {i18n.language === "ar"
                            ? `فقط ${program.price} دولار كندي للبرنامج الكامل`
                            : `Only $${program.price} CAD for the full program`}
                    </p>

                    <div className="investment-buttons d-flex flex-column flex-md-row justify-content-center align-items-center gap-3 mt-4 flex-wrap">
                        {userSubscription?.status === "active" && userSubscription?.programTitle === program.title ? (
                            <button className="btn btn-accent-gradient btn-lg" disabled>
                                {i18n.language === "ar"
                                    ? "أنت مشتركة بالفعل في هذا البرنامج"
                                    : "You're already subscribed to this program"}
                            </button>
                        ) : userSubscription?.status === "active" ? (
                            <div className="subscribed-banner">
                                <div className="subscribed-text">
                                    <strong>
                                        {i18n.language === "ar"
                                            ? `أنتِ مشترك بالفعل في برنامج:`
                                            : `You're already subscribed to:`}
                                    </strong>{" "}
                                    {userSubscription?.programTitle}
                                </div>
                                <div className="subscribed-note">
                                    {i18n.language === "ar"
                                        ? "يرجى التواصل معنا إذا كنتِ ترغبين في تغيير البرنامج."
                                        : "Please contact us if you'd like to switch programs."}
                                </div>
                            </div>
                        ) : (
                            <button
                                className="btn btn-accent-gradient btn-lg"
                                onClick={handleStartJourney}
                            >
                                {i18n.language === "ar" ? "ابدئي رحلة التعافي الآن" : "Start Your Recovery Journey"}
                            </button>
                        )}

                        <a
                            href="http://wa.me/16476130760"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-accent-gradient btn-lg"
                        >
                            {i18n.language === "ar" ? "تحدثي على واتساب" : "Chat on WhatsApp"}
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProgramDetails;
