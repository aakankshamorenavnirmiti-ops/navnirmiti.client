/**
 * Resolve a stored file reference to a displayable URL.
 *
 * - Full URLs (https://) returned as-is (legacy Cloudinary or external)
 * - Local filenames served via /uploads/:filename from the backend
 * - Certificate PDFs served via /api/modules/cert-pdf/:id
 */
const API_BACKEND = process.env.REACT_APP_API_URL || '';

// Extract just the filename from a path (handles both / and \ separators)
const basename = (ref) => {
  if (!ref) return ref;
  const parts = ref.replace(/\\/g, '/').split('/');
  return parts[parts.length - 1];
};

// For images — served from /uploads/
export const imageUrl = (ref) => {
  if (!ref) return null;
  if (ref.startsWith('http://') || ref.startsWith('https://')) return ref;
  return `${API_BACKEND}/uploads/${basename(ref)}`;
};

// For PDFs and downloadable files — served from /api/download/
export const fileUrl = (ref) => {
  if (!ref) return null;
  if (ref.startsWith('http://') || ref.startsWith('https://')) return ref;
  return `${API_BACKEND}/api/download/${basename(ref)}`;
};

// For certificate PDFs stored in MongoDB Base64 — served via cert ID
export const certPdfUrl = (certId) => {
  if (!certId) return null;
  return `${API_BACKEND}/api/modules/cert-pdf/${certId}`;
};