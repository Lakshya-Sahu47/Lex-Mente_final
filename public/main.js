// main.js - Consolidated JavaScript for Lex Mente website

document.addEventListener('DOMContentLoaded', function() {
    // Initialize hamburger menu functionality
    initHamburgerMenu();
    
    // Update active navigation highlighting
    updateActiveNav();
    
    // Initialize any page-specific functionality
    initPageSpecificFeatures();
    
    // Initialize Instagram fallback (for index page)
    if (document.getElementById('instagram-feed')) {
        setTimeout(showFallbackContent, 1500);
    }
});

// Hamburger menu toggle
function initHamburgerMenu() {
    const hamburger = document.querySelector('.hamburger');
    const mobileNav = document.querySelector('.mobile-nav');
    
    if (hamburger && mobileNav) {
        hamburger.addEventListener('click', function() {
            const isExpanded = this.getAttribute('aria-expanded') === 'true';
            this.setAttribute('aria-expanded', !isExpanded);
            mobileNav.classList.toggle('active');
            
            // Change icon between hamburger and X
            const icon = this.querySelector('i');
            if (mobileNav.classList.contains('active')) {
                icon.classList.replace('fa-bars', 'fa-times');
            } else {
                icon.classList.replace('fa-times', 'fa-bars');
            }
        });

        // Close mobile menu when clicking a link
        document.querySelectorAll('.mobile-nav a').forEach(link => {
            link.addEventListener('click', function() {
                mobileNav.classList.remove('active');
                hamburger.setAttribute('aria-expanded', 'false');
                const icon = hamburger.querySelector('i');
                icon.classList.replace('fa-times', 'fa-bars');
            });
        });
    }
}

// Highlight current page in navigation
function updateActiveNav() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const navLinks = document.querySelectorAll('.desktop-nav a, .mobile-nav a');
    
    navLinks.forEach(link => {
        const linkPage = link.getAttribute('href');
        if (currentPage === linkPage) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
}

// Initialize page-specific features
function initPageSpecificFeatures() {
    // Journal page specific functionality
    if (document.querySelector('.volumes-table')) {
        // Add any journal page specific JS here
    }
    
    // Editorial board page specific functionality
    if (document.querySelector('.team-grid')) {
        // Add any editorial board page specific JS here
    }
    
    // Call for papers page specific functionality
    if (document.querySelector('.dates-container')) {
        // Add any call for papers page specific JS here
    }
}

// Instagram fallback content (for index page)
function showFallbackContent() {
    const loader = document.querySelector('.loader');
    const instaContent = document.getElementById('insta-post-content');
    
    if (loader && instaContent) {
        loader.style.display = 'none';
        instaContent.innerHTML = `
            <p>Supreme Court Clarifies: Right to Protest Cannot Infringe on Others' Fundamental Rights</p>
            <p><small>Follow us on Instagram for the latest legal updates</small></p>
        `;
    }
}

// For production, you would implement a proper Instagram API integration
// This would require server-side code due to CORS and authentication requirements
async function fetchInstagramPosts() {
    try {
        // This would be replaced with actual API call to your backend
        // which would then call the Instagram API with proper authentication
        const response = await fetch('/api/instagram-posts');
        if (!response.ok) throw new Error('Failed to fetch posts');
        
        const data = await response.json();
        displayInstagramPosts(data);
    } catch (error) {
        console.error('Error fetching Instagram posts:', error);
        showFallbackContent();
    }
}

function displayInstagramPosts(posts) {
    // Implementation to display posts would go here
}

// Debounced resize handler
let resizeTimeout;
window.addEventListener('resize', function() {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(updateActiveNav, 100);
});