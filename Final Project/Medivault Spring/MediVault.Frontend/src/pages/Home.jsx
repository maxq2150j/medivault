import React from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useTheme } from '../context/ThemeContext.jsx';
import Chatbot from '../components/Chatbot.jsx';

const Home = () => {
    const navigate = useNavigate();
    const { isDark } = useTheme();
    const styles = getStyles(isDark);

    return (
        <div style={styles.wrapper}>
            <Navbar />
            <div style={styles.container}>
                <section style={styles.hero}>
                    <h1 style={styles.title}>Welcome to MediVault</h1>
                    <p style={styles.subtitle}>
                        Secure Medical Records Management System
                    </p>
                    <p style={styles.description}>
                        MediVault provides a comprehensive platform for hospitals and patients to manage medical records,
                        consultations, and medical files securely and efficiently.
                    </p>
                    <button onClick={() => navigate('/login')} style={styles.button}>
                        Show Reports
                    </button>
                </section>

                <section style={styles.features}>
                    <h2 style={styles.sectionTitle}>Features</h2>
                    <div style={styles.featureGrid}>
                        <div style={styles.card}>
                            <div style={styles.icon}>🏥</div>
                            <h3>Hospital Management</h3>
                            <p>Hospitals can search patients, manage consultations, and upload medical files.</p>
                        </div>
                        <div style={styles.card}>
                            <div style={styles.icon}>👤</div>
                            <h3>Patient Portal</h3>
                            <p>Patients can view their medical records, consultations, and uploaded files.</p>
                        </div>
                        <div style={styles.card}>
                            <div style={styles.icon}>🔒</div>
                            <h3>Secure Access</h3>
                            <p>OTP-based verification ensures secure access to sensitive medical information.</p>
                        </div>
                        <div style={styles.card}>
                            <div style={styles.icon}>📄</div>
                            <h3>Digital Reports</h3>
                            <p>Generate and store consultation reports and medical documents digitally.</p>
                        </div>
                    </div>
                </section>

                <section style={styles.cta}>
                    <h2>Ready to Get Started?</h2>
                    <p>Login to access your medical records or contact your hospital for registration.</p>
                    <button onClick={() => navigate('/login')} style={styles.ctaButton}>
                        Login Now
                    </button>
                </section>
            </div>
            <Chatbot isDark={isDark} />
            <Footer />
        </div>
    );
};
const getStyles = (isDark) => ({
    wrapper: {
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        background: isDark
            ? 'linear-gradient(135deg, #020617 0%, #020617 35%, #020617 100%)'
            : 'linear-gradient(135deg, #fdf6e3 0%, #fefcf7 45%, #ecfdf3 100%)',
        color: isDark ? '#e5e7eb' : '#1f2933',
    },
    container: {
        flex: 1,
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '3rem 2rem 2.5rem',
    },
    hero: {
        textAlign: 'center',
        padding: '4rem 0',
        background: isDark
            ? 'radial-gradient(circle at top left, #1d4ed8 0, #1e293b 35%, #020617 100%)'
            : 'linear-gradient(135deg, #f9fafb 0%, #fefce8 40%, #dcfce7 100%)',
        borderRadius: '24px',
        color: isDark ? '#e5e7eb' : '#052e16',
        marginBottom: '3rem',
        boxShadow: isDark
            ? '0 20px 55px rgba(15, 23, 42, 0.7)'
            : '0 20px 50px rgba(15, 23, 42, 0.25)',
    },
    title: {
        fontSize: '3rem',
        marginBottom: '1rem',
        fontWeight: 'bold',
    },
    subtitle: {
        fontSize: '1.5rem',
        marginBottom: '1rem',
        opacity: 0.9,
    },
    description: {
        fontSize: '1.1rem',
        maxWidth: '800px',
        margin: '0 auto 2rem',
        lineHeight: '1.6',
    },
    button: {
        backgroundColor: isDark ? '#0f172a' : '#22c55e',
        color: isDark ? 'white' : '#052e16',
        border: 'none',
        padding: '1rem 2.5rem',
        fontSize: '1.1rem',
        borderRadius: '999px',
        cursor: 'pointer',
        fontWeight: '600',
        transition: 'transform 0.3s, background-color 0.3s',
    },
    features: {
        marginBottom: '3rem',
        paddingTop: '0.5rem',
    },
    sectionTitle: {
        fontSize: '2.5rem',
        textAlign: 'center',
        marginBottom: '2rem',
        color: isDark ? '#e5e7eb' : '#111827',
    },
    featureGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '1.75rem',
    },
    card: {
        backgroundColor: isDark ? '#020617' : '#ffffff',
        padding: '1.9rem 1.8rem',
        borderRadius: '18px',
        boxShadow: isDark
            ? '0 14px 32px rgba(15, 23, 42, 0.7)'
            : '0 10px 26px rgba(148, 163, 184, 0.35)',
        border: isDark ? '1px solid rgba(148, 163, 184, 0.45)' : '1px solid rgba(209, 213, 219, 0.9)',
        textAlign: 'left',
        transition: 'transform 0.3s',
        color: isDark ? '#e5e7eb' : '#1f2937',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.6rem',
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
    cta: {
        textAlign: 'center',
        padding: '3rem',
        background: isDark
            ? 'linear-gradient(135deg, #020617 0%, #020617 55%, #020617 100%)'
            : 'linear-gradient(135deg, #fefce8 0%, #ecfdf3 45%, #dcfce7 100%)',
        borderRadius: '20px',
        boxShadow: isDark
            ? '0 18px 48px rgba(15, 23, 42, 0.7)'
            : '0 16px 40px rgba(148, 163, 184, 0.4)',
        color: isDark ? '#e5e7eb' : '#052e16',
    },
    ctaButton: {
        backgroundColor: '#22c55e',
        color: 'white',
        border: 'none',
        padding: '1rem 2.5rem',
        fontSize: '1.1rem',
        borderRadius: '999px',
        cursor: 'pointer',
        fontWeight: '600',
        marginTop: '1rem',
    },
});

export default Home;
