// Modul untuk menyimpan dan mengelola data aktivitas user

(function() {
    'use strict';

    // Fungsi untuk menyimpan progress lab
    async function saveProgress(labName, data) {
        try {
            const auth = VirtualLabAuth.getFirebaseAuth();
            const db = VirtualLabAuth.getFirebaseDb();
            const currentUser = VirtualLabAuth.getCurrentUser();

            if (!currentUser) {
                console.error('User tidak login');
                return { success: false, message: 'User tidak login' };
            }

            if (!db || !auth || !auth.currentUser) {
                console.error('Firestore tidak tersedia');
                return { success: false, message: 'Database tidak tersedia' };
            }

            const progressData = {
                labName: labName,
                data: data,
                timestamp: new Date().toISOString(),
                userId: auth.currentUser.uid,
                username: currentUser.username
            };

            // Simpan ke Firebase Firestore
            await db.collection('user_progress')
                .doc(auth.currentUser.uid)
                .collection('labs')
                .doc(labName)
                .set(progressData, { merge: true });
            
            console.log('✅ Progress saved to Firestore:', labName);
            return { success: true, message: 'Progress berhasil disimpan' };
        } catch (error) {
            console.error('Error saving progress:', error);
            return { success: false, message: error.message };
        }
    }

    // Fungsi untuk menyimpan hasil simulasi
    async function saveSimulationResult(labName, parameters, results) {
        try {
            const auth = VirtualLabAuth.getFirebaseAuth();
            const db = VirtualLabAuth.getFirebaseDb();
            const currentUser = VirtualLabAuth.getCurrentUser();

            if (!currentUser) {
                console.error('User tidak login');
                return { success: false, message: 'User tidak login' };
            }

            if (!db || !auth || !auth.currentUser) {
                console.error('Firestore tidak tersedia');
                return { success: false, message: 'Database tidak tersedia' };
            }

            const resultData = {
                labName: labName,
                parameters: parameters,
                results: results,
                timestamp: new Date().toISOString(),
                userId: auth.currentUser.uid,
                username: currentUser.username
            };

            // Simpan ke Firebase Firestore
            await db.collection('simulation_results')
                .doc(auth.currentUser.uid)
                .collection('results')
                .add(resultData);
            
            console.log('✅ Simulation result saved to Firestore:', labName);
            return { success: true, message: 'Hasil simulasi berhasil disimpan' };
        } catch (error) {
            console.error('Error saving simulation result:', error);
            return { success: false, message: error.message };
        }
    }

    // Fungsi untuk menyimpan nilai quiz
    async function saveQuizScore(quizName, score, maxScore, answers, metadata = {}) {
        try {
            const auth = VirtualLabAuth.getFirebaseAuth();
            const db = VirtualLabAuth.getFirebaseDb();
            const currentUser = VirtualLabAuth.getCurrentUser();

            if (!currentUser) {
                console.error('User tidak login');
                return { success: false, message: 'User tidak login' };
            }

            if (!db || !auth || !auth.currentUser) {
                console.error('Firestore tidak tersedia');
                return { success: false, message: 'Database tidak tersedia' };
            }

            const quizData = {
                quizName: quizName,
                score: score,
                maxScore: maxScore,
                percentage: (score / maxScore) * 100,
                answers: answers,
                metadata: metadata,
                timestamp: new Date().toISOString(),
                userId: auth.currentUser.uid,
                username: currentUser.username
            };

            console.log('Saving quiz score:', quizData);

            // Simpan ke Firebase Firestore
            await db.collection('quiz_scores')
                .doc(auth.currentUser.uid)
                .collection('scores')
                .add(quizData);
            
            console.log('✅ Quiz score saved to Firestore:', quizName);
            return { success: true, message: 'Nilai quiz berhasil disimpan' };
        } catch (error) {
            console.error('Error saving quiz score:', error);
            return { success: false, message: error.message };
        }
    }

    // Fungsi untuk mendapatkan progress user
    async function getProgress(labName) {
        try {
            const auth = VirtualLabAuth.getFirebaseAuth();
            const db = VirtualLabAuth.getFirebaseDb();

            if (!db || !auth || !auth.currentUser) {
                return null;
            }

            // Ambil dari Firestore
            const doc = await db.collection('user_progress')
                .doc(auth.currentUser.uid)
                .collection('labs')
                .doc(labName)
                .get();
            
            return doc.exists ? doc.data() : null;
        } catch (error) {
            console.error('Error getting progress:', error);
            return null;
        }
    }

    // Fungsi untuk mendapatkan semua hasil simulasi user
    async function getAllResults() {
        try {
            const auth = VirtualLabAuth.getFirebaseAuth();
            const db = VirtualLabAuth.getFirebaseDb();

            if (!db || !auth || !auth.currentUser) {
                console.log('Firestore not available');
                return [];
            }

            // Ambil dari Firestore
            const snapshot = await db.collection('simulation_results')
                .doc(auth.currentUser.uid)
                .collection('results')
                .get();
            
            const results = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            
            // Sort by timestamp descending
            results.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
            
            return results;
        } catch (error) {
            console.error('Error getting results:', error);
            return [];
        }
    }

    // Fungsi untuk mendapatkan semua nilai quiz user
    async function getAllQuizScores() {
        try {
            // Tunggu Firebase selesai initialize
            await waitForFirebase();

            const auth = VirtualLabAuth.getFirebaseAuth();
            const db = VirtualLabAuth.getFirebaseDb();

            console.log('getAllQuizScores check:');
            console.log('- auth:', auth ? 'OK' : 'NULL');
            console.log('- db:', db ? 'OK' : 'NULL');
            console.log('- auth.currentUser:', auth && auth.currentUser ? auth.currentUser.uid : 'NULL');

            if (!db || !auth || !auth.currentUser) {
                console.error('Firestore not available');
                console.error('Please check Firebase initialization');
                return [];
            }

            console.log('Fetching quiz scores from Firestore for uid:', auth.currentUser.uid);

            // Ambil dari Firestore
            const snapshot = await db.collection('quiz_scores')
                .doc(auth.currentUser.uid)
                .collection('scores')
                .get();
            
            console.log('Firestore snapshot size:', snapshot.size);
            
            const scores = snapshot.docs.map(doc => ({ 
                id: doc.id, 
                ...doc.data() 
            }));
            
            // Sort by timestamp descending
            scores.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
            
            console.log('Quiz scores fetched:', scores.length, 'items');
            if (scores.length > 0) {
                console.log('Sample score:', scores[0]);
            }
            
            return scores;
        } catch (error) {
            console.error('Error getting quiz scores:', error);
            console.error('Error code:', error.code);
            console.error('Error message:', error.message);
            return [];
        }
    }

    // Helper function: tunggu Firebase siap
    function waitForFirebase(maxAttempts = 10) {
        return new Promise((resolve) => {
            let attempts = 0;
            const checkInterval = setInterval(() => {
                attempts++;
                const auth = VirtualLabAuth.getFirebaseAuth();
                const db = VirtualLabAuth.getFirebaseDb();
                
                if ((auth && auth.currentUser && db) || attempts >= maxAttempts) {
                    clearInterval(checkInterval);
                    console.log(`Firebase ready after ${attempts} attempts`);
                    resolve();
                }
            }, 300); // Check every 300ms
        });
    }

    // Fungsi untuk log aktivitas user
    async function logActivity(activityType, description, metadata = {}) {
        try {
            const auth = VirtualLabAuth.getFirebaseAuth();
            const db = VirtualLabAuth.getFirebaseDb();
            const currentUser = VirtualLabAuth.getCurrentUser();

            if (!currentUser || !db || !auth || !auth.currentUser) {
                return;
            }

            const activityData = {
                activityType: activityType,
                description: description,
                metadata: metadata,
                timestamp: new Date().toISOString(),
                userId: auth.currentUser.uid,
                username: currentUser.username
            };

            // Simpan ke Firestore
            await db.collection('user_activities')
                .doc(auth.currentUser.uid)
                .collection('activities')
                .add(activityData);
        } catch (error) {
            console.error('Error logging activity:', error);
        }
    }

    // Fungsi untuk hapus quiz score
    async function deleteQuizScore(scoreId) {
        try {
            const auth = VirtualLabAuth.getFirebaseAuth();
            const db = VirtualLabAuth.getFirebaseDb();

            if (!db || !auth || !auth.currentUser) {
                return { success: false, message: 'Database tidak tersedia' };
            }

            await db.collection('quiz_scores')
                .doc(auth.currentUser.uid)
                .collection('scores')
                .doc(scoreId)
                .delete();
            
            console.log('✅ Quiz score deleted from Firestore:', scoreId);
            return { success: true, message: 'Hasil quiz berhasil dihapus' };
        } catch (error) {
            console.error('Error deleting quiz score:', error);
            return { success: false, message: error.message };
        }
    }

    // Export fungsi ke global scope
    window.UserData = {
        saveProgress,
        saveSimulationResult,
        saveQuizScore,
        getProgress,
        getAllResults,
        getAllQuizScores,
        logActivity,
        deleteQuizScore,
        waitForFirebase // Export helper
    };
})();