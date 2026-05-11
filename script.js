// --- GLOBAL STATE ---
let cart = [];
const WHATSAPP_NUMBER = "2349151827546";
const ADMIN_PASS = "cubeadmin75";

// Variables to track current selection in the Dynamic Panel
let selectedGame = "";
let selectedPackage = "";
let selectedPrice = "";

// Payment & Legal Data
const paymentDetails = {
    opay: { bank: "OPay", acct: "9050916159" },
    palmpay: { bank: "PalmPay", acct: "9151827546" }
};

const legalContent = {
    terms: { 
        title: "Terms of Service", 
        body: "1. No refunds for incorrect Game IDs.\n2. Delivery Time: Instant to 30 mins.\n3. You must verify payment before clicking WhatsApp.\n4. Prices are subject to change based on market rates." 
    },
    privacy: { 
        title: "Privacy Policy", 
        body: "We value your privacy. We only collect your Game ID and Order details to process your top-up. We do not store your financial information." 
    }
};

// --- INITIALIZATION ---
window.onload = () => {
    displayHistory(); 
    applySavedTheme(); 
    updateSupportStatus();
    // Welcome Toast
    setTimeout(() => showToast("Welcome to Cube Games! 🚀 Launch Special is LIVE! 💎"), 1500);
};

// --- DYNAMIC PANEL LOGIC ---
function openPanel(gameName, pricesArray) {
    // 1. Save state
    selectedGame = gameName;
    selectedPackage = "";
    selectedPrice = "";
    
    // 2. Hide Main Elements (Grid, Search, Calc, Testimonials)
    document.getElementById('gameGrid').style.display = 'none';
    document.getElementById('searchContainer').style.display = 'none';
    document.getElementById('calcSection').style.display = 'none';
    document.getElementById('testimonials').style.display = 'none';
    
    // 3. Show Dynamic Panel
    const panel = document.getElementById('game-detail-panel');
    panel.style.display = 'block';
    
    // 4. Update Text
    document.getElementById('panel-title').innerText = gameName;
    document.getElementById('playerID').value = ''; 

    // 5. Generate Price Buttons Dynamically
    const priceGrid = document.getElementById('panel-price-grid');
    priceGrid.innerHTML = ''; 
    
    pricesArray.forEach(priceString => {
        // Split the string based on " - " format
        let parts = priceString.split(' - ');
        let amount = parts[0];
        let cost = parts[1] || '';

        let btn = document.createElement('button');
        btn.innerHTML = `<span style="display:block; font-size:12px; opacity:0.7; margin-bottom:5px;">${amount}</span>
                         <strong style="font-size:16px;">${cost}</strong>`;
        
        // Base styling for the buttons
        btn.style.cssText = "padding: 15px; background: rgba(128,128,128,0.1); border: 2px solid var(--glass-border); color: var(--text-main); border-radius: 12px; cursor: pointer; transition: 0.2s; text-align: center;";
        
        // Selection Event
        btn.onclick = function() {
            // Reset all buttons
            document.querySelectorAll('#panel-price-grid button').forEach(b => {
                b.style.borderColor = 'var(--glass-border)';
                b.style.background = 'rgba(128,128,128,0.1)';
            });
            // Highlight selected
            this.style.borderColor = 'var(--primary-neon)'; 
            this.style.background = 'rgba(0, 242, 254, 0.1)'; // Faint neon background
            
            // Update global state
            selectedPackage = amount;
            selectedPrice = cost;
        };
        priceGrid.appendChild(btn);
    });
}

function closePanel() {
    // Hide panel
    document.getElementById('game-detail-panel').style.display = 'none';
    
    // Restore Main Elements
    document.getElementById('gameGrid').style.display = 'grid'; 
    document.getElementById('searchContainer').style.display = 'block';
    document.getElementById('calcSection').style.display = 'block';
    document.getElementById('testimonials').style.display = 'block';
}

function proceedToCheckout() {
    const id = document.getElementById('playerID').value.trim();
    
    // Validation
    if(!id) {
        showToast("⚠️ Please enter your Player ID!");
        return;
    }
    if(!selectedPackage) {
        showToast("⚠️ Please select a package!");
        return;
    }

    // Add to cart array (Currently handles 1 item at a time smoothly)
    cart = [{ game: selectedGame, price: selectedPrice, package: selectedPackage, id: id }];
    
    document.getElementById('cart-count').innerText = cart.length;
    openCart();
}

// --- CART & PAYMENT LOGIC ---
function openCart() {
    const list = document.getElementById('cartItemsList');
    list.innerHTML = '';
    
    if(cart.length === 0) {
        list.innerHTML = '<p style="text-align:center; opacity:0.5;">Your cart is empty</p>';
    } else {
        cart.forEach((it) => {
            list.innerHTML += `
            <div style="background:rgba(128,128,128,0.1); padding:15px; border-radius:10px; border-left:4px solid var(--primary-neon); margin-bottom:10px; text-align:left;">
                <b style="color:var(--primary-neon); font-size:16px;">${it.game}</b>
                <div style="font-size:13px; margin-top:5px;">Package: ${it.package}</div>
                <div style="font-size:13px; color:var(--text-dim);">Player ID: ${it.id}</div>
                <div style="margin-top:8px; font-weight:bold; font-size:16px;">Total: ${it.price}</div>
            </div>`;
        });
    }
    document.getElementById('cartOverlay').style.display = 'flex';
}

function closeCart() { 
    document.getElementById('cartOverlay').style.display = 'none'; 
}

function updatePaymentInfo() {
    const method = document.getElementById('paymentMethod').value;
    const info = paymentDetails[method];
    document.getElementById('bankName').innerText = info.bank;
    document.getElementById('bankAcct').innerText = info.acct;
}

function copyCurrentBank() {
    const acct = document.getElementById('bankAcct').innerText;
    navigator.clipboard.writeText(acct).then(() => {
        showToast("Account Number Copied! ✅");
    });
}

function processPayment() {
    if(!cart.length) {
        showToast("⚠️ Your cart is empty!");
        return;
    }
    if(!document.getElementById('termsAgree').checked) {
        showToast("⚠️ Please check the confirmation box!");
        return;
    }

    const method = document.getElementById('paymentMethod').value.toUpperCase();
    let msg = `*NEW CUBE GAMES ORDER (${method})*%0A---------------------------%0A`;
    let history = JSON.parse(localStorage.getItem('cubeHistory')) || [];
    
    // Format WhatsApp Message & Update History
    cart.forEach(it => {
        msg += `*Game:* ${it.game}%0A*Package:* ${it.package}%0A*Player ID:* ${it.id}%0A*Amount Due:* ${it.price}%0A---------------------------%0A`;
        
        // Save to LocalStorage History
        history.unshift({ game: it.game, price: it.price, id: it.id, status: 'Pending', date: new Date().toLocaleDateString() });
    });
    
    msg += `_Payment confirmed sent to ${method}_`;
    
    // Keep only last 15 history items to save space
    localStorage.setItem('cubeHistory', JSON.stringify(history.slice(0, 15)));
    
    // Open WhatsApp
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${msg}`, '_blank');
    
    // Reset Flow
    cart = []; 
    document.getElementById('cart-count').innerText = "0"; 
    document.getElementById('termsAgree').checked = false;
    closeCart(); 
    closePanel(); // Return to home grid
    displayHistory();
}

// --- UTILITIES & UI ---
function calculatePrice() {
    const rate = parseFloat(document.getElementById('calcGame').value);
    let amt = parseInt(document.getElementById('calcAmount').value) || 0;
    let total = amt * rate;
    
    // 5% Discount logic for bulk
    if (amt >= 2000) total *= 0.95;
    
    if(amt > 0) {
        document.getElementById('calcResult').innerHTML = `Estimated Total: <b style="color:var(--accent-green); font-size:18px;">₦${Math.floor(total).toLocaleString()}</b>`;
    } else {
        document.getElementById('calcResult').innerHTML = "Estimated Price: ₦0";
    }
}

function filterGames() {
    let q = document.getElementById('gameSearch').value.toLowerCase();
    let cards = document.getElementsByClassName('game-card');
    for(let c of cards) {
        c.style.display = c.innerText.toLowerCase().includes(q) ? 'block' : 'none';
    }
}

function displayHistory() {
    const cont = document.getElementById('historyList');
    let hist = JSON.parse(localStorage.getItem('cubeHistory')) || [];
    
    if(!hist.length) {
        cont.innerHTML = '<p style="opacity:0.6; font-size:13px;">No recent orders. Make your first top-up!</p>';
        return;
    }
    
    cont.innerHTML = '';
    hist.forEach(h => {
        let borderColor = h.status === 'Approved' ? 'var(--accent-green)' : '#ffcc00';
        cont.innerHTML += `
        <div style="background:var(--card-bg); padding:12px; margin-bottom:10px; border-radius:10px; border-left:4px solid ${borderColor}; display:flex; justify-content:space-between; align-items:center;">
            <div>
                <b style="font-size:14px;">${h.game}</b> <span style="font-size:12px; opacity:0.8;">(${h.price})</span>
                <div style="font-size:11px; opacity:0.6; margin-top:3px;">Date: ${h.date}</div>
            </div>
            <span style="font-size:12px; font-weight:bold; color:${borderColor};">${h.status}</span>
        </div>`;
    });
}

function showToast(message) {
    const toast = document.getElementById('notification-toast'); 
    toast.innerText = message;
    toast.classList.add('show'); 
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3500);
}

// --- THEME & SUPPORT STATUS ---
function toggleTheme() {
    const isLight = document.body.classList.toggle('light-mode');
    localStorage.setItem('cubeTheme', isLight ? 'light' : 'dark');
}

function applySavedTheme() {
    if (localStorage.getItem('cubeTheme') === 'light') {
        document.body.classList.add('light-mode');
    }
}

function updateSupportStatus() {
    const hr = new Date().getHours();
    // Assuming active hours are 7 AM to 11 PM
    if(hr >= 7 && hr <= 23) {
        document.getElementById('admin-online-status').innerText = "● Online";
        document.getElementById('admin-online-status').style.color = "#25D366";
    } else {
        document.getElementById('admin-online-status').innerText = "○ Away";
        document.getElementById('admin-online-status').style.color = "#ffcc00";
    }
}

// --- LEGAL MODALS ---
function openLegal(type) {
    document.getElementById('legalTitle').innerText = legalContent[type].title;
    document.getElementById('legalBody').innerText = legalContent[type].body;
    document.getElementById('legalModal').style.display = 'flex';
}

function closeLegal() { 
    document.getElementById('legalModal').style.display = 'none'; 
}

// --- ADMIN DASHBOARD ---
function accessAdmin() {
    if (prompt("Enter Admin Access Code:") === ADMIN_PASS) {
        document.getElementById('adminContent').style.display = 'block';
        updateAdminDashboard();
        showToast("Admin Access Granted");
    } else {
        alert("Incorrect Access Code.");
    }
}

function logoutAdmin() { 
    document.getElementById('adminContent').style.display = 'none'; 
    showToast("Admin Logged Out");
}

function updateAdminDashboard() {
    const cont = document.getElementById('adminOrderList');
    const earnEl = document.getElementById('totalEarnings');
    let history = JSON.parse(localStorage.getItem('cubeHistory')) || [];
    let revenue = 0;
    
    if(!history.length) {
        cont.innerHTML = '<p style="text-align:center; opacity:0.6;">No orders found.</p>';
        earnEl.innerText = "₦0";
        return;
    }
    
    cont.innerHTML = '';
    history.forEach((h, i) => {
        // Extract numbers only for revenue calculation (e.g. "₦16,000" -> 16000)
        let priceNum = parseInt(h.price.replace(/[^\d]/g, '')) || 0;
        if(h.status === 'Approved') revenue += priceNum;
        
        cont.innerHTML += `
        <div style="padding:12px; background:rgba(0,0,0,0.2); border-radius:10px; margin-bottom:10px; font-size:12px; text-align:left;">
            <strong style="color:var(--primary-neon);">${h.game}</strong> - ${h.price}<br>
            <span style="opacity:0.8;">Player ID: ${h.id}</span><br>
            <span style="color:${h.status==='Approved'?'#25D366':'#ffcc00'};">Status: ${h.status}</span><br>
            <div style="margin-top:8px; display:flex; gap:10px;">
                <button onclick="approveOrder(${i})" style="padding:5px 10px; background:var(--accent-green); border:none; border-radius:5px; color:white; cursor:pointer;">Approve</button> 
                <button onclick="deleteOrder(${i})" style="padding:5px 10px; background:var(--error-red); border:none; border-radius:5px; color:white; cursor:pointer;">Delete</button>
            </div>
        </div>`;
    });
    
    earnEl.innerText = "₦" + revenue.toLocaleString();
}

function approveOrder(i) {
    let hist = JSON.parse(localStorage.getItem('cubeHistory'));
    hist[i].status = 'Approved';
    localStorage.setItem('cubeHistory', JSON.stringify(hist));
    updateAdminDashboard(); 
    displayHistory(); // Update public view too
}

function deleteOrder(i) {
    if(confirm("Are you sure you want to delete this order record?")) {
        let hist = JSON.parse(localStorage.getItem('cubeHistory'));
        hist.splice(i, 1);
        localStorage.setItem('cubeHistory', JSON.stringify(hist));
        updateAdminDashboard(); 
        displayHistory();
    }
        }
