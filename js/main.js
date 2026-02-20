/**
 * Hospital Reservation - Main JavaScript
 */

document.addEventListener('DOMContentLoaded', () => {
    // ===== Mobile Menu =====
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const nav = document.getElementById('nav');
    let overlay = null;

    function createOverlay() {
        overlay = document.createElement('div');
        overlay.className = 'nav-overlay';
        document.body.appendChild(overlay);
        overlay.addEventListener('click', closeMenu);
    }

    function openMenu() {
        mobileMenuBtn.classList.add('active');
        nav.classList.add('active');
        if (!overlay) createOverlay();
        requestAnimationFrame(() => overlay.classList.add('active'));
        document.body.style.overflow = 'hidden';
    }

    function closeMenu() {
        mobileMenuBtn.classList.remove('active');
        nav.classList.remove('active');
        if (overlay) overlay.classList.remove('active');
        document.body.style.overflow = '';
    }

    mobileMenuBtn.addEventListener('click', () => {
        if (nav.classList.contains('active')) {
            closeMenu();
        } else {
            openMenu();
        }
    });

    // Close menu on nav link click
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', closeMenu);
    });

    // ===== Header Scroll Effect =====
    const header = document.getElementById('header');

    window.addEventListener('scroll', () => {
        if (window.pageYOffset > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    }, { passive: true });

    // ===== Scroll Down Button (Hero) =====
    const scrollDownBtn = document.getElementById('scrollDownBtn');
    if (scrollDownBtn) {
        scrollDownBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            const aboutSection = document.getElementById('about');
            if (aboutSection) {
                const headerHeight = header.offsetHeight;
                const targetPos = aboutSection.getBoundingClientRect().top + window.pageYOffset - headerHeight - 20;
                window.scrollTo({
                    top: targetPos,
                    behavior: 'smooth'
                });
            }
        });
    }

    // ===== Counter Animation =====
    function animateCounters() {
        const counters = document.querySelectorAll('.stat-number');

        counters.forEach(counter => {
            if (counter.dataset.animated) return;

            const target = parseInt(counter.dataset.target);
            const duration = 2000;
            const startTime = performance.now();

            function update(currentTime) {
                const elapsed = currentTime - startTime;
                const progress = Math.min(elapsed / duration, 1);
                const easeOut = 1 - Math.pow(1 - progress, 3);
                const current = Math.floor(easeOut * target);

                counter.textContent = current.toLocaleString();

                if (progress < 1) {
                    requestAnimationFrame(update);
                } else {
                    counter.textContent = target.toLocaleString();
                    counter.dataset.animated = 'true';
                }
            }

            requestAnimationFrame(update);
        });
    }

    // ===== Scroll Animations (AOS-like) =====
    const observerOptions = {
        root: null,
        rootMargin: '0px 0px -80px 0px',
        threshold: 0.15
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const delay = entry.target.dataset.aosDelay || 0;
                setTimeout(() => {
                    entry.target.classList.add('aos-animate');
                }, parseInt(delay));

                if (entry.target.closest('.stats-section') || entry.target.classList.contains('stats-grid')) {
                    animateCounters();
                }

                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    document.querySelectorAll('[data-aos]').forEach(el => observer.observe(el));

    // ===== Testimonials Slider (Fixed) =====
    const track = document.getElementById('testimonialsTrack');
    const wrapper = document.getElementById('testimonialsWrapper');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    let currentSlide = 0;

    function getVisibleCards() {
        const width = window.innerWidth;
        if (width <= 768) return 1;
        if (width <= 1024) return 2;
        return 3;
    }

    function getTotalCards() {
        if (!track) return 0;
        return track.querySelectorAll('.testimonial-card').length;
    }

    function getMaxSlide() {
        return Math.max(0, getTotalCards() - getVisibleCards());
    }

    function setCardWidths() {
        if (!wrapper || !track) return;
        const cards = track.querySelectorAll('.testimonial-card');
        if (!cards.length) return;

        const visible = getVisibleCards();
        const gap = parseFloat(getComputedStyle(track).gap) || 24;
        const wrapperW = wrapper.offsetWidth;
        const cardW = (wrapperW - gap * (visible - 1)) / visible;

        cards.forEach(card => {
            card.style.width = cardW + 'px';
            card.style.minWidth = cardW + 'px';
        });
    }

    function updateSlider() {
        if (!track) return;
        const cards = track.querySelectorAll('.testimonial-card');
        if (!cards.length) return;

        const cardWidth = cards[0].offsetWidth;
        const gap = parseFloat(getComputedStyle(track).gap) || 24;
        const offset = currentSlide * (cardWidth + gap);
        track.style.transform = `translateX(-${offset}px)`;

        // Update button states
        const maxSlide = getMaxSlide();
        if (prevBtn) {
            if (currentSlide === 0) {
                prevBtn.classList.add('disabled');
            } else {
                prevBtn.classList.remove('disabled');
            }
        }
        if (nextBtn) {
            if (currentSlide >= maxSlide) {
                nextBtn.classList.add('disabled');
            } else {
                nextBtn.classList.remove('disabled');
            }
        }
    }

    if (prevBtn && nextBtn && track) {
        prevBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (currentSlide > 0) {
                currentSlide--;
                updateSlider();
            }
        });

        nextBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const maxSlide = getMaxSlide();
            if (currentSlide < maxSlide) {
                currentSlide++;
                updateSlider();
            }
        });

        window.addEventListener('resize', () => {
            setCardWidths();
            currentSlide = Math.min(currentSlide, getMaxSlide());
            updateSlider();
        });

        // Touch / Swipe support
        let touchStartX = 0;

        track.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });

        track.addEventListener('touchend', (e) => {
            const touchEndX = e.changedTouches[0].screenX;
            const diff = touchStartX - touchEndX;

            if (Math.abs(diff) > 50) {
                if (diff > 0 && currentSlide < getMaxSlide()) {
                    currentSlide++;
                } else if (diff < 0 && currentSlide > 0) {
                    currentSlide--;
                }
                updateSlider();
            }
        }, { passive: true });

        // Initial setup
        setCardWidths();
        updateSlider();
    }

    // ===== Smooth Scroll for Anchor Links =====
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;

            e.preventDefault();
            const target = document.querySelector(targetId);
            if (target) {
                const headerHeight = header.offsetHeight;
                const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - headerHeight - 20;

                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // ===== Service Cards Stagger Animation =====
    const serviceCards = document.querySelectorAll('.service-card');
    const serviceObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                setTimeout(() => {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }, index * 100);
                serviceObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    serviceCards.forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        serviceObserver.observe(card);
    });
});
