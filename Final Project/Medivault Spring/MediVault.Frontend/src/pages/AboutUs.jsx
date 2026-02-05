import React from 'react';
import Navbar from '../components/Navbar';
import { useTheme } from '../context/ThemeContext.jsx';

const AboutUs = () => {
    const { isDark } = useTheme();
    const styles = getStyles(isDark);

    return (
        <div style={styles.wrapper}>
            <Navbar />
            <div style={styles.container}>
                <h1 style={styles.title}>About MediVault</h1>
				
                <section style={styles.section}>
                    <h2 style={styles.subtitle}>Our Mission</h2>
                    <p style={styles.text}>
                        MediVault is dedicated to revolutionizing healthcare record management by providing a secure, 
                        efficient, and user-friendly platform for hospitals and patients. Our mission is to ensure that 
                        medical records are accessible, organized, and protected.
                    </p>
                </section>

                <section style={styles.section}>
                    <h2 style={styles.subtitle}>What We Do</h2>
                    <p style={styles.text}>
                        We provide a comprehensive medical records management system that enables:
                    </p>
                    <ul style={styles.list}>
                        <li>Secure storage of patient medical records</li>
                        <li>OTP-based authentication for data security</li>
                        <li>Digital consultation reports and medical file uploads</li>
                        <li>Easy access for both hospitals and patients</li>
                        <li>Efficient hospital-patient communication</li>
                    </ul>
                </section>

                <section style={styles.section}>
                    <h2 style={styles.subtitle}>Our Values</h2>
                    <div style={styles.valuesGrid}>
                        <div style={styles.valueCard}>
                            <h3>🔒 Security</h3>
                            <p>We prioritize the security and privacy of your medical data with advanced encryption and authentication.</p>
                        </div>
                        <div style={styles.valueCard}>
                            <h3>⚡ Efficiency</h3>
                            <p>Streamlined workflows to save time for both healthcare providers and patients.</p>
                        </div>
                        <div style={styles.valueCard}>
                            <h3>🤝 Trust</h3>
                            <p>Building trust through transparency, reliability, and exceptional service.</p>
                        </div>
                    </div>
                </section>

                <section style={styles.section}>
                    <h2 style={styles.subtitle}>Why Choose MediVault?</h2>
                    <p style={styles.text}>
                        MediVault stands out as a trusted healthcare management solution because we combine cutting-edge 
                        technology with a deep understanding of healthcare needs. Our platform is designed to be intuitive, 
                        secure, and scalable to meet the demands of modern healthcare facilities.
                    </p>
                </section>
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
        maxWidth: '1000px',
        margin: '0 auto',
        padding: '3rem 2rem',
    },
    title: {
        fontSize: '3rem',
        color: isDark ? '#e5e7eb' : '#111827',
        textAlign: 'center',
        marginBottom: '3rem',
    },
    section: {
        backgroundColor: isDark ? '#020617' : '#ffffff',
        padding: '2rem',
        marginBottom: '2rem',
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
        fontSize: '1.05rem',
        lineHeight: '1.8',
        color: isDark ? '#d1d5db' : '#4b5563',
        marginBottom: '1rem',
    },
    list: {
        fontSize: '1.05rem',
        lineHeight: '1.9',
        color: isDark ? '#d1d5db' : '#4b5563',
        marginLeft: '1.5rem',
    },
    valuesGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1.5rem',
        marginTop: '1.5rem',
    },
    valueCard: {
        backgroundColor: isDark ? '#020617' : '#f1f5f9',
        padding: '1.5rem',
        borderRadius: '14px',
        textAlign: 'left',
        border: isDark ? '1px solid rgba(148, 163, 184, 0.45)' : '1px solid rgba(209, 213, 219, 0.9)',
    },
});

export default AboutUs;
