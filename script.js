// ===============================
// ABYSS BACKGROUND
// ===============================

const page = document.querySelector(".page");

// Create particle container
const abyss = document.createElement("div");
abyss.className = "abyss-background";
abyss.setAttribute("aria-hidden", "true");

page.prepend(abyss);

// --------------------------------
// Floating abyss particles
// --------------------------------

const particleCount = window.innerWidth < 600 ? 45 : 80;

for (let i = 0; i < particleCount; i++) {
    const particle = document.createElement("span");

    particle.className = "abyss-particle";

    const size = Math.random() * 3 + 1;
    const x = Math.random() * 100;
    const y = Math.random() * 100;
    const duration = Math.random() * 15 + 10;
    const delay = Math.random() * -20;
    const drift = (Math.random() - 0.5) * 120;

    particle.style.width = `${size}px`;
    particle.style.height = `${size}px`;
    particle.style.left = `${x}%`;
    particle.style.top = `${y}%`;

    particle.style.setProperty("--drift", `${drift}px`);
    particle.style.animationDuration = `${duration}s`;
    particle.style.animationDelay = `${delay}s`;

    abyss.appendChild(particle);
}


// --------------------------------
// Random glowing eyes
// --------------------------------

const eyeCount = window.innerWidth < 600 ? 2 : 4;

for (let i = 0; i < eyeCount; i++) {
    const eyes = document.createElement("div");

    eyes.className = "abyss-eyes";

    eyes.style.left = `${10 + Math.random() * 80}%`;
    eyes.style.top = `${15 + Math.random() * 65}%`;

    eyes.style.animationDelay = `${Math.random() * 8}s`;

    abyss.appendChild(eyes);
}


// --------------------------------
// Mouse movement
// --------------------------------

let mouseX = 0;
let mouseY = 0;

window.addEventListener("mousemove", (event) => {
    mouseX = (event.clientX / window.innerWidth - 0.5) * 2;
    mouseY = (event.clientY / window.innerHeight - 0.5) * 2;

    document.documentElement.style.setProperty(
        "--mouse-x",
        `${mouseX * 20}px`
    );

    document.documentElement.style.setProperty(
        "--mouse-y",
        `${mouseY * 20}px`
    );
});


// --------------------------------
// Occasional abyss pulse
// --------------------------------

setInterval(() => {
    abyss.classList.add("abyss-pulse");

    setTimeout(() => {
        abyss.classList.remove("abyss-pulse");
    }, 1200);

}, 7000);