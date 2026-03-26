// app.js - Public Site Logic (Firebase version)

function setTab(el) {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    el.classList.add('active');
}

let allProperties = [];

document.addEventListener('DOMContentLoaded', async () => {
    const propertyGrid = document.getElementById('propertyGrid');
    const spinner = document.getElementById('loadingSpinner');

    // Seed data on first load
    await seedData();

    // Load properties from Firestore
    try {
        allProperties = await getAllProperties();
        if (spinner) spinner.style.display = 'none';
        renderProperties(allProperties);
    } catch (err) {
        console.error('Error loading properties:', err);
        if (spinner) spinner.textContent = 'Failed to load properties. Please refresh.';
    }

    function renderProperties(properties) {
        if (!propertyGrid) return;
        propertyGrid.innerHTML = '';
        if (properties.length === 0) {
            propertyGrid.innerHTML = '<p style="padding:2rem;color:#8993a4;">No properties found matching your search.</p>';
            return;
        }
        properties.forEach(p => {
            const card = document.createElement('div');
            card.className = 'property-card';
            card.innerHTML = `
                <div class="property-img-wrap">
                    <img src="${p.image}" alt="${p.title}" class="property-img" onerror="this.src='https://via.placeholder.com/400x250?text=Property'">
                    <div class="property-badge">${p.badge || 'New'}</div>
                </div>
                <div class="property-info">
                    <div class="property-price">${p.price} <span>${p.pricePerSqft || ''}</span></div>
                    <div class="property-title">${p.title}</div>
                    <div class="property-location">${p.location}</div>
                    <div class="property-meta">
                        <span>${p.bedrooms || p.type}</span>
                        <span>${p.area || ''}</span>
                        <span>${p.floor || ''}</span>
                    </div>
                    <button class="btn-inquire" onclick="openInquiry('${p.id}','${encodeURIComponent(p.title)}','${encodeURIComponent(p.price)}','${encodeURIComponent(p.location)}')">Contact Owner</button>
                </div>
            `;
            propertyGrid.appendChild(card);
        });
    }

    // Search
    const searchBtn = document.getElementById('searchBtn');
    const searchInput = document.getElementById('searchInput');
    if (searchBtn) {
        searchBtn.addEventListener('click', () => {
            const term = searchInput.value.toLowerCase().trim();
            if (!term) { renderProperties(allProperties); return; }
            const filtered = allProperties.filter(p =>
                p.title.toLowerCase().includes(term) ||
                p.location.toLowerCase().includes(term) ||
                p.type.toLowerCase().includes(term) ||
                (p.bedrooms && p.bedrooms.toLowerCase().includes(term))
            );
            renderProperties(filtered);
        });
        searchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') searchBtn.click();
        });
    }

    // Inquiry Modal
    const modal = document.getElementById('inquiryModal');
    const closeBtn = document.getElementById('closeInquiry');

    window.openInquiry = function (propId, title, price, location) {
        if (!modal) return;
        document.getElementById('inquiryPropertyId').value = propId;
        document.getElementById('inquiryPropertyTitle').value = decodeURIComponent(title);
        document.getElementById('modalPropertyDetails').innerHTML =
            `<strong>${decodeURIComponent(title)}</strong> &bull; ${decodeURIComponent(price)} &bull; ${decodeURIComponent(location)}`;
        modal.classList.add('show');
    };

    if (closeBtn) closeBtn.onclick = () => modal.classList.remove('show');
    window.onclick = (e) => { if (e.target === modal) modal.classList.remove('show'); };

    // Form Submit
    const form = document.getElementById('inquiryForm');
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = form.querySelector('button[type="submit"]');
            btn.textContent = 'Sending...';
            btn.disabled = true;
            try {
                await addInquiry({
                    propertyId: document.getElementById('inquiryPropertyId').value,
                    propertyTitle: document.getElementById('inquiryPropertyTitle').value,
                    name: document.getElementById('inquiryName').value,
                    phone: document.getElementById('inquiryPhone').value,
                    email: document.getElementById('inquiryEmail').value,
                    status: 'New'
                });
                modal.classList.remove('show');
                form.reset();
                showToast('Inquiry sent! Our team will contact you shortly.');
            } catch (err) {
                console.error('Error sending inquiry:', err);
                alert('Failed to send inquiry. Please try again.');
            }
            btn.textContent = 'Get Contact Details';
            btn.disabled = false;
        });
    }
});

// Toast notification
function showToast(msg) {
    const t = document.createElement('div');
    t.textContent = msg;
    Object.assign(t.style, {
        position: 'fixed', bottom: '30px', left: '50%', transform: 'translateX(-50%)',
        background: '#34a853', color: '#fff', padding: '14px 28px', borderRadius: '8px',
        fontSize: '0.9rem', fontWeight: '600', zIndex: '9999', boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
        animation: 'fadeIn 0.3s'
    });
    document.body.appendChild(t);
    setTimeout(() => { t.style.opacity = '0'; t.style.transition = 'opacity 0.5s'; setTimeout(() => t.remove(), 500); }, 3000);
}
