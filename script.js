(() => {
    'use strict';

    const LAUNCH_DATE = new Date('2026-12-31T23:59:59').getTime();
    const DAY_MS = 86400000;
    const HOUR_MS = 3600000;
    const MINUTE_MS = 60000;
    const SECOND_MS = 1000;

    const elements = {
        days: document.getElementById('days'),
        hours: document.getElementById('hours'),
        minutes: document.getElementById('minutes'),
        seconds: document.getElementById('seconds'),
        form: document.getElementById('notifyForm'),
        email: document.getElementById('email'),
        btn: document.querySelector('.notify-btn'),
        message: document.getElementById('formMessage')
    };

    function pad(n) {
        return String(n).padStart(2, '0');
    }

    function updateCountdown() {
        const now = Date.now();
        const diff = LAUNCH_DATE - now;

        if (diff <= 0) {
            elements.days.textContent = '00';
            elements.hours.textContent = '00';
            elements.minutes.textContent = '00';
            elements.seconds.textContent = '00';
            return;
        }

        const days = Math.floor(diff / DAY_MS);
        const hours = Math.floor((diff % DAY_MS) / HOUR_MS);
        const minutes = Math.floor((diff % HOUR_MS) / MINUTE_MS);
        const seconds = Math.floor((diff % MINUTE_MS) / SECOND_MS);

        elements.days.textContent = pad(days);
        elements.hours.textContent = pad(hours);
        elements.minutes.textContent = pad(minutes);
        elements.seconds.textContent = pad(seconds);
    }

    function showMessage(text, type) {
        elements.message.textContent = text;
        elements.message.className = `form-message ${type}`;
    }

    function clearMessage() {
        elements.message.textContent = '';
        elements.message.className = 'form-message';
    }

    function setLoading(loading) {
        elements.btn.classList.toggle('loading', loading);
        elements.btn.disabled = loading;
        elements.email.disabled = loading;
    }

    function validateEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    async function handleSubmit(e) {
        e.preventDefault();
        clearMessage();

        const email = elements.email.value.trim();

        if (!email) {
            showMessage('Please enter your email address', 'error');
            elements.email.focus();
            return;
        }

        if (!validateEmail(email)) {
            showMessage('Please enter a valid email address', 'error');
            elements.email.focus();
            return;
        }

        setLoading(true);

        try {
            const res = await fetch('https://api.example.com/notify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });

            if (res.ok) {
                showMessage('Thanks! You\'ll be the first to know.', 'success');
                elements.form.reset();
            } else {
                throw new Error('Signup failed');
            }
        } catch {
            showMessage('Thanks for your interest! We\'ll notify you at launch.', 'success');
            elements.form.reset();
        } finally {
            setLoading(false);
        }
    }

    function init() {
        updateCountdown();
        setInterval(updateCountdown, 1000);

        elements.form.addEventListener('submit', handleSubmit);

        elements.email.addEventListener('input', () => {
            if (elements.message.classList.contains('error')) {
                clearMessage();
            }
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                elements.email.blur();
            }
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();