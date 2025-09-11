// Set current year in footer
document.getElementById('year').textContent = new Date().getFullYear();

// Custom Glowing Cursor
class CustomCursor {
    constructor() {
        this.cursor = null;
        this.cursorX = 0;
        this.cursorY = 0;
        this.targetX = 0;
        this.targetY = 0;
        this.animationId = null;
        this.init();
    }

    init() {
        // Create cursor element
        this.cursor = document.createElement('div');
        this.cursor.className = 'custom-cursor';
        document.body.appendChild(this.cursor);

        // Use RAF for smooth tracking
        this.animate();

        // Track mouse movement with throttling
        let ticking = false;
        document.addEventListener('mousemove', (e) => {
            if (!ticking) {
                requestAnimationFrame(() => {
                    this.targetX = e.clientX;
                    this.targetY = e.clientY;
                    ticking = false;
                });
                ticking = true;
            }
        });

        // Add hover effects for interactive elements
        const updateInteractiveElements = () => {
            const interactiveElements = document.querySelectorAll('a, button, .nav-link, .showreel-video, [role="button"], input, textarea');
            
            interactiveElements.forEach(el => {
                el.addEventListener('mouseenter', () => {
                    this.cursor.classList.add('hover');
                });
                
                el.addEventListener('mouseleave', () => {
                    this.cursor.classList.remove('hover');
                });
            });
        };

        // Initial setup and observe for dynamic elements
        updateInteractiveElements();
        
        // Use MutationObserver for dynamically added elements
        const observer = new MutationObserver(updateInteractiveElements);
        observer.observe(document.body, { childList: true, subtree: true });

        // Hide cursor when leaving window
        document.addEventListener('mouseleave', () => {
            this.cursor.style.opacity = '0';
        });

        document.addEventListener('mouseenter', () => {
            this.cursor.style.opacity = '1';
        });

        // Handle page visibility
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.cursor.style.opacity = '0';
            } else {
                this.cursor.style.opacity = '1';
            }
        });
    }

    animate() {
        // Smooth lerp animation for cursor position
        const lerp = (start, end, factor) => start + (end - start) * factor;
        
        this.cursorX = lerp(this.cursorX, this.targetX, 0.15);
        this.cursorY = lerp(this.cursorY, this.targetY, 0.15);
        
        // Use transform for better performance
        this.cursor.style.transform = `translate3d(${this.cursorX}px, ${this.cursorY}px, 0) translate(-50%, -50%)`;
        
        this.animationId = requestAnimationFrame(() => this.animate());
    }

    destroy() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        if (this.cursor) {
            this.cursor.remove();
        }
    }
}

// Initialize custom cursor when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new CustomCursor();
});

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
    const playButton = document.getElementById('play-button');
    const videoContainer = document.querySelector('.video-container');
    
    if (!showreelVideo || !playButton) return;

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

    // Function to open fullscreen
    const openFullscreen = () => {
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
    };

    // Add click handlers with proper event handling
    const handleClick = (e) => {
        e.preventDefault();
        e.stopPropagation(); // Prevent event bubbling
        openFullscreen();
    };

    // Only attach to the video container (parent element)
    // This will handle clicks on video, play button, and container
    videoContainer.addEventListener('click', handleClick);

    // Show/hide play button based on video state
    const updatePlayButton = () => {
        if (showreelVideo.paused) {
            playButton.classList.remove('hidden');
        } else {
            playButton.classList.add('hidden');
        }
    };

    // Listen for video state changes
    showreelVideo.addEventListener('play', updatePlayButton);
    showreelVideo.addEventListener('pause', updatePlayButton);
    showreelVideo.addEventListener('loadeddata', updatePlayButton);

    // Initial state
    updatePlayButton();

    // Add hover cursor pointer
    showreelVideo.style.cursor = 'pointer';
    videoContainer.style.cursor = 'pointer';
}

// Initialize fullscreen video when DOM is loaded
document.addEventListener('DOMContentLoaded', initFullscreenVideo);

// Interactive 3D Arrow using Three.js - FIXED VERSION
class InteractiveArrow {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.arrow = null;
        this.mouse = { x: 0, y: 0 };
        this.container = null;
        this.loaded = false;
        this.raycaster = new THREE.Raycaster();
        this.mouseVector = new THREE.Vector2();
        
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

        // Create the arrow immediately
        this.createArrow();
    }

    setupLighting() {
        // Ambient light for general illumination
        const ambientLight = new THREE.AmbientLight(0x6BFFFA, 0.4);
        this.scene.add(ambientLight);

        // Directional light for highlights
        const directionalLight = new THREE.DirectionalLight(0x6BFFFA, 0.8);
        directionalLight.position.set(5, 5, 5);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 1024;
        directionalLight.shadow.mapSize.height = 1024;
        this.scene.add(directionalLight);

        // Point light for glow effect
        const pointLight = new THREE.PointLight(0x6BFFFA, 0.6, 10);
        pointLight.position.set(2, 2, 2);
        this.scene.add(pointLight);
    }

    createArrow() {
        console.log('Loading 3D arrow model');
        
        // Try GLTF first, then fallback to OBJ, then simple geometry
        const gltfLoader = new THREE.GLTFLoader();
        
        gltfLoader.load('./assets/arrow.gltf', 
            (gltf) => {
                this.arrow = gltf.scene;
                this.setupArrowMaterial();
                this.setupArrowTransform();
                this.scene.add(this.arrow);
                this.loaded = true;
                console.log('GLTF arrow loaded successfully');
            },
            (progress) => {
                console.log('Loading GLTF progress:', (progress.loaded / progress.total * 100) + '%');
            },
            (error) => {
                console.warn('GLTF failed, trying OBJ:', error);
                this.loadObjArrow();
            }
        );
    }

    loadObjArrow() {
        const objLoader = new THREE.OBJLoader();
        
        objLoader.load('./assets/arrow.obj',
            (object) => {
                this.arrow = object;
                this.setupArrowMaterial();
                this.setupArrowTransform();
                this.scene.add(this.arrow);
                this.loaded = true;
                console.log('OBJ arrow loaded successfully');
            },
            (progress) => {
                console.log('Loading OBJ progress:', (progress.loaded / progress.total * 100) + '%');
            },
            (error) => {
                console.warn('OBJ failed, using fallback geometry:', error);
                this.createFallbackArrow();
            }
        );
    }

    setupArrowMaterial() {
        // Set the arrow material to white with cyan glow
        this.arrow.traverse((child) => {
            if (child.isMesh) {
                child.material = new THREE.MeshPhongMaterial({
                    color: 0xFFFFFF,
                    emissive: 0x6BFFFA,
                    emissiveIntensity: 0.15,
                    shininess: 100,
                    transparent: true,
                    opacity: 0.95
                });
                child.castShadow = true;
            }
        });
    }

    setupArrowTransform() {
        // Scale the arrow appropriately
        this.arrow.scale.set(0.5, 0.5, 0.5);
        
        // Tilt the arrow 10 degrees towards the right
        this.arrow.rotation.z = -Math.PI / 18; // -10 degrees in radians
        
        // Position the arrow
        this.arrow.position.set(0, 0, 0);
    }

    createFallbackArrow() {
        console.log('Creating fallback arrow');
        
        const arrowGroup = new THREE.Group();

        // Simple arrow geometry as fallback
        const arrowMaterial = new THREE.MeshPhongMaterial({
            color: 0xFFFFFF,
            emissive: 0x6BFFFA,
            emissiveIntensity: 0.15,
            shininess: 100,
            transparent: true,
            opacity: 0.95
        });

        // Arrow shaft
        const shaftGeometry = new THREE.CylinderGeometry(0.04, 0.04, 1.8, 16);
        const shaft = new THREE.Mesh(shaftGeometry, arrowMaterial);
        shaft.rotation.z = Math.PI / 2;
        shaft.castShadow = true;
        arrowGroup.add(shaft);

        // Arrow head
        const headGeometry = new THREE.ConeGeometry(0.15, 0.5, 16);
        const head = new THREE.Mesh(headGeometry, arrowMaterial);
        head.position.x = 1.15;
        head.rotation.z = -Math.PI / 2;
        head.castShadow = true;
        arrowGroup.add(head);

        // Set scale and add to scene
        arrowGroup.scale.set(1.2, 1.2, 1.2);
        
        this.arrow = arrowGroup;
        this.scene.add(this.arrow);
        this.loaded = true;
        
        console.log('Fallback arrow created successfully');
    }

    addEventListeners() {
        // Improved mouse tracking for arrow pointing
        document.addEventListener('mousemove', (event) => {
            if (!this.arrow || !this.loaded) return;

            // Get container bounds
            const rect = this.container.getBoundingClientRect();
            
            // Calculate mouse position relative to the container
            const mouseX = event.clientX - rect.left - rect.width / 2;
            const mouseY = event.clientY - rect.top - rect.height / 2;
            
            // Convert to normalized coordinates
            this.mouseVector.x = (mouseX / (rect.width / 2));
            this.mouseVector.y = -(mouseY / (rect.height / 2));
            
            // Calculate angle for arrow to point towards cursor
            const angle = Math.atan2(this.mouseVector.y, this.mouseVector.x);
            
            // Update arrow rotation to point towards mouse
            if (this.arrow) {
                this.arrow.rotation.z = angle;
                
                // Add slight tilt based on mouse position for more dynamic effect
                this.arrow.rotation.x = this.mouseVector.y * 0.2;
                this.arrow.rotation.y = this.mouseVector.x * 0.1;
            }
        });

        // Handle window resize
        window.addEventListener('resize', () => {
            if (this.renderer) {
                this.renderer.setSize(250, 250);
                this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
            }
        });

        // Handle mouse enter/leave for container
        this.container.addEventListener('mouseenter', () => {
            if (this.arrow) {
                // Scale up slightly on hover
                this.arrow.scale.setScalar(1.3);
            }
        });

        this.container.addEventListener('mouseleave', () => {
            if (this.arrow) {
                // Reset scale and rotation when mouse leaves
                this.arrow.scale.setScalar(1.2);
                this.arrow.rotation.set(0, 0, 0);
            }
        });
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        
        if (this.arrow && this.loaded) {
            // Add subtle floating animation
            const time = Date.now() * 0.002;
            this.arrow.position.y = Math.sin(time) * 0.05;
            this.arrow.position.x = Math.cos(time * 0.7) * 0.02;
            
            // Removed automatic rotation - arrow now only rotates based on mouse movement
        }
        
        if (this.renderer && this.scene && this.camera) {
            this.renderer.render(this.scene, this.camera);
        }
    }

    destroy() {
        if (this.renderer) {
            this.renderer.dispose();
        }
        if (this.container && this.renderer.domElement) {
            this.container.removeChild(this.renderer.domElement);
        }
    }
}

// Initialize the interactive arrow when the page loads
window.addEventListener('load', () => {
    // Check if Three.js is loaded
    if (typeof THREE !== 'undefined') {
        console.log('Initializing Interactive 3D Arrow...');
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
    if (navbar) {
        if (window.scrollY > 100) {
            navbar.style.background = 'rgba(14, 15, 18, 0.95)';
        } else {
            navbar.style.background = 'transparent';
        }
    }
});

// Cursor glow effect
document.addEventListener('mousemove', (e) => {
    let cursor = document.querySelector('.cursor-glow');
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
        cursor = glowDiv;
    }
    
    cursor.style.left = (e.clientX - 10) + 'px';
    cursor.style.top = (e.clientY - 10) + 'px';
});