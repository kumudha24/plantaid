import React, { useEffect } from 'react';

function PlantAid() {
  useEffect(() => {
    // Load model-viewer script dynamically
    const script = document.createElement('script');
    script.type = 'module';
    script.src = 'https://unpkg.com/@google/model-viewer/dist/model-viewer.min.js';
    document.head.appendChild(script);

    return () => {
      // Cleanup script when component unmounts
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, []);

  const containerStyle = {
    display: 'flex',
    gap: '30px',
    width: '100%',
    maxWidth: '1200px',
    margin: '30px auto',
    padding: '0 20px'
  };

  const matildaCardStyle = {
    position: 'relative',
    width: '25%',
    height: '830px', // Combined height of both right cards plus gap
    borderRadius: '15px',
    overflow: 'hidden',
    boxShadow: '0 8px 25px rgba(74, 124, 89, 0.15)',
    border: '2px solid #c8e6c8'
  };

  const rightSectionStyle = {
    width: '75%',
    display: 'flex',
    flexDirection: 'column',
    gap: '30px'
  };

  const plantAidCardStyle = {
    position: 'relative',
    height: '200px',
    borderRadius: '15px',
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 8px 25px rgba(74, 124, 89, 0.15)',
    border: '2px solid #c8e6c8',
    backgroundColor: '#f8fdf8'
  };

  const pottedCardStyle = {
    position: 'relative',
    height: '600px',
    borderRadius: '15px',
    overflow: 'hidden',
    boxShadow: '0 8px 25px rgba(74, 124, 89, 0.15)',
    border: '2px solid #c8e6c8'
  };

  const modelViewerStyle = {
    width: '100%',
    height: '100%',
    background: 'linear-gradient(135deg, #f0f8f0 0%, #e8f5e8 100%)'
  };

  const plantAidTextStyle = {
    color: '#4a7c59',
    fontSize: '2.5rem',
    fontWeight: 'bold',
    textAlign: 'center'
  };

  return (
    <div style={{ padding: '20px', backgroundColor: '#f8fdf8', minHeight: '100vh' }}>
      <div style={containerStyle}>
        {/* Left Card - Matilda with combined height */}
        <div style={matildaCardStyle}>
          <model-viewer
            src="matilda.glb"
            alt="3D Matilda Model"
            auto-rotate="true"
            auto-rotate-delay="1000"
            rotation-per-second="30deg"
            camera-orbit="0deg 90deg 60m"
            shadow-intensity="1"
            shadow-softness="0.5"
            style={modelViewerStyle}
          />
        </div>

        {/* Right Section - PlantAid Card and Potted Plants stacked */}
        <div style={rightSectionStyle}>
          {/* PlantAid Card */}
          <div style={plantAidCardStyle}>
            <div style={plantAidTextStyle}>
              🌿 PlantAid 🌿<br/>
              <span style={{ fontSize: '1.2rem', fontWeight: 'normal', color: '#6b8e6b' }}>
                Welcome to the PlantAid community platform!
              </span>
            </div>
          </div>

          {/* Potted Plants Card */}
          <div style={pottedCardStyle}>
            <model-viewer
              src="potted_house_plants.glb"
              alt="3D Potted House Plants"
              auto-rotate="true"
              auto-rotate-delay="1000"
              rotation-per-second="30deg"
              camera-orbit="0deg 90deg 45m"
              shadow-intensity="1"
              shadow-softness="0.5"
              style={modelViewerStyle}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default PlantAid;