(function() {
    'use strict';

    const quizDatabase = {
        'gerak-parabola': {
            title: 'Quiz Gerak Parabola',
            description: 'Uji pemahaman Anda tentang Gerak Parabola',
            questions: [
                {
                    question: 'Apa yang dimaksud dengan gerak parabola?',
                    options: [
                        'Gerak lurus beraturan',
                        'Gerak melingkar beraturan',
                        'Gerak yang membentuk lintasan melengkung akibat gravitasi',
                        'Gerak jatuh bebas'
                    ],
                    correct: 2,
                    explanation: 'Gerak parabola adalah gerak dua dimensi yang membentuk lintasan melengkung karena pengaruh gravitasi.'
                },
                {
                    question: 'Pada sudut berapa derajat proyektil mencapai jangkauan maksimum?',
                    options: ['30°', '45°', '60°', '90°'],
                    correct: 1,
                    explanation: 'Jangkauan maksimum tercapai pada sudut elevasi 45°.'
                },
                {
                    question: 'Komponen kecepatan mana yang konstan dalam gerak parabola?',
                    options: [
                        'Kecepatan vertikal',
                        'Kecepatan horizontal',
                        'Kedua komponen kecepatan',
                        'Tidak ada yang konstan'
                    ],
                    correct: 1,
                    explanation: 'Kecepatan horizontal (vx) konstan karena tidak ada gaya yang bekerja pada arah horizontal (mengabaikan hambatan udara).'
                },
                {
                    question: 'Rumus untuk menghitung tinggi maksimum (h) dalam gerak parabola adalah?',
                    options: [
                        'h = (v₀² sin²θ) / (2g)',
                        'h = (v₀² cos²θ) / (2g)',
                        'h = (v₀² sin θ) / g',
                        'h = v₀ sin θ × t'
                    ],
                    correct: 0,
                    explanation: 'Tinggi maksimum dihitung dengan rumus h = (v₀² sin²θ) / (2g).'
                },
                {
                    question: 'Jika kecepatan awal proyektil digandakan, jangkauan horizontal akan?',
                    options: [
                        'Tetap sama',
                        'Menjadi 2 kali lipat',
                        'Menjadi 4 kali lipat',
                        'Menjadi 8 kali lipat'
                    ],
                    correct: 2,
                    explanation: 'Jangkauan horizontal sebanding dengan kuadrat kecepatan awal (R ∝ v₀²), jadi jika v₀ digandakan, R menjadi 4 kali lipat.'
                }
            ]
        },
        'hukum-newton': {
            title: 'Quiz Hukum Newton',
            description: 'Uji pemahaman Anda tentang Hukum Newton',
            questions: [
                {
                    question: 'Apa bunyi Hukum Newton I?',
                    options: [
                        'F = m × a',
                        'Benda akan tetap diam atau bergerak lurus beraturan jika tidak ada gaya yang bekerja',
                        'Aksi = Reaksi',
                        'Momentum kekal'
                    ],
                    correct: 1,
                    explanation: 'Hukum Newton I menyatakan bahwa benda akan mempertahankan keadaannya (diam atau bergerak lurus beraturan) jika resultan gaya yang bekerja padanya nol.'
                },
                {
                    question: 'Rumus Hukum Newton II adalah?',
                    options: ['F = m × v', 'F = m × a', 'F = m / a', 'F = a / m'],
                    correct: 1,
                    explanation: 'Hukum Newton II: F = m × a (Gaya = massa × percepatan).'
                },
                {
                    question: 'Jika massa benda 2 kg dan percepatannya 5 m/s², berapa gaya yang bekerja?',
                    options: ['5 N', '10 N', '15 N', '20 N'],
                    correct: 1,
                    explanation: 'F = m × a = 2 kg × 5 m/s² = 10 N.'
                },
                {
                    question: 'Apa bunyi Hukum Newton III?',
                    options: [
                        'F = m × a',
                        'Setiap benda memiliki inersia',
                        'Untuk setiap aksi ada reaksi yang sama besar dan berlawanan arah',
                        'Energi kekal'
                    ],
                    correct: 2,
                    explanation: 'Hukum Newton III: Untuk setiap aksi (gaya), ada reaksi yang sama besar tetapi berlawanan arah.'
                },
                {
                    question: 'Sebuah mobil bermassa 1000 kg dipercepat dari 0 ke 20 m/s dalam 5 detik. Berapa gaya yang bekerja?',
                    options: ['2000 N', '4000 N', '5000 N', '10000 N'],
                    correct: 1,
                    explanation: 'a = (v-u)/t = (20-0)/5 = 4 m/s². F = m × a = 1000 × 4 = 4000 N.'
                }
            ]
        },
        'vektor': {
            title: 'Quiz Vektor',
            description: 'Uji pemahaman Anda tentang Vektor',
            questions: [
                {
                    question: 'Apa perbedaan antara besaran skalar dan vektor?',
                    options: [
                        'Skalar memiliki arah, vektor tidak',
                        'Vektor memiliki magnitude dan arah, skalar hanya magnitude',
                        'Keduanya sama saja',
                        'Skalar lebih besar dari vektor'
                    ],
                    correct: 1,
                    explanation: 'Besaran vektor memiliki magnitude (besar) dan arah, sedangkan besaran skalar hanya memiliki magnitude.'
                },
                {
                    question: 'Manakah yang merupakan besaran vektor?',
                    options: ['Massa', 'Waktu', 'Kecepatan', 'Suhu'],
                    correct: 2,
                    explanation: 'Kecepatan adalah besaran vektor karena memiliki magnitude dan arah. Massa, waktu, dan suhu adalah besaran skalar.'
                },
                {
                    question: 'Jika vektor A = (3, 4) dan vektor B = (1, 2), berapa resultan A + B?',
                    options: ['(2, 2)', '(4, 6)', '(3, 8)', '(4, 2)'],
                    correct: 1,
                    explanation: 'Penjumlahan vektor: (3+1, 4+2) = (4, 6).'
                },
                {
                    question: 'Rumus untuk menghitung besar (magnitude) vektor V = (x, y) adalah?',
                    options: ['|V| = x + y', '|V| = x² + y²', '|V| = √(x² + y²)', '|V| = √(x + y)'],
                    correct: 2,
                    explanation: 'Magnitude vektor menggunakan teorema Pythagoras: |V| = √(x² + y²).'
                },
                {
                    question: 'Jika vektor A = (6, 8), berapa besar vektor A?',
                    options: ['10', '14', '48', '100'],
                    correct: 0,
                    explanation: '|A| = √(6² + 8²) = √(36 + 64) = √100 = 10.'
                }
            ]
        }
    };

    let currentQuiz = null;
    let currentQuestionIndex = 0;
    let userAnswers = [];
    let score = 0;
    let quizStartTime = null;

    const quizSelection = document.getElementById('quiz-selection');
    const quizContainer = document.getElementById('quiz-container');
    const resultContainer = document.getElementById('result-container');
    const quizTitle = document.getElementById('quiz-title');
    const questionNumber = document.getElementById('question-number');
    const questionText = document.getElementById('question-text');
    const optionsContainer = document.getElementById('options-container');
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const submitBtn = document.getElementById('submit-btn');
    const progressBar = document.getElementById('progress-bar');
    const timerDisplay = document.getElementById('timer-display');
    const finalScore = document.getElementById('final-score');
    const finalPercentage = document.getElementById('final-percentage');
    const finalMessage = document.getElementById('final-message');
    const reviewAnswers = document.getElementById('review-answers');
    const retakeBtn = document.getElementById('retake-btn');
    const backToSelectionBtn = document.getElementById('back-to-selection-btn');

    let timerInterval = null;

    function init() {
        setupQuizCards();
        setupEventListeners();
    }

    function setupQuizCards() {
        const quizCards = document.querySelectorAll('.quiz-card');
        quizCards.forEach(card => {
            card.addEventListener('click', () => {
                const quizId = card.dataset.quiz;
                startQuiz(quizId);
            });
        });
    }

    function setupEventListeners() {
        if (prevBtn) prevBtn.addEventListener('click', previousQuestion);
        if (nextBtn) nextBtn.addEventListener('click', nextQuestion);
        if (submitBtn) submitBtn.addEventListener('click', submitQuiz);
        if (retakeBtn) retakeBtn.addEventListener('click', () => startQuiz(currentQuiz.id));
        if (backToSelectionBtn) backToSelectionBtn.addEventListener('click', backToSelection);
    }

    function startQuiz(quizId) {
        currentQuiz = { id: quizId, ...quizDatabase[quizId] };
        currentQuestionIndex = 0;
        userAnswers = new Array(currentQuiz.questions.length).fill(null);
        score = 0;
        quizStartTime = Date.now();

        if (window.UserData) {
            UserData.logActivity('quiz_start', `Memulai quiz: ${currentQuiz.title}`);
        }

        quizSelection.style.display = 'none';
        quizContainer.style.display = 'block';
        resultContainer.style.display = 'none';

        quizTitle.textContent = currentQuiz.title;

        startTimer();

        showQuestion();
    }

    function showQuestion() {
        const question = currentQuiz.questions[currentQuestionIndex];
        
        questionNumber.textContent = `Soal ${currentQuestionIndex + 1} dari ${currentQuiz.questions.length}`;
        
        questionText.textContent = question.question;
        
        optionsContainer.innerHTML = '';
        question.options.forEach((option, index) => {
            const optionDiv = document.createElement('div');
            optionDiv.className = 'option';
            if (userAnswers[currentQuestionIndex] === index) {
                optionDiv.classList.add('selected');
            }
            
            optionDiv.innerHTML = `
                <input type="radio" name="answer" id="option${index}" value="${index}" 
                       ${userAnswers[currentQuestionIndex] === index ? 'checked' : ''}>
                <label for="option${index}">${option}</label>
            `;
            
            optionDiv.addEventListener('click', () => selectAnswer(index));
            optionsContainer.appendChild(optionDiv);
        });
        
        updateProgress();
        
        updateButtons();
    }

    function selectAnswer(index) {
        userAnswers[currentQuestionIndex] = index;
        
        const options = optionsContainer.querySelectorAll('.option');
        options.forEach((opt, i) => {
            if (i === index) {
                opt.classList.add('selected');
                opt.querySelector('input').checked = true;
            } else {
                opt.classList.remove('selected');
                opt.querySelector('input').checked = false;
            }
        });
        
        updateButtons();
    }

    function updateProgress() {
        const answeredCount = userAnswers.filter(a => a !== null).length;
        const progress = (answeredCount / currentQuiz.questions.length) * 100;
        progressBar.style.width = progress + '%';
    }

    function updateButtons() {
        prevBtn.disabled = currentQuestionIndex === 0;
        
        if (currentQuestionIndex === currentQuiz.questions.length - 1) {
            nextBtn.style.display = 'none';
            submitBtn.style.display = 'inline-block';
        } else {
            nextBtn.style.display = 'inline-block';
            submitBtn.style.display = 'none';
        }
    }

    function previousQuestion() {
        if (currentQuestionIndex > 0) {
            currentQuestionIndex--;
            showQuestion();
        }
    }

    function nextQuestion() {
        if (currentQuestionIndex < currentQuiz.questions.length - 1) {
            currentQuestionIndex++;
            showQuestion();
        }
    }

    async function submitQuiz() {
        const unanswered = userAnswers.filter(a => a === null).length;
        if (unanswered > 0) {
            const confirm = window.confirm(`Masih ada ${unanswered} soal yang belum dijawab. Yakin ingin submit?`);
            if (!confirm) return;
        }

        score = 0;
        currentQuiz.questions.forEach((q, i) => {
            if (userAnswers[i] === q.correct) {
                score++;
            }
        });

        const percentage = (score / currentQuiz.questions.length) * 100;
        const timeTaken = Math.floor((Date.now() - quizStartTime) / 1000);

        stopTimer();

        console.log('Quiz completed:', {
            quizName: currentQuiz.title,
            score: score,
            maxScore: currentQuiz.questions.length,
            percentage: percentage,
            timeTaken: timeTaken,
            answers: userAnswers
        });

        if (window.UserData) {
            const saveResult = await UserData.saveQuizScore(
                currentQuiz.title,
                score,
                currentQuiz.questions.length,
                userAnswers,
                {
                    timeTaken: timeTaken,
                    quizId: currentQuiz.id,
                    completedAt: new Date().toISOString()
                }
            );

            console.log('Save result:', saveResult);

            await UserData.logActivity('quiz_complete', `Menyelesaikan quiz: ${currentQuiz.title}`, {
                score: score,
                maxScore: currentQuiz.questions.length,
                percentage: percentage.toFixed(1),
                timeTaken: timeTaken
            });
        } else {
            console.error('UserData not available!');
        }

        showResults(percentage, timeTaken);
    }

    function showResults(percentage, timeTaken) {
        quizContainer.style.display = 'none';
        resultContainer.style.display = 'block';

        finalScore.textContent = `${score} / ${currentQuiz.questions.length}`;
        finalPercentage.textContent = percentage.toFixed(1) + '%';

        let message = '';
        if (percentage >= 80) {
            message = '🎉 Luar biasa! Anda sangat memahami materi ini!';
        } else if (percentage >= 60) {
            message = '👍 Bagus! Terus tingkatkan pemahaman Anda!';
        } else {
            message = '💪 Jangan menyerah! Pelajari lagi materinya!';
        }
        finalMessage.textContent = message;

        reviewAnswers.innerHTML = '';
        currentQuiz.questions.forEach((q, i) => {
            const isCorrect = userAnswers[i] === q.correct;
            const reviewItem = document.createElement('div');
            reviewItem.className = 'review-item';
            reviewItem.innerHTML = `
                <div class="review-question">
                    <strong>Soal ${i + 1}:</strong> ${q.question}
                </div>
                <div class="review-answer ${isCorrect ? 'correct' : 'wrong'}">
                    <strong>Jawaban Anda:</strong> ${userAnswers[i] !== null ? q.options[userAnswers[i]] : 'Tidak dijawab'}
                    ${isCorrect ? '✓' : '✗'}
                </div>
                ${!isCorrect ? `
                    <div class="review-correct">
                        <strong>Jawaban Benar:</strong> ${q.options[q.correct]}
                    </div>
                ` : ''}
                <div class="review-explanation">
                    <strong>Penjelasan:</strong> ${q.explanation}
                </div>
            `;
            reviewAnswers.appendChild(reviewItem);
        });
    }

    function startTimer() {
        let seconds = 0;
        timerInterval = setInterval(() => {
            seconds++;
            const minutes = Math.floor(seconds / 60);
            const secs = seconds % 60;
            timerDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        }, 1000);
    }

    function stopTimer() {
        if (timerInterval) {
            clearInterval(timerInterval);
            timerInterval = null;
        }
    }

    function backToSelection() {
        quizSelection.style.display = 'block';
        quizContainer.style.display = 'none';
        resultContainer.style.display = 'none';
        stopTimer();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();