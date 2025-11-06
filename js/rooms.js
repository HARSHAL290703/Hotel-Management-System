// Rooms Manager - Handles room display and management
class RoomsManager {
  constructor(api) {
    this.api = api;
    this.allRooms = [];
    this.filteredRooms = [];
  }

  async renderRooms() {
    try {
      this.allRooms = await this.api.getRooms();
      this.filteredRooms = [...this.allRooms];
      this.displayAvailableRooms();
      this.displayBookedRooms();
      this.displayAllRooms();
      
      // Refresh stats if stats manager exists
      if (window.statsManager) {
        window.statsManager.updateStats();
      }
    } catch (error) {
      console.error('Error loading rooms:', error);
      this.showErrorMessage('Failed to load rooms. Make sure the backend server is running.');
    }
  }

  displayAvailableRooms() {
    const container = document.getElementById('availableRooms');
    if (!container) return;

    const available = this.filteredRooms.filter(r => !r.isBooked);
    
    if (available.length === 0) {
      container.innerHTML = '<p class="empty-message">No available rooms</p>';
      return;
    }

    container.innerHTML = available.map(room => `
      <div class="room-item">
        <div class="room-header">
          <b>Room ${room.number}</b>
          <span class="status available">Available</span>
        </div>
        <p>${room.description}</p>
        <button class="btn-inline btn-book" onclick="window.bookingManager.openBookingModal('${room.number}')">
          Book Room
        </button>
      </div>
    `).join('');
  }

  displayBookedRooms() {
    const container = document.getElementById('bookedRooms');
    if (!container) return;

    const booked = this.filteredRooms.filter(r => r.isBooked);
    
    if (booked.length === 0) {
      container.innerHTML = '<p class="empty-message">No booked rooms</p>';
      return;
    }

    container.innerHTML = booked.map(room => `
      <div class="room-item">
        <div class="room-header">
          <b>Room ${room.number}</b>
          <span class="status booked">Booked</span>
        </div>
        <p>${room.description}<br>Guest: <b>${room.booked_by || 'N/A'}</b></p>
        <button class="btn-inline btn-unbook" onclick="window.roomsManager.unbookRoom('${room.number}')">
          Unbook Room
        </button>
      </div>
    `).join('');
  }

  displayAllRooms() {
    const container = document.getElementById('allRoomsList');
    if (!container) return;

    if (this.filteredRooms.length === 0) {
      container.innerHTML = '<p class="empty-message">No rooms found</p>';
      return;
    }

    container.innerHTML = this.filteredRooms.map(room => `
      <div class="room-item">
        <div class="room-header">
          <b>Room ${room.number}</b>
          <span class="status ${room.isBooked ? 'booked' : 'available'}">
            ${room.isBooked ? 'Booked' : 'Available'}
          </span>
        </div>
        <p>${room.description}</p>
        ${room.isBooked ? `<p>Guest: <b>${room.bookedBy || 'N/A'}</b></p>` : ''}
        <div class="room-actions">
          ${!room.isBooked ? `
            <button class="btn-inline btn-edit" onclick="window.roomsManager.editRoom('${room.number}')" style="margin-right: 5px;">
              ✏️ Edit
            </button>
            <button class="btn-inline btn-delete" onclick="window.roomsManager.deleteRoom('${room.number}')">
              🗑️ Delete
            </button>
          ` : `
            <button class="btn-inline btn-unbook" onclick="window.roomsManager.unbookRoom('${room.number}')">
              Unbook First
            </button>
          `}
        </div>
      </div>
    `).join('');
  }

  async displayBookings() {
    const container = document.getElementById('bookingsList');
    if (!container) return;

    // Refresh rooms data first
    await this.renderRooms();

    const booked = this.allRooms.filter(r => r.isBooked);
    
    if (booked.length === 0) {
      container.innerHTML = '<p class="empty-message">No active bookings</p>';
      return;
    }

    container.innerHTML = booked.map(room => `
      <div class="room-item">
        <div class="room-header">
          <b>Room ${room.number}</b>
          <span class="status booked">Booked</span>
        </div>
        <p>${room.description}</p>
        <p><strong>Guest:</strong> ${room.bookedBy || 'N/A'}</p>
        ${room.checkIn ? `<p><strong>Check-in:</strong> ${window.UI ? window.UI.formatDate(room.checkIn) : room.checkIn}</p>` : ''}
        ${room.checkOut ? `<p><strong>Check-out:</strong> ${window.UI ? window.UI.formatDate(room.checkOut) : room.checkOut}</p>` : ''}
        <button class="btn-inline btn-unbook" onclick="window.roomsManager.unbookRoom('${room.number}')">
          Cancel Booking
        </button>
      </div>
    `).join('');
  }

  async addRoom(roomData) {
    try {
      const result = await this.api.addRoom(roomData);
      await this.renderRooms();
      return { success: true, data: result };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async unbookRoom(roomNo) {
    try {
      await this.api.unbookRoom(roomNo);
      this.showSuccessMessage('Room unbooked successfully!');
      await this.renderRooms();
      // Refresh bookings if on bookings page
      const bookingsSection = document.getElementById('section-bookings');
      if (bookingsSection && bookingsSection.classList.contains('active')) {
        await this.displayBookings();
      }
    } catch (error) {
      this.showErrorMessage('Failed to unbook room: ' + error.message);
    }
  }

  async deleteRoom(roomNo) {
    if (!confirm(`Are you sure you want to delete Room ${roomNo}? This action cannot be undone.`)) {
      return;
    }

    try {
      await this.api.deleteRoom(roomNo);
      this.showSuccessMessage('Room deleted successfully!');
      await this.renderRooms();
    } catch (error) {
      this.showErrorMessage('Failed to delete room: ' + error.message);
    }
  }

  async editRoom(roomNo) {
    const room = this.allRooms.find(r => r.number === roomNo);
    if (!room) return;

    const newPrice = prompt(`Enter new price for Room ${roomNo}:`, room.price);
    if (newPrice === null) return;

    const price = parseFloat(newPrice);
    if (isNaN(price) || price <= 0) {
      alert('Please enter a valid price');
      return;
    }

    const newType = prompt(`Enter new room type (SingleRoom/DoubleRoom/SuiteRoom) or press Cancel to keep current:`, room.type);
    
    try {
      const updateData = { price: price };
      if (newType && ['SingleRoom', 'DoubleRoom', 'SuiteRoom'].includes(newType)) {
        updateData.type = newType;
      }
      
      await this.api.updateRoom(roomNo, updateData);
      this.showSuccessMessage('Room updated successfully!');
      await this.renderRooms();
    } catch (error) {
      this.showErrorMessage('Failed to update room: ' + error.message);
    }
  }

  filterByType(type) {
    if (type === 'all') {
      this.filteredRooms = [...this.allRooms];
    } else {
      this.filteredRooms = this.allRooms.filter(room => room.type === type);
    }
    this.displayAllRooms();
  }

  sortRooms(sortBy) {
    const rooms = [...this.filteredRooms];
    
    switch(sortBy) {
      case 'number':
        rooms.sort((a, b) => a.number.localeCompare(b.number));
        break;
      case 'price-asc':
        rooms.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        rooms.sort((a, b) => b.price - a.price);
        break;
      case 'type':
        rooms.sort((a, b) => a.type.localeCompare(b.type));
        break;
      default:
        return;
    }
    
    this.filteredRooms = rooms;
    this.displayAllRooms();
  }

  exportBookings() {
    const booked = this.allRooms.filter(r => r.isBooked);
    
    if (booked.length === 0) {
      alert('No bookings to export');
      return;
    }

    let content = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Hotel Bookings Report</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          h1 { color: #333; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
          th { background-color: #4CAF50; color: white; }
          tr:nth-child(even) { background-color: #f2f2f2; }
          .header { text-align: center; margin-bottom: 30px; }
          .footer { margin-top: 30px; text-align: right; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>🏨 Elite Hotel - Bookings Report</h1>
          <p>Generated on: ${new Date().toLocaleString()}</p>
        </div>
        <table>
          <thead>
            <tr>
              <th>Room Number</th>
              <th>Room Type</th>
              <th>Guest Name</th>
              <th>Check-in</th>
              <th>Check-out</th>
              <th>Price per Night</th>
              <th>Total Cost</th>
            </tr>
          </thead>
          <tbody>
    `;

    let totalRevenue = 0;
    booked.forEach(room => {
      const checkIn = room.checkIn ? new Date(room.checkIn) : null;
      const checkOut = room.checkOut ? new Date(room.checkOut) : null;
      const days = checkIn && checkOut ? Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24)) : 0;
      const totalCost = room.price * days;
      totalRevenue += totalCost;

      content += `
        <tr>
          <td>${room.number}</td>
          <td>${room.type || 'N/A'}</td>
          <td>${room.bookedBy || 'N/A'}</td>
          <td>${checkIn ? checkIn.toLocaleDateString() : 'N/A'}</td>
          <td>${checkOut ? checkOut.toLocaleDateString() : 'N/A'}</td>
          <td>₹${room.price.toLocaleString()}</td>
          <td>₹${totalCost.toLocaleString()}</td>
        </tr>
      `;
    });

    content += `
          </tbody>
        </table>
        <div class="footer">
          <p><strong>Total Bookings:</strong> ${booked.length}</p>
          <p><strong>Total Revenue:</strong> ₹${totalRevenue.toLocaleString()}</p>
        </div>
      </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    printWindow.document.write(content);
    printWindow.document.close();
    printWindow.print();
  }

  searchRooms(query) {
    const filter = document.getElementById('searchFilter')?.value || 'all';
    const searchTerm = query.toLowerCase().trim();

    if (!searchTerm) {
      this.filteredRooms = [...this.allRooms];
    } else {
      this.filteredRooms = this.allRooms.filter(room => {
        const matchesSearch = 
          room.number.toLowerCase().includes(searchTerm) ||
          room.type?.toLowerCase().includes(searchTerm) ||
          room.description?.toLowerCase().includes(searchTerm) ||
          room.price?.toString().includes(searchTerm);

        const matchesFilter = 
          filter === 'all' ||
          (filter === 'available' && !room.isBooked) ||
          (filter === 'booked' && room.isBooked);

        return matchesSearch && matchesFilter;
      });
    }

    this.displayAllRooms();
    
    // Show search results count
    const resultsContainer = document.getElementById('searchResults');
    if (resultsContainer) {
      if (searchTerm) {
        resultsContainer.innerHTML = `
          <p class="search-results-info">
            Found ${this.filteredRooms.length} room(s) matching "${query}"
          </p>
        `;
      } else {
        resultsContainer.innerHTML = '';
      }
    }
  }

  showSuccessMessage(message) {
    if (window.UI) {
      window.UI.showSuccessMessage(message);
    } else {
      alert(message);
    }
  }

  showErrorMessage(message) {
    if (window.UI) {
      window.UI.showErrorMessage(message);
    } else {
      alert(message);
    }
  }
}

// Make RoomsManager available globally
window.RoomsManager = RoomsManager;
