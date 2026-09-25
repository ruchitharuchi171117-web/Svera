/* ==========================================================
   SVÉRA — INTERACTIONS
   ========================================================== */

/* ==================== PRELOADER ==================== */
window.addEventListener('load', () => {
    const preloader = document.getElementById('preloader');
    if (!preloader) return;

    setTimeout(() => {
        preloader.classList.add('hidden');

        document.querySelectorAll('.hero .reveal').forEach(el => {
            el.classList.add('visible');
        });
    }, 1500);
});

/* ==================== SCROLL PROGRESS BAR ==================== */
const scrollProgress = document.getElementById('scrollProgress');

function updateScrollProgress() {
    if (!scrollProgress) return;
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrollPercent = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    scrollProgress.style.width = scrollPercent + '%';
}

window.addEventListener('scroll', updateScrollProgress, { passive: true });

/* ==================== CUSTOM CURSOR (smooth lerp) ==================== */
const cursorDot = document.getElementById('cursorDot');
const cursorRing = document.getElementById('cursorRing');

if (window.innerWidth > 768 && cursorDot && cursorRing) {
    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let ringX = mouseX;
    let ringY = mouseY;
    let rafId = null;

    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        cursorDot.style.left = mouseX + 'px';
        cursorDot.style.top = mouseY + 'px';

        if (!rafId) rafId = requestAnimationFrame(animateCursor);
    });

    function animateCursor() {
        ringX += (mouseX - ringX) * 0.16;
        ringY += (mouseY - ringY) * 0.16;

        cursorRing.style.left = ringX + 'px';
        cursorRing.style.top = ringY + 'px';

        if (Math.abs(mouseX - ringX) > 0.1 || Math.abs(mouseY - ringY) > 0.1) {
            rafId = requestAnimationFrame(animateCursor);
        } else {
            rafId = null;
        }
    }

    const hoverSelectors = 'a, button, .service-card, .work-card, input, textarea, select, .social-link, .value-item, .contact-item';
    document.querySelectorAll(hoverSelectors).forEach(el => {
        el.addEventListener('mouseenter', () => cursorRing.classList.add('hovering'));
        el.addEventListener('mouseleave', () => cursorRing.classList.remove('hovering'));
    });
}

/* ==================== NAVIGATION ==================== */
const navbar = document.getElementById('navbar');
const menuToggle = document.getElementById('menuToggle');
const navMenu = document.getElementById('navMenu');
const backToTop = document.getElementById('backToTop');
const scrollIndicator = document.querySelector('.scroll-indicator');

function handleScrollUI() {
    if (navbar) {
        navbar.classList.toggle('scrolled', window.scrollY > 100);
    }
    if (scrollIndicator) {
        scrollIndicator.style.opacity = window.scrollY > 50 ? '0' : '1';
    }
    if (backToTop) {
        backToTop.classList.toggle('visible', window.scrollY > 400);
    }
}

window.addEventListener('scroll', handleScrollUI, { passive: true });

if (menuToggle && navMenu) {
    menuToggle.addEventListener('click', () => {
        menuToggle.classList.toggle('active');
        navMenu.classList.toggle('active');
        const expanded = menuToggle.classList.contains('active');
        menuToggle.setAttribute('aria-expanded', expanded);
    });

    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            menuToggle.classList.remove('active');
            navMenu.classList.remove('active');
            menuToggle.setAttribute('aria-expanded', 'false');
        });
    });
}

/* Active link highlighting */
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-link');

function updateActiveLink() {
    let current = '';
    const scrollPos = window.scrollY + 140;

    sections.forEach(section => {
        if (scrollPos >= section.offsetTop && scrollPos < section.offsetTop + section.clientHeight) {
            current = section.getAttribute('id');
        }
    });

    navLinks.forEach(link => {
        link.classList.toggle('active', link.getAttribute('href') === '#' + current);
    });
}

window.addEventListener('scroll', updateActiveLink, { passive: true });

/* ==================== SMOOTH SCROLL ==================== */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        if (!href || href === '#') return;

        const target = document.querySelector(href);
        if (!target) return;

        e.preventDefault();
        const targetPosition = target.offsetTop - 80;
        window.scrollTo({ top: targetPosition, behavior: 'smooth' });
    });
});

if (backToTop) {
    backToTop.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

/* ==================== REVEAL ANIMATIONS ==================== */
const allRevealElements = document.querySelectorAll('.reveal');

allRevealElements.forEach(el => {
    el.addEventListener('animationend', (e) => {
        if (e.animationName === 'revealUp') {
            el.classList.remove('reveal', 'visible');
            el.style.removeProperty('--d');
        }
    });
});

const observableReveals = Array.from(allRevealElements).filter(el => !el.closest('.hero'));

if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });

    observableReveals.forEach(el => revealObserver.observe(el));
} else {
    observableReveals.forEach(el => el.classList.add('visible'));
}

/* ==================== TILT EFFECT (cards) ==================== */
const isDesktop = window.innerWidth > 768;

if (isDesktop) {
    document.querySelectorAll('[data-tilt]').forEach(card => {
        let rafPending = false;
        let targetRotateX = 0;
        let targetRotateY = 0;
        let targetLift = 0;

        function applyTransform() {
            rafPending = false;
            card.style.transform =
                `perspective(1000px) rotateX(${targetRotateX}deg) rotateY(${targetRotateY}deg) translateY(${targetLift}px)`;
        }

        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            targetRotateX = (y - centerY) / 22;
            targetRotateY = (centerX - x) / 22;
            targetLift = -5;

            if (!rafPending) {
                rafPending = true;
                requestAnimationFrame(applyTransform);
            }
        });

        card.addEventListener('mouseleave', () => {
            targetRotateX = 0;
            targetRotateY = 0;
            targetLift = 0;
            card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateY(0)';
        });
    });
}

/* ==================== DYNAMIC ISLAND NOTIFICATION ==================== */
const dynamicIsland = document.getElementById('dynamicIsland');
const diTitle = document.getElementById('diTitle');
const diSub = document.getElementById('diSub');
let diTimer = null;

function showDynamicIsland(title, subtitle, duration = 4400) {
    if (!dynamicIsland) return;

    if (diTitle) diTitle.textContent = title;
    if (diSub) diSub.textContent = subtitle;

    dynamicIsland.classList.remove('active');
    void dynamicIsland.offsetWidth; /* restart SVG animation */
    dynamicIsland.classList.add('active');

    clearTimeout(diTimer);
    diTimer = setTimeout(() => {
        dynamicIsland.classList.remove('active');
    }, duration);
}

function hideDynamicIsland() {
    if (!dynamicIsland) return;
    clearTimeout(diTimer);
    dynamicIsland.classList.remove('active');
}

if (dynamicIsland) {
    dynamicIsland.addEventListener('click', hideDynamicIsland);
}

/* ==================== CONTACT FORM ==================== */
const contactForm = document.getElementById('contactForm');

if (contactForm) {
    contactForm.addEventListener('submit', function (e) {
        e.preventDefault();

        const formData = new FormData(this);
        const name = formData.get('name');
        const email = formData.get('email');
        const message = formData.get('message');

        if (!name || !email || !message) {
            alert('Please fill in all required fields.');
            return;
        }

        const submitBtn = this.querySelector('.submit-btn');
        if (!submitBtn) return;

        const originalContent = submitBtn.innerHTML;

        submitBtn.innerHTML = '<i class="fi fi-rr-spinner"></i><span>Sending...</span>';
        submitBtn.disabled = true;
        submitBtn.style.pointerEvents = 'none';

        setTimeout(() => {
            submitBtn.innerHTML = '<i class="fi fi-rr-check"></i><span>Message Sent!</span>';
            submitBtn.classList.add('success');

            showDynamicIsland(
                'Message Sent',
                "We'll get back to you within 24 hours"
            );

            setTimeout(() => {
                submitBtn.innerHTML = originalContent;
                submitBtn.disabled = false;
                submitBtn.style.pointerEvents = '';
                submitBtn.classList.remove('success');
                contactForm.reset();
            }, 2600);
        }, 1400);
    });
}

/* ==================== KEYBOARD NAVIGATION ==================== */
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        if (menuToggle && navMenu) {
            menuToggle.classList.remove('active');
            navMenu.classList.remove('active');
            menuToggle.setAttribute('aria-expanded', 'false');
        }
        hideDynamicIsland();
    }
});

/* ==================== IMAGE FALLBACK ==================== */
document.querySelectorAll('img').forEach(img => {
    img.addEventListener('error', function () {
        this.style.display = 'none';
    });
});

/* ==================== INTERACTIVE HERO GRID (dimmed for readability) ==================== */
(function initHeroGrid() {
    const canvas = document.getElementById('heroCanvas');
    if (!canvas) return;

    const hero = document.querySelector('.hero');
    if (!hero) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    const off = document.createElement('canvas');
    const octx = off.getContext('2d');

    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    let W = 0;
    let H = 0;
    let GRID = window.innerWidth < 640 ? 44 : 64;

    let targetX = 0.5;
    let targetY = 0.45;
    let curX = 0.5;
    let curY = 0.45;

    let idle = true;
    let idleT = 0;
    let rafId = null;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function resize() {
        const rect = hero.getBoundingClientRect();
        W = Math.max(1, Math.floor(rect.width));
        H = Math.max(1, Math.floor(rect.height));

        dpr = Math.min(window.devicePixelRatio || 1, 2);

        canvas.width = Math.floor(W * dpr);
        canvas.height = Math.floor(H * dpr);
        canvas.style.width = W + 'px';
        canvas.style.height = H + 'px';
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

        off.width = Math.floor(W * dpr);
        off.height = Math.floor(H * dpr);
        octx.setTransform(dpr, 0, 0, dpr, 0, 0);

        GRID = window.innerWidth < 640 ? 44 : 64;
    }

    function drawBaseGrid() {
        /* Very faint grid lines so text stays readable */
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.018)';
        ctx.lineWidth = 1;

        const cols = Math.ceil(W / GRID);
        const rows = Math.ceil(H / GRID);

        ctx.beginPath();
        for (let i = 0; i <= cols; i++) {
            const x = Math.round(i * GRID) + 0.5;
            ctx.moveTo(x, 0);
            ctx.lineTo(x, H);
        }
        for (let j = 0; j <= rows; j++) {
            const y = Math.round(j * GRID) + 0.5;
            ctx.moveTo(0, y);
            ctx.lineTo(W, y);
        }
        ctx.stroke();
    }

    function drawHighlight() {
        const mx = curX * W;
        const my = curY * H;
        const radius = Math.max(W, H) * 0.4;

        octx.clearRect(0, 0, W, H);
        /* Softer highlight stroke */
        octx.strokeStyle = 'rgba(233, 69, 96, 0.42)';
        octx.lineWidth = 1;

        const cols = Math.ceil(W / GRID);
        const rows = Math.ceil(H / GRID);

        octx.beginPath();
        for (let i = 0; i <= cols; i++) {
            const x = Math.round(i * GRID) + 0.5;
            octx.moveTo(x, 0);
            octx.lineTo(x, H);
        }
        for (let j = 0; j <= rows; j++) {
            const y = Math.round(j * GRID) + 0.5;
            octx.moveTo(0, y);
            octx.lineTo(W, y);
        }
        octx.stroke();

        /* Softer radial mask */
        octx.globalCompositeOperation = 'destination-in';
        const grad = octx.createRadialGradient(mx, my, 0, mx, my, radius);
        grad.addColorStop(0, 'rgba(0, 0, 0, 0.55)');
        grad.addColorStop(0.35, 'rgba(0, 0, 0, 0.28)');
        grad.addColorStop(0.7, 'rgba(0, 0, 0, 0.08)');
        grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        octx.fillStyle = grad;
        octx.fillRect(0, 0, W, H);
        octx.globalCompositeOperation = 'source-over';

        /* Composite onto main canvas */
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        ctx.drawImage(off, 0, 0, W, H);
        ctx.restore();

        /* Soft red glow near the cursor — very subtle */
        const glow = ctx.createRadialGradient(mx, my, 0, mx, my, radius * 0.5);
        glow.addColorStop(0, 'rgba(233, 69, 96, 0.07)');
        glow.addColorStop(0.4, 'rgba(233, 69, 96, 0.03)');
        glow.addColorStop(1, 'rgba(233, 69, 96, 0)');
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(mx, my, radius * 0.5, 0, Math.PI * 2);
        ctx.fill();

        /* Faint node pulses at nearest intersections */
        const nearestX = Math.round(mx / GRID) * GRID;
        const nearestY = Math.round(my / GRID) * GRID;
        for (let dx = -1; dx <= 1; dx++) {
            for (let dy = -1; dy <= 1; dy++) {
                const nx = nearestX + dx * GRID;
                const ny = nearestY + dy * GRID;
                if (nx < -GRID || nx > W + GRID || ny < -GRID || ny > H + GRID) continue;

                const d = Math.hypot(nx - mx, ny - my);
                const fade = Math.max(0, 1 - d / (GRID * 2.2));
                if (fade <= 0.02) continue;

                ctx.beginPath();
                ctx.arc(nx, ny, 1.4 + fade * 1.2, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(255, 255, 255, ${fade * 0.22})`;
                ctx.fill();
            }
        }
    }

    function loop() {
        if (idle) {
            idleT += 0.0035;
            targetX = 0.5 + Math.cos(idleT) * 0.2;
            targetY = 0.45 + Math.sin(idleT * 1.25) * 0.16;
        }

        curX += (targetX - curX) * 0.075;
        curY += (targetY - curY) * 0.075;

        ctx.clearRect(0, 0, W, H);
        drawBaseGrid();
        drawHighlight();

        rafId = requestAnimationFrame(loop);
    }

    hero.addEventListener('mousemove', (e) => {
        const rect = hero.getBoundingClientRect();
        targetX = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
        targetY = Math.min(1, Math.max(0, (e.clientY - rect.top) / rect.height));
        idle = false;
    });

    hero.addEventListener('mouseleave', () => {
        idle = true;
        idleT = 0;
    });

    hero.addEventListener('touchmove', (e) => {
        if (!e.touches || !e.touches[0]) return;
        const rect = hero.getBoundingClientRect();
        const t = e.touches[0];
        targetX = Math.min(1, Math.max(0, (t.clientX - rect.left) / rect.width));
        targetY = Math.min(1, Math.max(0, (t.clientY - rect.top) / rect.height));
        idle = false;
    }, { passive: true });

    hero.addEventListener('touchend', () => {
        idle = true;
        idleT = 0;
    });

    let resizeTimer = null;
    function onResize() {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            resize();
        }, 120);
    }

    window.addEventListener('resize', onResize, { passive: true });
    window.addEventListener('orientationchange', onResize, { passive: true });

    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            if (rafId) {
                cancelAnimationFrame(rafId);
                rafId = null;
            }
        } else {
            if (!rafId && !reducedMotion) {
                rafId = requestAnimationFrame(loop);
            }
        }
    });

    resize();
    if (!reducedMotion) {
        rafId = requestAnimationFrame(loop);
    } else {
        ctx.clearRect(0, 0, W, H);
        drawBaseGrid();
        curX = 0.5;
        curY = 0.45;
        drawHighlight();
    }
})();

/* ==================== INITIAL STATE ==================== */
updateScrollProgress();
handleScrollUI();
updateActiveLink();
