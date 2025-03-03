// src/components/ImageSelector.js
import React, { useState, useEffect } from 'react';

const ImageSelector = ({ folderPath }) => {
  const [input, setInput] = useState('');
  const [imagePath, setImagePath] = useState('');
  const [error, setError] = useState('');
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Reset image states when input changes
  useEffect(() => {
    setImagePath('');
    setImageLoaded(false);
    setImageError(false);
  }, [input]);

  // Validate if input is a valid digit or uppercase letter
  const isValidInput = (value) => {
    return /^[0-9A-Z]$/.test(value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!input) {
      setError('Please enter a value.');
      setImagePath('');
      return;
    }
    
    if (!isValidInput(input)) {
      setError('Please enter a single digit (0-9) or uppercase letter (A-Z).');
      setImagePath('');
      return;
    }
    
    setError('');
    const fullPath = `${folderPath}${input}.jpg`;
    setImagePath(fullPath);
  };

  const handleImageLoad = () => {
    setImageLoaded(true);
    setImageError(false);
  };

  const handleImageError = () => {
    setImageLoaded(false);
    setImageError(true);
  };

  return (
    <div style={{
      padding: '20px',
      maxWidth: '500px',
      margin: '0 auto',
      backgroundColor: '#fff',
      borderRadius: '8px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    }}>

      <form onSubmit={handleSubmit} style={{ marginBottom: '16px' }}>
        <div style={{ marginBottom: '16px' }}>
          <label htmlFor="imageInput" style={{ 
            display: 'block', 
            marginBottom: '8px',
            fontWeight: '500'
          }}>
            Enter a digit (0-9) or letter (A-Z):
          </label>
          <input
            id="imageInput"
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value.toUpperCase())}
            style={{
              width: '100%',
              padding: '8px 12px',
              border: '1px solid #ccc',
              borderRadius: '4px',
              fontSize: '1rem'
            }}
            maxLength={1}
          />
        </div>
        
        <button 
          type="submit"
          style={{
            backgroundColor: '#3b82f6',
            color: 'white',
            padding: '8px 16px',
            borderRadius: '4px',
            border: 'none',
            fontWeight: '500',
            cursor: 'pointer'
          }}
        >
          Display Image
        </button>
      </form>
      
      {error && (
        <p style={{ color: 'red', marginBottom: '16px' }}>{error}</p>
      )}
      
      {imagePath && (
        <div style={{ marginTop: '24px' }}>
          
          <div style={{ 
            border: '1px solid #ddd', 
            borderRadius: '4px', 
            padding: '8px',
            backgroundColor: '#f9f9f9'
          }}>
            {!imageError ? (
              <img 
                src={imagePath}
                alt={`Image ${input}`}
                style={{ 
                  width: '100%', 
                  height: 'auto',
                  display: imageLoaded ? 'block' : 'none'
                }}
                onLoad={handleImageLoad}
                onError={handleImageError}
              />
            ) : null}
            
            {!imageLoaded && !imageError && (
              <div style={{ 
                height: '200px', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                backgroundColor: '#f3f4f6',
                color: '#6b7280'
              }}>
                Loading image...
              </div>
            )}
            
            {imageError && (
              <div style={{ 
                height: '200px', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                backgroundColor: '#f3f4f6',
                color: '#ef4444'
              }}>
                Image not found at {imagePath}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageSelector;