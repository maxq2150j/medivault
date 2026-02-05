import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import { useTheme } from '../context/ThemeContext.jsx';

const ContactUs = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: '',
    });
    const { isDark } = useTheme();
    const styles = getStyles(isDark);

    const handleSubmit = (e) => {
        e.preventDefault();
        alert('Thank you for contacting us! We will get back to you soon.');
        setFormData({ name: '', email: '', subject: '', message: '' });
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    return (
        <div style={styles.wrapper}>
            <Navbar />
            <div style={styles.container}>
                <h1 style={styles.title}>Contact Us</h1>

                <div style={styles.content}>
                    <div style={styles.formSection}>
                        <h2 style={styles.subtitle}>Send us a Message</h2>
                        <form onSubmit={handleSubmit} style={styles.form}>
                            <input
                                type="text"
                                name="name"
                                placeholder="Your Name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                style={styles.input}
                            />
                            <input
                                type="email"
                                name="email"
                                placeholder="Your Email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                style={styles.input}
                            />
                            <input
                                type="text"
                                name="subject"
                                placeholder="Subject"
                                value={formData.subject}
                                onChange={handleChange}
                                required
                                style={styles.input}
                            />
                            <textarea
                                name="message"
                                placeholder="Your Message"
                                value={formData.message}
                                onChange={handleChange}
                                required
                                rows="6"
                                style={styles.textarea}
                            />
                            <button type="submit" style={styles.button}>
                                Send Message
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

const getStyles = (isDark) => ({
    wrapper: {
        minHeight: '100vh',
        background: isDark
            ? 'linear-gradient(135deg, #020617 0%, #020617 35%, #020617 100%)'
            : 'linear-gradient(135deg, #fdf6e3 0%, #fefcf7 45%, #ecfdf3 100%)',
        color: isDark ? '#e5e7eb' : '#1f2933',
    },
    container: {
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '3rem 2rem',
    },
    title: {
        fontSize: '3rem',
        color: isDark ? '#e5e7eb' : '#111827',
        textAlign: 'center',
        marginBottom: '0.25rem',
    },
    subtitleInline: {
        textAlign: 'center',
        fontSize: '0.9rem',
        letterSpacing: '0.08em',
        textTransform: 'lowercase',
        color: isDark ? '#9ca3af' : '#6b7280',
        marginBottom: '2.2rem',
    },
    content: {
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem',
        maxWidth: '800px',
        margin: '0 auto',
    },
    formSection: {
        backgroundColor: isDark ? '#020617' : '#ffffff',
        padding: '2rem',
        borderRadius: '18px',
        boxShadow: isDark
            ? '0 16px 38px rgba(15, 23, 42, 0.7)'
            : '0 10px 26px rgba(148, 163, 184, 0.35)',
        border: isDark ? '1px solid rgba(148, 163, 184, 0.45)' : '1px solid rgba(209, 213, 219, 0.9)',
    },
    subtitle: {
        fontSize: '2rem',
        color: isDark ? '#bfdbfe' : '#16a34a',
        marginBottom: '1rem',
    },
    text: {
        fontSize: '1.1rem',
        lineHeight: '1.8',
        color: isDark ? '#d1d5db' : '#4b5563',
        marginBottom: '2rem',
    },
    icon: {
        fontSize: '1.6rem',
        width: '3rem',
        height: '3rem',
        borderRadius: '999px',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '0.8rem',
        backgroundColor: isDark ? 'rgba(34, 197, 94, 0.14)' : 'rgba(34, 197, 94, 0.1)',
        color: isDark ? '#bbf7d0' : '#16a34a',
    },
    contactRow: {
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: '0.75rem',
        marginTop: '0.5rem',
        fontSize: '0.95rem',
        color: isDark ? '#d1d5db' : '#4b5563',
    },
    contactItem: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.4rem',
        padding: '0.4rem 0.8rem',
        borderRadius: '999px',
        backgroundColor: isDark ? 'rgba(15,23,42,0.8)' : 'rgba(226, 232, 240, 0.9)',
        border: isDark ? '1px solid rgba(148, 163, 184, 0.5)' : '1px solid rgba(209, 213, 219, 0.9)',
    },
    form: {
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
    },
    input: {
        padding: '0.85rem 1rem',
        fontSize: '1rem',
        borderRadius: '10px',
        border: '1px solid #d1d5db',
        backgroundColor: isDark ? '#020617' : '#ffffff',
        color: isDark ? '#e5e7eb' : '#111827',
    },
    textarea: {
        padding: '0.85rem 1rem',
        fontSize: '1rem',
        borderRadius: '10px',
        border: '1px solid #d1d5db',
        backgroundColor: isDark ? '#020617' : '#ffffff',
        color: isDark ? '#e5e7eb' : '#111827',
        resize: 'vertical',
    },
    button: {
        backgroundColor: '#22c55e',
        color: 'white',
        border: 'none',
        padding: '1rem',
        fontSize: '1.1rem',
        borderRadius: '999px',
        cursor: 'pointer',
        fontWeight: '600',
        transition: 'background-color 0.3s',
    },
});

export default ContactUs;
