// Booking Manager - Handles booking flow
class BookingManager {
  constructor(api, ui) {
    this.api = api;
    this.ui = ui;
    this.currentRoomNo = null;
    this.bookingData = {
      guestName: '',
      checkIn: '',
      checkOut: '',
      cost: 0
    };
  }

  openBookingModal(roomNo) {
    this.currentRoomNo = roomNo;
    const modal = document.getElementById('bookingModal');
    if (modal) {
      modal.style.display = 'block';
      // Reset form
      document.getElementById('guestName').value = '';
      document.getElementById('guestEmail').value = '';
      document.getElementById('guestPhone').value = '';
      document.getElementById('guestCount').value = '1';
      document.getElementById('checkIn').value = '';
      document.getElementById('checkOut').value = '';
      document.getElementById('bookingNotes').value = '';
      document.getElementById('costDisplay').textContent = '₹0';
    }
  }

  closeBookingModal() {
    const modal = document.getElementById('bookingModal');
    if (modal) {
      modal.style.display = 'none';
    }
    this.currentRoomNo = null;
    this.bookingData = {
      guestName: '',
      checkIn: '',
      checkOut: '',
      cost: 0
    };
  }

  async calculateCost() {
    const checkIn = document.getElementById('checkIn').value;
    const checkOut = document.getElementById('checkOut').value;
    const roomNo = this.currentRoomNo;

    if (!checkIn || !checkOut) {
      alert('Please select both check-in and check-out dates');
      return;
    }

    if (!this.ui.validateDates(checkIn, checkOut)) {
      return;
    }

    try {
      // Get room price from API
      const rooms = await this.api.getRooms();
      const room = rooms.find(r => r.number === roomNo);
      if (room) {
        const days = this.ui.calculateDays(checkIn, checkOut);
        const cost = room.price * days;
        this.bookingData.cost = cost;
        document.getElementById('costDisplay').textContent = `₹${cost.toLocaleString()}`;
      }
    } catch (error) {
      console.error('Error calculating cost:', error);
      alert('Failed to calculate cost. Please try again.');
    }
  }

  async confirmBooking() {
    const guestName = document.getElementById('guestName').value.trim();
    const checkIn = document.getElementById('checkIn').value;
    const checkOut = document.getElementById('checkOut').value;

    if (!guestName || !checkIn || !checkOut) {
      alert('Please fill in all booking details');
      return;
    }

    if (!this.ui.validateDates(checkIn, checkOut)) {
      return;
    }

    // Calculate cost if not already calculated
    if (this.bookingData.cost === 0) {
      await this.calculateCost();
    }

    // Show processing indicator
    const confirmBtn = document.getElementById('confirmBookingBtn');
    const originalText = confirmBtn.textContent;
    confirmBtn.textContent = 'Processing...';
    confirmBtn.disabled = true;

    try {
      const guestEmail = document.getElementById('guestEmail').value.trim();
      const guestPhone = document.getElementById('guestPhone').value.trim();
      const guestCount = parseInt(document.getElementById('guestCount').value) || 1;
      const notes = document.getElementById('bookingNotes').value.trim();

      // Process booking
      const result = await this.api.bookRoom(this.currentRoomNo, {
        guestName: guestName,
        guestEmail: guestEmail || undefined,
        guestPhone: guestPhone || undefined,
        guestCount: guestCount,
        checkIn: checkIn,
        checkOut: checkOut,
        notes: notes || undefined
      });

      // Store booking data for summary
      this.bookingData.guestName = guestName;
      this.bookingData.checkIn = checkIn;
      this.bookingData.checkOut = checkOut;
      this.bookingData.confirmationNumber = result.confirmationNumber;

      // Show success summary
      this.showSummaryModal();
      this.closeBookingModal();
      
      // Refresh rooms display
      if (window.roomsManager) {
        await window.roomsManager.renderRooms();
      }
    } catch (error) {
      alert('Booking failed: ' + error.message);
    } finally {
      // Restore button
      confirmBtn.textContent = originalText;
      confirmBtn.disabled = false;
    }
  }

  showSummaryModal() {
    const modal = document.getElementById('summaryModal');
    if (modal) {
      document.getElementById('summaryRoomNo').textContent = this.currentRoomNo;
      document.getElementById('summaryGuestName').textContent = this.bookingData.guestName;
      document.getElementById('summaryCheckIn').textContent = this.ui.formatDate(this.bookingData.checkIn);
      document.getElementById('summaryCheckOut').textContent = this.ui.formatDate(this.bookingData.checkOut);
      document.getElementById('summaryCost').textContent = `₹${this.bookingData.cost.toLocaleString()}`;
      document.getElementById('summaryConfirmation').textContent = this.bookingData.confirmationNumber || 'N/A';
      modal.style.display = 'block';
    }
  }

  closeSummaryModal() {
    const modal = document.getElementById('summaryModal');
    if (modal) {
      modal.style.display = 'none';
    }
  }
}

// Make BookingManager available globally
window.BookingManager = BookingManager;
