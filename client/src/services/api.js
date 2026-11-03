const API_URL = '/api';

async function request(endpoint, options = {}) {
  const res = await fetch(`${API_URL}${endpoint}`, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    },
    ...options
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.message || 'Request failed');
  }

  return data;
}

export const api = {
  auth: {
    login: (email, password) => request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    }),
    signup: (name, email, password) => request('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ name, email, password })
    }),
    logout: () => request('/auth/logout', { method: 'POST' }),
    me: () => request('/auth/me')
  },

  devices: {
    list: () => request('/devices'),
    get: (id) => request(`/devices/${id}`),
    create: (data) => request('/devices', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
    update: (id, data) => request(`/devices/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    }),
    delete: (id) => request(`/devices/${id}`, { method: 'DELETE' }),

    addRepair: (deviceId, repair) => request(`/devices/${deviceId}/repairs`, {
      method: 'POST',
      body: JSON.stringify(repair)
    }),
    updateRepair: (deviceId, repairId, repair) => request(`/devices/${deviceId}/repairs/${repairId}`, {
      method: 'PUT',
      body: JSON.stringify(repair)
    }),
    deleteRepair: (deviceId, repairId) => request(`/devices/${deviceId}/repairs/${repairId}`, {
      method: 'DELETE'
    }),

    dashboardInsights: () => request('/devices/insights/dashboard'),
    costInsights: (deviceId) => request(`/devices/insights/cost/${deviceId}`)
  }
};