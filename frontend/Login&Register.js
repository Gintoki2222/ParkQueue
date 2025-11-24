// ====================================
// GOOGLE LOGIN HANDLER WITH FALLBACK
// ====================================

async function handleGoogleLogin() {
    try {
        console.log('🔐 Starting Google login...');
        
        // Check if loginWithGoogle is available from firebase.js
        if (typeof loginWithGoogle === 'function') {
            await loginWithGoogle();
        } else {
            // Fallback: Direct Google authentication
            await signInWithGoogleDirect();
        }
    } catch (error) {
        console.error('❌ Google login failed:', error);
        alert('Google login failed: ' + error.message);
    }
}

// Fallback Google login function
async function signInWithGoogleDirect() {
    try {
        const provider = new GoogleAuthProvider();
        
        // Add scopes if needed
        provider.addScope('email');
        provider.addScope('profile');
        
        console.log('🔐 Starting direct Google sign-in...');
        const result = await signInWithPopup(auth, provider);
        const user = result.user;

        console.log('✅ Google authentication successful:', user.email);

        // Check if user exists in Firestore
        const userDoc = await getDoc(doc(db, "users", user.uid));

        if (userDoc.exists()) {
            // Existing user - redirect to dashboard
            console.log('👤 Existing Google user, redirecting...');
            window.location.href = 'Dashboard/dashboard.html';
        } else {
            // New user - create document and redirect
            console.log('👤 New Google user, creating document...');
            await setDoc(doc(db, "users", user.uid), {
                email: user.email,
                username: user.displayName || user.email.split('@')[0],
                is_verified: true,
                email_verified: true,
                photo_url: user.photoURL || null,
                created_at: Timestamp.now(),
                updated_at: Timestamp.now(),
                uid: user.uid,
                last_login: Timestamp.now(),
                registration_method: 'google'
            });
            
            console.log('✅ Google user document created, redirecting...');
            window.location.href = 'Dashboard/dashboard.html';
        }

    } catch (error) {
        console.error('❌ Direct Google sign-in error:', error);
        
        // User-friendly error messages
        if (error.code === 'auth/popup-closed-by-user') {
            alert('Google sign-in was cancelled.');
        } else if (error.code === 'auth/network-request-failed') {
            alert('Network error. Please check your internet connection.');
        } else {
            alert('Google sign-in failed: ' + error.message);
        }
    }
}

// ====================================
// REGISTRATION HANDLER
// ====================================

// Login&Register.js - Simplified
// Login&Register.js - Updated without verification
async function handleRegistration() {
    const email = document.getElementById('registerEmail').value;
    const username = document.getElementById('registerUsername').value;
    const password = document.getElementById('registerPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    // Validation
    if (!email || !username || !password || !confirmPassword) {
        alert('Please fill in all fields');
        return;
    }

    if (password !== confirmPassword) {
        alert('Passwords do not match');
        return;
    }

    if (password.length < 6) {
        alert('Password must be at least 6 characters');
        return;
    }

    try {
        const userData = {
            username: username,
            firstName: '',
            lastName: ''
        };

        await registerUser(email, password, userData);
        // User will be automatically redirected to dashboard
    } catch (error) {
        alert('Registration failed: ' + error.message);
    }
}

async function handleLogin() {
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    if (!email || !password) {
        alert('Please enter email and password');
        return;
    }

    await loginUser(email, password);
}

async function handleGoogleLogin() {
    await loginWithGoogle();
}

// UI Functions
function switchToRegister(e) {
    e.preventDefault();
    document.getElementById('loginForm').style.display = 'none';
    document.getElementById('registerForm').style.display = 'block';
    document.getElementById('imageContainer').classList.add('register-active');
}

function switchToLogin(e) {
    e.preventDefault();
    document.getElementById('registerForm').style.display = 'none';
    document.getElementById('loginForm').style.display = 'block';
    document.getElementById('imageContainer').classList.remove('register-active');
}

function togglePassword(inputId) {
    const input = document.getElementById(inputId);
    const icon = document.getElementById(inputId + 'Icon');
    
    if (input.type === 'password') {
        input.type = 'text';
        icon.classList.remove('bi-eye');
        icon.classList.add('bi-eye-slash');
    } else {
        input.type = 'password';
        icon.classList.remove('bi-eye-slash');
        icon.classList.add('bi-eye');
    }
}

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
    console.log('Login/Register page loaded');
});


// ====================================
// FORM VALIDATION
// ====================================

function validateRegistrationForm(email, password, confirmPassword, username) {
    // Check if all fields are filled
    if (!email || !password || !confirmPassword || !username) {
        alert('Please fill in all required fields');
        return false;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        alert('Please enter a valid email address');
        return false;
    }

    // Check password length
    if (password.length < 6) {
        alert('Password must be at least 6 characters long');
        return false;
    }

    // Check if passwords match
    if (password !== confirmPassword) {
        alert('Passwords do not match');
        return false;
    }

    // Check username length
    if (username.length < 3) {
        alert('Username must be at least 3 characters long');
        return false;
    }

    return true;
}

// ====================================
// FORM SWITCHING FUNCTIONS
// ====================================

function switchToRegister(e) {
    e.preventDefault();
    const formContainer = document.getElementById('formContainer');
    const imageContainer = document.getElementById('imageContainer');
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');

    // Add fade-out effect to current form
    loginForm.classList.add('fade-out');

    // Wait for fade-out, then switch and slide
    setTimeout(() => {
        // Hide login, show register with fade-in
        loginForm.style.display = 'none';
        registerForm.style.display = 'block';
        
        // Slide the containers
        formContainer.classList.add('slide-right');
        imageContainer.classList.add('slide-left');

        // Fade in the register form
        setTimeout(() => {
            loginForm.classList.remove('fade-out');
            registerForm.classList.add('fade-in');
        }, 50);
    }, 300);
}

function switchToLogin(e) {
    e.preventDefault();
    const formContainer = document.getElementById('formContainer');
    const imageContainer = document.getElementById('imageContainer');
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');

    // Add fade-out effect to current form
    registerForm.classList.add('fade-out');

    // Wait for fade-out, then switch and slide
    setTimeout(() => {
        // Hide register, show login with fade-in
        registerForm.style.display = 'none';
        loginForm.style.display = 'block';
        
        // Slide the containers back
        formContainer.classList.remove('slide-right');
        imageContainer.classList.remove('slide-left');

        // Fade in the login form
        setTimeout(() => {
            registerForm.classList.remove('fade-out');
            loginForm.classList.add('fade-in');
        }, 50);
    }, 300);
}

// ====================================
// PASSWORD VISIBILITY TOGGLE
// ====================================

function togglePassword(id) {
    const input = document.getElementById(id);
    const icon = document.getElementById(id + 'Icon');

    if (input.type === 'password') {
        input.type = 'text';
        icon.classList.remove('bi-eye');
        icon.classList.add('bi-eye-slash');
    } else {
        input.type = 'password';
        icon.classList.remove('bi-eye-slash');
        icon.classList.add('bi-eye');
    }
}

// ====================================
// HELPER FUNCTIONS
// ====================================

function clearRegisterForm() {
    document.getElementById('registerEmail').value = '';
    document.getElementById('registerUsername').value = '';
    document.getElementById('registerPassword').value = '';
    document.getElementById('confirmPassword').value = '';
}

function clearLoginForm() {
    document.getElementById('loginEmail').value = '';
    document.getElementById('loginPassword').value = '';
}

// ====================================
// ENTER KEY SUBMIT
// ====================================

document.addEventListener('DOMContentLoaded', () => {
    // Enter key for login form
    const loginEmail = document.getElementById('loginEmail');
    const loginPassword = document.getElementById('loginPassword');
    
    if (loginEmail && loginPassword) {
        const handleLoginEnter = (e) => {
            if (e.key === 'Enter') {
                handleLogin();
            }
        };
        
        loginEmail.addEventListener('keypress', handleLoginEnter);
        loginPassword.addEventListener('keypress', handleLoginEnter);
    }

    // Enter key for register form
    const registerPassword = document.getElementById('registerPassword');
    const confirmPassword = document.getElementById('confirmPassword');
    
    if (registerPassword && confirmPassword) {
        const handleRegisterEnter = (e) => {
            if (e.key === 'Enter') {
                handleRegistration();
            }
        };
        
        registerPassword.addEventListener('keypress', handleRegisterEnter);
        confirmPassword.addEventListener('keypress', handleRegisterEnter);
    }

    // Initialize form states
    document.getElementById('loginForm').style.display = 'block';
    document.getElementById('registerForm').style.display = 'none';
});

// ====================================
// GLOBAL FUNCTION EXPORTS
// ====================================

window.handleRegistration = handleRegistration;
window.handleLogin = handleLogin;
window.handleGoogleLogin = handleGoogleLogin;
window.switchToRegister = switchToRegister;
window.switchToLogin = switchToLogin;
window.togglePassword = togglePassword;
window.clearRegisterForm = clearRegisterForm;
window.clearLoginForm = clearLoginForm;