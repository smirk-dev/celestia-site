
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

    // Add click handlers for both video and play button
    const handleClick = (e) => {
        e.preventDefault();
        openFullscreen();
    };

    showreelVideo.addEventListener('click', handleClick);
    playButton.addEventListener('click', handleClick);
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

        // Load arrow with multiple fallback methods
        this.loadArrowModel();
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

    loadArrowModel() {
        console.log('=== ARROW LOADING DEBUG START ===');
        console.log('Loading 3D arrow...');
        
        // First, create the geometric arrow (guaranteed to work)
        this.createAdvancedGeometricArrow();
        
        // Then try to load external model with detailed debugging
        setTimeout(() => {
            console.log('Attempting external model loading...');
            this.debugAndLoadExternalModel();
        }, 1000);
    }

    createAdvancedGeometricArrow() {
        console.log('Creating advanced geometric arrow');
        
        const arrowGroup = new THREE.Group();

        // High-quality arrow material
        const arrowMaterial = new THREE.MeshPhongMaterial({
            color: 0xFFFFFF,
            emissive: 0x4A73FF,
            emissiveIntensity: 0.25,
            shininess: 100,
            transparent: true,
            opacity: 0.95,
            side: THREE.DoubleSide
        });

        // Arrow shaft (main body)
        const shaftGeometry = new THREE.CylinderGeometry(0.04, 0.04, 1.8, 16);
        const shaft = new THREE.Mesh(shaftGeometry, arrowMaterial);
        shaft.rotation.z = Math.PI / 2;
        shaft.castShadow = true;
        arrowGroup.add(shaft);

        // Arrow head (pointed tip)
        const headGeometry = new THREE.ConeGeometry(0.15, 0.5, 16);
        const head = new THREE.Mesh(headGeometry, arrowMaterial);
        head.position.x = 1.15;
        head.rotation.z = -Math.PI / 2;
        head.castShadow = true;
        arrowGroup.add(head);

        // Arrow fletching (back feathers) - top
        const fletchGeometry = new THREE.ConeGeometry(0.06, 0.25, 8);
        const fletch1 = new THREE.Mesh(fletchGeometry, arrowMaterial);
        fletch1.position.set(-0.8, 0.08, 0);
        fletch1.rotation.z = Math.PI / 2;
        arrowGroup.add(fletch1);

        // Arrow fletching - bottom
        const fletch2 = new THREE.Mesh(fletchGeometry, arrowMaterial);
        fletch2.position.set(-0.8, -0.08, 0);
        fletch2.rotation.z = Math.PI / 2;
        arrowGroup.add(fletch2);

        // Arrow fletching - side (3D effect)
        const fletch3 = new THREE.Mesh(fletchGeometry, arrowMaterial);
        fletch3.position.set(-0.8, 0, 0.08);
        fletch3.rotation.x = Math.PI / 2;
        fletch3.rotation.z = Math.PI / 2;
        arrowGroup.add(fletch3);

        // Arrow nock (back end detail)
        const nockGeometry = new THREE.SphereGeometry(0.05, 12, 8);
        const nock = new THREE.Mesh(nockGeometry, arrowMaterial);
        nock.position.x = -0.9;
        arrowGroup.add(nock);

        // Add subtle glow effect
        const glowGeometry = new THREE.CylinderGeometry(0.08, 0.08, 1.8, 16);
        const glowMaterial = new THREE.MeshBasicMaterial({
            color: 0xFFFFFF,
            transparent: true,
            opacity: 0.2,
            side: THREE.DoubleSide
        });
        const glow = new THREE.Mesh(glowGeometry, glowMaterial);
        glow.rotation.z = Math.PI / 2;
        arrowGroup.add(glow);

        // Set scale and add to scene
        arrowGroup.scale.set(1.2, 1.2, 1.2);
        
        this.arrow = arrowGroup;
        this.scene.add(this.arrow);
        this.loaded = true;
        
        console.log('Advanced geometric arrow created and loaded successfully');
    }

    debugAndLoadExternalModel() {
        console.log('=== DEBUGGING EXTERNAL MODEL LOADING ===');
        
        // Check Three.js availability
        console.log('Three.js version:', THREE.REVISION);
        console.log('GLTFLoader available:', typeof THREE.GLTFLoader !== 'undefined');
        console.log('OBJLoader available:', typeof THREE.OBJLoader !== 'undefined');
        
        // Check file accessibility with fetch
        this.checkFileAccessibility('./assets/arrow.gltf')
            .then(() => {
                console.log('arrow.gltf is accessible, attempting GLTF load...');
                return this.tryLoadGLTF();
            })
            .catch((error) => {
                console.log('arrow.gltf not accessible:', error);
                console.log('Checking for arrow.obj...');
                return this.checkFileAccessibility('./assets/arrow.obj')
                    .then(() => this.tryLoadOBJ())
                    .catch(() => {
                        console.log('No external arrow files found or accessible');
                        this.createCustomArrowFromCode();
                    });
            })
            .catch((error) => {
                console.log('All external loading failed:', error);
                console.log('Using geometric arrow (which is already working)');
            });
    }

    async checkFileAccessibility(url) {
        try {
            console.log(`Checking if ${url} is accessible...`);
            const response = await fetch(url, { method: 'HEAD' });
            if (!response.ok) {
                throw new Error(`File not accessible: ${response.status} ${response.statusText}`);
            }
            console.log(`✅ ${url} is accessible`);
            return true;
        } catch (error) {
            console.log(`❌ ${url} is not accessible:`, error.message);
            throw error;
        }
    }

    createCustomArrowFromCode() {
        console.log('Creating a more detailed custom arrow from code...');
        
        // Remove current arrow
        if (this.arrow) {
            this.scene.remove(this.arrow);
        }
        
        // Create a very detailed arrow programmatically
        const arrowGroup = new THREE.Group();

        // Enhanced materials
        const mainMaterial = new THREE.MeshPhongMaterial({
            color: 0xFFFFFF,
            emissive: 0x2A5FFF,
            emissiveIntensity: 0.3,
            shininess: 120,
            transparent: true,
            opacity: 0.95
        });

        const accentMaterial = new THREE.MeshPhongMaterial({
            color: 0xFFFFFF,
            emissive: 0x6BFFFA,
            emissiveIntensity: 0.5,
            shininess: 150,
            transparent: true,
            opacity: 0.8
        });

        // Main shaft with segments for detail
        for (let i = 0; i < 5; i++) {
            const segmentGeometry = new THREE.CylinderGeometry(0.035 - i * 0.002, 0.035 - i * 0.002, 0.3, 12);
            const segment = new THREE.Mesh(segmentGeometry, mainMaterial);
            segment.position.set(-0.6 + i * 0.3, 0, 0);
            segment.rotation.z = Math.PI / 2;
            arrowGroup.add(segment);
        }

        // Detailed arrow head with multiple parts
        const headBase = new THREE.ConeGeometry(0.12, 0.4, 12);
        const headMesh = new THREE.Mesh(headBase, accentMaterial);
        headMesh.position.x = 1.0;
        headMesh.rotation.z = -Math.PI / 2;
        arrowGroup.add(headMesh);

        // Arrow tip
        const tipGeometry = new THREE.ConeGeometry(0.02, 0.15, 8);
        const tip = new THREE.Mesh(tipGeometry, accentMaterial);
        tip.position.x = 1.25;
        tip.rotation.z = -Math.PI / 2;
        arrowGroup.add(tip);

        // Multiple fletching for realism
        const fletchPositions = [
            { x: -0.7, y: 0.1, z: 0, rot: [0, 0, Math.PI / 2] },
            { x: -0.7, y: -0.1, z: 0, rot: [0, 0, Math.PI / 2] },
            { x: -0.7, y: 0, z: 0.1, rot: [Math.PI / 2, 0, Math.PI / 2] },
            { x: -0.7, y: 0, z: -0.1, rot: [-Math.PI / 2, 0, Math.PI / 2] }
        ];

        fletchPositions.forEach((pos, index) => {
            const fletchGeometry = new THREE.ConeGeometry(0.04, 0.2, 6);
            const fletch = new THREE.Mesh(fletchGeometry, mainMaterial);
            fletch.position.set(pos.x, pos.y, pos.z);
            fletch.rotation.set(pos.rot[0], pos.rot[1], pos.rot[2]);
            arrowGroup.add(fletch);
        });

        // Nock (back end)
        const nockGeometry = new THREE.SphereGeometry(0.04, 8, 6);
        const nock = new THREE.Mesh(nockGeometry, accentMaterial);
        nock.position.x = -0.85;
        arrowGroup.add(nock);

        // Glow effect rings
        for (let i = 0; i < 3; i++) {
            const glowGeometry = new THREE.RingGeometry(0.05 + i * 0.02, 0.07 + i * 0.02, 16);
            const glowMaterial = new THREE.MeshBasicMaterial({
                color: 0xFFFFFF,
                transparent: true,
                opacity: 0.3 - i * 0.1,
                side: THREE.DoubleSide
            });
            const glow = new THREE.Mesh(glowGeometry, glowMaterial);
            glow.position.x = 0.5 - i * 0.3;
            arrowGroup.add(glow);
        }

        // Set scale and add to scene
        arrowGroup.scale.set(50.9, 50.9, 50.9);
        
        this.arrow = arrowGroup;
        this.scene.add(this.arrow);
        
        console.log('✅ Detailed custom arrow created successfully');
        console.log('=== ARROW LOADING DEBUG END ===');
    }

    tryLoadGLTF() {
        return new Promise((resolve, reject) => {
            console.log('Attempting to load GLTF model...');
            
            // Check if we can dynamically load GLTFLoader
            if (typeof THREE.GLTFLoader === 'undefined') {
                // Try to load GLTFLoader dynamically
                const script = document.createElement('script');
                script.src = 'https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/loaders/GLTFLoader.js';
                script.onload = () => {
                    console.log('GLTFLoader loaded dynamically');
                    this.loadGLTFFile(resolve, reject);
                };
                script.onerror = () => {
                    console.log('Failed to load GLTFLoader dynamically');
                    reject('GLTFLoader not available');
                };
                document.head.appendChild(script);
            } else {
                this.loadGLTFFile(resolve, reject);
            }
        });
    }

    loadGLTFFile(resolve, reject) {
        const loader = new THREE.GLTFLoader();
        
        loader.load(
            './assets/arrow.gltf',
            (gltf) => {
                console.log('GLTF loaded successfully, replacing geometric arrow');
                
                // Remove geometric arrow
                if (this.arrow) {
                    this.scene.remove(this.arrow);
                }
                
                // Process GLTF model
                const object = gltf.scene;
                this.applyArrowMaterial(object);
                
                object.scale.set(50.5, 50.5, 50.5);
                this.arrow = object;
                this.scene.add(this.arrow);
                
                console.log('GLTF arrow loaded successfully');
                resolve(object);
            },
            (progress) => {
                if (progress.total > 0) {
                    const percent = Math.round((progress.loaded / progress.total) * 100);
                    console.log(`GLTF loading: ${percent}%`);
                }
            },
            (error) => {
                console.log('GLTF loading failed:', error);
                reject(error);
            }
        );
    }

    tryLoadOBJ() {
        return new Promise((resolve, reject) => {
            if (typeof THREE.OBJLoader === 'undefined') {
                console.log('OBJLoader not available');
                reject('OBJLoader not available');
                return;
            }
            
            console.log('Attempting to load OBJ model...');
            
            const loader = new THREE.OBJLoader();
            loader.load(
                './assets/arrow.obj',
                (object) => {
                    console.log('OBJ loaded successfully, replacing geometric arrow');
                    
                    // Remove geometric arrow
                    if (this.arrow) {
                        this.scene.remove(this.arrow);
                    }
                    
                    // Process OBJ model
                    this.applyArrowMaterial(object);
                    
                    object.scale.set(4.5, 4.5, 4.5);
                    this.arrow = object;
                    this.scene.add(this.arrow);
                    
                    console.log('OBJ arrow loaded successfully');
                    resolve(object);
                },
                undefined,
                (error) => {
                    console.log('OBJ loading failed:', error);
                    reject(error);
                }
            );
        });
    }

    applyArrowMaterial(object) {
        const arrowMaterial = new THREE.MeshPhongMaterial({
            color: 0xFFFFFF,
            emissive: 0x4A73FF,
            emissiveIntensity: 0.25,
            shininess: 100,
            transparent: true,
            opacity: 0.95
        });

        object.traverse((child) => {
            if (child.isMesh) {
                child.material = arrowMaterial;
                child.castShadow = true;
                child.receiveShadow = true;
                console.log('Applied material to mesh:', child.name || 'unnamed');
            }
        });
    }

    createFallbackArrow() {
        console.log('Creating fallback geometric arrow');
        
        // Create a simple arrow using basic geometry
        const arrowGroup = new THREE.Group();

        // Arrow material
        const arrowMaterial = new THREE.MeshPhongMaterial({
            color: 0xFFFFFF,
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
        // Improved mouse tracking for arrow pointing
        // Improved mouse tracking for arrow pointing
document.addEventListener('mousemove', (event) => {
    // Get mouse position relative to the viewport
    const rect = this.container.getBoundingClientRect();
    const containerCenterX = rect.left + rect.width / 2;
    const containerCenterY = rect.top + rect.height / 2;
    
    // Calculate direction from container center to mouse
    const deltaX = event.clientX - containerCenterX;
    const deltaY = event.clientY - containerCenterY;
    
    // Calculate angle to point arrow head toward cursor
    const angle = Math.atan2(deltaY, deltaX);
    
    // Set target rotation to point arrow head toward mouse
    // No need to subtract π - let the arrow point directly toward the cursor
    this.targetRotation.z = angle;
    
    // Add subtle 3D movement based on mouse position
    this.targetRotation.x = -deltaY * 0.0008;  // Slight pitch
    this.targetRotation.y = deltaX * 0.0005;   // Slight yaw
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
