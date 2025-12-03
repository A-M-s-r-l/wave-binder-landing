document.addEventListener('DOMContentLoaded', () => {
    const container = document.querySelector('.gradients-container');

    const sphereCount = 10; // Number of spheres
    const minSize = 400;
    const maxSize = 800;
    const colors = ['var(--gradient-1)', 'var(--gradient-2)', 'var(--gradient-3)'];

    const gradientBg = document.getElementById('gradient-bg');
    const pageHeight = Math.max(document.body.scrollHeight, window.innerHeight);
    gradientBg.style.height = pageHeight + 'px';

    // Define spawn ranges
    const X_RANGE = [-400, window.innerWidth + 400];
    const Y_RANGE = [-800, pageHeight];
    const MOVE_RANGE = 1000;

    for (let i = 0; i < sphereCount; i++) {
        const sphere = document.createElement('div');
        sphere.classList.add('gradient-sphere');

        // Random size
        const size = Math.floor(Math.random() * (maxSize - minSize)) + minSize;
        sphere.style.width = `${size}px`;
        sphere.style.height = `${size}px`;

        // Gradient blending to bg-color
        const color = colors[Math.floor(Math.random() * colors.length)];
        sphere.style.background = `radial-gradient(circle at center, ${color} 0%, var(--bg-color) 90%)`;

        // Random spawn in ranges
        const startX = X_RANGE[0] + Math.random() * (X_RANGE[1] - X_RANGE[0] - size);
        const startY = Y_RANGE[0] + Math.random() * (Y_RANGE[1] - Y_RANGE[0] - size);
        sphere.style.left = `${startX}px`;
        sphere.style.top = `${startY}px`;

        container.appendChild(sphere);

        // Each sphere gets its own random phase
        const phaseX = Math.random() * Math.PI * 2;
        const phaseY = Math.random() * Math.PI * 2;

        // Animate drifting
        animateSphereDrift(sphere, startX, startY, MOVE_RANGE, phaseX, phaseY);
    }

    function animateSphereDrift(el, baseX, baseY, range, phaseX, phaseY) {
        const speed = 0.1; // Radians per second
        function step(timestamp) {
            const t = timestamp / 1000; // convert ms → s
            const offsetX = Math.sin(t * speed + phaseX) * range;
            const offsetY = Math.cos(t * speed + phaseY) * range;
            el.style.transform = `translate(${offsetX}px, ${offsetY}px)`;
            requestAnimationFrame(step);
        }
        requestAnimationFrame(step);
    }

    // Update height on resize
    window.addEventListener('resize', () => {
        const newHeight = Math.max(document.body.scrollHeight, window.innerHeight);
        gradientBg.style.height = newHeight + 'px';
    });
});
