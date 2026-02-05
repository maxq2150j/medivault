import React from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const Home = () => {
    const navigate = useNavigate();

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
            <Footer />
        </div>
    );
};

const styles = {
    wrapper: {
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
    },
    container: {
        flex: 1,
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '2rem',
    },
    hero: {
        textAlign: 'center',
        padding: '4rem 0',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        borderRadius: '10px',
        color: 'white',
        marginBottom: '3rem',
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
        backgroundColor: '#3498db',
        color: 'white',
        border: 'none',
        padding: '1rem 2.5rem',
        fontSize: '1.1rem',
        borderRadius: '5px',
        cursor: 'pointer',
        fontWeight: '600',
        transition: 'transform 0.3s, background-color 0.3s',
    },
    features: {
        marginBottom: '3rem',
    },
    sectionTitle: {
        fontSize: '2.5rem',
        textAlign: 'center',
        marginBottom: '2rem',
        color: '#2c3e50',
    },
    featureGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '2rem',
    },
    card: {
        backgroundColor: 'white',
        padding: '2rem',
        borderRadius: '10px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
        textAlign: 'center',
        transition: 'transform 0.3s',
    },
    icon: {
        fontSize: '3rem',
        marginBottom: '1rem',
    },
    cta: {
        textAlign: 'center',
        padding: '3rem',
        backgroundColor: '#ecf0f1',
        borderRadius: '10px',
    },
    ctaButton: {
        backgroundColor: '#27ae60',
        color: 'white',
        border: 'none',
        padding: '1rem 2.5rem',
        fontSize: '1.1rem',
        borderRadius: '5px',
        cursor: 'pointer',
        fontWeight: '600',
        marginTop: '1rem',
    },
};

export default Home;
