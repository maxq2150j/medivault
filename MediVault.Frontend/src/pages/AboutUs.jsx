import React from 'react';
import Navbar from '../components/Navbar';

const AboutUs = () => {
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
                        <div style={styles.valueCard}>
                            <h3>💡 Innovation</h3>
                            <p>Continuously improving our platform with the latest healthcare technology.</p>
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

const styles = {
    wrapper: {
        minHeight: '100vh',
        backgroundColor: '#f5f5f5',
    },
    container: {
        maxWidth: '1000px',
        margin: '0 auto',
        padding: '3rem 2rem',
    },
    title: {
        fontSize: '3rem',
        color: '#2c3e50',
        textAlign: 'center',
        marginBottom: '3rem',
    },
    section: {
        backgroundColor: 'white',
        padding: '2rem',
        marginBottom: '2rem',
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
        marginBottom: '1rem',
    },
    list: {
        fontSize: '1.1rem',
        lineHeight: '2',
        color: '#555',
        marginLeft: '2rem',
    },
    valuesGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1.5rem',
        marginTop: '1.5rem',
    },
    valueCard: {
        backgroundColor: '#ecf0f1',
        padding: '1.5rem',
        borderRadius: '8px',
        textAlign: 'center',
    },
};

export default AboutUs;
