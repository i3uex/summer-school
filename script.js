// Enhanced Summer School Website Interactivity
document.addEventListener('DOMContentLoaded', function() {
    
    // Smooth scrolling with navbar offset for navigation links
    const navLinks = document.querySelectorAll('.nav-link[href^="#"]');
    const navigationBar = document.querySelector('.navbar');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);
            
            if (targetElement) {
                // Wait a bit for any layout changes, then calculate position
                setTimeout(() => {
                    const navbarHeight = navigationBar.offsetHeight;
                    // Get the container margin-top (mt-5 = 3rem = 48px approx)
                    const container = targetElement.closest('.container');
                    const containerMarginTop = container ? parseInt(getComputedStyle(container).marginTop) : 0;
                    
                    const elementRect = targetElement.getBoundingClientRect();
                    const elementTop = elementRect.top + window.pageYOffset;
                    // Adjust for navbar height and container margin
                    const targetPosition = elementTop - navbarHeight - 30;
                    
                    window.scrollTo({
                        top: Math.max(0, targetPosition),
                        behavior: 'smooth'
                    });
                }, 10);
                
                // Close mobile menu if open
                const navbarToggler = document.querySelector('.navbar-toggler');
                const navbarCollapse = document.querySelector('.navbar-collapse');
                if (navbarCollapse && navbarCollapse.classList.contains('show') && navbarToggler) {
                    navbarToggler.click();
                }
            }
        });
    });

    // Handle "Register Now" button with same offset
    const registerButtons = document.querySelectorAll('a[href="#registration"]');
    registerButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetElement = document.getElementById('registration');
            if (targetElement) {
                setTimeout(() => {
                    const navbarHeight = navigationBar.offsetHeight;
                    const container = targetElement.closest('.container');
                    const containerMarginTop = container ? parseInt(getComputedStyle(container).marginTop) : 0;
                    
                    const elementRect = targetElement.getBoundingClientRect();
                    const elementTop = elementRect.top + window.pageYOffset;
                    const targetPosition = elementTop - navbarHeight - 30;
                    
                    window.scrollTo({
                        top: Math.max(0, targetPosition),
                        behavior: 'smooth'
                    });
                }, 10);
            }
        });
    });

    // Enhanced scroll-to-top functionality
    const scrollToTopBtn = document.querySelector('.scroll-to-top');
    if (scrollToTopBtn) {
        window.addEventListener('scroll', () => {
            if (window.pageYOffset > 300) {
                scrollToTopBtn.classList.add('show');
            } else {
                scrollToTopBtn.classList.remove('show');
            }
        });

        scrollToTopBtn.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

    // Lazy loading for images
    const images = document.querySelectorAll('img[data-src]');
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.remove('loading');
                img.classList.add('loaded');
                observer.unobserve(img);
            }
        });
    });

    images.forEach(img => {
        img.classList.add('loading');
        imageObserver.observe(img);
    });

    // Enhanced navbar background on scroll
    const navbar = document.querySelector('.navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // Animate elements on scroll
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
            }
        });
    }, observerOptions);

    // Observe elements for animation
    document.querySelectorAll('.card, .hero-badge, .key-topic, .speaker-item, .venue-info, .stat-card').forEach(el => {
        observer.observe(el);
    });

    // Enhanced form validation
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        form.addEventListener('submit', function(e) {
            const inputs = form.querySelectorAll('input[required], textarea[required], select[required]');
            let isValid = true;

            inputs.forEach(input => {
                if (!input.value.trim()) {
                    input.classList.add('is-invalid');
                    isValid = false;
                } else {
                    input.classList.remove('is-invalid');
                }
            });

            if (!isValid) {
                e.preventDefault();
                showNotification('Please fill in all required fields', 'error');
                return;
            }

            // Format mailto body for registration form
            if (form.action.startsWith('mailto:')) {
                e.preventDefault();
                const name = form.querySelector('[name="fullName"]').value.trim();
                const email = form.querySelector('[name="email"]').value.trim();
                const institution = form.querySelector('[name="institution"]').value.trim();
                const country = form.querySelector('[name="country"]').value.trim();
                const position = form.querySelector('[name="position"]').value.trim();
                const education = form.querySelector('[name="education"]').value;
                const motivation = form.querySelector('[name="motivation"]').value.trim();
                const scholarship = form.querySelector('[name="accommodationScholarship"]').value;
                let scholarshipText = scholarship === 'yes' ? 'Yes, I would like to apply' : 'No, I do not need accommodation support';
                
                const subject = encodeURIComponent('LLMA4SE 2025 Summer School Registration');
                const body = encodeURIComponent(
                    `Full Name: ${name}\n` +
                    `Email: ${email}\n` +
                    `Institution: ${institution}\n` +
                    `Country: ${country}\n` +
                    `Position/Role: ${position}\n` +
                    `Highest Level of Education: ${education}\n` +
                    `Motivation & Expectations: ${motivation}\n` +
                    `Accommodation Scholarship: ${scholarshipText}`
                );
                const mailto = `${form.action}?subject=${subject}&body=${body}`;
                window.location.href = mailto;
            }
        });
    });

    // Card hover effects enhancement
    document.querySelectorAll('.card').forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-8px) scale(1.02)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });



    // Notification system
    function showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-message">${message}</span>
                <button class="notification-close">&times;</button>
            </div>
        `;

        document.body.appendChild(notification);

        // Auto remove after 5 seconds
        setTimeout(() => {
            notification.classList.add('fade-out');
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 5000);

        // Manual close
        notification.querySelector('.notification-close').addEventListener('click', () => {
            notification.classList.add('fade-out');
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        });
    }

    // Enhanced search functionality (if search input exists)
    const searchInput = document.querySelector('#search');
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            const searchTerm = this.value.toLowerCase();
            const searchableElements = document.querySelectorAll('[data-searchable]');
            
            searchableElements.forEach(element => {
                const text = element.textContent.toLowerCase();
                if (text.includes(searchTerm)) {
                    element.style.display = '';
                    element.classList.add('search-highlight');
                } else {
                    element.style.display = 'none';
                    element.classList.remove('search-highlight');
                }
            });
        });
    }

    // Loading states for buttons
    document.querySelectorAll('button[type="submit"]').forEach(button => {
        button.addEventListener('click', function() {
            this.classList.add('loading');
            this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading...';
            
            // Simulate loading (remove in real implementation)
            setTimeout(() => {
                this.classList.remove('loading');
                this.innerHTML = 'Submit';
            }, 2000);
        });
    });

    // Enhanced mobile menu toggle
    const navbarToggler = document.querySelector('.navbar-toggler');
    const navbarCollapse = document.querySelector('.navbar-collapse');
    
    if (navbarToggler && navbarCollapse) {
        navbarToggler.addEventListener('click', function() {
            setTimeout(() => {
                if (navbarCollapse.classList.contains('show')) {
                    navbarCollapse.style.animation = 'slideInDown 0.3s ease';
                }
            }, 10);
        });
    }

    // Copy to clipboard functionality
    document.querySelectorAll('[data-copy]').forEach(element => {
        element.addEventListener('click', function() {
            const textToCopy = this.dataset.copy;
            navigator.clipboard.writeText(textToCopy).then(() => {
                showNotification('Copied to clipboard!', 'success');
            });
        });
    });

    // Initialize tooltips (if Bootstrap tooltips are used)
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });

    console.log('Summer School website enhanced with interactive features!');
});

// Additional utility functions
function formatDate(date) {
    return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    }).format(new Date(date));
}

function isElementInViewport(el) {
    const rect = el.getBoundingClientRect();
    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
}
