// Profile Page Script

(function() {
    'use strict';

    // Init
    async function init() {
        console.log('Initializing profile page...');
        
        // Tunggu Firebase siap
        if (window.UserData && window.UserData.waitForFirebase) {
            console.log('Waiting for Firebase to be ready...');
            await UserData.waitForFirebase();
            console.log('Firebase is ready!');
        }
        
        await loadUserProfile();
        setupEventListeners();
    }

    // Load user profile
    async function loadUserProfile() {
        try {
            const currentUser = VirtualLabAuth.getCurrentUser();
            
            if (!currentUser) {
                console.error('No user logged in');
                window.location.href = 'login.html';
                return;
            }

            console.log('Loading profile for:', currentUser.username);

            // Set profile data
            const usernameEl = document.getElementById('username');
            const emailEl = document.getElementById('email');
            const fullNameEl = document.getElementById('fullName');
            const memberSinceEl = document.getElementById('memberSince');

            if (usernameEl) usernameEl.textContent = currentUser.username || '-';
            if (emailEl) emailEl.textContent = currentUser.email || '-';
            if (fullNameEl) fullNameEl.textContent = currentUser.fullName || '-';
            
            // Get additional data from Firestore
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

            // Load statistics
            await loadStatistics();

            console.log('✅ Profile loaded');
        } catch (error) {
            console.error('Error loading profile:', error);
        }
    }

    // // Load statistics
    // async function loadStatistics() {
    //     try {
    //         // Get quiz scores
    //         let quizScores = [];
    //         if (window.UserData && typeof UserData.getAllQuizScores === 'function') {
    //             quizScores = await UserData.getAllQuizScores();
    //         }

    //         // Get simulation results
    //         let simResults = [];
    //         if (window.UserData && typeof UserData.getAllResults === 'function') {
    //             simResults = await UserData.getAllResults();
    //         }

    //         // Update UI
    //         const totalQuizzesEl = document.getElementById('totalQuizzes');
    //         const avgScoreEl = document.getElementById('avgScore');
    //         const totalSimsEl = document.getElementById('totalSimulations');

    //         if (totalQuizzesEl) {
    //             totalQuizzesEl.textContent = quizScores.length;
    //         }

    //         if (avgScoreEl && quizScores.length > 0) {
    //             const avgPercentage = quizScores.reduce((sum, q) => sum + q.percentage, 0) / quizScores.length;
    //             avgScoreEl.textContent = avgPercentage.toFixed(1) + '%';
    //         } else if (avgScoreEl) {
    //             avgScoreEl.textContent = '0%';
    //         }

    //         if (totalSimsEl) {
    //             totalSimsEl.textContent = simResults.length;
    //         }

    //         console.log('✅ Statistics loaded');
    //     } catch (error) {
    //         console.error('Error loading statistics:', error);
    //     }
    // }

    // Setup event listeners
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

    // Change password
    async function changePassword() {
        const newPassword = prompt('Masukkan password baru (minimal 6 karakter):');
        
        if (!newPassword) return;
        
        if (newPassword.length < 6) {
            alert('Password minimal 6 karakter');
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

    // Logout
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

    // Start
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();