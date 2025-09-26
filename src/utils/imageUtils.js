export const getFallbackImage = (text = '') => {
  if (text) {
    const svg = `<svg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="#f3f4f6" />
        <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="10" text-anchor="middle" dominant-baseline="middle" fill="#9ca8de">
          ${text.substring(0, 15)}${text.length > 15 ? '...' : ''}
        </text>
      </svg>`;
    
    // Encode the SVG string to be compatible with btoa
    const encodedSvg = btoa(unescape(encodeURIComponent(svg)));
    
    return `data:image/svg+xml;base64,${encodedSvg}`;
  }
  
  // Default package/box icon
  return 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiB2aWV3Qm94PSIwIDAgMjQgMjQiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzljYThkZSIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiPjxwYXRoIGQ9Ik0yMSAxNmMwIDQuNDE4LTRsNi0zLjU4NlYxMS41ODZMMjEgOHY4ek0zIDh2OGMwIDQuNDE4IDQgNi41ODIgNiA3LjQxNEwyMSAxNnYtOEw5IDUuNTg2QzcuMzY0IDYuNTEyIDMgOS44NzkgMyAxNnoiPjwvcGF0aD48L3N2Zz4=';
};

// Function to handle image errors
export const handleImageError = (e, text = '') => {
  e.target.onerror = null;
  e.target.src = getFallbackImage(text);
};