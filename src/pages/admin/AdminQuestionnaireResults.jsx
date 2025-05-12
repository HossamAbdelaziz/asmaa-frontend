// src/pages/AdminQuestionnaireResults.js

import React, { useEffect, useState } from "react";
import { db } from "../../firebase/firebaseConfig";
import {
    collection,
    getDocs,
    doc,
    updateDoc,
    query,
    orderBy,
} from "firebase/firestore";
import { format } from "date-fns";
//import "../styles/AdminQuestionnaireResults.css"; // Optional: style this page

const AdminQuestionnaireResults = () => {
    const [submissions, setSubmissions] = useState([]);
    const [loading, setLoading] = useState(true);

    // Fetch all questionnaire submissions
    const fetchSubmissions = async () => {
        try {
            const q = query(collection(db, "questionnaire_submissions"), orderBy("createdAt", "desc"));
            const snapshot = await getDocs(q);
            const data = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));
            setSubmissions(data);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching questionnaire submissions:", error);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSubmissions();
    }, []);

    // Toggle approval
    const toggleApproval = async (id, currentStatus) => {
        try {
            await updateDoc(doc(db, "questionnaire_submissions", id), {
                approvedForConsultation: !currentStatus,
            });
            fetchSubmissions(); // Refresh the list
        } catch (error) {
            console.error("Error updating approval status:", error);
        }
    };

    return (
        <div className="container py-5">
            <h2 className="mb-4">🧠 Questionnaire Submissions</h2>
            {loading ? (
                <p>Loading...</p>
            ) : submissions.length === 0 ? (
                <p>No questionnaire submissions found.</p>
            ) : (
                <div className="table-responsive">
                    <table className="table table-bordered table-striped align-middle">
                        <thead className="table-light">
                            <tr>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Phone</th>
                                <th>Country</th>
                                <th>Result</th>
                                <th>Date</th>
                                <th>Status</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {submissions.map((sub) => (
                                <tr key={sub.id}>
                                    <td>{sub.name || "—"}</td>
                                    <td>{sub.email || "—"}</td>
                                    <td>{sub.phone || "—"}</td>
                                    <td>{sub.country || "—"}</td>
                                    <td>
                                        <span
                                            className={`badge ${sub.result === "disorder"
                                                ? "bg-danger"
                                                : sub.result === "warning"
                                                    ? "bg-warning text-dark"
                                                    : "bg-success"
                                                }`}
                                        >
                                            {sub.result}
                                        </span>
                                    </td>
                                    <td>
                                        {sub.createdAt?.toDate
                                            ? format(sub.createdAt.toDate(), "MMM d, yyyy – h:mm a")
                                            : "—"}
                                    </td>
                                    <td>
                                        {sub.approvedForConsultation ? (
                                            <span className="badge bg-success">Approved</span>
                                        ) : (
                                            <span className="badge bg-secondary">Not Approved</span>
                                        )}
                                    </td>
                                    <td>
                                        <button
                                            className={`btn btn-sm ${sub.approvedForConsultation
                                                ? "btn-outline-danger"
                                                : "btn-outline-success"
                                                }`}
                                            onClick={() =>
                                                toggleApproval(sub.id, sub.approvedForConsultation)
                                            }
                                        >
                                            {sub.approvedForConsultation ? "Decline" : "Approve"}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default AdminQuestionnaireResults;
