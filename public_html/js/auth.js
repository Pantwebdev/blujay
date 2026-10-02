// ============================================
// FIREBASE CONFIGURATION
// ============================================
const firebaseConfig = {
    apiKey: "AIzaSyCiedANEie5u-2XQOjdsUFgdkE7s08gArY",
    authDomain: "blujay-tech.firebaseapp.com",
    projectId: "blujay-tech",
    storageBucket: "blujay-tech.firebasestorage.app",
    messagingSenderId: "586422050005",
    appId: "1:586422050005:web:737ba2502d1b283ea6165c",
    measurementId: "G-1JE665W8D0"
};

// Initialize Firebase (prevent re-initialization)
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

const auth = firebase.auth();
const db = firebase.firestore();

// ============================================
// BACKEND API CONFIGURATION
// ============================================
// Smart API URL - Auto-detects environment
const API_URL = window.API_CONFIG ? window.API_CONFIG.getApiUrl() : 'https://blujay-backend.onrender.com/api';
console.log('🔗 Backend API URL:', API_URL);

/**
 * ARCHITECTURE NOTE:
 * This auth.js ONLY handles authentication (JWT creation).
 * It does NOT decide where users go after login.
 * That responsibility belongs to post-login-router.html
 * 
 * Separation of Concerns:
 * - auth.js = Authentication
 * - post-login-router.html = Routing
 * - CommunityProfile = Profile data
 */

// ============================================
// SET PERMANENT LOGIN PERSISTENCE
// ============================================
auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL)
    .then(() => {
        console.log('✅ Persistence set to LOCAL - User will stay logged in permanently');
    })
    .catch((error) => {
        console.error('❌ Error setting persistence:', error);
    });

// Global variables
let recaptchaVerifier;
let confirmationResult;
let isLoggingIn = false; // Track if user is actively logging in

// ============================================
// VERIFY USER WITH BACKEND
// ============================================
async function verifyUserWithBackend(firebaseUser) {
    try {
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('🔄 STEP 1: Starting backend verification...');
        console.log('📧 User Email:', firebaseUser.email || 'N/A');
        console.log('📱 User Phone:', firebaseUser.phoneNumber || 'N/A');

        // Get Firebase ID token
        console.log('🔄 STEP 2: Getting Firebase ID token...');
        const idToken = await firebaseUser.getIdToken();
        console.log('✅ Firebase ID token obtained');

        // Prepare request body - NO ROLE PARAMETER
        // Authentication only, no routing decisions
        const requestBody = {
            name: firebaseUser.displayName || firebaseUser.phoneNumber || 'User',
            profilePhoto: firebaseUser.photoURL || ''
        };

        // Send to backend
        console.log('🔄 STEP 3: Sending verification request to backend...');
        console.log('📡 API Endpoint:', `${API_URL}/auth/verify`);

        const response = await fetch(`${API_URL}/auth/verify`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${idToken}`
            },
            body: JSON.stringify(requestBody)
        });

        console.log('✅ Backend response received');
        console.log('📊 Response status:', response.status);

        if (!response.ok) {
            const errorData = await response.json();
            console.error('❌ Backend verification failed:', errorData);
            throw new Error(errorData.message || 'Backend verification failed');
        }

        const data = await response.json();
        console.log('✅ STEP 4: Backend verification successful!');

        if (data.success) {
            // Store JWT token and user info in localStorage
            console.log('🔄 STEP 5: Storing user data in localStorage...');
            localStorage.setItem('authToken', data.jwtToken);
            localStorage.setItem('userRole', data.user.role);  // admin or student ONLY
            localStorage.setItem('userName', data.user.name);
            localStorage.setItem('userEmail', data.user.email);
            localStorage.setItem('userId', data.user.uid);
            localStorage.setItem('userPhoto', data.user.profilePhoto);

            console.log('✅ User data stored successfully');
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            console.log('👤 USER DETAILS:');
            console.log('   "� Name:', data.user.name);
            console.log('   "� Email:', data.user.email);
            console.log('   "� Role:', data.user.role);
            console.log('   "� UID:', data.user.uid);
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

            // Check if this is a community login
            const loginContext = sessionStorage.getItem('loginContext');
            const requestedProfile = sessionStorage.getItem('requestedProfile');

            console.log('🔍 Login Context Check:');
            console.log('   "� loginContext:', loginContext || 'none');
            console.log('   "� requestedProfile:', requestedProfile || 'none');

            // CRITICAL: Redirect to post-login router (NOT direct dashboard)
            // Router will decide destination based on context
            console.log('🔄 STEP 6: Redirecting to post-login router...');
            console.log('⚠️ NOTE: Login ONLY authenticates, router decides destination');

            // Determine correct path based on current location
            const currentPath = window.location.pathname;
            const currentDir = window.location.href;
            let routerPath = 'post-login-router.html';

            console.log('📍 Current full URL:', currentDir);
            console.log('📍 Current path:', currentPath);

            // If we're in a subdirectory (like community/), go up one level
            if (currentPath.includes('/community/') || currentPath.includes('/admin/')) {
                routerPath = '../post-login-router.html';
                console.log('🔼 In subdirectory, using relative path: ../ ');
            } else {
                console.log('📁 In root frontend directory');
            }

            console.log('🎯 Router path:', routerPath);
            console.log('🚀 Redirecting now...');

            // Reset the login flag before redirect
            isLoggingIn = false;

            window.location.href = routerPath;
        } else {
            throw new Error(data.message || 'Verification failed');
        }

    } catch (error) {
        console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.error('❌ BACKEND VERIFICATION ERROR:');
        console.error('   Message:', error.message);
        console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

        alert(
            '⚠️ Authentication Error\n\n' +
            'Error: ' + error.message + '\n\n' +
            'Please ensure:\n' +
            '1. Backend server is running\n' +
            '2. MongoDB is connected\n' +
            '3. Firebase Admin SDK is configured correctly\n\n' +
            'Check browser console for detailed logs.'
        );

        // Sign out Firebase user on error
        auth.signOut();
    }
}

// ============================================
// CHECK AUTH STATE (IMPROVED WITH BACKEND)
// ============================================
function checkAuthState() {
    firebase.auth().onAuthStateChanged(async (user) => {
        if (user) {
            console.log('✅ Firebase user authenticated');
            console.log('📧 Email:', user.email || 'N/A');
            console.log('📱 Phone:', user.phoneNumber || 'N/A');

            const currentPath = window.location.pathname;

            // CRITICAL FIX: Skip auto-redirect on login page UNLESS user is actively logging in
            if (currentPath.includes('login.html') && !isLoggingIn) {
                console.log('⏸️ On login page - skipping auto-redirect');
                console.log('ℹ️ User can click login button to choose account');
                return;
            }

            // CRITICAL FIX: Skip auth check on dashboard pages
            // These pages have their own auth verification
            if (currentPath.includes('dashboard.html') ||
                currentPath.includes('my-learning.html') ||
                currentPath.includes('admin/admin-dashboard.html') ||
                currentPath.includes('community/giver-dashboard.html') ||
                currentPath.includes('community/receiver-dashboard.html') ||
                currentPath.includes('community/giver-profile.html') ||
                currentPath.includes('community/receiver-profile.html') ||
                currentPath.includes('community/verification-pending.html') ||
                currentPath.includes('post-login-router.html')) {
                console.log('🏠 On dashboard page - skipping auth redirect');
                console.log('ℹ️ Dashboard has its own verification');
                return;
            }

            console.log('🔄 Initiating backend verification...');

            // Verify with backend
            await verifyUserWithBackend(user);

        } else {
            console.log('ℹ️ No user logged in');

            // Clear all stored tokens
            localStorage.removeItem('authToken');
            localStorage.removeItem('userRole');
            localStorage.removeItem('userName');
            localStorage.removeItem('userEmail');
            localStorage.removeItem('userId');
            localStorage.removeItem('userPhoto');

            const currentPath = window.location.pathname;

            // Redirect to login if on protected pages
            if (currentPath.includes('dashboard') ||
                currentPath.includes('my-learning') ||
                currentPath.includes('course-player') ||
                currentPath.includes('admin/')) {

                console.log('🔄 Protected page detected - redirecting to login...');
                const redirectTo = currentPath.includes('admin/') ? '../login' : 'login';
                window.location.href = redirectTo;
            }
        }
    });
}

// ============================================
// INITIALIZE RECAPTCHA ON PAGE LOAD
// ============================================
window.onload = function () {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🚀 Blujay Technologies - Auth System');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ Auth.js loaded successfully');
    console.log('🔗 Backend API:', API_URL);

    // Check if user is coming from community role selection
    const requestedProfile = sessionStorage.getItem('requestedProfile');
    const currentPath = window.location.pathname;

    if (requestedProfile && currentPath.includes('login.html')) {
        console.log('🏘️ Community role selected:', requestedProfile);
        console.log('🔄 Signing out existing session to allow account selection...');

        // Sign out any existing Firebase session
        firebase.auth().signOut().then(() => {
            console.log('✅ Previous session cleared');
            console.log('ℹ️ User can now select their Google account');
        }).catch((error) => {
            console.error('⚠️ Error signing out:', error);
        });
    }

    // Check if backend is reachable
    console.log('🔄 Testing backend connection...');
    fetch(`${API_URL.replace('/api', '')}/health`)
        .then(response => response.json())
        .then(data => {
            console.log('✅ Backend server is online');
            console.log('📡 Server message:', data.message);
        })
        .catch(error => {
            console.warn('⚠️ WARNING: Backend server not reachable!');
            console.warn('   Please start backend with: cd backend && npm start');
            console.warn('   Backend API URL:', API_URL);
        });

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    // Initialize invisible reCAPTCHA for login page
    if (document.getElementById('recaptcha-container')) {
        recaptchaVerifier = new firebase.auth.RecaptchaVerifier('recaptcha-container', {
            'size': 'invisible',
            'callback': (response) => {
                console.log('✅ reCAPTCHA solved');
            },
            'expired-callback': () => {
                console.log('⚠️ reCAPTCHA expired');
            }
        });
    }

    // Initialize for signup page
    if (document.getElementById('recaptcha-signup-container')) {
        recaptchaVerifier = new firebase.auth.RecaptchaVerifier('recaptcha-signup-container', {
            'size': 'invisible',
            'callback': (response) => {
                console.log('✅ reCAPTCHA solved');
            }
        });
    }

    // Check if user is already logged in
    checkAuthState();
};

// ============================================
// PHONE LOGIN FUNCTIONALITY
// ============================================
if (document.getElementById('phone-login-form')) {
    document.getElementById('phone-login-form').addEventListener('submit', function (e) {
        e.preventDefault();

        const countryCode = document.getElementById('country-code').value;
        const phoneNumber = document.getElementById('phone').value.trim();
        const fullNumber = countryCode + phoneNumber;
        const submitBtn = document.getElementById('send-otp-btn');

        // Validation
        if (phoneNumber.length !== 10) {
            alert('Please enter a valid 10-digit phone number');
            return;
        }

        // Set flag to indicate user is actively logging in
        isLoggingIn = true;

        // Show loading state
        submitBtn.textContent = 'Sending OTP...';
        submitBtn.disabled = true;

        console.log('📱 Sending OTP to:', fullNumber);

        // Send OTP
        firebase.auth().signInWithPhoneNumber(fullNumber, recaptchaVerifier)
            .then((result) => {
                confirmationResult = result;
                console.log('✅ OTP sent successfully');

                // Prompt for OTP
                const otp = prompt('Enter the 6-digit OTP sent to ' + fullNumber);

                if (otp && otp.length === 6) {
                    // Verify OTP
                    submitBtn.textContent = 'Verifying...';
                    return confirmationResult.confirm(otp);
                } else {
                    throw new Error('Invalid OTP format');
                }
            })
            .then((result) => {
                console.log('✅ Phone login successful');
                // Backend verification happens in onAuthStateChanged
            })
            .catch((error) => {
                console.error('❌ Phone login error:', error);
                alert('Error: ' + error.message);

                // Reset flag on error
                isLoggingIn = false;

                // Reset button
                submitBtn.textContent = 'Login';
                submitBtn.disabled = false;

                // Reset reCAPTCHA
                if (recaptchaVerifier) {
                    recaptchaVerifier.clear();
                    recaptchaVerifier = new firebase.auth.RecaptchaVerifier('recaptcha-container', {
                        'size': 'invisible'
                    });
                }
            });
    });
}

// ============================================
// GOOGLE LOGIN FUNCTIONALITY
// ============================================
if (document.getElementById('google-login-btn')) {
    document.getElementById('google-login-btn').addEventListener('click', function () {
        console.log('🔄 Initiating Google login...');

        // Set flag to indicate user is actively logging in
        isLoggingIn = true;

        const provider = new firebase.auth.GoogleAuthProvider();

        // Force account selection popup every time
        provider.setCustomParameters({
            prompt: 'select_account'
        });

        firebase.auth().signInWithPopup(provider)
            .then((result) => {
                console.log('✅ Google authentication successful');
                console.log('🔄 Backend verification will proceed...');
                // Backend verification happens in onAuthStateChanged
                // isLoggingIn flag allows it to proceed
            })
            .catch((error) => {
                console.error('❌ Google login error:', error);
                alert('Login Error: ' + error.message);
                // Reset flag on error
                isLoggingIn = false;
            });
    });
}

// ============================================
// PHONE NUMBER FORMATTING
// ============================================
const phoneInputs = document.querySelectorAll('input[type="tel"]');
phoneInputs.forEach(input => {
    input.addEventListener('input', function () {
        this.value = this.value.replace(/[^0-9]/g, '');
        if (this.value.length > 10) {
            this.value = this.value.slice(0, 10);
        }
    });
});

console.log('✅ Blujay Technologies - Auth System Ready with Backend Integration!');
