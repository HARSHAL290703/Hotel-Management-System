// Navigation Manager - Handles section navigation
class NavigationManager {
  constructor() {
    this.currentSection = 'dashboard';
    this.init();
  }

  init() {
    // Set initial active section
    this.showSection('dashboard');
  }

  navigate(sectionName) {
    this.showSection(sectionName);
    this.updateNavbar(sectionName);
  }

  showSection(sectionName) {
    // Hide all sections
    const sections = document.querySelectorAll('.section');
    sections.forEach(section => {
      section.classList.remove('active');
    });

    // Show target section
    const targetSection = document.getElementById(`section-${sectionName}`);
    if (targetSection) {
      targetSection.classList.add('active');
      this.currentSection = sectionName;
    } else {
      console.error(`Section ${sectionName} not found`);
    }
  }

  updateNavbar(sectionName) {
    // Update navbar active state
    const navLinks = document.querySelectorAll('.navbar-link');
    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('data-section') === sectionName) {
        link.classList.add('active');
      }
    });
  }

  toggleMobileMenu() {
    const menu = document.querySelector('.navbar-menu');
    if (menu) {
      menu.classList.toggle('active');
    }
  }
}

// Create and expose navigation manager
const navigationManager = new NavigationManager();
window.navigationManager = navigationManager;
