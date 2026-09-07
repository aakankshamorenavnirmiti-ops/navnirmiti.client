/**
 * Resolve a stored file reference to a usable URL.
 *
 * New uploads use MongoDB Base64 storage, served via /api/modules/cert-pdf/:id
 * Cloudinary uploads are full https:// URLs (returned as-is)
 * Legacy uploads are local filenames served via the backend download endpoint
 */
const API_BACKEND = process.env.REACT_APP_API_URL || '';

// For PDFs and downloadable files
export const fileUrl = (ref) => {
  if (!ref) return null;
  if (ref.startsWith('http://') || ref.startsWith('https://')) return ref;
  return `${API_BACKEND}/api/download/${ref}`;
};

// For images
export const imageUrl = (ref) => {
  if (!ref) return null;
  if (ref.startsWith('http://') || ref.startsWith('https://')) return ref;
  return `${API_BACKEND}/uploads/${ref}`;
};

// For certificate PDFs stored in MongoDB — use cert document ID
export const certPdfUrl = (certId) => {
  if (!certId) return null;
  return `${API_BACKEND}/api/modules/cert-pdf/${certId}`;
};
