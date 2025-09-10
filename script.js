
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
        this.targetRotation = { x: 0, y: 0 };
        this.currentRotation = { x: 0, y: 0 };
        
        this.init();
        this.addEventListeners();
        this.animate();
    }

    init() {
        // Create container
        const container = document.getElementById('arrow-container');
        if (!container) return;

        // Scene setup
        this.scene = new THREE.Scene();
        
        // Camera setup
        this.camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
        this.camera.position.z = 5;

        // Renderer setup
        this.renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        this.renderer.setSize(250, 250);
        this.renderer.setClearColor(0x000000, 0);
        
        container.appendChild(this.renderer.domElement);

        // Load the actual arrow.obj file
        this.loadArrowModel();

        // Lighting
        const ambientLight = new THREE.AmbientLight(0x9AE6FF, 0.6);
        this.scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0x9AE6FF, 0.8);
        directionalLight.position.set(1, 1, 1);
        this.scene.add(directionalLight);
    }

    loadArrowModel() {
        // Check if GLTFLoader is available
        if (typeof THREE.GLTFLoader === 'undefined') {
            console.warn('GLTFLoader not available, falling back to geometry arrow');
            this.createArrowGeometry();
            return;
        }

        const loader = new THREE.GLTFLoader();
        loader.load(
            './assets/arrow.gltf',
            (gltf) => {
                const object = gltf.scene;
                
                // Material for the loaded model
                const arrowMaterial = new THREE.MeshPhongMaterial({ 
                    color: 0x9AE6FF,
                    emissive: 0x9AE6FF,
                    emissiveIntensity: 0.2,
                    shininess: 100
                });

                // Apply material to all meshes in the object
                object.traverse((child) => {
                    if (child.isMesh) {
                        child.material = arrowMaterial;
                    }
                });

                // Scale and position the arrow
                object.scale.set(2, 2, 2);
                object.position.set(0, 0, 0);
                
                this.arrow = object;
                this.scene.add(this.arrow);
            },
            (progress) => {
                console.log('Arrow loading progress: ', (progress.loaded / progress.total * 100) + '%');
            },
            (error) => {
                console.warn('Error loading arrow.gltf, falling back to geometry arrow:', error);
                this.createArrowGeometry();
            }
        );
    }

    createArrowGeometry() {
        // Create a simple arrow shape using geometry
        const arrowGroup = new THREE.Group();

        // Arrow shaft
        const shaftGeometry = new THREE.CylinderGeometry(0.1, 0.1, 2, 8);
        const arrowMaterial = new THREE.MeshPhongMaterial({ 
            color: 0x9AE6FF,
            emissive: 0x9AE6FF,
            emissiveIntensity: 0.2,
            shininess: 100
        });
        const shaft = new THREE.Mesh(shaftGeometry, arrowMaterial);
        shaft.rotation.z = Math.PI / 2; // Rotate to point right
        arrowGroup.add(shaft);

        // Arrow head
        const headGeometry = new THREE.ConeGeometry(0.3, 0.8, 8);
        const head = new THREE.Mesh(headGeometry, arrowMaterial);
        head.position.x = 1.4;
        head.rotation.z = -Math.PI / 2; // Point right
        arrowGroup.add(head);

        // Arrow fletching
        const fletchGeometry = new THREE.ConeGeometry(0.15, 0.4, 3);
        const fletch = new THREE.Mesh(fletchGeometry, arrowMaterial);
        fletch.position.x = -1.2;
        fletch.rotation.z = Math.PI / 2; // Point left
        arrowGroup.add(fletch);

        this.arrow = arrowGroup;
        this.arrow.scale.set(0.8, 0.8, 0.8);
        this.scene.add(this.arrow);
    }

    addEventListeners() {
        // Mouse move event
        document.addEventListener('mousemove', (event) => {
            // Convert mouse position to normalized coordinates (-1 to 1)
            this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
            this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
            
            // Calculate target rotation based on mouse position
            this.targetRotation.y = this.mouse.x * Math.PI * 0.3;
            this.targetRotation.x = this.mouse.y * Math.PI * 0.2;
        });

        // Handle window resize
        window.addEventListener('resize', () => {
            if (this.camera && this.renderer) {
                this.renderer.setSize(250, 250);
            }
        });
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        
        if (this.arrow) {
            // Smooth rotation interpolation
            this.currentRotation.x += (this.targetRotation.x - this.currentRotation.x) * 0.05;
            this.currentRotation.y += (this.targetRotation.y - this.currentRotation.y) * 0.05;
            
            this.arrow.rotation.x = this.currentRotation.x;
            this.arrow.rotation.y = this.currentRotation.y;
            
            // Add a subtle floating animation
            this.arrow.position.y = Math.sin(Date.now() * 0.001) * 0.1;
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
