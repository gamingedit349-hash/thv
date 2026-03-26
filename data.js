// data.js - Firebase Firestore Database for THE VOGUE REALITY

// Firebase SDK (using CDN modules via compat mode)
// Firebase config - Replace with your own Firebase project config
const firebaseConfig = {
    apiKey: "AIzaSyDemoKeyReplace",
    authDomain: "the-vogue-reality.firebaseapp.com",
    projectId: "the-vogue-reality",
    storageBucket: "the-vogue-reality.appspot.com",
    messagingSenderId: "000000000000",
    appId: "1:000000000000:web:0000000000000000"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// Collections
const propertiesRef = db.collection('properties');
const inquiriesRef = db.collection('inquiries');
const teamRef = db.collection('team');

// ===== PROPERTIES =====
async function getAllProperties() {
    const snapshot = await propertiesRef.orderBy('createdAt', 'desc').get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

async function getPropertyById(id) {
    const doc = await propertiesRef.doc(id).get();
    return doc.exists ? { id: doc.id, ...doc.data() } : null;
}

async function addProperty(property) {
    property.createdAt = firebase.firestore.FieldValue.serverTimestamp();
    const docRef = await propertiesRef.add(property);
    return docRef.id;
}

async function updatePropertyById(id, data) {
    await propertiesRef.doc(id).update(data);
}

async function deletePropertyById(id) {
    await propertiesRef.doc(id).delete();
}

// ===== INQUIRIES =====
async function getAllInquiries() {
    const snapshot = await inquiriesRef.orderBy('createdAt', 'desc').get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

async function addInquiry(inquiry) {
    inquiry.createdAt = firebase.firestore.FieldValue.serverTimestamp();
    inquiry.date = new Date().toLocaleDateString('en-IN');
    inquiry.time = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    const docRef = await inquiriesRef.add(inquiry);
    return docRef.id;
}

async function updateInquiryById(id, data) {
    await inquiriesRef.doc(id).update(data);
}

// ===== TEAM =====
async function getAllTeam() {
    const snapshot = await teamRef.get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

// ===== SEED DEFAULT DATA (run once) =====
async function seedData() {
    const snap = await propertiesRef.limit(1).get();
    if (!snap.empty) return; // Already seeded

    const properties = [
        {
            title: "2 BHK Flat in Andheri West", location: "Andheri West, Mumbai",
            price: "1.25 Cr", pricePerSqft: "19,500/sq.ft", area: "640 sq.ft",
            bedrooms: "2 BHK", type: "Flat", status: "Available", badge: "Verified",
            floor: "5th of 12 Floors",
            image: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80",
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        },
        {
            title: "3 BHK Apartment in Powai", location: "Hiranandani Gardens, Powai",
            price: "2.80 Cr", pricePerSqft: "22,400/sq.ft", area: "1250 sq.ft",
            bedrooms: "3 BHK", type: "Apartment", status: "Available", badge: "Premium",
            floor: "8th of 20 Floors",
            image: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80",
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        },
        {
            title: "4 BHK Villa in Bandra", location: "Bandra West, Mumbai",
            price: "7.50 Cr", pricePerSqft: "35,000/sq.ft", area: "2140 sq.ft",
            bedrooms: "4 BHK", type: "Villa", status: "Available", badge: "Hot Deal",
            floor: "Independent",
            image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80",
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        },
        {
            title: "1 BHK in Thane West", location: "Ghodbunder Road, Thane",
            price: "55 Lac", pricePerSqft: "11,000/sq.ft", area: "500 sq.ft",
            bedrooms: "1 BHK", type: "Flat", status: "Available", badge: "New",
            floor: "3rd of 15 Floors",
            image: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80",
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        },
        {
            title: "3 BHK in Goregaon East", location: "Oberoi Splendor, Goregaon",
            price: "1.95 Cr", pricePerSqft: "18,000/sq.ft", area: "1080 sq.ft",
            bedrooms: "3 BHK", type: "Apartment", status: "Available", badge: "Verified",
            floor: "11th of 22 Floors",
            image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80",
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        },
        {
            title: "2 BHK in Malad West", location: "Evershine Nagar, Malad",
            price: "85 Lac", pricePerSqft: "14,200/sq.ft", area: "600 sq.ft",
            bedrooms: "2 BHK", type: "Flat", status: "Available", badge: "Featured",
            floor: "7th of 14 Floors",
            image: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80",
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        }
    ];

    const team = [
        { name: "Rajesh Sharma", role: "Senior Broker", email: "rajesh@voguereality.com", phone: "+91 98765 43210", properties: 12 },
        { name: "Priya Patel", role: "Luxury Specialist", email: "priya@voguereality.com", phone: "+91 98765 43211", properties: 8 },
        { name: "Amit Singh", role: "Commercial Expert", email: "amit@voguereality.com", phone: "+91 98765 43212", properties: 15 }
    ];

    const batch = db.batch();
    properties.forEach(p => batch.set(propertiesRef.doc(), p));
    team.forEach(t => batch.set(teamRef.doc(), t));
    await batch.commit();
    console.log('Default data seeded to Firestore!');
}
