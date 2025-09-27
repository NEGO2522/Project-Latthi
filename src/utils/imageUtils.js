 
export const convertGoogleDriveLink = (link) => {
  if (link && link.includes("drive.google.com")) {
    let fileId = null;
    if (link.includes('/file/d/')) {
      const parts = link.split('/d/');
      if (parts.length > 1) {
        fileId = parts[1].split('/')[0];
      }
    } else if (link.includes('id=')) {
      const parts = link.split('id=');
      if (parts.length > 1) {
        fileId = parts[1].split('&')[0];
      }
    }
    
    if (fileId) {
      return `https://drive.google.com/uc?export=view&id=${fileId}`;
    }
  }
  return link;
};

export const handleImageError = (e, name = 'product') => {
  const originalSrc = e.target.src;
  console.error(`Image for ${name} failed to load: ${originalSrc}`);
  // Prevent infinite loop if placeholder also fails
  if (!originalSrc.endsWith('/placeholder.svg')) {
    e.target.src = '/placeholder.svg';
  }
};
