/**
 * Premium Landing Page Scripts
 * CRO-focused: sticky mobile CTA, dynamic pricing, COD form validation.
 */

document.addEventListener('DOMContentLoaded', () => {

    const HEADER_OFFSET = 100;

    // 1. Scroll Reveal Animations
    const revealElements = document.querySelectorAll('.reveal');
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) entry.target.classList.add('active');
        });
    }, { root: null, rootMargin: '0px 0px -50px 0px', threshold: 0.1 });

    revealElements.forEach(el => revealObserver.observe(el));

    // 2. Sticky Navigation Styling on Scroll
    const navbar = document.getElementById('navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('shadow-lg', 'border-b', 'border-white/10');
        } else {
            navbar.classList.remove('shadow-lg', 'border-b', 'border-white/10');
        }
    });

    // 3. FAQ Accordion
    const faqButtons = document.querySelectorAll('.faq-btn');
    faqButtons.forEach(button => {
        button.addEventListener('click', () => {
            const content = button.nextElementSibling;
            const icon = button.querySelector('svg');

            faqButtons.forEach(otherBtn => {
                if (otherBtn !== button) {
                    otherBtn.nextElementSibling.style.maxHeight = null;
                    otherBtn.querySelector('svg').classList.remove('rotate-180');
                    otherBtn.classList.remove('text-primary');
                }
            });

            if (content.style.maxHeight) {
                content.style.maxHeight = null;
                icon.classList.remove('rotate-180');
                button.classList.remove('text-primary');
            } else {
                content.style.maxHeight = content.scrollHeight + 'px';
                icon.classList.add('rotate-180');
                button.classList.add('text-primary');
            }
        });
    });

    // 4. Smooth Scrolling
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            e.preventDefault();

            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                const offsetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - HEADER_OFFSET;
                window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
            }
        });
    });

    // 5. Dynamic Package Pricing
    const packageRadios = document.querySelectorAll('input[name="package"]');
    const orderBtn = document.getElementById('order-btn');
    const mobilePrice = document.getElementById('mobile-price');

    function formatPrice(amount) {
        return '৳' + amount.toLocaleString('en-BD');
    }

    function updatePricing() {
        const selected = document.querySelector('input[name="package"]:checked');
        if (!selected) return;
        const price = selected.dataset.price;
        const label = selected.dataset.label;
        if (orderBtn) {
            orderBtn.textContent = `Confirm Order — ${formatPrice(Number(price))} (Cash on Delivery)`;
        }
        if (mobilePrice) {
            mobilePrice.textContent = formatPrice(Number(price));
        }

        // Fix styling for nested elements since inputs are hidden and peers are deep
        packageRadios.forEach(radio => {
            const card = radio.nextElementSibling;
            const dot = card.querySelector('.inner-dot');
            const radioOutline = card.querySelector('.package-radio');
            if (radio.checked) {
                card.classList.add('border-primary', 'bg-primary/5');
                card.classList.remove('border-white/10');
                if (dot) dot.classList.add('scale-100');
                if (dot) dot.classList.remove('scale-0');
                if (radioOutline) {
                    radioOutline.classList.add('border-primary');
                    radioOutline.classList.remove('border-white/30');
                }
            } else {
                card.classList.remove('border-primary', 'bg-primary/5');
                card.classList.add('border-white/10');
                if (dot) dot.classList.add('scale-0');
                if (dot) dot.classList.remove('scale-100');
                if (radioOutline) {
                    radioOutline.classList.remove('border-primary');
                    radioOutline.classList.add('border-white/30');
                }
            }
        });
    }

    packageRadios.forEach(radio => {
        radio.addEventListener('change', updatePricing);
    });
    updatePricing();

    // 6. Mobile Sticky CTA — show after hero, hide at checkout
    const mobileCta = document.getElementById('mobile-cta');
    const checkoutSection = document.getElementById('checkout');

    if (mobileCta && checkoutSection) {
        const ctaObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.target.id === 'checkout') {
                    mobileCta.classList.toggle('visible', !entry.isIntersecting && window.scrollY > 400);
                }
            });
        }, { threshold: 0.15 });

        ctaObserver.observe(checkoutSection);

        window.addEventListener('scroll', () => {
            const checkoutRect = checkoutSection.getBoundingClientRect();
            const checkoutVisible = checkoutRect.top < window.innerHeight && checkoutRect.bottom > 0;
            mobileCta.classList.toggle('visible', window.scrollY > 400 && !checkoutVisible);
        }, { passive: true });
    }

    // 7. COD Order Form Validation & Submit
    const orderForm = document.getElementById('order-form');
    const formError = document.getElementById('form-error');
    const successModal = document.getElementById('success-modal');
    const closeModal = document.getElementById('close-modal');

    function validatePhone(phone) {
        return /^01[0-9]{9}$/.test(phone.replace(/\s/g, ''));
    }

    function clearFieldErrors() {
        orderForm.querySelectorAll('.form-input').forEach(input => input.classList.remove('error'));
        formError.classList.add('hidden');
    }

    if (orderForm) {
        orderForm.addEventListener('submit', (e) => {
            e.preventDefault();
            clearFieldErrors();

            const name = orderForm.querySelector('#customer-name');
            const phone = orderForm.querySelector('#customer-phone');
            const address = orderForm.querySelector('#customer-address');
            let valid = true;

            if (!name.value.trim()) {
                name.classList.add('error');
                valid = false;
            }
            if (!validatePhone(phone.value)) {
                phone.classList.add('error');
                valid = false;
            }
            if (!address.value.trim()) {
                address.classList.add('error');
                valid = false;
            }

            if (!valid) {
                formError.textContent = 'Please fill in all required fields with a valid 11-digit mobile number.';
                formError.classList.remove('hidden');
                return;
            }

            const selected = document.querySelector('input[name="package"]:checked');
            const orderData = {
                name: name.value.trim(),
                phone: phone.value.trim(),
                address: address.value.trim(),
                package: selected?.dataset.label || 'Single Unit',
                price: selected?.dataset.price || '1299',
            };

            // Change button state to loading (using document selection since button is outside form tags)
            const submitBtn = document.getElementById('order-btn');
            const originalText = submitBtn ? submitBtn.textContent : 'অর্ডার নিশ্চিত করুন (ক্যাশ অন ডেলিভারি)';
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.textContent = 'অর্ডার সাবমিট হচ্ছে...';
            }

            const GOOGLE_SHEET_URL = "https://script.google.com/macros/s/AKfycbw5TnC82KSmI32kqt8ZC3PF9QkRPV-wxsc7MEmSzgv3ewZBS-6aQhMPmBkq5P3GgWWG/exec";

            // Prepare URLencoded form body for Apps Script (highly compatible with standard configurations)
            const formBody = [];
            for (const key in orderData) {
                const encodedKey = encodeURIComponent(key);
                const encodedValue = encodeURIComponent(orderData[key]);
                formBody.push(encodedKey + "=" + encodedValue);
            }
            const encodedData = formBody.join("&");

            fetch(GOOGLE_SHEET_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded"
                },
                body: encodedData,
                mode: "no-cors" // Recommended mode to bypass CORS issues on direct static file deployment
            })
            .then(() => {
                console.log('Order submitted successfully to Google Sheet:', orderData);
            })
            .catch(error => {
                console.log('Error submitting form to Google Sheet:', error);
            })
            .finally(() => {
                // Re-enable submit button and reset form
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.textContent = originalText;
                }

                // Show success modal to user
                successModal.classList.remove('hidden');
                successModal.classList.add('flex');
                orderForm.reset();
                updatePricing();
            });
        });

        orderForm.querySelectorAll('.form-input').forEach(input => {
            input.addEventListener('input', () => {
                input.classList.remove('error');
                formError.classList.add('hidden');
            });
        });
    }

    // 8. Interactive Charging Mock Animation Logic
    const phoneContainer = document.getElementById('phone-container');
    const successGlowOverlay = document.getElementById('success-glow-overlay');
    const batteryOuter = document.getElementById('battery-outer');
    const batteryFill = document.getElementById('battery-fill');
    const statusIconCharging = document.getElementById('status-icon-charging');
    const statusIconComplete = document.getElementById('status-icon-complete');
    const percentageText = document.getElementById('percentage-text');
    const statusLabel = document.getElementById('status-label');
    const chargingCable = document.getElementById('charging-cable');
    const cableLed = document.getElementById('cable-led');
    const particlesContainer = document.getElementById('particles-container');

    function createParticles() {
        if (!batteryOuter || !particlesContainer) return;
        const rect = batteryOuter.getBoundingClientRect();
        const parentRect = particlesContainer.getBoundingClientRect();
        const startX = (rect.left + rect.right) / 2 - parentRect.left;
        const startY = (rect.top + rect.bottom) / 2 - parentRect.top;

        for (let i = 0; i < 20; i++) {
            const p = document.createElement('div');
            p.classList.add('particle');
            
            // Random explosion direction
            const angle = Math.random() * Math.PI * 2;
            const distance = 40 + Math.random() * 60;
            const x = Math.cos(angle) * distance;
            const y = Math.sin(angle) * distance;

            p.style.setProperty('--x', `${x}px`);
            p.style.setProperty('--y', `${y}px`);
            p.style.left = `${startX}px`;
            p.style.top = `${startY}px`;
            p.style.animation = 'particle-burst 1s cubic-bezier(0.1, 0.8, 0.3, 1) forwards';
            particlesContainer.appendChild(p);

            // Clean up
            setTimeout(() => p.remove(), 1000);
        }
    }

    function runAnimation() {
        if (!phoneContainer) return;
        
        // Reset state
        chargingCable.style.transform = 'translateY(64px)'; // Cable disconnected
        cableLed.className = 'w-1.5 h-1.5 rounded-full bg-slate-600 transition-colors duration-300';
        batteryFill.style.height = '0%';
        batteryFill.className = 'w-full bg-red-500 rounded-lg transition-all duration-300 shadow-[0_0_15px_rgba(239,68,68,0.5)]';
        percentageText.textContent = '0%';
        percentageText.className = 'text-3xl font-extrabold text-white tracking-wider font-mono transition-colors duration-500';
        statusLabel.textContent = 'পাওয়ার ডিসকানেক্টেড';
        statusLabel.className = 'text-[10px] uppercase tracking-widest text-slate-500 font-bold h-4 text-center';
        statusIconCharging.style.transform = 'scale(1)';
        statusIconComplete.style.transform = 'scale(0)';
        batteryOuter.classList.remove('battery-charging-glow', 'battery-success-glow', 'border-green-500');
        batteryOuter.classList.add('border-slate-700');
        successGlowOverlay.className = 'absolute inset-0 bg-green-500/0 transition-all duration-1000 pointer-events-none';

        // 1. Cable connects
        setTimeout(() => {
            if (!chargingCable) return;
            chargingCable.style.transform = 'translateY(16px)'; // Cable plugged in
            cableLed.className = 'w-1.5 h-1.5 rounded-full bg-blue-500 transition-colors duration-300 shadow-[0_0_8px_#3b82f6]';
            statusLabel.textContent = 'KH-51(AI) কানেক্টেড';
        }, 1500);

        // 2. Charging begins
        setTimeout(() => {
            if (!cableLed) return;
            cableLed.className = 'w-1.5 h-1.5 rounded-full bg-accent transition-colors duration-300 shadow-[0_0_8px_#06b6d4]';
            statusLabel.textContent = 'চার্জ হচ্ছে...';
            batteryOuter.classList.add('battery-charging-glow');
            
            // Start counter sequence
            const steps = [
                { p: 10, h: '10%', c: 'bg-red-500', s: 'shadow-[0_0_15px_rgba(239,68,68,0.5)]', t: 400 },
                { p: 25, h: '25%', c: 'bg-orange-500', s: 'shadow-[0_0_15px_rgba(249,115,22,0.5)]', t: 800 },
                { p: 50, h: '50%', c: 'bg-yellow-500', s: 'shadow-[0_0_15px_rgba(234,179,8,0.5)]', t: 1400 },
                { p: 75, h: '75%', c: 'bg-blue-500', s: 'shadow-[0_0_15px_rgba(59,130,246,0.5)]', t: 2000 },
                { p: 90, h: '90%', c: 'bg-accent', s: 'shadow-[0_0_15px_rgba(6,182,212,0.5)]', t: 2600 },
                { p: 99, h: '99%', c: 'bg-accent', s: 'shadow-[0_0_15px_rgba(6,182,212,0.5)]', t: 3200 },
                { p: 100, h: '100%', c: 'bg-green-500', s: 'shadow-[0_0_15px_rgba(34,197,94,0.5)]', t: 3800 }
            ];

            steps.forEach(step => {
                setTimeout(() => {
                    if (!percentageText) return;
                    percentageText.textContent = step.p + '%';
                    batteryFill.style.height = step.h;
                    batteryFill.className = `w-full ${step.c} rounded-lg transition-all duration-300 ${step.s}`;
                    
                    if (step.p === 100) {
                        // 3. Fully Charged reached!
                        batteryOuter.classList.remove('battery-charging-glow');
                        batteryOuter.classList.remove('border-slate-700');
                        batteryOuter.classList.add('battery-success-glow', 'border-green-500');
                        statusIconCharging.style.transform = 'scale(0)';
                        statusIconComplete.style.transform = 'scale(1)';
                        percentageText.className = 'text-3xl font-extrabold text-green-400 tracking-wider font-mono transition-colors duration-500';
                        statusLabel.textContent = 'Fully Charged ✓';
                        statusLabel.className = 'text-[10px] uppercase tracking-widest text-green-400 font-bold h-4 text-center';
                        successGlowOverlay.className = 'absolute inset-0 bg-green-500/10 transition-all duration-500 pointer-events-none';
                        
                        createParticles();

                        // 4. Power Auto Cut-off (cable disconnects)
                        setTimeout(() => {
                            if (!chargingCable) return;
                            chargingCable.style.transform = 'translateY(64px)'; // Cable falls
                            cableLed.className = 'w-1.5 h-1.5 rounded-full bg-slate-600 transition-colors duration-300';
                            statusLabel.textContent = 'Auto-Cutoff অ্যাক্টিভেটেড';
                            statusLabel.className = 'text-[10px] uppercase tracking-widest text-red-400 font-bold h-4 text-center';
                            successGlowOverlay.className = 'absolute inset-0 bg-green-500/0 transition-all duration-1000 pointer-events-none';
                            
                            // Restart cycle after brief delay
                            setTimeout(runAnimation, 4000);
                        }, 2000);
                    }
                }, step.t);
            });
        }, 2200);
    }

    // Run animation when page loads
    if (phoneContainer) {
        runAnimation();
    }

    // 9. Image Protection (Disable Right-click & Drag on protected images)
    document.querySelectorAll('.protected-image').forEach(img => {
        // Prevent right-click context menu
        img.addEventListener('contextmenu', (e) => {
            e.preventDefault();
        });
        // Prevent dragging image
        img.addEventListener('dragstart', (e) => {
            e.preventDefault();
        });
    });
});
