import React, { useState } from 'react';
import Navbar from '../components/Navbar';

const ContactUs = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: '',
    });

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
                    <div style={styles.infoSection}>
                        <h2 style={styles.subtitle}>Get in Touch</h2>
                        <p style={styles.text}>
                            Have questions or need assistance? We're here to help! Reach out to us through any of the following channels.
                        </p>
                        
                        <div style={styles.contactInfo}>
                            <div style={styles.infoCard}>
                                <div style={styles.icon}>📧</div>
                                <h3>Email</h3>
                                <p>info@medivault.com</p>
                                <p>support@medivault.com</p>
                            </div>
                            
                            <div style={styles.infoCard}>
                                <div style={styles.icon}>📞</div>
                                <h3>Phone</h3>
                                <p>+91 1234567890</p>
                                <p>Mon-Fri: 9:00 AM - 6:00 PM</p>
                            </div>
                            
                            <div style={styles.infoCard}>
                                <div style={styles.icon}>📍</div>
                                <h3>Address</h3>
                                <p>MediVault Headquarters</p>
                                <p>Mumbai, Maharashtra, India</p>
                            </div>
                        </div>
                    </div>

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

const styles = {
    wrapper: {
        minHeight: '100vh',
        backgroundColor: '#f5f5f5',
    },
    container: {
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '3rem 2rem',
    },
    title: {
        fontSize: '3rem',
        color: '#2c3e50',
        textAlign: 'center',
        marginBottom: '3rem',
    },
    content: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
        gap: '3rem',
    },
    infoSection: {
        backgroundColor: 'white',
        padding: '2rem',
        borderRadius: '10px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    },
    formSection: {
        backgroundColor: 'white',
        padding: '2rem',
        borderRadius: '10px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    },
    subtitle: {
        fontSize: '2rem',
        color: '#3498db',
        marginBottom: '1rem',
    },
    text: {
        fontSize: '1.1rem',
        lineHeight: '1.8',
        color: '#555',
        marginBottom: '2rem',
    },
    contactInfo: {
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem',
    },
    infoCard: {
        backgroundColor: '#ecf0f1',
        padding: '1.5rem',
        borderRadius: '8px',
        textAlign: 'center',
    },
    icon: {
        fontSize: '2.5rem',
        marginBottom: '0.5rem',
    },
    form: {
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
    },
    input: {
        padding: '0.8rem',
        fontSize: '1rem',
        border: '1px solid #ddd',
        borderRadius: '5px',
    },
    textarea: {
        padding: '0.8rem',
        fontSize: '1rem',
        border: '1px solid #ddd',
        borderRadius: '5px',
        resize: 'vertical',
    },
    button: {
        backgroundColor: '#3498db',
        color: 'white',
        border: 'none',
        padding: '1rem',
        fontSize: '1.1rem',
        borderRadius: '5px',
        cursor: 'pointer',
        fontWeight: '600',
        transition: 'background-color 0.3s',
    },
};

export default ContactUs;
