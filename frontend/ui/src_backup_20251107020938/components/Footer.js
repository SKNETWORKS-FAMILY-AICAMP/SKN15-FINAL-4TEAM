import React from 'react';

const Footer = () => {
  return (
    <footer style={{
      backgroundColor: '#1a1a1a',
      color: '#ffffff',
      padding: '60px 0 30px',
      marginTop: 'auto',
      width: '100%'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '0 20px'
      }}>
        {/* Main Content */}
        <div style={{
          marginBottom: '40px'
        }}>
          {/* Company Info */}
          <div>
            <h3 style={{
              color: '#ff6b35',
              fontSize: '24px',
              fontWeight: 'bold',
              marginBottom: '12px'
            }}>
              ASSEMBLE
            </h3>
            <p style={{
              fontSize: '14px',
              lineHeight: '1.4',
              color: '#cccccc',
              marginBottom: '10px'
            }}>
              ASSEMBLE은 AI 기술을 활용하여 최적의 인테리어 솔루션을 제공합니다
            </p>

            {/* Contact Info */}
            <h4 style={{
              fontSize: '16px',
              fontWeight: '600',
              marginBottom: '10px',
              marginTop: '15px',
              color: '#ffffff'
            }}>
              Contact
            </h4>
            <div style={{
              fontSize: '14px',
              lineHeight: '1.5',
              color: '#cccccc',
              marginBottom: '10px'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'flex-start',
                marginBottom: '10px'
              }}>
                <span style={{
                  color: '#ff6b35',
                  marginRight: '12px',
                  fontSize: '16px',
                  fontWeight: 'bold'
                }}>📍</span>
                <span>서울 금천구 가산디지털1로 25 대륭테크노타운17차</span>
              </div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                marginBottom: '10px'
              }}>
                <span style={{
                  color: '#ff6b35',
                  marginRight: '12px',
                  fontSize: '16px',
                  fontWeight: 'bold'
                }}>@</span>
                <a href="mailto:goodfellow@assemble.com" style={{
                  color: '#cccccc',
                  textDecoration: 'none',
                  transition: 'color 0.3s ease'
                }}
                onMouseEnter={(e) => e.target.style.color = '#ff6b35'}
                onMouseLeave={(e) => e.target.style.color = '#cccccc'}>
                  goodfellow@assemble.com
                </a>
              </div>
            </div>

            <p style={{
              fontSize: '14px',
              lineHeight: '1.4',
              color: '#cccccc',
              fontStyle: 'italic',
              marginTop: '10px'
            }}>
              Interior Design Powered by AI Technology
            </p>
          </div>
        </div>

        {/* Divider */}
        <div style={{
          height: '1px',
          backgroundColor: '#333333',
          margin: '30px 0'
        }}></div>

        {/* Copyright */}
        <div style={{
          textAlign: 'left',
          fontSize: '13px',
          color: '#888888'
        }}>
          © 2025 ASSEMBLE. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
