
// Set current year in footer
document.getElementById('year').textContent = new Date().getFullYear();

// Mobile navigation toggle
const hamburger = document.getElementById('hamburger');
const navLeft = document.querySelector('.nav-left');
const navRight = document.querySelector('.nav-right');

if (hamburger && navLeft && navRight) {
    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navLeft.classList.toggle('active');
        navRight.classList.toggle('active');
    });

    // Close mobile menu when clicking on a link
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            hamburger.classList.remove('active');
            navLeft.classList.remove('active');
            navRight.classList.remove('active');
        });
    });
}

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Fullscreen video functionality for showreel
function initFullscreenVideo() {
    const showreelVideo = document.querySelector('.showreel-video');
    if (!showreelVideo) return;

    // Create fullscreen overlay
    const createFullscreenOverlay = () => {
        const overlay = document.createElement('div');
        overlay.className = 'fullscreen-video-overlay';
        overlay.innerHTML = `
            <div class="fullscreen-video-container">
                <video class="fullscreen-video" controls autoplay>
                    <source src="./assets/showreel.mp4" type="video/mp4">
                </video>
                <button class="close-fullscreen">×</button>
            </div>
        `;
        document.body.appendChild(overlay);
        return overlay;
    };

    // Add click handler to showreel video
    showreelVideo.addEventListener('click', (e) => {
        e.preventDefault();
        const overlay = createFullscreenOverlay();
        const fullscreenVideo = overlay.querySelector('.fullscreen-video');
        const closeBtn = overlay.querySelector('.close-fullscreen');

        // Set video time to match the clicked video
        fullscreenVideo.currentTime = showreelVideo.currentTime;
        
        // Show overlay
        overlay.style.display = 'flex';
        document.body.style.overflow = 'hidden';

        // Close functionality
        const closeFullscreen = () => {
            // Update original video time before closing
            showreelVideo.currentTime = fullscreenVideo.currentTime;
            overlay.remove();
            document.body.style.overflow = 'auto';
        };

        closeBtn.addEventListener('click', closeFullscreen);
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) closeFullscreen();
        });

        // ESC key to close
        const handleKeydown = (e) => {
            if (e.key === 'Escape') {
                closeFullscreen();
                document.removeEventListener('keydown', handleKeydown);
            }
        };
        document.addEventListener('keydown', handleKeydown);
    });

    // Add hover cursor pointer
    showreelVideo.style.cursor = 'pointer';
}

// Initialize fullscreen video when DOM is loaded
document.addEventListener('DOMContentLoaded', initFullscreenVideo);

// Interactive 3D Arrow using Three.js
class InteractiveArrow {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.arrow = null;
        this.mouse = { x: 0, y: 0 };
        this.targetRotation = { x: 0, y: 0, z: 0 };
        this.currentRotation = { x: 0, y: 0, z: 0 };
        this.container = null;
        this.loaded = false;
        
        this.init();
        this.addEventListeners();
        this.animate();
    }

    init() {
        // Create container
        this.container = document.getElementById('arrow-container');
        if (!this.container) {
            console.error('Arrow container not found');
            return;
        }

        // Scene setup
        this.scene = new THREE.Scene();
        
        // Camera setup
        this.camera = new THREE.PerspectiveCamera(45, 1, 0.1, 1000);
        this.camera.position.set(0, 0, 8);

        // Renderer setup
        this.renderer = new THREE.WebGLRenderer({ 
            alpha: true, 
            antialias: true,
            powerPreference: "high-performance"
        });
        this.renderer.setSize(250, 250);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.setClearColor(0x000000, 0);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        
        this.container.appendChild(this.renderer.domElement);

        // Add lighting
        this.setupLighting();

        // Load the arrow model
        this.loadArrowModel();
    }

    setupLighting() {
        // Ambient light for general illumination
        const ambientLight = new THREE.AmbientLight(0x9AE6FF, 0.4);
        this.scene.add(ambientLight);

        // Directional light for highlights
        const directionalLight = new THREE.DirectionalLight(0x9AE6FF, 0.8);
        directionalLight.position.set(5, 5, 5);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 1024;
        directionalLight.shadow.mapSize.height = 1024;
        this.scene.add(directionalLight);

        // Point light for glow effect
        const pointLight = new THREE.PointLight(0x9AE6FF, 0.6, 10);
        pointLight.position.set(2, 2, 2);
        this.scene.add(pointLight);
    }

    loadArrowModel() {
        // Check if GLTFLoader is available
        if (typeof THREE.GLTFLoader === 'undefined') {
            console.warn('GLTFLoader not available, creating fallback arrow');
            this.createFallbackArrow();
            return;
        }

        const loader = new THREE.GLTFLoader();
        
        console.log('Loading arrow.gltf...');
        
        loader.load(
            './assets/arrow.gltf',
            (gltf) => {
                console.log('Arrow GLTF loaded successfully:', gltf);
                
                this.arrow = gltf.scene;
                
                // Apply glowing material to all meshes
                const glowMaterial = new THREE.MeshPhongMaterial({
                    color: 0x9AE6FF,
                    emissive: 0x4A73FF,
                    emissiveIntensity: 0.3,
                    shininess: 100,
                    transparent: true,
                    opacity: 0.9
                });

                this.arrow.traverse((child) => {
                    if (child.isMesh) {
                        child.material = glowMaterial;
                        child.castShadow = true;
                        child.receiveShadow = true;
                    }
                });

                // Scale and position the arrow
                this.arrow.scale.set(1.5, 1.5, 1.5);
                this.arrow.position.set(0, 0, 0);
                
                // Add to scene
                this.scene.add(this.arrow);
                this.loaded = true;
                
                console.log('Arrow added to scene');
            },
            (progress) => {
                const percent = Math.round((progress.loaded / progress.total) * 100);
                console.log(`Arrow loading: ${percent}%`);
            },
            (error) => {
                console.error('Error loading arrow.gltf:', error);
                console.log('Creating fallback arrow instead');
                this.createFallbackArrow();
            }
        );
    }

    createFallbackArrow() {
        console.log('Creating fallback geometric arrow');
        
        // Create a simple arrow using basic geometry
        const arrowGroup = new THREE.Group();

        // Arrow material
        const arrowMaterial = new THREE.MeshPhongMaterial({
            color: 0x9AE6FF,
            emissive: 0x4A73FF,
            emissiveIntensity: 0.2,
            shininess: 100,
            transparent: true,
            opacity: 0.9
        });

        // Arrow shaft
        const shaftGeometry = new THREE.CylinderGeometry(0.05, 0.05, 2, 12);
        const shaft = new THREE.Mesh(shaftGeometry, arrowMaterial);
        shaft.rotation.z = Math.PI / 2;
        arrowGroup.add(shaft);

        // Arrow head
        const headGeometry = new THREE.ConeGeometry(0.2, 0.6, 12);
        const head = new THREE.Mesh(headGeometry, arrowMaterial);
        head.position.x = 1.3;
        head.rotation.z = -Math.PI / 2;
        arrowGroup.add(head);

        // Arrow fletching
        const fletchGeometry = new THREE.ConeGeometry(0.1, 0.3, 8);
        const fletch1 = new THREE.Mesh(fletchGeometry, arrowMaterial);
        fletch1.position.set(-1.0, 0.1, 0);
        fletch1.rotation.z = Math.PI / 2;
        arrowGroup.add(fletch1);

        const fletch2 = new THREE.Mesh(fletchGeometry, arrowMaterial);
        fletch2.position.set(-1.0, -0.1, 0);
        fletch2.rotation.z = Math.PI / 2;
        arrowGroup.add(fletch2);

        this.arrow = arrowGroup;
        this.arrow.scale.set(1, 1, 1);
        this.scene.add(this.arrow);
        this.loaded = true;
        
        console.log('Fallback arrow created and added to scene');
    }

    addEventListeners() {
        // Improved mouse tracking
        document.addEventListener('mousemove', (event) => {
            // Get mouse position relative to the viewport
            const rect = this.container.getBoundingClientRect();
            const containerCenterX = rect.left + rect.width / 2;
            const containerCenterY = rect.top + rect.height / 2;
            
            // Calculate direction from container center to mouse
            const deltaX = event.clientX - containerCenterX;
            const deltaY = event.clientY - containerCenterY;
            
            // Normalize the values
            this.mouse.x = deltaX / (window.innerWidth / 2);
            this.mouse.y = deltaY / (window.innerHeight / 2);
            
            // Calculate target rotations with improved sensitivity
            this.targetRotation.y = this.mouse.x * Math.PI * 0.5; // Horizontal rotation
            this.targetRotation.x = -this.mouse.y * Math.PI * 0.3; // Vertical rotation
            
            // Add slight roll for more dynamic movement
            this.targetRotation.z = this.mouse.x * Math.PI * 0.1;
        });

        // Handle window resize
        window.addEventListener('resize', () => {
            if (this.renderer) {
                this.renderer.setSize(250, 250);
                this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
            }
        });
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        
        if (this.arrow && this.loaded) {
            // Smooth rotation interpolation with easing
            const easingFactor = 0.08;
            
            this.currentRotation.x += (this.targetRotation.x - this.currentRotation.x) * easingFactor;
            this.currentRotation.y += (this.targetRotation.y - this.currentRotation.y) * easingFactor;
            this.currentRotation.z += (this.targetRotation.z - this.currentRotation.z) * easingFactor;
            
            this.arrow.rotation.x = this.currentRotation.x;
            this.arrow.rotation.y = this.currentRotation.y;
            this.arrow.rotation.z = this.currentRotation.z;
            
            // Add subtle floating animation
            const time = Date.now() * 0.002;
            this.arrow.position.y = Math.sin(time) * 0.1;
            this.arrow.position.x = Math.cos(time * 0.7) * 0.05;
        }
        
        if (this.renderer && this.scene && this.camera) {
            this.renderer.render(this.scene, this.camera);
        }
    }
}

// Initialize the interactive arrow when the page loads
window.addEventListener('load', () => {
    // Check if Three.js is loaded
    if (typeof THREE !== 'undefined') {
        new InteractiveArrow();
    } else {
        console.warn('Three.js not loaded. 3D arrow will not be displayed.');
    }
});

// Intersection Observer for scroll animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('animate-in');
        }
    });
}, observerOptions);

// Observe elements for animations
document.addEventListener('DOMContentLoaded', () => {
    const elementsToObserve = document.querySelectorAll('.agency-section, .showreel-section, .services-section, .service-card');
    elementsToObserve.forEach(el => observer.observe(el));
});

// Add CSS for scroll animations
const style = document.createElement('style');
style.textContent = `
    .agency-section,
    .showreel-section,
    .services-section,
    .service-card {
        opacity: 0;
        transform: translateY(30px);
        transition: opacity 0.8s ease, transform 0.8s ease;
    }
    
    .animate-in {
        opacity: 1 !important;
        transform: translateY(0) !important;
    }
    
    .service-card:nth-child(1) { transition-delay: 0.1s; }
    .service-card:nth-child(2) { transition-delay: 0.2s; }
    .service-card:nth-child(3) { transition-delay: 0.3s; }
`;
document.head.appendChild(style);

// Video handling
document.addEventListener('DOMContentLoaded', () => {
    const videos = document.querySelectorAll('video');
    
    videos.forEach(video => {
        // Add loading states
        video.addEventListener('loadstart', () => {
            video.style.opacity = '0.5';
        });
        
        video.addEventListener('canplay', () => {
            video.style.opacity = '1';
        });
        
        // Handle autoplay issues
        video.addEventListener('loadedmetadata', () => {
            if (video.autoplay && video.muted) {
                video.play().catch(e => {
                    console.log('Autoplay prevented:', e);
                });
            }
        });
    });
});

// Enhanced navbar background on scroll
window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 100) {
        navbar.style.background = 'rgba(14, 15, 18, 0.95)';
    } else {
        navbar.style.background = 'transparent';
    }
});

// Cursor glow effect
document.addEventListener('mousemove', (e) => {
    const cursor = document.querySelector('.cursor-glow');
    if (!cursor) {
        const glowDiv = document.createElement('div');
        glowDiv.className = 'cursor-glow';
        glowDiv.style.cssText = `
            position: fixed;
            width: 20px;
            height: 20px;
            background: radial-gradient(circle, rgba(154, 230, 255, 0.3) 0%, transparent 70%);
            border-radius: 50%;
            pointer-events: none;
            z-index: 9999;
            transition: transform 0.1s ease;
        `;
        document.body.appendChild(glowDiv);
    }
    
    const glow = document.querySelector('.cursor-glow');
    if (glow) {
        glow.style.left = (e.clientX - 10) + 'px';
        glow.style.top = (e.clientY - 10) + 'px';
    }
});
