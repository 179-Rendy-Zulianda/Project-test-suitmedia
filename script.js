// State Management
class AppState {
    constructor() {
        this.currentPage = 1;
        this.itemsPerPage = 10;
        this.sortBy = '-published_at';
        this.totalItems = 0;
        this.totalPages = 0;
        this.posts = [];
        this.isLoading = false;
    }

    updateState(newState) {
        Object.assign(this, newState);
        this.saveToLocalStorage();
    }

    loadFromLocalStorage() {
        const saved = localStorage.getItem('ideasAppState');
        if (saved) {
            const parsed = JSON.parse(saved);
            this.currentPage = parsed.currentPage || 1;
            this.itemsPerPage = parsed.itemsPerPage || 10;
            this.sortBy = parsed.sortBy || '-published_at';
        }
    }

    saveToLocalStorage() {
        localStorage.setItem('ideasAppState', JSON.stringify({
            currentPage: this.currentPage,
            itemsPerPage: this.itemsPerPage,
            sortBy: this.sortBy
        }));
    }
}

// API Service
class APIService {
    constructor() {
        this.baseURL = 'https://suitmedia-backend.suitdev.com/api/ideas';
    }

    async fetchPosts(page = 1, perPage = 10, sort = '-published_at') {
        // Coba beberapa metode berbeda
        const methods = [
            // Metode 1: GET dengan query parameters
            async () => {
                const params = new URLSearchParams({
                    'page[number]': page,
                    'page[size]': perPage,
                    'append[]': 'small_image',
                    'append[]': 'medium_image',
                    'sort': sort
                });
                return await fetch(`${this.baseURL}?${params}`, {
                    method: 'GET',
                    headers: {
                        'Accept': 'application/json'
                    }
                });
            },
            // Metode 2: POST dengan JSON
            async () => {
                const requestBody = {
                    'page[number]': page,
                    'page[size]': perPage,
                    'append[]': ['small_image', 'medium_image'],
                    'sort': sort
                };
                return await fetch(this.baseURL, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify(requestBody)
                });
            },
            // Metode 3: POST dengan form data
            async () => {
                const formData = new FormData();
                formData.append('page[number]', page);
                formData.append('page[size]', perPage);
                formData.append('append[]', 'small_image');
                formData.append('append[]', 'medium_image');
                formData.append('sort', sort);
                return await fetch(this.baseURL, {
                    method: 'POST',
                    body: formData
                });
            }
        ];

        let lastError = null;

        for (let i = 0; i < methods.length; i++) {
            try {
                const response = await methods[i]();
                
                if (response.ok) {
                    return await response.json();
                } else {
                    const errorData = await response.json().catch(() => ({}));
                    lastError = new Error(`Method ${i + 1} failed: ${response.status} - ${errorData.message || 'Unknown error'}`);
                    console.log(`Method ${i + 1} failed:`, response.status, errorData);
                }
            } catch (error) {
                lastError = new Error(`Method ${i + 1} error: ${error.message}`);
                console.log(`Method ${i + 1} error:`, error.message);
            }
        }

        throw lastError || new Error('All methods failed');
    }
}

// UI Components
class UIComponents {
    static createPostCard(post) {
        const card = document.createElement('div');
        card.className = 'post-card';
        
        const imageUrl = post.medium_image || post.small_image || '';
        const date = new Date(post.published_at).toLocaleDateString('en-US', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        }).toUpperCase();

        card.innerHTML = `
            <div class="post-image-container">
                <img 
                    src="${imageUrl}" 
                    alt="${post.title}" 
                    class="post-image lazy-image"
                    loading="lazy"
                    onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';"
                >
                <div class="image-placeholder" style="display:none; align-items:center; justify-content:center; height:100%; position:absolute; top:0; left:0; width:100%; background:#f5f5f5; color:#666; font-size:14px;">Image not available</div>
            </div>
            <div class="post-content">
                <div class="post-date">${date}</div>
                <h3 class="post-title">${post.title}</h3>
            </div>
        `;

        return card;
    }

    static createPagination(currentPage, totalPages) {
        const pagination = document.createElement('div');
        pagination.className = 'pagination';

        // First page button
        const firstBtn = document.createElement('button');
        firstBtn.className = 'pagination-button';
        firstBtn.innerHTML = '&laquo;&laquo;';
        firstBtn.disabled = currentPage === 1;
        firstBtn.onclick = () => app.goToPage(1);
        pagination.appendChild(firstBtn);

        // Previous page button
        const prevBtn = document.createElement('button');
        prevBtn.className = 'pagination-button';
        prevBtn.innerHTML = '&laquo;';
        prevBtn.disabled = currentPage === 1;
        prevBtn.onclick = () => app.goToPage(currentPage - 1);
        pagination.appendChild(prevBtn);

        // Page numbers
        const startPage = Math.max(1, currentPage - 2);
        const endPage = Math.min(totalPages, currentPage + 2);

        for (let i = startPage; i <= endPage; i++) {
            const pageBtn = document.createElement('button');
            pageBtn.className = `pagination-button ${i === currentPage ? 'active' : ''}`;
            pageBtn.textContent = i;
            pageBtn.onclick = () => app.goToPage(i);
            pagination.appendChild(pageBtn);
        }

        // Next page button
        const nextBtn = document.createElement('button');
        nextBtn.className = 'pagination-button';
        nextBtn.innerHTML = '&raquo;';
        nextBtn.disabled = currentPage === totalPages;
        nextBtn.onclick = () => app.goToPage(currentPage + 1);
        pagination.appendChild(nextBtn);

        // Last page button
        const lastBtn = document.createElement('button');
        lastBtn.className = 'pagination-button';
        lastBtn.innerHTML = '&raquo;&raquo;';
        lastBtn.disabled = currentPage === totalPages;
        lastBtn.onclick = () => app.goToPage(totalPages);
        pagination.appendChild(lastBtn);

        return pagination;
    }

    static updateShowingText(currentPage, itemsPerPage, totalItems) {
        const start = (currentPage - 1) * itemsPerPage + 1;
        const end = Math.min(currentPage * itemsPerPage, totalItems);
        const showingText = document.getElementById('showingText');
        showingText.textContent = `Showing ${start} - ${end} of ${totalItems}`;
    }
}

// Lazy Loading
class LazyLoader {
    constructor() {
        this.images = [];
        this.init();
    }

    init() {
        this.observeImages();
        window.addEventListener('scroll', this.throttle(this.observeImages.bind(this), 100));
    }

    observeImages() {
        const images = document.querySelectorAll('.lazy-image:not(.loaded)');
        images.forEach(img => {
            if (this.isInViewport(img)) {
                this.loadImage(img);
            }
        });
    }

    isInViewport(element) {
        const rect = element.getBoundingClientRect();
        return (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth)
        );
    }

    loadImage(img) {
        const src = img.getAttribute('data-src');
        if (src) {
            img.src = src;
            img.classList.add('loaded');
        }
    }

    throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        }
    }
}

// Header Scroll Effect
class HeaderScrollEffect {
    constructor() {
        this.header = document.getElementById('header');
        this.lastScrollY = window.scrollY;
        this.init();
    }

    init() {
        window.addEventListener('scroll', this.throttle(this.handleScroll.bind(this), 10));
    }

    handleScroll() {
        const currentScrollY = window.scrollY;
        
        // Hide/show header based on scroll direction
        if (currentScrollY > this.lastScrollY && currentScrollY > 100) {
            this.header.classList.add('hidden');
        } else {
            this.header.classList.remove('hidden');
        }

        // Add transparent effect when scrolled
        if (currentScrollY > 50) {
            this.header.classList.add('transparent');
        } else {
            this.header.classList.remove('transparent');
        }

        this.lastScrollY = currentScrollY;
    }

    throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        }
    }
}

// Efek parallax pada banner saat scroll
function initializeBannerParallax() {
    const bannerTitle = document.querySelector('.banner-title');
    const bannerSubtitle = document.querySelector('.banner-subtitle');
    window.addEventListener('scroll', () => {
        const scrollY = window.scrollY;
        bannerTitle.style.transform = `translateY(${scrollY * 0.3}px)`;
        bannerSubtitle.style.transform = `translateY(${scrollY * 0.15}px)`;
    });
}

// Main Application
class IdeasApp {
    constructor() {
        this.state = new AppState();
        this.api = new APIService();
        this.lazyLoader = new LazyLoader();
        this.headerEffect = new HeaderScrollEffect();
        
        this.init();
    }

    async init() {
        this.state.loadFromLocalStorage();
        this.setupEventListeners();
        await this.loadPosts();
    }

    setupEventListeners() {
        // Per page selector
        document.getElementById('perPage').addEventListener('change', (e) => {
            this.state.updateState({
                itemsPerPage: parseInt(e.target.value),
                currentPage: 1
            });
            this.loadPosts();
        });

        // Sort selector
        document.getElementById('sortBy').addEventListener('change', (e) => {
            this.state.updateState({
                sortBy: e.target.value,
                currentPage: 1
            });
            this.loadPosts();
        });

        // Set initial values
        document.getElementById('perPage').value = this.state.itemsPerPage;
        document.getElementById('sortBy').value = this.state.sortBy;
    }

    async loadPosts() {
        try {
            this.setLoading(true);
            
            const data = await this.api.fetchPosts(
                this.state.currentPage,
                this.state.itemsPerPage,
                this.state.sortBy
            );

            this.state.updateState({
                posts: data.data || [],
                totalItems: data.meta?.total || 0,
                totalPages: data.meta?.last_page || 1
            });

            this.renderPosts();
            this.renderPagination();
            this.updateShowingText();
            
        } catch (error) {
            console.error('Error loading posts:', error);
            let errorMessage = 'Gagal memuat data dari API. ';
            
            if (error.message.includes('405')) {
                errorMessage += 'API memerlukan komunikasi JSON.';
            } else if (error.message.includes('CORS')) {
                errorMessage += 'Masalah CORS. Gunakan local server atau browser extension.';
            } else if (error.message.includes('Failed to fetch')) {
                errorMessage += 'Tidak dapat terhubung ke API. Periksa koneksi internet.';
            } else {
                errorMessage += error.message;
            }
            
            this.showError(errorMessage);
        } finally {
            this.setLoading(false);
        }
    }

    renderPosts() {
        const postsGrid = document.getElementById('postsGrid');
        postsGrid.innerHTML = '';

        if (this.state.posts.length === 0) {
            postsGrid.innerHTML = '<p style="text-align: center; color: #666; grid-column: 1 / -1;">No posts found.</p>';
            return;
        }

        this.state.posts.forEach(post => {
            const card = UIComponents.createPostCard(post);
            postsGrid.appendChild(card);
        });

        // Reinitialize lazy loading for new images
        setTimeout(() => {
            this.lazyLoader.observeImages();
        }, 100);
    }

    renderPagination() {
        const paginationContainer = document.getElementById('pagination');
        paginationContainer.innerHTML = '';

        if (this.state.totalPages > 1) {
            const pagination = UIComponents.createPagination(
                this.state.currentPage,
                this.state.totalPages
            );
            paginationContainer.appendChild(pagination);
        }
    }

    updateShowingText() {
        UIComponents.updateShowingText(
            this.state.currentPage,
            this.state.itemsPerPage,
            this.state.totalItems
        );
    }

    async goToPage(page) {
        if (page >= 1 && page <= this.state.totalPages && page !== this.state.currentPage) {
            this.state.updateState({ currentPage: page });
            await this.loadPosts();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }

    setLoading(loading) {
        this.state.isLoading = loading;
        const spinner = document.getElementById('loadingSpinner');
        const postsGrid = document.getElementById('postsGrid');
        
        if (loading) {
            spinner.style.display = 'flex';
            postsGrid.style.opacity = '0.5';
        } else {
            spinner.style.display = 'none';
            postsGrid.style.opacity = '1';
        }
    }

    showError(message) {
        const postsGrid = document.getElementById('postsGrid');
        postsGrid.innerHTML = `
            <div style="text-align: center; color: #e74c3c; grid-column: 1 / -1; padding: 40px;">
                <p>${message}</p>
                <button onclick="app.loadPosts()" style="margin-top: 20px; padding: 10px 20px; background: #ff6b35; color: white; border: none; border-radius: 6px; cursor: pointer;">
                    Try Again
                </button>
            </div>
        `;
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    initializeBannerParallax();
    window.app = new IdeasApp();
}); 