// 📁 src/pages/admin/adminNotification/LogsTab.jsx
import React, { useEffect, useState } from 'react';
import {
    collection,
    query,
    where,
    orderBy,
    getDocs,
    doc,
    getDoc,
    Timestamp
} from 'firebase/firestore';
import { db } from '../../../firebase/firebaseConfig';
import moment from 'moment';
import { CSVLink } from 'react-csv';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

// Custom colors for pie chart
const COLORS = ['#8884d8', '#82ca9d', '#ffc658'];

const LogsTab = () => {
    const [notifications, setNotifications] = useState([]);
    const [userMap, setUserMap] = useState({});
    const [expandedId, setExpandedId] = useState(null);
    const [filterType, setFilterType] = useState('manual');
    const [searchTerm, setSearchTerm] = useState('');
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);

    // 📥 Fetch notifications based on type + date range
    useEffect(() => {
        const fetchNotifications = async () => {
            let q = collection(db, 'notifications');

            const filters = [];
            if (filterType !== 'all') filters.push(where('type', '==', filterType));
            if (startDate) filters.push(where('createdAt', '>=', Timestamp.fromDate(startDate)));
            if (endDate) filters.push(where('createdAt', '<=', Timestamp.fromDate(endDate)));

            if (filters.length > 0) {
                q = query(q, ...filters, orderBy('createdAt', 'desc'));
            } else {
                q = query(q, orderBy('createdAt', 'desc'));
            }

            const snap = await getDocs(q);
            const list = snap.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setNotifications(list);
        };
        fetchNotifications();
    }, [filterType, startDate, endDate]);

    // 👥 Map user IDs to profile data
    useEffect(() => {
        const fetchUsers = async () => {
            const allUIDs = new Set();
            notifications.forEach(n => {
                n.delivery?.forEach(d => allUIDs.add(d.uid));
            });

            const uidArray = Array.from(allUIDs);
            const tempMap = {};

            for (const uid of uidArray) {
                const snap = await getDoc(doc(db, 'users', uid));
                if (snap.exists()) {
                    const profile = snap.data().profile || {};
                    tempMap[uid] = {
                        fullName: `${profile.firstName || ''} ${profile.lastName || ''}`.trim(),
                        email: snap.data().email || '',
                    };
                }
            }

            setUserMap(tempMap);
        };

        if (notifications.length > 0) {
            fetchUsers();
        }
    }, [notifications]);

    const toggleExpand = (id) => {
        setExpandedId(expandedId === id ? null : id);
    };

    const filteredNotifications = notifications.filter(notif => {
        const titleMatch = notif.title?.toLowerCase().includes(searchTerm.toLowerCase());
        const nameMatch = notif.delivery?.some(entry =>
            userMap[entry.uid]?.fullName?.toLowerCase().includes(searchTerm.toLowerCase())
        );
        return titleMatch || nameMatch;
    });



    // ✅ Replace previous chart data logic with this:

    const totalSent = filteredNotifications.reduce((sum, n) => sum + (n.delivery?.length || 0), 0);
    const totalSeen = filteredNotifications.reduce((sum, n) => sum + (n.delivery?.filter(d => d.seen).length || 0), 0);
    const totalClicked = filteredNotifications.reduce((sum, n) => sum + (n.delivery?.filter(d => d.clicked).length || 0), 0);


    const pieData = [
        { name: 'Sent', value: totalSent },
        { name: 'Seen', value: totalSeen },
        { name: 'Clicked', value: totalClicked }
    ];

    const csvData = notifications.map(notif => ({
        title: notif.title,
        body: notif.body,
        type: notif.type,
        createdAt: moment(notif.createdAt?.toDate?.()).format('YYYY-MM-DD HH:mm'),
        totalRecipients: notif.delivery?.length || 0,
        seen: notif.delivery?.filter(d => d.seen).length || 0,
        clicked: notif.delivery?.filter(d => d.clicked).length || 0
    }));

    return (
        <div className="card p-4 shadow-sm">
            <h4 className="mb-4 fs-4 fw-bold text-primary">📊 Notification Logs & Analytics</h4>

            {/* 🔍 Filters */}
            <div className="row g-3 mb-3">
                <div className="col-md-2">
                    <label className="form-label">Type</label>
                    <select className="form-select" value={filterType} onChange={e => setFilterType(e.target.value)}>
                        <option value="all">All</option>
                        <option value="manual">Manual</option>
                        <option value="scheduled">Scheduled</option>
                        <option value="automatic">Automatic</option>
                    </select>
                </div>
                <div className="col-md-3">
                    <label className="form-label">Start Date</label>
                    <DatePicker
                        className="form-control"
                        selected={startDate}
                        onChange={(date) => setStartDate(date)}
                        placeholderText="Select start date"
                    />
                </div>
                <div className="col-md-3">
                    <label className="form-label">End Date</label>
                    <DatePicker
                        className="form-control"
                        selected={endDate}
                        onChange={(date) => setEndDate(date)}
                        placeholderText="Select end date"
                    />
                </div>
                <div className="col-md-4 d-flex align-items-end gap-2">
                    <button className="btn btn-outline-dark w-50" onClick={() => {
                        setStartDate(null);
                        setEndDate(null);
                        setSearchTerm('');
                    }}>
                        Reset
                    </button>
                    <CSVLink className="btn btn-success w-50" data={csvData} filename={`notification-logs.csv`}>
                        Export
                    </CSVLink>
                </div>
            </div>

            {/* 📊 Professional Seen vs Clicked Chart */}
            <div className="mb-5" style={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={[
                                { name: 'Seen', value: totalSeen },
                                { name: 'Clicked', value: totalClicked },
                                { name: 'Unseen', value: Math.max(totalSent - totalSeen, 0) }
                            ]}
                            cx="50%"
                            cy="50%"
                            innerRadius={70}
                            outerRadius={100}
                            paddingAngle={2}
                            labelLine={false}
                            label={({ name, percent }) =>
                                percent > 0 ? `${name}: ${(percent * 100).toFixed(0)}%` : ''
                            }
                            dataKey="value"
                        >
                            <Cell fill="#82ca9d" />      {/* Seen - Green */}
                            <Cell fill="#ffc658" />      {/* Clicked - Yellow */}
                            <Cell fill="#eee" />         {/* Unseen - Light Gray */}
                        </Pie>

                        {/* Center Label */}
                        <text
                            x="50%"
                            y="50%"
                            textAnchor="middle"
                            dominantBaseline="middle"
                            fontSize={16}
                            fontWeight="600"
                            fill="#444"
                        >
                            Sent: {totalSent}
                        </text>

                        <Tooltip formatter={(value) => [`${value} users`, 'Count']} />
                        <Legend verticalAlign="bottom" height={36} />
                    </PieChart>
                </ResponsiveContainer>
            </div>



            {/* 📋 Table */}
            <div className="table-responsive">
                <table className="table table-striped table-hover align-middle">
                    <thead className="table-light">
                        <tr>
                            <th>🗓️ Time</th>
                            <th>📝 Title</th>
                            <th>💬 Message</th>
                            <th>📦 Type</th>
                            <th>👥 Sent</th>
                            <th>✅ Seen</th>
                            <th>👁️ Clicked</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredNotifications.map(notif => (
                            <React.Fragment key={notif.id}>
                                <tr onClick={() => toggleExpand(notif.id)} style={{ cursor: 'pointer' }}>
                                    <td>{moment(notif.createdAt?.toDate?.()).format('YYYY-MM-DD HH:mm')}</td>
                                    <td>{notif.title}</td>
                                    <td title={notif.body}>
                                        {notif.body?.slice(0, 60)}{notif.body?.length > 60 && '…'}
                                    </td>
                                    <td><span className="badge bg-primary text-uppercase">{notif.type}</span></td>
                                    <td>{notif.delivery?.length || 0}</td>
                                    <td>{notif.delivery?.filter(d => d.seen).length || 0}</td>
                                    <td>{notif.delivery?.filter(d => d.clicked).length || 0}</td>
                                </tr>
                                {expandedId === notif.id && (
                                    <tr>
                                        <td colSpan="7">
                                            <div className="table-responsive">
                                                <table className="table table-bordered small">
                                                    <thead>
                                                        <tr>
                                                            <th>Name</th>
                                                            <th>Email</th>
                                                            <th>Seen</th>
                                                            <th>Clicked</th>
                                                            <th>Seen At</th>
                                                            <th>Clicked At</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {notif.delivery?.map(entry => {
                                                            const user = userMap[entry.uid] || {};
                                                            return (
                                                                <tr key={entry.uid}>
                                                                    <td>{user.fullName || '—'}</td>
                                                                    <td>{user.email || '—'}</td>
                                                                    <td>{entry.seen ? '✅' : '❌'}</td>
                                                                    <td>{entry.clicked ? '✅' : '❌'}</td>
                                                                    <td>{entry.seenAt ? moment(entry.seenAt?.toDate?.()).format('YYYY-MM-DD HH:mm') : '—'}</td>
                                                                    <td>{entry.clickedAt ? moment(entry.clickedAt?.toDate?.()).format('YYYY-MM-DD HH:mm') : '—'}</td>
                                                                </tr>
                                                            );
                                                        })}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </React.Fragment>
                        ))}
                    </tbody>
                </table>
            </div>

            {filteredNotifications.length === 0 && (
                <div className="alert alert-info">No notifications found for this filter.</div>
            )}
        </div>
    );
};

export default LogsTab;
