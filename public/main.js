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

    // Initialize sample PDF data if on admin page
    if (document.getElementById('admin-upload')) {
        initializeSampleData();
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
    
    fetch('/api/journals')
        .then(response => response.json())
        .then(entries => {
            if (!entries.length) {
                container.innerHTML = '<p class="empty-message">No journal entries available yet.</p>';
                return;
            }

            container.innerHTML = entries.map(entry => `
                <div class="journal-entry">
                    <h3>${entry.title}</h3>
                    <div class="entry-meta">
                        <span><i class="fas fa-user"></i> ${entry.author || 'Anonymous'}</span>
                        <span><i class="fas fa-calendar-alt"></i> ${entry.publishDate ? new Date(entry.publishDate).toLocaleDateString() : 'Date not available'}</span>
                        <span><i class="fas fa-book"></i> ${entry.volume || 'Vol. N/A'}, ${entry.issue || 'Issue N/A'}</span>
                        <span><i class="fas fa-tag"></i> ${entry.category || 'Uncategorized'}</span>
                    </div>
                    <div class="article-actions">
                        <a href="/api/journal-entries/${entry.id}/pdf" class="article-btn" download>
                            <i class="far fa-file-pdf" aria-hidden="true"></i> Download PDF
                        </a>
                        <a href="#" class="article-btn" onclick="alert('Citation format: ${entry.author || 'Anonymous'}, \"${entry.title}\", ${entry.volume || 'Vol. N/A'} Lex Mente ${entry.issue || 'Issue N/A'} (${entry.publishDate ? new Date(entry.publishDate).getFullYear() : 'n.d.'})')">
                            <i class="fas fa-quote-right" aria-hidden="true"></i> Cite
                        </a>
                    </div>
                </div>
            `).join('');
        })
        .catch(error => {
            console.error('Error loading journal entries:', error);
            container.innerHTML = '<p class="error-message">Error loading journal entries. Please try again later.</p>';
        });
}

// Initialize sample PDF data (for admin use)
async function initializeSampleData() {
    try {
        const response = await fetch('/api/initialize-sample', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        const result = await response.json();
        if (response.ok) {
            alert('Sample data initialized successfully!');
        } else {
            alert(`Error: ${result.message}`);
        }
    } catch (error) {
        console.error('Error initializing sample data:', error);
        alert('Failed to initialize sample data');
    }
}

// Debounced resize handler
let resizeTimeout;
window.addEventListener('resize', function() {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(updateActiveNav, 100);
});