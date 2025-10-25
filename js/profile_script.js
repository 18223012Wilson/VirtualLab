(function() {
    'use strict';

    async function init() {
        console.log('Initializing profile page...');     

        if (window.UserData && window.UserData.waitForFirebase) {
            console.log('Waiting for Firebase to be ready...');
            await UserData.waitForFirebase();
            console.log('Firebase is ready!');
        }
        
        await loadUserProfile();
        setupEventListeners();
    }

    async function loadUserProfile() {
        try {
            const currentUser = VirtualLabAuth.getCurrentUser();
            
            if (!currentUser) {
                console.error('No user logged in');
                window.location.href = 'login.html';
                return;
            }

            console.log('Loading profile for:', currentUser.username);
   
            const usernameEl = document.getElementById('username');
            const emailEl = document.getElementById('email');
            const fullNameEl = document.getElementById('fullName');
            const memberSinceEl = document.getElementById('memberSince');

            if (usernameEl) usernameEl.textContent = currentUser.username || '-';
            if (emailEl) emailEl.textContent = currentUser.email || '-';
            if (fullNameEl) fullNameEl.textContent = currentUser.fullName || '-';
          
            const auth = VirtualLabAuth.getFirebaseAuth();
            const db = VirtualLabAuth.getFirebaseDb();
            
            if (db && auth && auth.currentUser) {
                const userDoc = await db.collection('users').doc(auth.currentUser.uid).get();
                if (userDoc.exists) {
                    const userData = userDoc.data();
                    if (memberSinceEl && userData.createdAt) {
                        const date = new Date(userData.createdAt);
                        memberSinceEl.textContent = date.toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric'
                        });
                    }
                }
            }
 
            await loadStatistics();

            console.log('✅ Profile loaded');
        } catch (error) {
            console.error('Error loading profile:', error);
        }
    }

    function setupEventListeners() {
        const backBtn = document.getElementById('backBtn');
        const changePasswordBtn = document.getElementById('changePasswordBtn');
        const logoutBtnCard = document.getElementById('logoutBtnCard');

        if (backBtn) {
            backBtn.addEventListener('click', () => {
                window.location.href = 'home.html';
            });
        }

        if (changePasswordBtn) {
            changePasswordBtn.addEventListener('click', changePassword);
        }

        if (logoutBtnCard) {
            logoutBtnCard.addEventListener('click', logout);
        }
    }

    async function changePassword() {
        const newPassword = prompt('Masukkan password baru (minimal 8 karakter):');
        
        if (!newPassword) return;
        
        if (newPassword.length < 8) {
            alert('Password minimal 8 karakter');
            return;
        }

        try {
            const auth = VirtualLabAuth.getFirebaseAuth();
            if (auth && auth.currentUser) {
                await auth.currentUser.updatePassword(newPassword);
                alert('Password berhasil diubah!');
            } else {
                alert('Gagal mengubah password. Silakan login ulang.');
            }
        } catch (error) {
            console.error('Change password error:', error);
            
            if (error.code === 'auth/requires-recent-login') {
                alert('Sesi Anda sudah kadaluarsa. Silakan login ulang untuk mengubah password.');
                window.location.href = 'login.html';
            } else {
                alert('Gagal mengubah password: ' + error.message);
            }
        }
    }

    async function logout() {
        const confirmed = confirm('Apakah Anda yakin ingin logout?');
        if (!confirmed) return;

        try {
            const result = await VirtualLabAuth.logout();
            if (result.success) {
                window.location.href = 'login.html';
            }
        } catch (error) {
            console.error('Logout error:', error);
            alert('Gagal logout. Silakan coba lagi.');
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();