let cart = [];
const WHATSAPP_NUMBER = "2349151827546";
const ADMIN_PASS = "cubeadmin75";

const paymentDetails = {
    opay: { bank: "OPay", acct: "9050916159" },
    palmpay: { bank: "PalmPay", acct: "9151827546" }
};

const legalContent = {
    terms: { title: "Terms of Service", body: "1. No refunds for incorrect IDs.\n2. Delivery: 2-30 mins.\n3. Verify payment before clicking WhatsApp." },
    privacy: { title: "Privacy Policy", body: "We only collect Game ID and Order details to process your top-up." }
};

window.onload = () => {
    displayHistory(); applySavedTheme(); updateSupportStatus();
    setTimeout(() => showToast("Welcome to Cube Games! 🚀 Launch Special is LIVE! 💎"), 2000);
};

// --- PAYMENT UPDATER ---
function updatePaymentInfo() {
    const method = document.getElementById('paymentMethod').value;
    const info = paymentDetails[method];
    document.getElementById('bankName').innerText = info.bank;
    document.getElementById('bankAcct').innerText = info.acct;
}

function copyCurrentBank() {
    const acct = document.getElementById('bankAcct').innerText;
    navigator.clipboard.writeText(acct).then(() => showToast("Account Copied! ✅"));
}

// --- ADMIN ---
function accessAdmin() {
    if (prompt("Admin Code:") === ADMIN_PASS) {
        document.getElementById('adminContent').style.display = 'block';
        updateAdminDashboard();
    }
}

function updateAdminDashboard() {
    const cont = document.getElementById('adminOrderList');
    const earnEl = document.getElementById('totalEarnings');
    let history = JSON.parse(localStorage.getItem('cubeHistory')) || [];
    let revenue = 0;
    cont.innerHTML = history.length ? '' : 'Empty.';
    history.forEach((h, i) => {
        let priceNum = parseInt(h.price.replace(/[^\d]/g, '')) || 0;
        if(h.status === 'Approved') revenue += priceNum;
        cont.innerHTML += `<div style="padding:10px; border-bottom:1px solid #333; font-size:12px; text-align:left;">
            <b>${h.game}</b> - ${h.price} (ID: ${h.id})<br><small>Status: ${h.status}</small><br>
            <button onclick="approveOrder(${i})">Approve</button> <button onclick="deleteOrder(${i})">Del</button></div>`;
    });
    earnEl.innerText = "₦" + revenue.toLocaleString();
}

function approveOrder(i) {
    let hist = JSON.parse(localStorage.getItem('cubeHistory'));
    hist[i].status = 'Approved';
    localStorage.setItem('cubeHistory', JSON.stringify(hist));
    updateAdminDashboard(); displayHistory();
}

function deleteOrder(i) {
    let hist = JSON.parse(localStorage.getItem('cubeHistory'));
    hist.splice(i, 1);
    localStorage.setItem('cubeHistory', JSON.stringify(hist));
    updateAdminDashboard(); displayHistory();
}

function logoutAdmin() { document.getElementById('adminContent').style.display = 'none'; }

// --- THEME ---
function toggleTheme() {
    const isLight = document.body.classList.toggle('light-mode');
    localStorage.setItem('cubeTheme', isLight ? 'light' : 'dark');
}

function applySavedTheme() {
    if (localStorage.getItem('cubeTheme') === 'light') document.body.classList.add('light-mode');
}

function updateSupportStatus() {
    const hr = new Date().getHours();
    document.getElementById('admin-online-status').innerText = (hr >= 7 && hr <= 23) ? "● Online" : "○ Away";
}

// --- CORE ---
function calculatePrice() {
    const rate = parseFloat(document.getElementById('calcGame').value);
    let amt = parseInt(document.getElementById('calcAmount').value) || 0;
    let total = amt * rate;
    if (amt >= 2000) total *= 0.95;
    document.getElementById('calcResult').innerHTML = amt > 0 ? `Estimated Price: <b style="color:var(--accent-green)">₦${Math.floor(total).toLocaleString()}</b>` : "Estimated Price: ₦0";
}

function clearPlayerIDError() {
    document.getElementById('playerIDError').hidden = true;
    document.getElementById('playerID').removeAttribute('aria-invalid');
}

function openModal(name, prices, card) {
    const modal = document.getElementById('priceModal');
    const playerID = document.getElementById('playerID');
    const logo = document.getElementById('modalGameIcon');
    const fallback = document.getElementById('modalLogoFallback');
    const gameCard = card || [...document.querySelectorAll('.game-card')].find(c => c.dataset.game === name);
    const gameImage = gameCard?.querySelector('.game-icon-img');

    logo.hidden = true;
    logo.alt = `${name} logo`;
    fallback.textContent = name.split(' ').map(word => word[0]).join('').slice(0, 2).toUpperCase();
    fallback.hidden = false;
    logo.onload = () => { logo.hidden = false; fallback.hidden = true; };
    logo.onerror = () => { logo.hidden = true; fallback.hidden = false; };
    if (gameImage) logo.src = gameImage.currentSrc || gameImage.src;
    else logo.removeAttribute('src');

    document.getElementById('modalTitle').innerText = name;
    playerID.value = '';
    document.getElementById('orderNote').value = '';
    clearPlayerIDError();
    document.getElementById('extraFields').style.display = (name.includes('Airdrop')) ? 'block' : 'none';
    const cont = document.getElementById('priceOptions'); cont.innerHTML = '';
    prices.forEach(p => {
        const d = document.createElement('button');
        d.type = 'button';
        d.className = 'price-option';
        d.textContent = p;
        d.onclick = () => {
            const id = playerID.value.trim();
            if (!id) {
                document.getElementById('playerIDError').hidden = false;
                playerID.setAttribute('aria-invalid', 'true');
                playerID.focus();
                return;
            }
            cart.push({ game: name, price: p, id, note: document.getElementById('orderNote').value });
            document.getElementById('cart-count').innerText = cart.length;
            closeModal(); showToast("Added! 🛒");
        };
        cont.appendChild(d);
    });
    if (!modal.open) modal.showModal();
    playerID.focus();
}

function processPayment() {
    if(!cart.length || !document.getElementById('termsAgree').checked) return alert("Check items/agreement!");
    const method = document.getElementById('paymentMethod').value.toUpperCase();
    let msg = `*NEW ORDER (${method})*%0A`;
    let history = JSON.parse(localStorage.getItem('cubeHistory')) || [];
    cart.forEach(it => {
        msg += `- ${it.game}: ${it.price} (ID: ${it.id})%0A`;
        history.unshift({ ...it, date: new Date().toLocaleDateString(), status: 'Pending' });
    });
    localStorage.setItem('cubeHistory', JSON.stringify(history.slice(0, 15)));
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${msg}`, '_blank');
    cart = []; document.getElementById('cart-count').innerText = "0"; closeCart(); displayHistory();
}

function displayHistory() {
    const cont = document.getElementById('historyList');
    let hist = JSON.parse(localStorage.getItem('cubeHistory')) || [];
    cont.innerHTML = hist.length ? '' : 'No orders.';
    hist.forEach(h => {
        cont.innerHTML += `<div style="background:var(--card-bg); padding:10px; margin-bottom:10px; border-radius:10px; border-left:4px solid ${h.status==='Approved'?'#25D366':'orange'}">
            <b>${h.game}</b> (${h.price}) - ${h.status}</div>`;
    });
}

function filterGames() {
    let q = document.getElementById('gameSearch').value.toLowerCase();
    let cards = document.getElementsByClassName('game-card');
    for(let c of cards) c.hidden = !c.innerText.toLowerCase().includes(q);
}

function showToast(m) {
    const t = document.getElementById('notification-toast'); t.innerText = m;
    t.classList.add('show'); setTimeout(() => t.classList.remove('show'), 3500);
}

function openLegal(t) {
    document.getElementById('legalTitle').innerText = legalContent[t].title;
    document.getElementById('legalBody').innerText = legalContent[t].body;
    document.getElementById('legalModal').style.display = 'flex';
}
function closeModal() { document.getElementById('priceModal').close(); }
function openCart() {
    const list = document.getElementById('cartItemsList'); list.innerHTML = cart.length ? '' : 'Empty';
    cart.forEach((it, i) => list.innerHTML += `<div style="padding:10px; border-bottom:1px solid #333;">${it.game} - ${it.price} <button onclick="removeFromCart(${i})" style="float:right; color:red; background:none; border:none;">&times;</button></div>`);
    document.getElementById('cartOverlay').style.display = 'flex';
}
function removeFromCart(i) { cart.splice(i, 1); document.getElementById('cart-count').innerText = cart.length; openCart(); }
function closeCart() { document.getElementById('cartOverlay').style.display = 'none'; }
function closeLegal() { document.getElementById('legalModal').style.display = 'none'; }

// Keep keyboard focus inside the game modal (native dialog briefly lands on body at the wrap point).
document.getElementById('priceModal').addEventListener('keydown', (event) => {
    if (event.key !== 'Tab') return;
    const focusable = [...event.currentTarget.querySelectorAll('button:not(:disabled), input:not(:disabled), select:not(:disabled), a[href]')]
        .filter(element => element.getClientRects().length);
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && (document.activeElement === first || document.activeElement === event.currentTarget)) {
        event.preventDefault();
        last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
    }
});
