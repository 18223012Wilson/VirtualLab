// Quiz History Script

(function() {
    'use strict';

    let allQuizzes = [];
    let filteredQuizzes = [];

    // DOM Elements
    const totalQuizzesEl = document.getElementById('totalQuizzes');
    const avgScoreEl = document.getElementById('avgScore');
    const bestScoreEl = document.getElementById('bestScore');
    const passRateEl = document.getElementById('passRate');
    const historyList = document.getElementById('historyList');
    const noData = document.getElementById('noData');
    const filterQuiz = document.getElementById('filterQuiz');
    const filterPeriod = document.getElementById('filterPeriod');
    const sortBy = document.getElementById('sortBy');
    const exportBtn = document.getElementById('exportBtn');

    // Init
    async function init() {
        console.log('Initializing quiz history...');
        
        // Tunggu Firebase siap
        if (window.UserData && window.UserData.waitForFirebase) {
            console.log('Waiting for Firebase to be ready...');
            await UserData.waitForFirebase();
            console.log('Firebase is ready!');
        }
        
        await loadQuizHistory();
        setupEventListeners();
        applyFilters();
    }

    // Load quiz history
    async function loadQuizHistory() {
        try {
            console.log('Loading quiz history...');
            
            // Double check Firebase
            const auth = VirtualLabAuth.getFirebaseAuth();
            const db = VirtualLabAuth.getFirebaseDb();
            console.log('Firebase status before load:');
            console.log('- auth:', auth ? 'OK' : 'NULL');
            console.log('- db:', db ? 'OK' : 'NULL');
            console.log('- currentUser:', auth && auth.currentUser ? auth.currentUser.uid : 'NULL');
            
            if (window.UserData && typeof UserData.getAllQuizScores === 'function') {
                allQuizzes = await UserData.getAllQuizScores();
                console.log('Quiz history loaded from UserData:', allQuizzes.length, 'items');
                if (allQuizzes.length > 0) {
                    console.log('First quiz:', allQuizzes[0]);
                }
            } else {
                console.error('UserData or getAllQuizScores not available');
                allQuizzes = [];
            }
        } catch (error) {
            console.error('Error loading quiz history:', error);
            allQuizzes = [];
        }
    }

    // Setup event listeners
    function setupEventListeners() {
        if (filterQuiz) filterQuiz.addEventListener('change', applyFilters);
        if (filterPeriod) filterPeriod.addEventListener('change', applyFilters);
        if (sortBy) sortBy.addEventListener('change', applyFilters);
        if (exportBtn) exportBtn.addEventListener('click', exportResults);
    }

    // Apply filters
    function applyFilters() {
        console.log('Applying filters to', allQuizzes.length, 'quizzes');
        let filtered = [...allQuizzes];

        // Filter by quiz type
        const quizType = filterQuiz ? filterQuiz.value : 'all';
        if (quizType !== 'all') {
            filtered = filtered.filter(q => q.quizName === quizType);
        }

        // Filter by period
        const period = filterPeriod ? filterPeriod.value : 'all';
        const now = new Date();
        filtered = filtered.filter(q => {
            const quizDate = new Date(q.timestamp);
            switch(period) {
                case 'today':
                    return quizDate.toDateString() === now.toDateString();
                case 'week':
                    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                    return quizDate >= weekAgo;
                case 'month':
                    return quizDate.getMonth() === now.getMonth() && 
                           quizDate.getFullYear() === now.getFullYear();
                default:
                    return true;
            }
        });

        // Sort
        const sortType = sortBy ? sortBy.value : 'newest';
        filtered.sort((a, b) => {
            switch(sortType) {
                case 'newest':
                    return new Date(b.timestamp) - new Date(a.timestamp);
                case 'oldest':
                    return new Date(a.timestamp) - new Date(b.timestamp);
                case 'highest':
                    return b.percentage - a.percentage;
                case 'lowest':
                    return a.percentage - b.percentage;
                default:
                    return 0;
            }
        });

        filteredQuizzes = filtered;
        console.log('Filtered quizzes:', filteredQuizzes.length);
        
        displayQuizzes();
        updateStatistics();
    }

    // Display quizzes
    function displayQuizzes() {
        console.log('Displaying', filteredQuizzes.length, 'quizzes');
        
        if (!historyList || !noData) {
            console.error('DOM elements not found');
            return;
        }

        if (filteredQuizzes.length === 0) {
            historyList.style.display = 'none';
            noData.style.display = 'block';
            return;
        }

        historyList.style.display = 'flex';
        noData.style.display = 'none';
        historyList.innerHTML = '';

        filteredQuizzes.forEach((quiz, index) => {
            const item = createQuizItem(quiz, index);
            historyList.appendChild(item);
        });

        console.log('✅ Quizzes displayed');
    }

    // Create quiz item
    function createQuizItem(quiz, index) {
        const div = document.createElement('div');
        div.className = 'history-item';

        const date = new Date(quiz.timestamp);
        const dateStr = date.toLocaleString('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });

        const badge = getBadge(quiz.percentage);
        const timeTaken = calculateTimeTaken(quiz);

        div.innerHTML = `
            <div class="history-header">
                <div>
                    <div class="history-title">${quiz.quizName}</div>
                    <div class="history-date">📅 ${dateStr}</div>
                </div>
                <div class="history-score">
                    <div class="score-value">${quiz.score}/${quiz.maxScore}</div>
                    <div class="score-percentage">${quiz.percentage.toFixed(1)}%</div>
                </div>
            </div>

            <div class="history-details">
                <div class="detail-item">
                    <span class="icon">⏱️</span>
                    <span>${timeTaken}</span>
                </div>
                <div class="detail-item">
                    <span class="icon">✅</span>
                    <span>${quiz.score} Benar</span>
                </div>
                <div class="detail-item">
                    <span class="icon">❌</span>
                    <span>${quiz.maxScore - quiz.score} Salah</span>
                </div>
                <div class="detail-item">
                    <span class="badge ${badge.class}">${badge.text}</span>
                </div>
            </div>

            <div class="history-actions">
                <button class="btn btn-small" onclick="QuizHistory.viewDetails(${index})">
                    📋 Lihat Detail
                </button>
                <button class="btn btn-small" onclick="QuizHistory.retakeQuiz('${quiz.quizName}')">
                    🔄 Ulangi Quiz
                </button>
                <button class="btn btn-small" onclick="QuizHistory.deleteQuiz(${index})">
                    🗑️ Hapus
                </button>
            </div>

            <div class="answer-review" id="review-${index}" style="display: none;">
                <!-- Will be populated when view details is clicked -->
            </div>
        `;

        return div;
    }

    // Get badge
    function getBadge(percentage) {
        if (percentage >= 80) {
            return { class: 'excellent', text: '🎉 Luar Biasa' };
        } else if (percentage >= 60) {
            return { class: 'good', text: '👍 Bagus' };
        } else if (percentage >= 40) {
            return { class: 'needs-improvement', text: '💪 Perlu Ditingkatkan' };
        } else {
            return { class: 'failed', text: '😔 Perlu Belajar Lagi' };
        }
    }

    // Calculate time taken
    function calculateTimeTaken(quiz) {
        if (quiz.metadata && quiz.metadata.timeTaken !== undefined) {
            const seconds = quiz.metadata.timeTaken;
            const minutes = Math.floor(seconds / 60);
            const secs = seconds % 60;
            return `${minutes} menit ${secs} detik`;
        }
        
        if (quiz.timeTaken !== undefined) {
            const seconds = quiz.timeTaken;
            const minutes = Math.floor(seconds / 60);
            const secs = seconds % 60;
            return `${minutes} menit ${secs} detik`;
        }
        
        return 'Tidak tersedia';
    }

    // Update statistics
    function updateStatistics() {
        console.log('Updating statistics for', allQuizzes.length, 'quizzes');
        
        if (!totalQuizzesEl || !avgScoreEl || !bestScoreEl || !passRateEl) {
            console.error('Statistics DOM elements not found');
            return;
        }

        const total = allQuizzes.length;
        totalQuizzesEl.textContent = total;

        if (total === 0) {
            avgScoreEl.textContent = '0%';
            bestScoreEl.textContent = '0%';
            passRateEl.textContent = '0%';
            return;
        }

        // Average score
        const avgPercentage = allQuizzes.reduce((sum, q) => sum + q.percentage, 0) / total;
        avgScoreEl.textContent = avgPercentage.toFixed(1) + '%';

        // Best score
        const best = Math.max(...allQuizzes.map(q => q.percentage));
        bestScoreEl.textContent = best.toFixed(1) + '%';

        // Pass rate (>=60%)
        const passed = allQuizzes.filter(q => q.percentage >= 60).length;
        const passRate = (passed / total) * 100;
        passRateEl.textContent = passRate.toFixed(1) + '%';

        console.log('✅ Statistics updated');
    }

    // View details
    function viewDetails(index) {
        const reviewDiv = document.getElementById(`review-${index}`);
        if (!reviewDiv) return;

        if (reviewDiv.style.display === 'none') {
            const quiz = filteredQuizzes[index];
            reviewDiv.innerHTML = '<h4 style="margin-bottom: var(--spacing-md);">Review Jawaban:</h4>';
            
            if (quiz.answers && Array.isArray(quiz.answers)) {
                quiz.answers.forEach((answer, i) => {
                    const answerDiv = document.createElement('div');
                    answerDiv.className = 'answer-item';
                    answerDiv.innerHTML = `
                        <strong>Soal ${i + 1}:</strong> 
                        Jawaban: ${answer !== null ? 'Opsi ' + (answer + 1) : 'Tidak dijawab'}
                    `;
                    reviewDiv.appendChild(answerDiv);
                });
            } else {
                reviewDiv.innerHTML += '<p style="color: var(--text-muted);">Detail jawaban tidak tersedia</p>';
            }
            
            reviewDiv.style.display = 'block';
        } else {
            reviewDiv.style.display = 'none';
        }
    }

    // Retake quiz
    function retakeQuiz(quizName) {
        window.location.href = 'quiz.html';
    }

    // Delete quiz
    async function deleteQuiz(index) {
        const confirmed = confirm('Apakah Anda yakin ingin menghapus hasil quiz ini?');
        if (!confirmed) return;

        try {
            const quiz = filteredQuizzes[index];
            
            if (quiz.id) {
                const result = await UserData.deleteQuizScore(quiz.id);
                
                if (result.success) {
                    await loadQuizHistory();
                    applyFilters();
                    alert('Hasil quiz berhasil dihapus');
                } else {
                    alert('Gagal menghapus hasil quiz: ' + result.message);
                }
            } else {
                alert('Tidak dapat menghapus quiz: ID tidak ditemukan');
            }
        } catch (error) {
            console.error('Error deleting quiz:', error);
            alert('Gagal menghapus hasil quiz');
        }
    }

    // Export results
    function exportResults() {
        if (filteredQuizzes.length === 0) {
            alert('Tidak ada data untuk diekspor');
            return;
        }

        const currentUser = VirtualLabAuth.getCurrentUser();
        const username = currentUser?.username || 'user';
        
        let csvContent = 'Quiz,Tanggal,Nilai,Persentase,Status\n';
        
        filteredQuizzes.forEach(quiz => {
            const date = new Date(quiz.timestamp).toLocaleString('id-ID');
            const badge = getBadge(quiz.percentage);
            csvContent += `"${quiz.quizName}","${date}","${quiz.score}/${quiz.maxScore}","${quiz.percentage.toFixed(1)}%","${badge.text}"\n`;
        });

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `quiz_history_${username}_${Date.now()}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        alert('Hasil quiz berhasil diekspor!');
    }

    // Export functions
    window.QuizHistory = {
        viewDetails,
        retakeQuiz,
        deleteQuiz
    };

    // Start - PASTIKAN INI DIJALANKAN
    console.log('Quiz history script loaded, waiting for DOM...');
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            console.log('DOM loaded, initializing...');
            init();
        });
    } else {
        console.log('DOM already loaded, initializing...');
        init();
    }
})();