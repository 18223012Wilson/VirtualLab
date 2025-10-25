(function() {
    'use strict';

    const firebaseConfig = {
        apiKey: "AIzaSyDLZlcHqU7N6HY389ijgYzIPVIuZAza4_A",
        authDomain: "virtuallab-b69f8.firebaseapp.com",
        databaseURL: "https://virtuallab-b69f8-default-rtdb.asia-southeast1.firebasedatabase.app",
        projectId: "virtuallab-b69f8",
        storageBucket: "virtuallab-b69f8.firebasestorage.app",
        messagingSenderId: "663393452055",
        appId: "1:663393452055:web:10610e9eae72beda269c52",
        measurementId: "G-FK0V08SGLE"
    };

    let auth = null;
    let db = null;

    try {
        if (typeof firebase !== 'undefined') {
            if (!firebase.apps.length) {
                firebase.initializeApp(firebaseConfig);
            }
            auth = firebase.auth();
            db = firebase.firestore();
            console.log('✅ Firebase initialized');
        } else {
            console.warn('⚠️ Firebase SDK not loaded, falling back to localStorage');
        }
    } catch (error) {
        console.error('❌ Firebase initialization error:', error);
    }

    const USERS_KEY = 'virtuallab_users';
    const CURRENT_USER_KEY = 'virtuallab_current_user';
    const SESSION_KEY = 'virtuallab_session';

    function getUsers() {
        const data = localStorage.getItem(USERS_KEY);
        return data ? JSON.parse(data) : [];
    }

    function saveUsers(users) {
        localStorage.setItem(USERS_KEY, JSON.stringify(users));
    }

    function saveCurrentUser(user) {
        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
        const session = {
            userId: user.uid || user.id,
            loginTime: Date.now(),
            expiresIn: 24 * 60 * 60 * 1000
        };
        localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    }

    function clearSession() {
        localStorage.removeItem(CURRENT_USER_KEY);
        localStorage.removeItem(SESSION_KEY);
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('username');
    }

    function hashPassword(password) {
        let hash = 0;
        for (let i = 0; i < password.length; i++) {
            const char = password.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return 'hashed_' + Math.abs(hash).toString(36);
    }

    async function register(email, username, password, fullName) {
        try {
            console.log('Starting registration process...');

            if (!auth || !db) {
                console.error('Firebase not initialized');
                return {
                    success: false,
                    message: 'Firebase tidak tersedia. Pastikan koneksi internet Anda aktif.'
                };
            }

            try {
                console.log('Checking if username exists:', username);
                const usernameSnapshot = await db.collection('users')
                    .where('username', '==', username)
                    .limit(1)
                    .get();
                
                if (!usernameSnapshot.empty) {
                    return {
                        success: false,
                        message: 'Username sudah digunakan'
                    };
                }
            } catch (checkError) {
                console.warn('Username check error (continuing anyway):', checkError);
            }

            console.log('Creating user in Firebase Auth...');
            const userCredential = await auth.createUserWithEmailAndPassword(email, password);
            const user = userCredential.user;

            console.log('User created in Auth, saving to Firestore...');

            await db.collection('users').doc(user.uid).set({
                uid: user.uid,
                email: email,
                username: username,
                fullName: fullName,
                createdAt: new Date().toISOString()
            });

            console.log('✅ User registered successfully in Firebase');

            await auth.signOut();

            return {
                success: true,
                message: 'Registrasi berhasil! Silakan login.'
            };

        } catch (error) {
            console.error('Register error:', error);
            console.error('Error code:', error.code);
            console.error('Error message:', error.message);
            
            let message = 'Terjadi kesalahan saat registrasi';
            
            if (error.code === 'auth/email-already-in-use') {
                message = 'Email sudah terdaftar';
            } else if (error.code === 'auth/weak-password') {
                message = 'Password terlalu lemah (minimal 6 karakter)';
            } else if (error.code === 'auth/invalid-email') {
                message = 'Format email tidak valid';
            } else if (error.code === 'permission-denied') {
                message = 'Permission denied. Cek Firestore Rules di Firebase Console.';
            }

            return {
                success: false,
                message: message
            };
        }
    }

    async function login(emailOrUsername, password) {
        try {
            console.log('Starting login process...');

            if (!auth || !db) {
                console.error('Firebase not initialized');
                return {
                    success: false,
                    message: 'Firebase tidak tersedia. Pastikan koneksi internet Anda aktif.'
                };
            }

            let email = emailOrUsername;

            if (!emailOrUsername.includes('@')) {
                try {
                    console.log('Looking up email from username:', emailOrUsername);
                    const usernameSnapshot = await db.collection('users')
                        .where('username', '==', emailOrUsername)
                        .limit(1)
                        .get();
                    
                    if (usernameSnapshot.empty) {
                        return {
                            success: false,
                            message: 'Username tidak ditemukan'
                        };
                    }
                    
                    email = usernameSnapshot.docs[0].data().email;
                    console.log('Email found:', email);
                } catch (queryError) {
                    console.error('Username lookup error:', queryError);
                    return {
                        success: false,
                        message: 'Gagal mencari username. Coba gunakan email untuk login atau cek Firestore Rules.'
                    };
                }
            }

            console.log('Attempting login with email:', email);
            const userCredential = await auth.signInWithEmailAndPassword(email, password);
            const user = userCredential.user;

            console.log('Login successful, fetching user data...');

            try {
                const userDoc = await db.collection('users').doc(user.uid).get();
                
                if (!userDoc.exists) {
                    console.error('User document not found in Firestore');
                    return {
                        success: false,
                        message: 'Data user tidak ditemukan'
                    };
                }
                
                const userData = userDoc.data();

                const session = {
                    uid: user.uid,
                    email: userData.email,
                    username: userData.username,
                    fullName: userData.fullName,
                    loginTime: new Date().toISOString()
                };
                
                sessionStorage.setItem('virtuallab_session', JSON.stringify(session));

                console.log('✅ User logged in successfully');

                return {
                    success: true,
                    message: 'Login berhasil!',
                    user: session
                };
            } catch (firestoreError) {
                console.error('Firestore fetch error:', firestoreError);
                
                const session = {
                    uid: user.uid,
                    email: user.email,
                    username: emailOrUsername,
                    fullName: user.displayName || emailOrUsername,
                    loginTime: new Date().toISOString()
                };
                
                sessionStorage.setItem('virtuallab_session', JSON.stringify(session));
                
                console.log('✅ User logged in (with minimal data)');
                
                return {
                    success: true,
                    message: 'Login berhasil!',
                    user: session
                };
            }

        } catch (error) {
            console.error('Login error:', error);
            console.error('Error code:', error.code);
            console.error('Error message:', error.message);
            
            let message = 'Email/Username atau password salah';
            
            if (error.code === 'auth/user-not-found') {
                message = 'User tidak ditemukan';
            } else if (error.code === 'auth/wrong-password') {
                message = 'Password salah';
            } else if (error.code === 'auth/too-many-requests') {
                message = 'Terlalu banyak percobaan login. Coba lagi nanti.';
            } else if (error.code === 'permission-denied') {
                message = 'Permission denied. Coba login dengan email langsung.';
            } else if (error.code === 'auth/invalid-email') {
                message = 'Format email tidak valid';
            }

            return {
                success: false,
                message: message
            };
        }
    }

    async function logout() {
        try {
            if (auth && auth.currentUser) {
                await auth.signOut();
            }
            
            sessionStorage.removeItem('virtuallab_session');
            console.log('✅ User logged out');

            return {
                success: true,
                message: 'Logout berhasil'
            };
        } catch (error) {
            console.error('Logout error:', error);
            return {
                success: false,
                message: 'Gagal logout'
            };
        }
    }

    function isAuthenticated() {
        if (auth && auth.currentUser) {
            return true;
        }
        
        const session = sessionStorage.getItem('virtuallab_session');
        return session !== null;
    }

    function getCurrentUser() {
        if (auth && auth.currentUser) {
            const session = sessionStorage.getItem('virtuallab_session');
            if (session) {
                return JSON.parse(session);
            }
        }
        
        return null;
    }

    function requireAuth() {
        if (!isAuthenticated()) {
            window.location.href = 'login.html';
            return false;
        }
        return true;
    }

    function redirectIfAuthenticated() {
        if (isAuthenticated()) {
            window.location.href = 'home.html';
            return true;
        }
        return false;
    }

    async function changePassword(oldPassword, newPassword) {
        try {
            if (auth && auth.currentUser) {
                const user = auth.currentUser;
                const credential = firebase.auth.EmailAuthProvider.credential(
                    user.email,
                    oldPassword
                );

                await user.reauthenticateWithCredential(credential);
                await user.updatePassword(newPassword);

                return { success: true, message: 'Password berhasil diubah.' };
            } else {
                const currentUser = getCurrentUser();
                if (!currentUser) {
                    return { success: false, message: 'User tidak ditemukan.' };
                }

                const users = getUsers();
                const userIndex = users.findIndex(u => u.id === currentUser.id);
                
                if (userIndex === -1) {
                    return { success: false, message: 'User tidak ditemukan.' };
                }

                const user = users[userIndex];
                
                if (user.password !== hashPassword(oldPassword)) {
                    return { success: false, message: 'Password lama salah.' };
                }

                if (newPassword.length < 6) {
                    return { success: false, message: 'Password baru minimal 6 karakter.' };
                }

                users[userIndex].password = hashPassword(newPassword);
                saveUsers(users);

                return { success: true, message: 'Password berhasil diubah.' };
            }
        } catch (error) {
            console.error('Change password error:', error);
            let message = 'Gagal mengubah password.';
            
            if (error.code === 'auth/wrong-password') {
                message = 'Password lama salah.';
            } else if (error.code === 'auth/weak-password') {
                message = 'Password baru terlalu lemah.';
            }
            
            return { success: false, message };
        }
    }

    if (auth) {
        auth.onAuthStateChanged((user) => {
            if (user) {
                console.log('✅ User logged in:', user.email);
            } else {
                console.log('ℹ️ User logged out');
            }
        });
    }

    window.VirtualLabAuth = {
        register,
        login,
        logout,
        isAuthenticated,
        requireAuth,
        redirectIfAuthenticated,
        getCurrentUser,
        changePassword,
        getFirebaseAuth: () => auth,
        getFirebaseDb: () => db
    };
})();