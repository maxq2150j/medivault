import React from 'react';

const Footer = () => {
    return (
        <footer style={styles.footer}>
            <div style={styles.container}>
                <div style={styles.column}>
                    <h3 style={styles.heading}>MediVault</h3>
                    <p style={styles.text}>Your trusted medical records management system.</p>
                </div>
                <div style={styles.column}>
                    <h4 style={styles.heading}>Quick Links</h4>
                    <p style={styles.link}>Privacy Policy</p>
                    <p style={styles.link}>Terms of Service</p>
                    <p style={styles.link}>FAQs</p>
                </div>
                <div style={styles.column}>
                    <h4 style={styles.heading}>Contact</h4>
                    <p style={styles.text}>Email: info@medivault.com</p>
                    <p style={styles.text}>Phone: +91 1234567890</p>
                    <p style={styles.text}>Address: Mumbai, India</p>
                </div>
            </div>
            <div style={styles.bottom}>
                <p>&copy; 2025 MediVault. All rights reserved.</p>
            </div>
        </footer>
    );
};

const styles = {
    footer: {
        backgroundColor: '#2c3e50',
        color: '#ecf0f1',
        padding: '2rem 0 1rem',
        marginTop: 'auto',
    },
    container: {
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '0 2rem',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '2rem',
    },
    column: {
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem',
    },
    heading: {
        color: '#3498db',
        marginBottom: '0.5rem',
    },
    text: {
        fontSize: '0.9rem',
        lineHeight: '1.6',
        margin: '0.2rem 0',
    },
    link: {
        fontSize: '0.9rem',
        cursor: 'pointer',
        margin: '0.2rem 0',
        transition: 'color 0.3s',
    },
    bottom: {
        textAlign: 'center',
        marginTop: '2rem',
        paddingTop: '1rem',
        borderTop: '1px solid #34495e',
        fontSize: '0.9rem',
    },
};

export default Footer;
