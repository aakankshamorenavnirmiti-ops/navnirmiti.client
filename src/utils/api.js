// Helper functions for API calls
// In production, REACT_APP_API_URL points to the Render backend.
// In development, the proxy in package.json forwards /api -> localhost:5000.
export const API_BASE_URL = process.env.REACT_APP_API_URL
  ? `${process.env.REACT_APP_API_URL}/api`
  : '/api';

// Fetch all projects
export const fetchProjects = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/projects`);
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error fetching projects:', error);
    return [];
  }
};

// Fetch projects by category
export const fetchProjectsByCategory = async (category) => {
  try {
    const response = await fetch(`${API_BASE_URL}/projects/category/${category}`);
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error(`Error fetching ${category} projects:`, error);
    return [];
  }
};

// Fetch all blog posts
export const fetchBlogPosts = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/blog`);
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error fetching blog posts:', error);
    return [];
  }
};

// Fetch all career opportunities
export const fetchCareerOpportunities = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/careers`);
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error fetching career opportunities:', error);
    return [];
  }
};

// Submit contact form
export const submitContactForm = async (formData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/contact`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
    });
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error submitting contact form:', error);
    return { success: false, error: 'Failed to submit form' };
  }
};

// Submit quote request form
export const submitQuoteRequest = async (quoteData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/quotes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(quoteData),
    });
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error submitting quote request:', error);
    return { success: false, error: 'Failed to submit quote request' };
  }
};

// Create new project
export const createProject = async (projectData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/projects`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(projectData),
    });
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error creating project:', error);
    return { success: false, error: 'Failed to create project' };
  }
};