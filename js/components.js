// Component Loader - Loads HTML components dynamically
class ComponentLoader {
  static async loadComponent(componentPath) {
    try {
      const response = await fetch(componentPath);
      if (!response.ok) {
        throw new Error(`Failed to load component: ${componentPath}`);
      }
      return await response.text();
    } catch (error) {
      console.error(`Error loading component ${componentPath}:`, error);
      return '';
    }
  }

  static async loadComponentIntoElement(componentPath, targetElement) {
    const html = await this.loadComponent(componentPath);
    if (html && targetElement) {
      // Replace the placeholder with the component HTML
      targetElement.outerHTML = html;
    }
  }

  static async loadAllComponents() {
    // Find all placeholders first before replacing any
    const navbarPlaceholder = document.getElementById('navbar-placeholder');
    const dashboardPlaceholder = document.getElementById('dashboard-section-placeholder');
    const roomsPlaceholder = document.getElementById('rooms-section-placeholder');
    const adminPlaceholder = document.getElementById('admin-section-placeholder');
    const bookingsPlaceholder = document.getElementById('bookings-section-placeholder');
    const modalsPlaceholder = document.getElementById('modals-placeholder');

    // Load all components in parallel for better performance
    const [navbarHtml, dashboardHtml, roomsHtml, adminHtml, bookingsHtml, modalsHtml] = await Promise.all([
      navbarPlaceholder ? this.loadComponent('components/navbar.html') : Promise.resolve(''),
      dashboardPlaceholder ? this.loadComponent('components/dashboard-section.html') : Promise.resolve(''),
      roomsPlaceholder ? this.loadComponent('components/rooms-section.html') : Promise.resolve(''),
      adminPlaceholder ? this.loadComponent('components/admin-section.html') : Promise.resolve(''),
      bookingsPlaceholder ? this.loadComponent('components/bookings-section.html') : Promise.resolve(''),
      modalsPlaceholder ? this.loadComponent('components/modals.html') : Promise.resolve('')
    ]);

    // Replace all placeholders with loaded components
    if (navbarPlaceholder && navbarHtml) {
      navbarPlaceholder.outerHTML = navbarHtml;
    }
    if (dashboardPlaceholder && dashboardHtml) {
      dashboardPlaceholder.outerHTML = dashboardHtml;
    }
    if (roomsPlaceholder && roomsHtml) {
      roomsPlaceholder.outerHTML = roomsHtml;
    }
    if (adminPlaceholder && adminHtml) {
      adminPlaceholder.outerHTML = adminHtml;
    }
    if (bookingsPlaceholder && bookingsHtml) {
      bookingsPlaceholder.outerHTML = bookingsHtml;
    }
    if (modalsPlaceholder && modalsHtml) {
      modalsPlaceholder.outerHTML = modalsHtml;
    }
  }
}

// Make ComponentLoader globally available
window.ComponentLoader = ComponentLoader;

