const API_URL = 'http://localhost:8000/api';
const getToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token');
  }
  return null;
};

export const api = async (endpoint, options = {}) => {
  const token = getToken();
  
  const headers = {
    ...options.headers
  };
  
  // Only add Content-Type for non-FormData requests
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }
  
  if (token) {
    headers['Authorization'] = `Token ${token}`; 
}
  
  const res = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers
  });
  
  if (!res.ok) {
    throw new Error(`API error: ${res.status}`);
  }
  
  return res.json();
};

//auth

export const loginUser = (identifier, password) => 
  api('/login/', {
    method: 'POST',
    body: JSON.stringify({ identifier, password })
  });

export const logoutUser = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
  }
};

export const getProfile = () => api('/auth/profile/');


//admin

export const getUsers = () => api('/admin/users/');

export const deleteUser = (id) => 
  api(`/admin/users/${id}/`, { method: 'DELETE' });

export const resetPassword = (id, newPassword) => 
  api(`/admin/users/${id}/reset-password/`, {
    method: 'POST',
    body: JSON.stringify({ new_password: newPassword })
  });

export const updateUserRole = (id, role) =>
  api(`/admin/users/${id}/`, {
    method: 'PATCH',
    body: JSON.stringify({ role })
  });

//asset

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
  
  return api(`/assets/${groupId}/upload-version/`, {
    method: 'POST',
    body: formData
  });
};

export const deleteAsset = (id) =>
  api(`/assets/${id}/`, { method: 'DELETE' });

export const searchAssets = (query) =>
  api(`/assets/search/?q=${encodeURIComponent(query)}`);

export const filterAssets = (filters) => {
  const params = new URLSearchParams(filters).toString();
  return api(`/assets/filter/?${params}`);
};

export const addTags = (assetId, tags) =>
  api(`/assets/${assetId}/tags/`, {
    method: 'POST',
    body: JSON.stringify({ tags })
  });

export const removeTags = (assetId, tags) =>
  api(`/assets/${assetId}/tags/`, {
    method: 'DELETE',
    body: JSON.stringify({ tags })
  });