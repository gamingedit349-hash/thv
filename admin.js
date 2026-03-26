// admin.js - Admin Panel Logic with Firebase Firestore

// Authentication Check: Redirect to login if not authenticated
onAuthChange((user) => {
    if (!user) {
        window.location.href = 'login.html';
    }
});

async function handleLogout() {
    if (confirm('Are you sure you want to logout?')) {
        await logOut();
        window.location.href = 'login.html';
    }
}

const LOCATIONS = [
    "Andheri West, Mumbai","Andheri East, Mumbai","Bandra West, Mumbai","Bandra East, Mumbai",
    "Powai, Mumbai","Goregaon East, Mumbai","Goregaon West, Mumbai","Malad West, Mumbai",
    "Malad East, Mumbai","Borivali West, Mumbai","Borivali East, Mumbai","Thane West, Mumbai",
    "Thane East, Mumbai","Worli, Mumbai","Lower Parel, Mumbai","Dadar, Mumbai",
    "Juhu, Mumbai","Versova, Mumbai","Lokhandwala, Mumbai","Kandivali West, Mumbai",
    "Kandivali East, Mumbai","Chembur, Mumbai","Ghatkopar, Mumbai","Mulund, Mumbai",
    "Vikhroli, Mumbai","Kurla, Mumbai","Sion, Mumbai","Wadala, Mumbai",
    "Connaught Place, New Delhi","Dwarka, New Delhi","Rohini, New Delhi","Saket, New Delhi",
    "Greater Kailash, New Delhi","Vasant Kunj, New Delhi","Janakpuri, New Delhi",
    "Noida Sector 62","Noida Sector 128","Greater Noida West","Gurugram Sector 49",
    "Gurugram Sector 56","Gurugram Sector 82","Golf Course Road, Gurugram",
    "Whitefield, Bangalore","Koramangala, Bangalore","HSR Layout, Bangalore",
    "Electronic City, Bangalore","Indiranagar, Bangalore","JP Nagar, Bangalore",
    "Marathahalli, Bangalore","Sarjapur Road, Bangalore","Hebbal, Bangalore",
    "Hinjewadi, Pune","Kharadi, Pune","Wakad, Pune","Baner, Pune",
    "Viman Nagar, Pune","Hadapsar, Pune","Aundh, Pune","Kothrud, Pune",
    "Gachibowli, Hyderabad","HITEC City, Hyderabad","Madhapur, Hyderabad",
    "Kondapur, Hyderabad","Banjara Hills, Hyderabad","Jubilee Hills, Hyderabad",
    "OMR, Chennai","Adyar, Chennai","Velachery, Chennai","Anna Nagar, Chennai",
    "T Nagar, Chennai","Porur, Chennai","Sholinganallur, Chennai",
    "Salt Lake, Kolkata","New Town, Kolkata","Rajarhat, Kolkata","EM Bypass, Kolkata",
    "Ahmedabad SG Highway","Ahmedabad Prahlad Nagar","Ahmedabad Satellite",
    "Lucknow Gomti Nagar","Jaipur Vaishali Nagar","Jaipur Mansarovar",
    "Chandigarh Sector 17","Chandigarh Sector 35","Mohali","Panchkula",
    "Indore Vijay Nagar","Bhopal MP Nagar","Nagpur Dharampeth","Surat Vesu"
];

let editingPropertyId = null;

function showTab(event, tabId) {
    document.querySelectorAll('.sidebar-link').forEach(l => l.classList.remove('active'));
    if (event) event.currentTarget.classList.add('active');
    editingPropertyId = null;
    renderAdmin(tabId);
}

async function renderAdmin(tab) {
    const c = document.getElementById('mainContent');
    c.innerHTML = '<div class="loading-spinner">Loading...</div>';

    try {
        if (tab === 'dashboard') {
            const [properties, inquiries, team] = await Promise.all([getAllProperties(), getAllInquiries(), getAllTeam()]);
            const newInq = inquiries.filter(i => i.status === 'New').length;
            c.innerHTML = `
                <h2>Dashboard Overview</h2>
                <div class="dash-cards">
                    <div class="dash-card"><h3>${properties.length}</h3><p>Total Properties</p></div>
                    <div class="dash-card"><h3>${inquiries.length}</h3><p>Total Inquiries</p></div>
                    <div class="dash-card"><h3>${newInq}</h3><p>New Inquiries</p></div>
                    <div class="dash-card"><h3>${team.length}</h3><p>Active Brokers</p></div>
                </div>
                <h3 style="margin-bottom:1rem;">Recent Inquiries</h3>
                <table class="data-table">
                    <thead><tr><th>Date</th><th>Name</th><th>Property</th><th>Status</th></tr></thead>
                    <tbody>
                        ${inquiries.slice(0,5).map(i => `
                            <tr>
                                <td>${i.date||''} ${i.time||''}</td>
                                <td>${i.name}</td>
                                <td>${i.propertyTitle||i.propertyId}</td>
                                <td><span style="background:${i.status==='New'?'#e4002b':'#34a853'};color:#fff;padding:3px 10px;border-radius:20px;font-size:0.75rem;">${i.status}</span></td>
                            </tr>
                        `).join('')||'<tr><td colspan="4">No inquiries yet.</td></tr>'}
                    </tbody>
                </table>
            `;
        }
        else if (tab === 'properties') {
            const properties = await getAllProperties();
            c.innerHTML = `
                <h2>Manage Properties</h2>
                <button class="btn-primary" style="margin-bottom:1.5rem;" onclick="toggleAddForm()">+ Add New Property</button>
                <div id="addForm" style="display:none;"></div>
                <table class="data-table">
                    <thead><tr><th>Image</th><th>Title</th><th>Location</th><th>Price</th><th>Type</th><th>Status</th><th>Actions</th></tr></thead>
                    <tbody>
                        ${properties.map(p => `
                            <tr>
                                <td><img src="${p.image}" width="80" height="50" style="object-fit:cover;border-radius:4px;" onerror="this.src='https://via.placeholder.com/80x50'"></td>
                                <td><strong>${p.title}</strong><br><span style="font-size:0.75rem;color:#8993a4;">${p.bedrooms||''} ${p.area?'| '+p.area:''}</span></td>
                                <td>${p.location}</td>
                                <td><strong>${p.price}</strong></td>
                                <td>${p.type}</td>
                                <td>${p.status}</td>
                                <td>
                                    <button onclick="editProperty('${p.id}')" style="background:#e4eefc;color:#0078db;border:1px solid #0078db;padding:5px 12px;border-radius:4px;cursor:pointer;font-size:0.8rem;margin-right:4px;">Edit</button>
                                    <button onclick="deleteProperty('${p.id}')" style="background:#fff0f3;color:#e4002b;border:1px solid #e4002b;padding:5px 12px;border-radius:4px;cursor:pointer;font-size:0.8rem;">Delete</button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            `;
        }
        else if (tab === 'inquiries') {
            const inquiries = await getAllInquiries();
            c.innerHTML = `
                <h2>All Inquiries</h2>
                <table class="data-table">
                    <thead><tr><th>Date</th><th>Client</th><th>Contact</th><th>Property</th><th>Status</th><th>Action</th></tr></thead>
                    <tbody>
                        ${inquiries.length > 0 ? inquiries.map(i => `
                            <tr>
                                <td>${i.date||''}<br><span style="color:#8993a4;font-size:0.75rem;">${i.time||''}</span></td>
                                <td><strong>${i.name}</strong></td>
                                <td>${i.email}<br>${i.phone}</td>
                                <td>${i.propertyTitle||i.propertyId}</td>
                                <td><span style="background:${i.status==='New'?'#e4002b':'#34a853'};color:#fff;padding:3px 10px;border-radius:20px;font-size:0.75rem;">${i.status}</span></td>
                                <td><button onclick="markInquiry('${i.id}')" style="background:#e4eefc;color:#0078db;border:1px solid #0078db;padding:5px 10px;border-radius:4px;cursor:pointer;font-size:0.78rem;">Mark Done</button></td>
                            </tr>
                        `).join('') : '<tr><td colspan="6" style="text-align:center;padding:2rem;color:#8993a4;">No inquiries received yet.</td></tr>'}
                    </tbody>
                </table>
            `;
        }
        else if (tab === 'team') {
            const team = await getAllTeam();
            c.innerHTML = `
                <h2>Brokers Team</h2>
                <table class="data-table">
                    <thead><tr><th>Name</th><th>Role</th><th>Email</th><th>Phone</th><th>Properties</th></tr></thead>
                    <tbody>
                        ${team.map(t => `
                            <tr>
                                <td><strong>${t.name}</strong></td>
                                <td>${t.role}</td>
                                <td><a href="mailto:${t.email}" style="color:#0078db;">${t.email}</a></td>
                                <td>${t.phone||'-'}</td>
                                <td>${t.properties||0}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            `;
        }
    } catch (err) {
        console.error('Admin error:', err);
        c.innerHTML = '<p style="color:#e4002b;padding:2rem;">Error loading data. Check console.</p>';
    }
}

// ===== MagicBricks-style Property Form =====
function buildPropertyForm(prop) {
    const p = prop || {};
    const isEdit = !!p.id;
    return `
    <div class="mb-form">
        <div class="mb-form-header">
            <h3>${isEdit ? 'Edit Property' : 'Sell or Rent your Property'}</h3>
            <span class="mb-form-close" onclick="toggleAddForm()">&times;</span>
        </div>
        <div class="mb-form-section">
            <h4>Property Details</h4>
            <div class="mb-form-row">
                <label>For</label>
                <div class="mb-radio-group">
                    <label class="mb-radio ${(p.listingType||'Sale')==='Sale'?'active':''}"><input type="radio" name="pListingType" value="Sale" ${(p.listingType||'Sale')==='Sale'?'checked':''}> Sale</label>
                    <label class="mb-radio ${p.listingType==='Rent'?'active':''}"><input type="radio" name="pListingType" value="Rent" ${p.listingType==='Rent'?'checked':''}> Rent / Lease</label>
                    <label class="mb-radio ${p.listingType==='PG'?'active':''}"><input type="radio" name="pListingType" value="PG" ${p.listingType==='PG'?'checked':''}> PG / Hostel</label>
                </div>
            </div>
            <div class="mb-form-row">
                <label>Property Type</label>
                <select id="pType" class="mb-select">
                    <option value="Flat/Apartment" ${p.type==='Flat/Apartment'||p.type==='Flat'?'selected':''}>Flat / Apartment</option>
                    <option value="Villa" ${p.type==='Villa'?'selected':''}>Villa</option>
                    <option value="Plot" ${p.type==='Plot'?'selected':''}>Plot</option>
                    <option value="Builder Floor" ${p.type==='Builder Floor'?'selected':''}>Builder Floor</option>
                    <option value="Penthouse" ${p.type==='Penthouse'?'selected':''}>Penthouse</option>
                    <option value="Studio" ${p.type==='Studio'?'selected':''}>Studio Apartment</option>
                    <option value="Independent House" ${p.type==='Independent House'?'selected':''}>Independent House</option>
                    <option value="Commercial" ${p.type==='Commercial'?'selected':''}>Commercial</option>
                </select>
            </div>
        </div>
        <div class="mb-form-section">
            <h4>Property Location</h4>
            <div class="mb-form-row">
                <label>City</label>
                <input id="pCity" type="text" class="mb-input" placeholder="Enter City" value="${p.city||''}">
            </div>
            <div class="mb-form-row" style="position:relative;">
                <label>Locality / Area</label>
                <input id="pLoc" type="text" class="mb-input" placeholder="Start typing locality..." value="${p.location||''}" autocomplete="off">
                <div id="locSuggestions" class="loc-suggestions"></div>
            </div>
            <div class="mb-form-row">
                <label>Project / Society Name</label>
                <input id="pProject" type="text" class="mb-input" placeholder="Name of Project/Society" value="${p.project||''}">
            </div>
        </div>
        <div class="mb-form-section">
            <h4>Property Features</h4>
            <div class="mb-form-row">
                <label>Bedrooms</label>
                <div class="mb-chip-group">${['1','2','3','4','5+'].map(v => `<span class="mb-chip ${(p.bedrooms||'').startsWith(v)?'active':''}" onclick="selectChip(this,'pBedrooms','${v}')">${v}</span>`).join('')}</div>
                <input type="hidden" id="pBedrooms" value="${p.bedrooms||''}">
            </div>
            <div class="mb-form-row">
                <label>Balconies</label>
                <div class="mb-chip-group">${['0','1','2','3','3+'].map(v => `<span class="mb-chip ${(p.balconies||'')==v?'active':''}" onclick="selectChip(this,'pBalconies','${v}')">${v}</span>`).join('')}</div>
                <input type="hidden" id="pBalconies" value="${p.balconies||''}">
            </div>
            <div class="mb-form-row">
                <label>Floor No.</label>
                <div class="mb-chip-group">${['Ground','1','2','3','4','5','6','7','8','9','10+'].map(v => `<span class="mb-chip ${(p.floorNo||'')==v?'active':''}" onclick="selectChip(this,'pFloorNo','${v}')">${v}</span>`).join('')}</div>
                <input type="hidden" id="pFloorNo" value="${p.floorNo||''}">
            </div>
            <div class="mb-form-row">
                <label>Total Floors</label>
                <div class="mb-chip-group">${['1','2','3','4','5','6','7','8','9','10','11','12','13+'].map(v => `<span class="mb-chip ${(p.totalFloors||'')==v?'active':''}" onclick="selectChip(this,'pTotalFloors','${v}')">${v}</span>`).join('')}</div>
                <input type="hidden" id="pTotalFloors" value="${p.totalFloors||''}">
            </div>
            <div class="mb-form-row">
                <label>Furnished Status</label>
                <div class="mb-chip-group">${['Furnished','Unfurnished','Semi-Furnished'].map(v => `<span class="mb-chip ${(p.furnished||'')==v?'active':''}" onclick="selectChip(this,'pFurnished','${v}')">${v}</span>`).join('')}</div>
                <input type="hidden" id="pFurnished" value="${p.furnished||''}">
            </div>
            <div class="mb-form-row">
                <label>Bathrooms</label>
                <div class="mb-chip-group">${['1','2','3','3+'].map(v => `<span class="mb-chip ${(p.bathrooms||'')==v?'active':''}" onclick="selectChip(this,'pBathrooms','${v}')">${v}</span>`).join('')}</div>
                <input type="hidden" id="pBathrooms" value="${p.bathrooms||''}">
            </div>
        </div>
        <div class="mb-form-section">
            <h4>Area</h4>
            <div class="mb-form-grid">
                <div class="mb-form-row"><label>Super Area (sq.ft)</label><input id="pArea" type="text" class="mb-input" placeholder="e.g. 1200" value="${(p.area||'').replace(' sq.ft','')}"></div>
                <div class="mb-form-row"><label>Carpet Area (sq.ft)</label><input id="pCarpet" type="text" class="mb-input" placeholder="e.g. 900" value="${p.carpet||''}"></div>
            </div>
        </div>
        <div class="mb-form-section">
            <h4>Price Details</h4>
            <div class="mb-form-grid">
                <div class="mb-form-row"><label>Expected Price</label><input id="pPrice" type="text" class="mb-input" placeholder="e.g. 1.25 Cr" value="${p.price||''}"></div>
                <div class="mb-form-row"><label>Price per sq.ft</label><input id="pPriceSqft" type="text" class="mb-input" placeholder="e.g. 19,500/sq.ft" value="${p.pricePerSqft||''}"></div>
            </div>
            <div class="mb-form-row"><label>Maintenance (Monthly)</label><input id="pMaintenance" type="text" class="mb-input" placeholder="e.g. 5000" value="${p.maintenance||''}"></div>
        </div>
        <div class="mb-form-section">
            <h4>Property Title &amp; Image</h4>
            <div class="mb-form-row"><label>Listing Title</label><input id="pTitle" type="text" class="mb-input" placeholder="e.g. 2 BHK Flat in Andheri West" value="${p.title||''}"></div>
            <div class="mb-form-row">
                <label>Property Image</label>
                <div class="img-upload-area">
                    <div class="img-upload-box" id="imgUploadBox" onclick="document.getElementById('pImgFile').click()">
                        <div class="img-upload-icon">&#128247;</div>
                        <p>Click to upload from your computer</p>
                        <span>JPG, PNG, WEBP supported</span>
                    </div>
                    <input type="file" id="pImgFile" accept="image/*" style="display:none" onchange="handleImageUpload(this)">
                    <div class="img-or-divider"><span>OR</span></div>
                    <input id="pImg" type="text" class="mb-input" placeholder="Paste image URL here" value="${p.image||''}" oninput="updateImagePreview()">
                    <div class="img-preview-container" id="imgPreviewContainer" style="${p.image ? '' : 'display:none'}">
                        <img id="imgPreview" src="${p.image||''}" alt="Preview" onerror="this.parentElement.style.display='none'">
                        <button type="button" class="img-remove-btn" onclick="removeImage()">&#10005; Remove</button>
                    </div>
                </div>
            </div>
        </div>
        <div class="mb-form-actions">
            <button class="btn-primary" id="formSubmitBtn" onclick="${isEdit ? `updateProperty('${p.id}')` : 'submitProperty()'}" style="padding:12px 40px;font-size:1rem;">${isEdit ? 'Update Property' : 'Post Property'}</button>
            <button onclick="toggleAddForm()" style="padding:12px 30px;border:1px solid #e0e0e0;background:#fff;border-radius:4px;cursor:pointer;font-size:0.9rem;">Cancel</button>
        </div>
    </div>
    `;
}

function toggleAddForm() {
    const form = document.getElementById('addForm');
    if (!form) return;
    editingPropertyId = null;
    if (form.style.display === 'none' || form.innerHTML === '') {
        form.innerHTML = buildPropertyForm();
        form.style.display = 'block';
        initLocationAutocomplete();
    } else {
        form.style.display = 'none';
        form.innerHTML = '';
    }
}

function selectChip(el, hiddenId, value) {
    el.parentElement.querySelectorAll('.mb-chip').forEach(c => c.classList.remove('active'));
    el.classList.add('active');
    document.getElementById(hiddenId).value = value;
}

// ===== Location Autocomplete =====
function initLocationAutocomplete() {
    const input = document.getElementById('pLoc');
    const sugBox = document.getElementById('locSuggestions');
    if (!input || !sugBox) return;
    input.addEventListener('input', function() {
        const val = this.value.toLowerCase().trim();
        sugBox.innerHTML = '';
        if (val.length < 2) { sugBox.style.display = 'none'; return; }
        const matches = LOCATIONS.filter(l => l.toLowerCase().includes(val)).slice(0, 8);
        if (matches.length === 0) { sugBox.style.display = 'none'; return; }
        matches.forEach(m => {
            const div = document.createElement('div');
            div.className = 'loc-suggestion-item';
            div.textContent = m;
            div.onclick = function() {
                input.value = m;
                sugBox.style.display = 'none';
                const parts = m.split(', ');
                if (parts.length > 1) {
                    const cityInput = document.getElementById('pCity');
                    if (cityInput) cityInput.value = parts[parts.length - 1];
                }
            };
            sugBox.appendChild(div);
        });
        sugBox.style.display = 'block';
    });
    document.addEventListener('click', function(e) {
        if (e.target !== input && e.target !== sugBox) sugBox.style.display = 'none';
    });
}

// ===== Collect form data =====
function collectFormData() {
    const floorNo = document.getElementById('pFloorNo').value;
    const totalFloors = document.getElementById('pTotalFloors').value;
    const floorStr = floorNo ? (floorNo + (totalFloors ? ' of ' + totalFloors + ' Floors' : '')) : '';
    return {
        title: document.getElementById('pTitle').value,
        location: document.getElementById('pLoc').value,
        city: document.getElementById('pCity').value || '',
        project: document.getElementById('pProject').value || '',
        price: document.getElementById('pPrice').value || 'On Request',
        pricePerSqft: document.getElementById('pPriceSqft').value || '',
        type: document.getElementById('pType').value || 'Flat',
        bedrooms: (document.getElementById('pBedrooms').value || '') + ' BHK',
        balconies: document.getElementById('pBalconies').value || '',
        floorNo: floorNo || '',
        totalFloors: totalFloors || '',
        floor: floorStr,
        furnished: document.getElementById('pFurnished').value || '',
        bathrooms: document.getElementById('pBathrooms').value || '',
        area: (document.getElementById('pArea').value || '') + ' sq.ft',
        carpet: document.getElementById('pCarpet').value || '',
        maintenance: document.getElementById('pMaintenance').value || '',
        listingType: document.querySelector('input[name="pListingType"]:checked')?.value || 'Sale',
        image: document.getElementById('pImg').value || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=800&q=80',
        status: 'Available',
        badge: 'New'
    };
}

// ===== Submit New Property =====
async function submitProperty() {
    const data = collectFormData();
    if (!data.title) return alert('Please enter a listing title.');
    if (!data.location) return alert('Please enter a location.');
    const btn = document.getElementById('formSubmitBtn');
    btn.textContent = 'Saving...'; btn.disabled = true;
    try {
        await addProperty(data);
        renderAdmin('properties');
    } catch (err) {
        console.error(err); alert('Failed to save. Check console.');
    }
    btn.textContent = 'Post Property'; btn.disabled = false;
}

// ===== Edit Property =====
async function editProperty(id) {
    const prop = await getPropertyById(id);
    if (!prop) return;
    editingPropertyId = id;
    const form = document.getElementById('addForm');
    form.innerHTML = buildPropertyForm(prop);
    form.style.display = 'block';
    form.scrollIntoView({ behavior: 'smooth' });
    initLocationAutocomplete();
    document.querySelectorAll('.mb-radio').forEach(r => {
        const input = r.querySelector('input');
        if (input) {
            r.classList.toggle('active', input.checked);
            input.addEventListener('change', () => {
                r.parentElement.querySelectorAll('.mb-radio').forEach(x => x.classList.remove('active'));
                r.classList.add('active');
            });
        }
    });
}

async function updateProperty(id) {
    const data = collectFormData();
    const btn = document.getElementById('formSubmitBtn');
    btn.textContent = 'Updating...'; btn.disabled = true;
    try {
        await updatePropertyById(id, data);
        editingPropertyId = null;
        renderAdmin('properties');
    } catch (err) {
        console.error(err); alert('Failed to update. Check console.');
    }
    btn.textContent = 'Update Property'; btn.disabled = false;
}

// ===== Delete Property =====
async function deleteProperty(id) {
    if (!confirm('Delete this property?')) return;
    try {
        await deletePropertyById(id);
        renderAdmin('properties');
    } catch (err) {
        console.error(err); alert('Failed to delete.');
    }
}

// ===== Mark Inquiry =====
async function markInquiry(id) {
    try {
        await updateInquiryById(id, { status: 'Contacted' });
        renderAdmin('inquiries');
    } catch (err) {
        console.error(err);
    }
}

// ===== Image Upload Handlers =====
function handleImageUpload(input) {
    const file = input.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { alert('Please select an image file.'); return; }
    if (file.size > 5 * 1024 * 1024) { alert('Image must be under 5MB.'); return; }
    const reader = new FileReader();
    reader.onload = function(e) {
        const base64 = e.target.result;
        document.getElementById('pImg').value = base64;
        document.getElementById('imgPreview').src = base64;
        document.getElementById('imgPreviewContainer').style.display = 'flex';
        document.getElementById('imgUploadBox').innerHTML = '<div class="img-upload-icon">&#9989;</div><p>Image selected: ' + file.name + '</p><span>Click to change</span>';
    };
    reader.readAsDataURL(file);
}

function updateImagePreview() {
    const url = document.getElementById('pImg').value.trim();
    const preview = document.getElementById('imgPreview');
    const container = document.getElementById('imgPreviewContainer');
    if (url && !url.startsWith('data:')) { preview.src = url; container.style.display = 'flex'; }
    else if (!url) { container.style.display = 'none'; }
}

function removeImage() {
    document.getElementById('pImg').value = '';
    document.getElementById('imgPreviewContainer').style.display = 'none';
    document.getElementById('pImgFile').value = '';
    document.getElementById('imgUploadBox').innerHTML = '<div class="img-upload-icon">&#128247;</div><p>Click to upload from your computer</p><span>JPG, PNG, WEBP supported</span>';
}

document.addEventListener('DOMContentLoaded', async () => {
    // Initial render is handled by Auth state change or default if user exists
    // But we need to wait for auth to initialize
    onAuthChange((user) => {
        if (user) {
            seedData();
            renderAdmin('dashboard');
        }
    });
});
