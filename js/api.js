// API Client - Handles all backend API calls
const API = {
  baseURL: 'http://127.0.0.1:5000',

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`);
      }
      
      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  },

  // Get all rooms (optionally filtered by status)
  async getRooms(status = null) {
    const endpoint = status ? `/rooms?status=${status}` : '/rooms';
    return await this.request(endpoint);
  },

  // Add a new room
  async addRoom(roomData) {
    return await this.request('/rooms', {
      method: 'POST',
      body: JSON.stringify(roomData)
    });
  },

  // Book a room
  async bookRoom(roomNo, bookingData) {
    return await this.request(`/rooms/${roomNo}/book`, {
      method: 'POST',
      body: JSON.stringify(bookingData)
    });
  },

  // Unbook a room
  async unbookRoom(roomNo) {
    return await this.request(`/rooms/${roomNo}/unbook`, {
      method: 'POST'
    });
  },

  // Update a room
  async updateRoom(roomNo, roomData) {
    return await this.request(`/rooms/${roomNo}`, {
      method: 'PUT',
      body: JSON.stringify(roomData)
    });
  },

  // Delete a room
  async deleteRoom(roomNo) {
    return await this.request(`/rooms/${roomNo}`, {
      method: 'DELETE'
    });
  },

  // Get statistics
  async getStats() {
    return await this.request('/stats');
  }
};

// Make API globally available
window.API = API;
