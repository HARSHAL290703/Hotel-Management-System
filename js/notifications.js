// Notifications Manager - Handles system notifications
class NotificationsManager {
  constructor(api) {
    this.api = api;
    this.notifications = [];
  }

  async loadNotifications() {
    try {
      this.notifications = await this.api.getNotifications();
      this.updateNotificationCount();
      return this.notifications;
    } catch (error) {
      console.error('Error loading notifications:', error);
      return [];
    }
  }

  updateNotificationCount() {
    const countElement = document.getElementById('notificationCount');
    if (countElement) {
      countElement.textContent = this.notifications.length;
    }
  }

  async refreshNotifications() {
    await this.loadNotifications();
    this.showNotificationsModal();
  }

  showNotificationsModal() {
    // Create or update notifications modal
    let modal = document.getElementById('notificationsModal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'notificationsModal';
      modal.className = 'modal';
      modal.innerHTML = `
        <div class="modal-content" style="max-width: 600px;">
          <span class="close" onclick="this.closest('.modal').style.display='none'">&times;</span>
          <h2>🔔 Notifications</h2>
          <div id="notificationsList"></div>
        </div>
      `;
      document.body.appendChild(modal);
    }

    const list = document.getElementById('notificationsList');
    if (this.notifications.length === 0) {
      list.innerHTML = '<p>No notifications</p>';
    } else {
      list.innerHTML = this.notifications.map(notif => `
        <div class="notification-item" style="padding: 15px; margin: 10px 0; border-radius: 5px; 
          background: ${notif.priority === 'high' ? 'rgba(255, 107, 107, 0.1)' : 'rgba(255, 193, 7, 0.1)'};
          border-left: 4px solid ${notif.priority === 'high' ? '#ff6b6b' : '#ffc107'};">
          <p style="margin: 0; font-weight: 600;">${notif.message}</p>
          <p style="margin: 5px 0 0 0; font-size: 0.9rem; color: #666;">Type: ${notif.type}</p>
        </div>
      `).join('');
    }

    modal.style.display = 'block';
  }
}

// Make NotificationsManager available globally
window.NotificationsManager = NotificationsManager;

