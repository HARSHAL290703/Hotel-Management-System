// Statistics Manager - Handles dashboard statistics
class StatisticsManager {
  constructor(api) {
    this.api = api;
  }

  async updateStats() {
    try {
      const stats = await this.api.getStats();
      
      document.getElementById('statTotalRooms').textContent = stats.totalRooms;
      document.getElementById('statAvailableRooms').textContent = stats.availableRooms;
      document.getElementById('statBookedRooms').textContent = stats.bookedRooms;
      document.getElementById('statRevenue').textContent = `₹${stats.revenue.toLocaleString()}`;
      document.getElementById('statOccupancyRate').textContent = `${stats.occupancyRate}%`;
      
      // Update progress bar
      const progressBar = document.getElementById('occupancyProgress');
      if (progressBar) {
        progressBar.style.width = `${stats.occupancyRate}%`;
      }
    } catch (error) {
      console.error('Error loading statistics:', error);
    }
  }

  async refreshStats() {
    await this.updateStats();
  }
}

// Make StatisticsManager available globally
window.StatisticsManager = StatisticsManager;

