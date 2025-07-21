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
    
    // Load journal entries if on journal page
    if (document.getElementById('journal-list')) {
        loadJournalEntries();
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
            icon.classList.toggle('fa-bars');
            icon.classList.toggle('fa-times');
        });

        // Close mobile menu when clicking a link
        document.querySelectorAll('.mobile-nav a').forEach(link => {
            link.addEventListener('click', function() {
                mobileNav.classList.remove('active');
                hamburger.setAttribute('aria-expanded', 'false');
                const icon = hamburger.querySelector('i');
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            });
        });
    }
}

// Highlight current page in navigation
function updateActiveNav() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const navLinks = document.querySelectorAll('.desktop-nav a, .mobile-nav a, nav a');
    
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

// Load journal entries
function loadJournalEntries() {
    // Show loading state
    const container = document.getElementById('journal-list');
    container.innerHTML = '<p class="loading-message"><span class="loader"></span> Loading journal entries...</p>';
    
    // Simulate API call (replace with actual fetch in production)
    setTimeout(() => {
        // This would be replaced with actual API call in production
        // fetch('/api/journal-entries').then().catch()
        const mockEntries = [
            {
                id: 1,
                title: "The Constitutionality of Preventive Detention Laws",
                author: "Rohan Mehta",
                category: "Constitutional Law",
                volume: "Vol. 1",
                issue: "Issue 1",
                publishDate: "2025-06-20",
                abstract: "A critical assessment of how preventive detention statutes align with constitutional safeguards of liberty and due process in India."
            },
            {
                id: 2,
                title: "Digital Privacy Rights in the Age of Surveillance",
                author: "Priya Sharma",
                category: "Technology Law",
                volume: "Vol. 1",
                issue: "Issue 1",
                publishDate: "2025-06-15",
                abstract: "Examining the balance between national security and individual privacy rights in digital surveillance programs."
            }
        ];

        if (!mockEntries.length) {
            container.innerHTML = '<p class="empty-message">No journal entries available yet.</p>';
            return;
        }

        container.innerHTML = mockEntries.map(entry => `
            <div class="journal-entry">
                <h3>${entry.title}</h3>
                <div class="entry-meta">
                    <span><i class="fas fa-user"></i> ${entry.author}</span>
                    <span><i class="fas fa-calendar-alt"></i> ${new Date(entry.publishDate).toLocaleDateString()}</span>
                    <span><i class="fas fa-book"></i> ${entry.volume}, ${entry.issue}</span>
                    <span><i class="fas fa-tag"></i> ${entry.category}</span>
                </div>
                <p>${entry.abstract}</p>
                <div class="article-actions">
                    <a href="#" class="article-btn">
                        <i class="far fa-file-pdf" aria-hidden="true"></i> Download PDF
                    </a>
                    <a href="#" class="article-btn" onclick="alert('Citation format: ${entry.author}, \"${entry.title}\", ${entry.volume} Lex Mente ${entry.issue} (${new Date(entry.publishDate).getFullYear()})')">
                        <i class="fas fa-quote-right" aria-hidden="true"></i> Cite
                    </a>
                </div>
            </div>
        `).join('');
    }, 1000);
}

// Debounced resize handler
let resizeTimeout;
window.addEventListener('resize', function() {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(updateActiveNav, 100);
});