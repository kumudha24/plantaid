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
    gap: '15px',
    width: '100%',
    maxWidth: '1200px',
    margin: '10px auto',
    padding: '0 15px',
    boxSizing: 'border-box'
  };

  const matildaCardStyle = {
    position: 'relative',
    width: '35%',
    minWidth: '250px',
    height: '500px',
    borderRadius: '12px',
    overflow: 'hidden',
    boxShadow: '0 6px 20px rgba(74, 124, 89, 0.12)',
    background: 'linear-gradient(135deg, #f0f8f0 0%, #e8f5e8 100%)'
  };

  const rightSectionStyle = {
    width: '65%',
    flex: '1',
    display: 'flex',
    flexDirection: 'column',
    gap: '15px'
  };

  const plantAidCardStyle = {
    position: 'relative',
    height: '140px',
    borderRadius: '12px',
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 6px 20px rgba(74, 124, 89, 0.12)',
    border: '2px solid #c8e6c8',
    backgroundColor: '#f8fdf8'
  };

  const pottedCardStyle = {
    position: 'relative',
    height: '345px',
    borderRadius: '12px',
    overflow: 'hidden',
    boxShadow: '0 6px 20px rgba(74, 124, 89, 0.12)',
    border: '2px solid #c8e6c8'
  };

  const modelViewerStyle = {
    width: '100%',
    height: '100%',
    background: 'linear-gradient(135deg, #f0f8f0 0%, #e8f5e8 100%)'
  };

  const plantAidTextStyle = {
    color: '#4a7c59',
    fontSize: '2rem',
    fontWeight: 'bold',
    textAlign: 'center'
  };

  return (
    <div style={{ padding: '15px', backgroundColor: '#f8fdf8', minHeight: '100vh' }}>
      <div style={containerStyle}>
        {/* Left Section - Matilda */}
        <div style={matildaCardStyle}>
          <model-viewer
            src="matilda.glb"
            alt="3D Matilda Model"
            auto-rotate="true"
            auto-rotate-delay="1000"
            rotation-per-second="30deg"
            camera-orbit="0deg 90deg 380m"
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
              <span style={{ fontSize: '1rem', fontWeight: 'normal', color: '#6b8e6b' }}>
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
              camera-orbit="0deg 90deg 40m"
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