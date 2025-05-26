// src/pages/admin/adminNotification/AdminManualNotifications.js
import React, { useState } from 'react';
import SendNotificationTab from './SendNotificationTab';
import ScheduledTab from './ScheduledTab';
import LogsTab from './LogsTab';
//import '../../../styles/AdminNotifications.css'; // optional styling

const AdminManualNotifications = () => {
    const [activeTab, setActiveTab] = useState('send');

    return (
        <div className="container py-4">
            <h2 className="mb-4">📢 Manual Notifications</h2>

            {/* 🔘 Tab Headers */}
            <div className="tab-header mb-4 d-flex gap-3">
                <button
                    className={`btn ${activeTab === 'send' ? 'btn-primary' : 'btn-outline-primary'}`}
                    onClick={() => setActiveTab('send')}
                >
                    📤 Send Notification
                </button>
                <button
                    className={`btn ${activeTab === 'scheduled' ? 'btn-primary' : 'btn-outline-primary'}`}
                    onClick={() => setActiveTab('scheduled')}
                >
                    🕒 Scheduled
                </button>
                <button
                    className={`btn ${activeTab === 'logs' ? 'btn-primary' : 'btn-outline-primary'}`}
                    onClick={() => setActiveTab('logs')}
                >
                    📜 Logs
                </button>
            </div>

            {/* 🔁 Dynamic Tab Content */}
            <div className="tab-content mt-3">
                {activeTab === 'send' && <SendNotificationTab />}
                {activeTab === 'scheduled' && <ScheduledTab />}
                {activeTab === 'logs' && <LogsTab />}
            </div>
        </div>
    );
};

export default AdminManualNotifications;
