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
      document.head.removeChild(script);
    };
  }, []);

  const containerStyle = {
    position: 'relative',
    width: '100%',
    height: '400px',
    marginTop: '30px',
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

  return (
    <div className="container">
      <center>
        <h1>🌿 PlantAid 🌿</h1>
        <p>Welcome to the PlantAid community platform!</p>
      </center>
      
      <div style={containerStyle}>
        <model-viewer
          src="/potted_house_plants.glb"
          alt="3D Potted House Plants"
          auto-rotate="true"
          auto-rotate-delay="1000"
          rotation-per-second="30deg"
          camera-orbit="0deg 90deg 45m"
          shadow-intensity="1"
          shadow-softness="0.5"
          style={modelViewerStyle}
        >
        </model-viewer>
      </div>
    </div>
  );
}

export default PlantAid;