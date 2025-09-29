 
// Convert various image hosting service URLs to direct image URLs
export const convertImageUrl = (url) => {
  if (!url) return url;
  
  try {
    // Handle ImgBB (im.ge) URLs
    if (url.includes('im.ge/')) {
      // Extract the image ID from the URL
      const match = url.match(/im\.ge\/i\/([^\s.]+)/);
      if (match && match[1]) {
        const imageId = match[1];
        // Construct direct image URL (ImgBB direct image format)
        return `https://i.im.ge/${imageId}.jpg`;
      }
    }
    
    // Handle ImgBB (ibb.co) URLs
    if (url.includes('ibb.co/')) {
      // Extract the image ID from the URL
      const parts = url.split('/');
      const imageId = parts[parts.length - 1];
      // Construct direct image URL (ImgBB direct image format)
      return `https://i.ibb.co/${imageId}.jpg`;
    }
    
    // Handle Google Drive URLs
    if (url.includes('drive.google.com')) {
      let fileId = null;
      if (url.includes('/file/d/')) {
        const parts = url.split('/d/');
        if (parts.length > 1) {
          fileId = parts[1].split('/')[0];
        }
      } else if (url.includes('id=')) {
        const parts = url.split('id=');
        if (parts.length > 1) {
          fileId = parts[1].split('&')[0];
        }
      }
      
      if (fileId) {
        return `https://drive.google.com/uc?export=view&id=${fileId}`;
      }
    }
    
    return url;
  } catch (error) {
    console.error('Error processing image URL:', error);
    return url; // Return original URL if something goes wrong
  }
};

// For backward compatibility
export const convertGoogleDriveLink = (link) => {
  return convertImageUrl(link);
};

export const handleImageError = (e, name = 'product') => {
  const originalSrc = e.target.src;
  console.error(`Image for ${name} failed to load: ${originalSrc}`);
  
  // Try to fix common URL issues
  if (originalSrc.includes('im.ge/') || originalSrc.includes('ibb.co/')) {
    const fixedUrl = convertImageUrl(originalSrc);
    if (fixedUrl !== originalSrc) {
      e.target.src = fixedUrl;
      return; // Let the browser try to load the fixed URL
    }
  }
  
  // If we can't fix it or the fixed URL also fails, show placeholder
  if (!originalSrc.endsWith('/placeholder.svg')) {
    e.target.src = '/placeholder.svg';
  }
};
