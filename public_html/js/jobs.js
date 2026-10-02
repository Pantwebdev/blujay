/**
 * Job Portal Frontend Logic
 * Handles All Jobs and Company-wise views with backend API integration
 */

// State Management
const state = {
    viewMode: 'jobs', // 'jobs' or 'companies'
    selectedCompany: null,
    jobCache: {}, // { "companyKey": jobsArray }
    currentPage: 1,
    itemsPerPage: 10,
    filters: {
        search: '',
        jobTypes: [],
        location: '',
        date: ''
    }
};

// API Configuration
const API_BASE = window.API_CONFIG ? window.API_CONFIG.getApiUrl() : '/api';

// DOM Elements
const elements = {
    allJobsBtn: document.getElementById('toggle-all-jobs'),
    companiesBtn: document.getElementById('toggle-companies'),
    searchInput: document.getElementById('main-search-input'),
    heroSearchInput: document.getElementById('search-input'),
    heroSearchBtn: document.getElementById('search-btn'),
    jobsGrid: document.getElementById('jobs-grid'),
    companiesGrid: document.getElementById('companies-view'),
    resultsCount: document.getElementById('results-count-dynamic'),
    jobTypeCheckboxes: document.getElementsByName('jobType'),
    locationSelect: document.getElementById('filter-location'),
    dateSelect: document.getElementById('filter-date'),
    resetBtn: document.getElementById('reset-filters'),
    mobileTypeSelect: document.getElementById('filter-type-mobile'),
    mobileRemoteSelect: document.getElementById('filter-remote-mobile'),
    mobileApplyBtn: document.getElementById('apply-filters-mobile'),
    emptyClearBtn: document.getElementById('clear-filters-btn')
};

/**
 * Initialize App
 */
document.addEventListener('DOMContentLoaded', () => {
    initEventListeners();
    fetchData(); // Load default view (All Jobs)
    updateStats(); // Initial stats load
});

/**
 * Event Listeners
 */
function initEventListeners() {
    // View Toggling
    elements.allJobsBtn?.addEventListener('click', () => switchView('jobs'));
    elements.companiesBtn?.addEventListener('click', () => switchView('companies'));

    // Search
    let searchTimeout;
    const handleSearch = (val) => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            state.filters.search = val;
            if (elements.searchInput) elements.searchInput.value = val;
            if (elements.heroSearchInput) elements.heroSearchInput.value = val;
            state.currentPage = 1;
            fetchData();
        }, 500);
    };

    elements.searchInput?.addEventListener('input', (e) => handleSearch(e.target.value));
    elements.heroSearchInput?.addEventListener('input', (e) => handleSearch(e.target.value));
    elements.heroSearchBtn?.addEventListener('click', () => {
        state.filters.search = elements.heroSearchInput.value;
        state.currentPage = 1;
        fetchData();
        scrollToResults();
    });

    // Filtering
    const checkboxArray = Array.from(elements.jobTypeCheckboxes);
    checkboxArray.forEach(cb => {
        cb.addEventListener('change', () => {
            state.filters.jobTypes = checkboxArray
                .filter(c => c.checked)
                .map(c => c.value);
            state.currentPage = 1;
            fetchData();
        });
    });

    elements.locationSelect?.addEventListener('change', (e) => {
        state.filters.location = e.target.value;
        state.currentPage = 1;
        fetchData();
    });

    elements.dateSelect?.addEventListener('change', (e) => {
        state.filters.date = e.target.value;
        state.currentPage = 1;
        fetchData();
    });

    // Mobile Filters
    elements.mobileApplyBtn?.addEventListener('click', () => {
        const type = elements.mobileTypeSelect.value;
        const remote = elements.mobileRemoteSelect.value;

        state.filters.jobTypes = type ? [type] : [];
        if (remote === 'true') {
            state.filters.location = 'Remote';
        } else if (remote === 'false' && state.filters.location === 'Remote') {
            state.filters.location = '';
        }

        // Close modal
        document.getElementById('close-filter-modal')?.click();

        state.currentPage = 1;
        fetchData();
        scrollToResults();
    });

    // Reset Filters
    const resetAll = () => {
        state.filters = { search: '', jobTypes: [], location: '', date: '' };
        if (elements.searchInput) elements.searchInput.value = '';
        if (elements.heroSearchInput) elements.heroSearchInput.value = '';
        if (elements.locationSelect) elements.locationSelect.value = '';
        if (elements.dateSelect) elements.dateSelect.value = '';
        if (elements.mobileTypeSelect) elements.mobileTypeSelect.value = '';
        if (elements.mobileRemoteSelect) elements.mobileRemoteSelect.value = '';

        checkboxArray.forEach(cb => cb.checked = false);
        state.currentPage = 1;
        fetchData();
    };

    elements.resetBtn?.addEventListener('click', resetAll);
    elements.emptyClearBtn?.addEventListener('click', resetAll);
}

/**
 * Fetch Data based on current state
 */
async function fetchData() {
    // Hide all paginations first to prevent overlaps
    document.getElementById('jobs-pagination')?.classList.add('hidden');
    document.getElementById('companies-pagination')?.classList.add('hidden');

    if (state.viewMode === 'jobs') {
        await fetchJobs();
    } else {
        await fetchCompanies();
    }
}

/**
 * Fetch Jobs with Filters
 */
async function fetchJobs() {
    // 1. Check Cache first for instant loading
    const cacheKey = state.selectedCompany || 'all';
    const filterString = JSON.stringify(state.filters);
    const fullCacheKey = `${cacheKey}-${filterString}-p${state.currentPage}`;

    if (state.jobCache[fullCacheKey]) {
        renderJobs(state.jobCache[fullCacheKey].data);
        elements.resultsCount.textContent = state.jobCache[fullCacheKey].total;
        renderPagination(state.jobCache[fullCacheKey].totalPages, state.currentPage, 'jobs');
        // Still fetch in background to keep it fresh
    } else {
        renderJobsSkeleton(); // Show skeleton if not in cache
    }

    try {
        const query = new URLSearchParams();
        if (state.filters.search) query.append('search', state.filters.search);
        if (state.selectedCompany) query.append('company', state.selectedCompany);
        if (state.filters.location) query.append('location', state.filters.location);

        query.append('page', state.currentPage);
        query.append('limit', state.itemsPerPage);

        // Multi-select for job type
        if (state.filters.jobTypes.length > 0) {
            state.filters.jobTypes.forEach(jt => {
                query.append('jobType', jt);
            });
        }

        if (state.filters.date) {
            const date = new Date();
            if (state.filters.date === '24h') date.setDate(date.getDate() - 1);
            if (state.filters.date === '7d') date.setDate(date.getDate() - 7);
            if (state.filters.date === '30d') date.setDate(date.getDate() - 30);
            query.append('postedAfter', date.toISOString());
        }

        const res = await fetch(`${API_BASE}/jobs?${query.toString()}`);
        const result = await res.json();

        if (result.success) {
            // Update cache
            state.jobCache[fullCacheKey] = result;
            renderJobs(result.data);
            elements.resultsCount.textContent = result.total;

            // Render pagination
            renderPagination(result.totalPages, state.currentPage, 'jobs');
        }
    } catch (error) {
        console.error('❌ Error fetching jobs:', error);
    }
}

/**
 * Fetch Companies
 */
async function fetchCompanies() {
    try {
        const query = new URLSearchParams();
        query.append('page', state.currentPage);
        query.append('limit', state.itemsPerPage);

        const res = await fetch(`${API_BASE}/companies?${query.toString()}`);
        const result = await res.json();

        if (result.success) {
            renderCompanies(result.data);
            elements.resultsCount.textContent = result.total;

            // Render pagination
            renderPagination(result.totalPages, state.currentPage, 'companies');
        }
    } catch (error) {
        console.error('❌ Error fetching companies:', error);
    }
}

/**
 * Update Hero Stats
 */
async function updateStats() {
    try {
        const res = await fetch(`${API_BASE}/jobs/stats`);
        const result = await res.json();

        if (result.success) {
            const stats = result.data;

            // DOM Updates with safety checks
            const map = {
                'stats-jobs': stats.totalJobs,
                'stats-companies': stats.totalCompanies,
                'stats-locations': stats.locations,
                'stats-recent': stats.newToday
            };

            Object.entries(map).forEach(([id, val]) => {
                const el = document.getElementById(id);
                if (el) {
                    // Smooth counter effect for that "Expert" feel
                    animateCounter(el, val);
                }
            });
        }
    } catch (error) {
        console.error('❌ Error updating stats:', error);
    }
}

/**
 * Helper: Animate Counter
 */
function animateCounter(el, target) {
    const current = parseInt(el.textContent) || 0;
    const duration = 1000; // 1 second
    const startTime = performance.now();

    function update(now) {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Ease out quad formula
        const easedProgress = progress * (2 - progress);
        const nextVal = Math.floor(current + (target - current) * easedProgress);

        el.textContent = nextVal;

        if (progress < 1) {
            requestAnimationFrame(update);
        } else {
            el.textContent = target; // Ensure exact final value
        }
    }

    requestAnimationFrame(update);
}

/**
 * Render Jobs Skeleton Loader
 */
function renderJobsSkeleton() {
    const container = document.getElementById('jobs-grid');
    container.classList.remove('hidden');
    document.getElementById('companies-view').classList.add('hidden');

    container.innerHTML = Array(6).fill(0).map(() => `
        <div class="animate-pulse bg-white border border-gray-100 rounded-2xl p-6 h-64 shadow-sm">
            <div class="flex justify-between mb-4">
                <div class="h-4 bg-gray-200 rounded w-1/4"></div>
                <div class="w-14 h-14 bg-gray-200 rounded-xl"></div>
            </div>
            <div class="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div class="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
            <div class="flex gap-4 mb-8">
                <div class="h-4 bg-gray-200 rounded w-20"></div>
                <div class="h-4 bg-gray-200 rounded w-20"></div>
            </div>
            <div class="border-t pt-4 flex justify-between">
                <div class="h-8 bg-gray-200 rounded w-10"></div>
                <div class="h-8 bg-gray-200 rounded w-24"></div>
            </div>
        </div>
    `).join('');
}

/**
 * Render Job Cards
 */
function renderJobs(jobs) {
    const container = document.getElementById('jobs-grid');
    container.classList.remove('hidden');
    document.getElementById('companies-view').classList.add('hidden');

    if (jobs.length === 0) {
        container.innerHTML = `
            <div class="col-span-full text-center py-20 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                <i class="fas fa-search text-gray-300 text-5xl mb-4"></i>
                <h3 class="text-xl font-bold text-gray-900">No jobs found</h3>
                <p class="text-gray-500">Try adjusting your filters or search terms</p>
            </div>
        `;
        return;
    }

    container.innerHTML = jobs.map(job => {
        const safeCompany = job.company.replace(/'/g, "\\'");
        const safeTitle = job.title.replace(/'/g, "\\'");
        const safeLocation = job.location.replace(/'/g, "\\'");
        const finalUrl = fixUrl(job.applyUrl);

        return `
            <div class="job-card bg-white border border-gray-100 rounded-2xl p-6 hover:shadow-xl hover:border-blujay/20 transition-all duration-300 flex flex-col h-full shadow-sm">
                <div class="flex justify-between items-start mb-4">
                    <div class="flex-1">
                        <span class="inline-block px-2.5 py-1 rounded-md bg-blujay/10 text-blujay text-xs font-bold mb-2 uppercase tracking-wider">${job.jobType}</span>
                        <h3 class="text-xl font-extrabold text-gray-900 leading-tight mb-1">${job.title}</h3>
                        <p class="text-blujay font-bold hover:underline cursor-pointer" onclick="filterByCompany('${safeCompany}')">${job.company}</p>
                    </div>
                    <div class="w-14 h-14 p-1.5 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-center overflow-hidden">
                        <img src="${getCompanyLogo(job.company)}" alt="${job.company}" class="w-full h-full object-contain" onerror="this.src='https://ui-avatars.com/api/?name=${encodeURIComponent(job.company)}&background=f3f4f6&color=1D5D7F&bold=true'">
                    </div>
                </div>
                
                <div class="flex flex-wrap gap-4 text-sm text-gray-500 mb-6">
                    <span class="flex items-center"><i class="fas fa-map-marker-alt mr-1.5 text-gray-400"></i>${job.location}</span>
                    <span class="flex items-center"><i class="fas fa-money-bill-wave mr-1.5 text-gray-400"></i>${job.salary || 'LPA disclosed'}</span>
                    <span class="flex items-center"><i class="fas fa-calendar-alt mr-1.5 text-gray-400"></i>${formatDate(job.postedAt)}</span>
                </div>

                <div class="mt-auto pt-5 border-t border-gray-100 flex items-center justify-between">
                    <button onclick="shareJob('${safeTitle}', '${safeCompany}', '${safeLocation}', '${finalUrl}')" 
                            class="p-2.5 text-gray-400 hover:text-blujay hover:bg-blujay/5 rounded-xl transition-all" title="Share via WhatsApp">
                        <i class="fas fa-share-alt"></i>
                    </button>
                    <a href="${finalUrl}" target="_blank" rel="noopener noreferrer"
                       class="bg-blujay text-white px-6 py-2.5 rounded-xl font-bold hover:bg-blujay-hover shadow-lg shadow-blujay/20 transition-all">
                        Apply Now
                    </a>
                </div>
            </div>
        `;
    }).join('');
}

/**
 * Render Company Cards
 */
function renderCompanies(companies) {
    const container = document.getElementById('companies-view');
    container.classList.remove('hidden');
    document.getElementById('jobs-grid').classList.add('hidden');

    // Using a grid wrapper for companies
    const gridInner = document.getElementById('companies-grid');
    gridInner.classList.remove('hidden');

    if (companies.length === 0) {
        gridInner.innerHTML = `<p class="text-center py-20 text-gray-500">No companies found.</p>`;
        return;
    }

    gridInner.innerHTML = companies.map(c => `
        <div onclick="filterByCompany('${c.companyName}')" class="company-card group bg-white border border-gray-100 rounded-3xl p-8 hover:shadow-2xl hover:border-blujay/30 transition-all duration-500 cursor-pointer flex flex-col items-center text-center">
            <div class="w-24 h-24 bg-gray-50 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-blujay/5 transition-all duration-500 shadow-inner overflow-hidden border border-gray-50">
                <img src="${getCompanyLogo(c.companyName)}" alt="${c.companyName}" class="w-16 h-16 object-contain" onerror="this.src='https://ui-avatars.com/api/?name=${encodeURIComponent(c.companyName)}&background=f3f4f6&color=1D5D7F&bold=true'">
            </div>
            <h3 class="text-xl font-black text-gray-900 mb-2 group-hover:text-blujay transition-colors">${c.companyName}</h3>
            <div class="px-4 py-1.5 rounded-full bg-blujay/10 text-blujay text-sm font-bold">
                ${c.jobCount} Active Roles
            </div>
        </div>
    `).join('');
}

/**
 * Handle View Switching
 */
function switchView(view, preserveFilters = false) {
    state.viewMode = view;
    state.currentPage = 1; // Reset page when switching views
    if (view === 'jobs') {
        elements.allJobsBtn.classList.add('active');
        elements.allJobsBtn.classList.remove('text-gray-600');
        elements.companiesBtn.classList.remove('active');
        elements.companiesBtn.classList.add('text-gray-600');

        // Reset company filter ONLY if we're manually clicking "All Jobs"
        if (!preserveFilters) {
            state.selectedCompany = null;
        }
    } else {
        elements.companiesBtn.classList.add('active');
        elements.companiesBtn.classList.remove('text-gray-600');
        elements.allJobsBtn.classList.remove('active');
        elements.allJobsBtn.classList.add('text-gray-600');
    }
    fetchData();
}

/**
 * Render Pagination
 */
function renderPagination(totalPages, currentPage, type) {
    const container = document.getElementById(`${type}-pagination`);
    if (!container) return; // Guard for top/bottom mismatch

    if (totalPages <= 1) {
        container.classList.add('hidden');
        return;
    }

    container.classList.remove('hidden');
    container.innerHTML = '';

    // Create wrapper for flex styling
    const wrapper = document.createElement('div');
    wrapper.className = 'flex items-center space-x-1.5 sm:space-x-2 flex-wrap justify-end';

    // Previous Button
    const prevBtn = document.createElement('button');
    prevBtn.className = `w-10 h-10 flex items-center justify-center rounded-xl font-bold transition-all duration-300 ${currentPage === 1 ? 'bg-gray-50 text-gray-300 cursor-not-allowed border border-gray-100' : 'bg-white text-gray-700 hover:bg-blujay hover:text-white border border-gray-200 hover:shadow-xl hover:border-blujay shadow-sm'}`;
    prevBtn.innerHTML = '<i class="fas fa-arrow-left text-xs"></i>';
    if (currentPage > 1) {
        prevBtn.onclick = () => {
            state.currentPage--;
            fetchData();
            scrollToResults();
        };
    }
    wrapper.appendChild(prevBtn);

    // Page Numbers Logic (Standard 7-item pagination)
    let pages = [];
    if (totalPages <= 7) {
        pages = Array.from({ length: totalPages }, (_, i) => i + 1);
    } else {
        if (currentPage <= 4) {
            pages = [1, 2, 3, 4, 5, '...', totalPages];
        } else if (currentPage >= totalPages - 3) {
            pages = [1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
        } else {
            pages = [1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages];
        }
    }

    pages.forEach(p => {
        if (p === '...') {
            const dots = document.createElement('span');
            dots.className = 'w-10 h-10 flex items-center justify-center text-gray-400 font-bold';
            dots.textContent = '...';
            wrapper.appendChild(dots);
        } else {
            const pageBtn = document.createElement('button');
            const isActive = (p === currentPage);
            pageBtn.className = `w-10 h-10 flex items-center justify-center rounded-xl font-bold transition-all duration-300 ${isActive ? 'bg-blujay text-white shadow-xl shadow-blujay/30 border border-blujay' : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200 hover:border-blujay/30 hover:text-blujay shadow-sm'}`;
            pageBtn.textContent = p;
            pageBtn.onclick = () => {
                state.currentPage = p;
                fetchData();
                scrollToResults();
            };
            wrapper.appendChild(pageBtn);
        }
    });

    // Next Button
    const nextBtn = document.createElement('button');
    nextBtn.className = `w-10 h-10 flex items-center justify-center rounded-xl font-bold transition-all duration-300 ${currentPage === totalPages ? 'bg-gray-50 text-gray-300 cursor-not-allowed border border-gray-100' : 'bg-white text-gray-700 hover:bg-blujay hover:text-white border border-gray-200 hover:shadow-lg hover:border-blujay shadow-sm'}`;
    nextBtn.innerHTML = '<i class="fas fa-arrow-right text-xs"></i>';
    if (currentPage < totalPages) {
        nextBtn.onclick = () => {
            state.currentPage++;
            fetchData();
            scrollToResults();
        };
    }
    wrapper.appendChild(nextBtn);
    container.appendChild(wrapper);
}

/**
 * Helper: Scroll back to results top
 */
function scrollToResults() {
    const mainArea = document.querySelector('main');
    if (mainArea) {
        const offset = -20; // Slight padding from top
        window.scrollTo({
            top: mainArea.offsetTop + offset,
            behavior: 'smooth'
        });
    }
}

/**
 * Helper: Fix URL Protocol
 */
function fixUrl(url) {
    if (!url) return '#';
    const trimmed = url.trim();
    if (trimmed.startsWith('http')) return trimmed;
    if (trimmed.startsWith('//')) return `https:${trimmed}`;
    return `https://${trimmed}`;
}

/**
 * Helper: Get Company Logo URL
 */
function getCompanyLogo(company) {
    if (!company) return 'https://ui-avatars.com/api/?name=J&background=random';

    // Clean company name for domain guessing (e.g., "Adobe Systems" -> "adobe.com")
    const cleanName = company.toLowerCase()
        .replace(/ (systems|inc|llc|it|technology|technologies|solutions|group|services|india|limited|pvt|ltd)/g, '')
        .trim()
        .replace(/ /g, '');

    // Using Clearbit Logo API - robust and free for public logos
    return `https://logo.clearbit.com/${cleanName}.com`;
}

/**
 * Helper: Filter by Company
 */
window.filterByCompany = function (company) {
    state.selectedCompany = company;
    switchView('jobs', true); // Preserve the company filter
};

/**
 * Helper: Share Job
 */
window.shareJob = function (title, company, location, url) {
    const text = `${title} at ${company}\nLocation: ${location}\nApply here: ${url}`;

    if (navigator.share) {
        navigator.share({
            title: title,
            text: text,
            url: url
        }).catch(err => console.log('Share failed:', err));
    } else {
        const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
        window.open(waUrl, '_blank');
    }
};

/**
 * Helper: Format Date
 */
function formatDate(dateString) {
    const date = new Date(dateString);
    const diff = Math.floor((new Date() - date) / (1000 * 60 * 60 * 24));

    if (diff === 0) return 'Today';
    if (diff === 1) return 'Yesterday';
    if (diff < 7) return `${diff} days ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}
