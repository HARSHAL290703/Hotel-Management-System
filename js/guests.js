// Guests Manager - Handles guest management
class GuestsManager {
  constructor(api) {
    this.api = api;
  }

  async displayGuests() {
    const container = document.getElementById('guestsList');
    if (!container) return;

    try {
      const guests = await this.api.getGuests();
      
      if (guests.length === 0) {
        container.innerHTML = '<p class="empty-message">No guests found</p>';
        return;
      }

      container.innerHTML = guests.map(guest => `
        <div class="room-item">
          <div class="room-header">
            <b>${guest.name}</b>
            <span class="status available">${guest.totalBookings} Booking(s)</span>
          </div>
          ${guest.email ? `<p><strong>Email:</strong> ${guest.email}</p>` : ''}
          ${guest.phone ? `<p><strong>Phone:</strong> ${guest.phone}</p>` : ''}
          <div style="margin-top: 15px;">
            <strong>Booking History:</strong>
            ${guest.bookings.map(booking => `
              <div style="margin-top: 10px; padding: 10px; background: rgba(20, 184, 166, 0.1); border-radius: 5px;">
                <p><strong>Room:</strong> ${booking.roomNo}</p>
                <p><strong>Check-in:</strong> ${new Date(booking.checkIn).toLocaleDateString()}</p>
                <p><strong>Check-out:</strong> ${new Date(booking.checkOut).toLocaleDateString()}</p>
                ${booking.confirmationNumber ? `<p><strong>Confirmation:</strong> <code>${booking.confirmationNumber}</code></p>` : ''}
                <p><strong>Status:</strong> 
                  ${booking.checkedOut ? '<span style="color: #999;">Checked Out</span>' : 
                    booking.checkedIn ? '<span style="color: #4CAF50;">Checked In</span>' : 
                    '<span style="color: #ffc107;">Booked</span>'}
                </p>
              </div>
            `).join('')}
          </div>
        </div>
      `).join('');
    } catch (error) {
      console.error('Error loading guests:', error);
      container.innerHTML = '<p class="empty-message">Failed to load guests</p>';
    }
  }
}

// Make GuestsManager available globally
window.GuestsManager = GuestsManager;

