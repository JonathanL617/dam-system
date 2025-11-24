const API_URL = 'http://localhost:8000/api';

// Get token safely
const getToken = () => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    console.log('Current token:', token); // debug
    return token;
  }
  return null;
};

// Core API function
export const api = async (endpoint, options = {}) => {
  const token = getToken();
  const headers = { ...options.headers };

  // Add Content-Type for JSON
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  // Skip token for login/register
  const noAuthRoutes = ['/auth/login/', '/auth/register/'];
  if (token && !noAuthRoutes.includes(endpoint)) {
    headers['Authorization'] = `Token ${token}`;
  }

  const fullUrl = `${API_URL}${endpoint}`;
  console.log('Fetching URL:', fullUrl); // debug

  const res = await fetch(fullUrl, { ...options, headers });

  if (!res.ok) {
    const msg = await res.text();
    console.error('API error response:', msg);
    throw new Error(`API error: ${res.status}`);
  }

  return res.json();
};

// -------------------------
// AUTH
// -------------------------

export const loginUser = async (identifier, password) => {
  const data = await api('/auth/login/', {
    method: 'POST',
    body: JSON.stringify({ username: identifier, password })
  });

  if (typeof window !== 'undefined') {
    localStorage.setItem('token', data.token);
    localStorage.setItem('role', data.role);
    localStorage.setItem('username', data.username);
    localStorage.setItem('user', JSON.stringify({
      username: data.username,
      email: data.email,
      role: data.role
    }));
    console.log('Token stored in localStorage:', data.token); // debug
  }

  return data;
};

export const registerUser = (username, email, password) =>
  api('/auth/register/', {
    method: 'POST',
    body: JSON.stringify({ username, email, password })
  });

export const logoutUser = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('username');
    localStorage.removeItem('user');
    console.log('Logged out, token cleared');
  }
};

export const getProfile = () => api('/auth/profile/');

// -------------------------
// ADMIN
// -------------------------
export const getUsers = () => api('/admin/users/');
export const deleteUser = (id) => api(`/admin/users/${id}/`, { method: 'DELETE' });
export const resetPassword = (id, newPassword) =>
  api(`/admin/users/${id}/`, {
    method: 'PUT',
    body: JSON.stringify({ password: newPassword })
  });
export const updateUserRole = (id, role, is_active) =>
  api(`/admin/users/${id}/`, {
    method: 'PUT',
    body: JSON.stringify({ role, is_active })
  });

// -------------------------
// ASSETS
// -------------------------
// -------------------------
// ASSETS - ADD THIS FUNCTION
// -------------------------
export const updateAsset = (id, data) =>
  api(`/assets/${id}/update/`, {  // ← Add /update/
    method: 'PUT',
    body: JSON.stringify(data)
  });

export const deleteAsset = (id) => 
  api(`/assets/${id}/delete/`, { method: 'DELETE' });  // ← Add /delete/

export const getAssets = (params = {}) => {
  const query = new URLSearchParams(params).toString();
  return api(`/assets${query ? '?' + query : ''}`);
};
export const getAsset = (id) => api(`/assets/${id}/`);
export const createAssetGroup = (name, assetType) =>
  api('/assets/', {
    method: 'POST',
    body: JSON.stringify({ name, asset_type: assetType })
  });
export const uploadAssetVersion = (groupId, file, changeNotes = '') => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('change_notes', changeNotes);
  return api(`/assets/${groupId}/upload-version/`, { method: 'POST', body: formData });
};

export const createAndUploadAsset = (name, file, changeNotes = 'Initial upload') => {
  const formData = new FormData();
  formData.append('name', name);
  formData.append('file', file);
  formData.append('change_notes', changeNotes);
  return api('/assets/upload/', { method: 'POST', body: formData });
};


export const searchAssets = (query) =>
  api(`/assets/search/?q=${encodeURIComponent(query)}`);
export const filterAssets = (filters) => {
  const params = new URLSearchParams(filters).toString();
  return api(`/assets/filter/?${params}`);
};
export const addTags = (assetId, tags) =>
  api(`/assets/${assetId}/tags/`, { method: 'POST', body: JSON.stringify({ tags }) });
export const removeTags = (assetId, tags) =>
  api(`/assets/${assetId}/tags/`, { method: 'DELETE', body: JSON.stringify({ tags }) });

