document.addEventListener('DOMContentLoaded', () => {
                // Dark/Light Mode Toggle
                const modeToggle = document.getElementById('modeToggle');
                modeToggle.addEventListener('click', () => {
                    document.body.classList.toggle('dark-mode');

                    // Icon toggle
                    if (document.body.classList.contains('dark-mode')) {
                        modeToggle.classList.remove('fa-moon');
                        modeToggle.classList.add('fa-sun');
                    } else {
                        modeToggle.classList.remove('fa-sun');
                        modeToggle.classList.add('fa-moon');
                    }

                    // Save preference in localStorage
                    localStorage.setItem('theme', document.body.classList.contains('dark-mode') ? 'dark' : 'light');
                });

                // Load theme preference on page load
                if (localStorage.getItem('theme') === 'dark') {
                    document.body.classList.add('dark-mode');
                    modeToggle.classList.remove('fa-moon');
                    modeToggle.classList.add('fa-sun');
                }

                // Sidebar Toggle
                const burger = document.getElementById('burger');
                const sidebar = document.getElementById('sidebar');
                burger.addEventListener('click', () => sidebar.classList.toggle('active'));

                document.querySelectorAll('.sidebar a').forEach(link => {
                    link.addEventListener('click', e => {
                        e.preventDefault();
                        sidebar.classList.remove('active');
                        const target = document.querySelector(link.getAttribute('href'));
                        if (target) target.scrollIntoView({ behavior: 'smooth' });
                    });
                });

                // Menu Category Filter
                const menuButtons = document.querySelectorAll('.menu-tabs button');
                const menuItems = document.querySelectorAll('.menu-item');

                menuButtons.forEach(btn => {
                    btn.addEventListener('click', () => {
                        menuButtons.forEach(b => b.classList.remove('active'));
                        btn.classList.add('active');
                        const cat = btn.getAttribute('data-category');
                        menuItems.forEach(item => {
                            item.style.display = (cat === 'all' || item.dataset.category === cat) ? 'block' : 'none';
                        });
                    });
                });

                // Cart System
                let cart = [];

                function attachAddToCart() {
                    document.querySelectorAll(".add-to-cart").forEach(btn => {
                        btn.addEventListener("click", () => {
                            const item = btn.closest(".menu-item");
                            const name = item.dataset.name || "Unknown";
                            const price = parseFloat(item.dataset.price) || 0;
                            const existing = cart.find(i => i.name === name);
                            if (existing) existing.qty++; else cart.push({ name, price, qty: 1 });
                            renderCart();
                        });
                    });
                }

                function renderCart() {
                    const cartItems = document.getElementById("cartItems");
                    if (!cartItems) return;
                    cartItems.innerHTML = "";
                    let total = 0;
                    cart.forEach((item, i) => {
                        const itemTotal = item.price * item.qty;
                        total += itemTotal;
                        cartItems.innerHTML += `
        <li class="list-group-item d-flex justify-content-between align-items-center">
          ${item.name} x ${item.qty} - $${itemTotal.toFixed(2)}
          <button class="btn btn-sm btn-danger" onclick="removeItem(${i})">Remove</button>
        </li>`;
                    });
                    document.getElementById("cartTotal").innerText = total.toFixed(2);
                }

                window.removeItem = function (i) { cart.splice(i, 1); renderCart(); };
                attachAddToCart();

                // Checkout Button
                const checkoutBtn = document.getElementById("checkoutBtn");
                if (checkoutBtn) {
                    checkoutBtn.addEventListener("click", () => {
                        const checkoutSection = document.getElementById("checkout");
                        if (checkoutSection) {
                            checkoutSection.style.display = "block";
                            checkoutSection.scrollIntoView({ behavior: "smooth" });
                        }
                    });
                }

                // Place Order
                const checkoutForm = document.getElementById("checkoutForm");
                if (checkoutForm) {
                    checkoutForm.addEventListener("submit", async (e) => {
                        e.preventDefault();
                        if (cart.length === 0) return alert("Your cart is empty!");
                        const orderData = {
                            customer: document.getElementById('custName').value,
                            phone: document.getElementById('custPhone').value,
                            address: document.getElementById('custAddress').value,
                            items: cart,
                            total: cart.reduce((sum, i) => sum + i.price * i.qty, 0)
                        };
                        try {
                            const res = await fetch('http://localhost:5000/orders', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify(orderData)
                            });
                            if (!res.ok) throw new Error("Network error");
                            await res.json();
                            alert("✅ Order placed successfully!");
                            cart = [];
                            renderCart();
                            e.target.reset();
                        } catch (err) { console.error(err); alert("❌ Failed to place order."); }
                    });
                }

                // Reservation Form
                const reservationForm = document.querySelector('#reservation form');
                if (reservationForm) {
                    reservationForm.addEventListener('submit', async (e) => {
                        e.preventDefault();
                        const bookingData = {
                            name: e.target.querySelector('[placeholder="Name"]').value,
                            email: e.target.querySelector('[placeholder="Email"]').value,
                            phone: e.target.querySelector('[placeholder="Phone"]').value,
                            date: e.target.querySelector('[type="date"]').value,
                            time: e.target.querySelector('[type="time"]').value,
                            guests: e.target.querySelector('[placeholder="Guests"]').value
                        };
                        try {
                            const res = await fetch('http://localhost:5000/api/bookings', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify(bookingData)
                            });
                            if (!res.ok) throw new Error("Network error");
                            await res.json();
                            alert('✅ Table booked successfully!');
                            e.target.reset();
                        } catch (err) { console.error(err); alert('❌ Failed to book table.'); }
                    });
                }

                // Load Menu Dynamically
                async function loadMenu() {
                    const container = document.getElementById("menuItemsContainer");
                    if (!container) return;
                    container.innerHTML = "";
                    try {
                        const res = await fetch("http://localhost:5000/api/menu");
                        const menu = await res.json();
                        menu.forEach(item => {
                            const div = document.createElement("div");
                            div.className = `col-md-4 menu-item card p-3 text-center`;
                            div.dataset.category = item.category;
                            div.dataset.name = item.name;
                            div.dataset.price = item.price;
                            div.innerHTML = `
          <img src="../assets/${item.image}" alt="${item.name}" style="width:100%;height:150px;object-fit:cover;">
          <h5>${item.name}</h5>
          <p>$${item.price.toFixed(2)}</p>
          <button class="btn btn-warning add-to-cart">Add to Order</button>
        `;
                            container.appendChild(div);
                        });
                        attachAddToCart();
                    } catch (err) { console.error("Failed to load menu items", err); }
                }

                loadMenu();

                // ===== Initialize Hero Carousel =====
                const heroCarouselEl = document.querySelector('#heroCarousel');
                if (heroCarouselEl) {
                    const heroCarousel = new bootstrap.Carousel(heroCarouselEl, {
                        interval: 5000,  // 5 seconds per slide
                        ride: 'carousel', // auto start
                        pause: false      // hover par stop na ho
                    });
                }

                // ===== Listen for Admin Menu Add Event =====
                document.addEventListener('menuItemAdded', (e) => {
                    loadMenu(); // refresh menu automatically when admin adds new item
                });

            });
