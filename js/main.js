document.documentElement.classList.add('js');

// Navigation: solid background after scrolling past the top
const nav = document.getElementById('nav');
const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 40);
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

// Mobile menu
const menuBtn = document.getElementById('menu-btn');
const menu = document.getElementById('mobile-menu');
const setMenu = (open) => {
    menu.hidden = !open;
    nav.classList.toggle('open', open);
    menuBtn.setAttribute('aria-expanded', String(open));
    menuBtn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
};
menuBtn.addEventListener('click', () => setMenu(menu.hidden));
menu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => setMenu(false)));

if ('IntersectionObserver' in window) {
    // Fade sections in as they enter the viewport
    const revealer = new IntersectionObserver((entries) => {
        entries.forEach(e => {
            if (e.isIntersecting) { e.target.classList.add('in'); revealer.unobserve(e.target); }
        });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    document.querySelectorAll('.reveal').forEach(el => revealer.observe(el));

    // Only load and play videos while they are on screen
    const player = new IntersectionObserver((entries) => {
        entries.forEach(e => {
            const v = e.target;
            if (e.isIntersecting) { v.preload = 'auto'; v.play().catch(() => {}); }
            else { v.pause(); }
        });
    }, { threshold: 0.25 });
    document.querySelectorAll('video[data-autoplay]').forEach(v => player.observe(v));
} else {
    document.querySelectorAll('.reveal').forEach(el => el.classList.add('in'));
    document.querySelectorAll('video[data-autoplay]').forEach(v => { v.autoplay = true; v.play().catch(() => {}); });
}

// Calendar: mark each event as completed, happening now or next up, based on today's date
const calRows = document.querySelectorAll('.cal-row[data-start][data-end]');
if (calRows.length) {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    let nextFound = false;
    calRows.forEach(row => {
        const start = new Date(row.dataset.start + 'T00:00:00');
        const end = new Date(row.dataset.end + 'T00:00:00');
        const status = row.querySelector('.cal-status');
        const item = row.closest('.cal-item');
        if (end < today) { row.classList.add('is-past'); if (item) item.classList.add('is-past'); status.textContent = 'Completed'; }
        else if (start <= today) { row.classList.add('is-now'); status.textContent = 'Happening now'; if (item) item.open = true; }
        else if (!nextFound) { row.classList.add('is-next'); status.textContent = 'Next up'; nextFound = true; if (item && !document.querySelector('.cal-item[open]')) item.open = true; }
        else { status.textContent = 'Upcoming'; }
    });
}

// Calendar: "Right now" map with a red pin
const mapEl = document.getElementById('now-map');
if (mapEl && window.L) {
    const pos = [parseFloat(mapEl.dataset.lat), parseFloat(mapEl.dataset.lng)];
    const map = L.map(mapEl, { scrollWheelZoom: false, zoomControl: true, attributionControl: true })
        .setView([pos[0] - 0.01, pos[1] - 0.02], parseInt(mapEl.dataset.zoom, 10) || 11);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 18,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);
    const pin = L.divIcon({ className: '', html: '<div class="map-pin"></div><div class="map-pulse"></div>', iconSize: [22, 32], iconAnchor: [11, 27] });
    L.marker(pos, { icon: pin, keyboard: false }).addTo(map);
}
