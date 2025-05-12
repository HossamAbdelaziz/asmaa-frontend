// src/pages/admin/AdminAddUser.jsx

import React, { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "../../firebase/firebaseConfig";
import { sendEmailVerification, signOut } from "firebase/auth";


export default function AdminAddUser() {
    const [form, setForm] = useState({
        email: "",
        password: "",
        firstName: "",
        lastName: "",
        phone: "",
        country: "",
        age: "",
    });

    const [status, setStatus] = useState("");

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus("Creating user...");

        try {
            const userCred = await createUserWithEmailAndPassword(auth, form.email, form.password);
            const user = userCred.user;

            // Send email verification
            await sendEmailVerification(user); // ✅ correct way
            await auth.signOut(); // Sign out so admin remains admin

            // Store profile
            await setDoc(doc(db, "users", user.uid), {
                firstName: form.firstName,
                lastName: form.lastName,
                phone: form.phone,
                country: form.country,
                age: form.age,
                createdAt: new Date().toISOString(),
            });

            setStatus("✅ User created and verification email sent!");
            setForm({
                email: "",
                password: "",
                firstName: "",
                lastName: "",
                phone: "",
                country: "",
                age: "",
            });
        } catch (err) {
            console.error(err);
            setStatus("❌ Error: " + err.message);
        }
    };


    return (
        <div className="container" style={{ maxWidth: "600px" }}>
            <h2>➕ Manually Add User</h2>
            <form onSubmit={handleSubmit} className="mt-4 row g-3">

                <div className="col-md-6">
                    <input name="firstName" placeholder="First Name" required className="form-control" value={form.firstName} onChange={handleChange} />
                </div>
                <div className="col-md-6">
                    <input name="lastName" placeholder="Last Name" required className="form-control" value={form.lastName} onChange={handleChange} />
                </div>

                <div className="col-md-6">
                    <input name="email" type="email" placeholder="Email" required className="form-control" value={form.email} onChange={handleChange} />
                </div>
                <div className="col-md-6">
                    <input name="password" type="password" placeholder="Password" required className="form-control" value={form.password} onChange={handleChange} />
                </div>

                <div className="col-md-6">
                    <input name="phone" placeholder="Phone Number" className="form-control" value={form.phone} onChange={handleChange} />
                </div>
                <div className="col-md-6">
                    <input name="country" placeholder="Country" className="form-control" value={form.country} onChange={handleChange} />
                </div>

                <div className="col-md-6">
                    <input name="age" type="number" placeholder="Age" className="form-control" value={form.age} onChange={handleChange} />
                </div>

                <div className="col-12">
                    <button className="btn btn-primary w-100" type="submit">Create User</button>
                </div>
            </form>

            {status && <p className="mt-3">{status}</p>}
        </div>
    );
}
