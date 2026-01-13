// Cart Functionality
let cart = JSON.parse(localStorage.getItem('vsr_cart')) || [];
const API_BASE = 'http://localhost:5000/api';

// --- Activity Tracking ---
async function trackActivity(action, productName, details = {}) {
    const user = JSON.parse(localStorage.getItem('vsr_user'));
    const customerId = user ? user.id : null;

    try {
        await fetch(`${API_BASE}/activity`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                customerId,
                action,
                productName,
                details
            })
        });
    } catch (e) { console.log('Tracking error', e); }
}

function updateCartCount() {
    const count = cart.reduce((total, item) => total + item.quantity, 0);
    const badge = document.getElementById('cart-count');
    if (badge) badge.textContent = count;
}

function addToCart(name, price, image, quantity = 1) {
    const existing = cart.find(item => item.name === name);
    if (existing) {
        existing.quantity += quantity;
    } else {
        cart.push({ name, price, image, quantity: quantity });
    }
    localStorage.setItem('vsr_cart', JSON.stringify(cart));
    updateCartCount();
    showNotification("You're item is added to cart");
    trackActivity('ADD_TO_CART', name, { price, quantity });
}

function changeCartQty(name, change) {
    const itemIndex = cart.findIndex(item => item.name === name);
    if (itemIndex > -1) {
        cart[itemIndex].quantity += change;
        if (cart[itemIndex].quantity <= 0) {
            cart.splice(itemIndex, 1); // Remove item if quantity is 0
        }
        localStorage.setItem('vsr_cart', JSON.stringify(cart));
        updateCartCount();
        renderOrderSummary();
    }
}

function renderOrderSummary() {
    const summaryList = document.getElementById('order-summary');
    const totalEl = document.getElementById('order-total');

    if (!summaryList || !totalEl) return;

    if (cart.length === 0) {
        summaryList.innerHTML = '<p>Your cart is empty.</p>';
        totalEl.textContent = 'Total: ₹0';
        return;
    }

    let total = 0;
    let html = '<ul style="list-style: none; padding: 0;">';

    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;
        html += `
            <li style="display: flex; align-items: center; margin-bottom: 15px; border-bottom: 1px solid #eee; padding-bottom: 15px;">
                <img src="${item.image}" alt="${item.name}" style="width: 60px; height: 60px; object-fit: cover; border-radius: 10px; margin-right: 15px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
                <div style="flex-grow: 1;">
                    <h4 style="margin: 0 0 5px; color: #2c3e50; font-size: 1rem;">${item.name}</h4>
                    <p style="margin: 0; color: #7f8c8d; font-size: 0.9rem;">₹${item.price} x ${item.quantity}</p>
                </div>
                <div style="text-align: right; display: flex; flex-direction: column; align-items: flex-end; gap: 5px;">
                    <span style="font-weight: 600; color: #27ae60;">₹${itemTotal}</span>
                    <div style="display: flex; align-items: center; gap: 8px; background: #f8f9fa; padding: 2px; border-radius: 20px;">
                        <button onclick="changeCartQty('${item.name}', -1)" style="background:#fff; color:#e74c3c; border:1px solid #e74c3c; border-radius:50%; width:24px; height:24px; cursor:pointer; display:flex; align-items:center; justify-content:center; font-size:12px;"><i class="fas fa-minus"></i></button>
                        <span style="font-weight: 600; font-size: 0.9rem; min-width: 20px; text-align: center;">${item.quantity}</span>
                        <button onclick="changeCartQty('${item.name}', 1)" style="background:#fff; color:#2ecc71; border:1px solid #2ecc71; border-radius:50%; width:24px; height:24px; cursor:pointer; display:flex; align-items:center; justify-content:center; font-size:12px;"><i class="fas fa-plus"></i></button>
                    </div>
                </div>
            </li>
        `;
    });

    html += '</ul>';
    summaryList.innerHTML = html;
    totalEl.textContent = `Total Amount: ₹${total}`;

    // Update WhatsApp Link with Order Details
    updateWhatsAppLink(total);
}

function updateWhatsAppLink(total) {
    const btn = document.getElementById('whatsapp-order-btn');
    if (!btn) return;

    let message = "Hello VSR Farm's, I would like to place an order:%0a";
    cart.forEach(item => {
        message += `- ${item.name} (${item.quantity})%0a`;
    });
    message += `%0aTotal Amount: ₹${total}`;

    const phone = "918143713538";
    btn.href = `https://wa.me/${phone}?text=${message}`;
}

function toggleMenu() {
    const navLinks = document.querySelector('.nav-links');
    navLinks.classList.toggle('active');
}

document.addEventListener('DOMContentLoaded', () => {
    updateCartCount();
    renderOrderSummary();
});

function showNotification(message) {
    // Create container if it doesn't exist
    let container = document.getElementById('notification-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'notification-container';
        container.style.cssText = "position: fixed; top: 20px; right: 20px; z-index: 10000; display: flex; flex-direction: column; gap: 10px;";
        document.body.appendChild(container);
    }

    // Create toast element
    const toast = document.createElement('div');
    toast.style.cssText = "background: #27ae60; color: white; padding: 15px 25px; border-radius: 5px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); display: flex; align-items: center; gap: 10px; animation: fadeIn 0.3s, fadeOut 0.3s 2.7s forwards;";
    toast.innerHTML = `<i class="fas fa-check-circle"></i> <span>${message}</span>`;

    container.appendChild(toast);

    // Remove after 3 seconds
    setTimeout(() => {
        toast.remove();
    }, 3000);
}
