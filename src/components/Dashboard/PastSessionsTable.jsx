// src/components/Dashboard/PastSessionsTable.js
import React from "react";

function PastSessionsTable({ pastSessions }) {
    if (!pastSessions || pastSessions.length === 0) {
        return <p className="text-muted">No past sessions yet.</p>;
    }

    return (
        <div className="card mt-4 p-3">
            <h5>📜 Past Sessions</h5>
            <ul className="list-group">
                {pastSessions.map(session => (
                    <li key={session.id} className="list-group-item d-flex justify-content-between align-items-center">
                        <span>
                            📅 {new Date(session.selectedDateTime).toLocaleString()} — {session.programTitle}
                        </span>
                        <span className="badge bg-secondary">{session.status}</span>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default PastSessionsTable;
