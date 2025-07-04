document.addEventListener('DOMContentLoaded', () => {
    // Screens
    const startScreen = document.getElementById('start-screen');
    const genderSelectionScreen = document.getElementById('gender-selection-screen');
    const questionScreen = document.getElementById('question-screen');
    const resultScreen = document.getElementById('result-screen');

    // Buttons
    const startBtn = document.getElementById('start-btn');
    const maleBtn = document.getElementById('male-btn');
    const femaleBtn = document.getElementById('female-btn');
    const restartBtn = document.getElementById('restart-btn');
    const shareFacebookBtn = document.getElementById('share-facebook-btn');
    const shareInstagramBtn = document.getElementById('share-instagram-btn');
    const navStartBtn = document.getElementById('nav-start');
    const navIntroBtn = document.getElementById('nav-intro');
    const closeModalBtn = document.getElementById('close-modal-btn');
    const faqLink = document.getElementById('faq-link');
    const faqModal = document.getElementById('faq-modal');
    const closeFaqModalBtn = document.getElementById('close-faq-modal-btn');
    const contactLink = document.getElementById('contact-link');
    const contactEmail = document.getElementById('contact-email');

    // Question elements
    const questionText = document.getElementById('question-text');
    const answerButtons = document.getElementById('answer-buttons');
    const progressBar = document.getElementById('progress');

    // Result elements
    const resultTitle = document.getElementById('result-title');
    const resultDescription = document.getElementById('result-description');
    const resultPercentages = document.getElementById('result-percentages');
    const resultImage = document.getElementById('result-image');

    // Modal
    const introModal = document.getElementById('intro-modal');

    // Dark Mode
    const darkModeToggle = document.getElementById('dark-mode-toggle-icons');
    const sunIcon = document.getElementById('sun-icon');
    const moonIcon = document.getElementById('moon-icon');

    let questions = [];
    let currentQuestionIndex = 0;
    let userAnswers = [];
    let userGender = null;
    let resultsData = [];

    // --- Dark Mode Logic ---
    function setDarkMode(isDark) {
        if (isDark) {
            document.body.classList.add('dark-mode');
            localStorage.setItem('darkMode', 'enabled');
        } else {
            document.body.classList.remove('dark-mode');
            localStorage.setItem('darkMode', 'disabled');
        }
    }

    // Check for saved dark mode preference
    if (localStorage.getItem('darkMode') === 'enabled') {
        setDarkMode(true);
        sunIcon.classList.add('hidden');
        moonIcon.classList.remove('hidden');
    }

    darkModeToggle.addEventListener('click', () => {
        const isDarkMode = document.body.classList.contains('dark-mode');
        setDarkMode(!isDarkMode);
        sunIcon.classList.toggle('hidden');
        moonIcon.classList.toggle('hidden');
    });

    // --- Modal Logic ---
    navIntroBtn.addEventListener('click', () => {
        introModal.classList.remove('hidden');
    });

    closeModalBtn.addEventListener('click', () => {
        introModal.classList.add('hidden');
    });

    introModal.addEventListener('click', (e) => {
        if (e.target === introModal) { // Close if clicked on overlay
            introModal.classList.add('hidden');
        }
    });

    faqLink.addEventListener('click', (e) => {
        e.preventDefault();
        faqModal.classList.remove('hidden');
    });

    closeFaqModalBtn.addEventListener('click', () => {
        faqModal.classList.add('hidden');
    });

    faqModal.addEventListener('click', (e) => {
        if (e.target === faqModal) { // Close if clicked on overlay
            faqModal.classList.add('hidden');
        }
    });

    contactLink.addEventListener('click', (e) => {
        e.preventDefault();
        contactEmail.classList.toggle('hidden');
    });


    // --- Test Logic ---
    async function fetchQuestions() {
        try {
            const questionsResponse = await fetch('/api/questions');
            questions = await questionsResponse.json();
            const resultsResponse = await fetch('/api/results');
            resultsData = await resultsResponse.json();
            startTest();
        } catch (error) {
            console.error("Error fetching data:", error);
            alert("데이터를 불러오는 데 실패했습니다. 페이지를 새로고침 해주세요.");
        }
    }

    function startTest() {
        genderSelectionScreen.classList.add('hidden');
        questionScreen.classList.remove('hidden');
        resultScreen.classList.add('hidden'); // Ensure result screen is hidden
        currentQuestionIndex = 0;
        userAnswers = [];
        showQuestion();
    }

    function showQuestion() {
        if (currentQuestionIndex < questions.length) {
            const question = questions[currentQuestionIndex];
            questionText.textContent = question.text;
            answerButtons.innerHTML = '';

            question.answers.forEach(answer => {
                const button = document.createElement('button');
                button.textContent = answer.text;
                button.onclick = () => selectAnswer(answer.type);
                answerButtons.appendChild(button);
            });

            updateProgress();
        } else {
            showResult();
        }
    }

    function selectAnswer(type) {
        userAnswers.push(type);
        currentQuestionIndex++;
        showQuestion();
    }

    function updateProgress() {
        const progressPercentage = (currentQuestionIndex / questions.length) * 100;
        progressBar.style.width = `${progressPercentage}%`;
    }

    async function showResult() {
        questionScreen.classList.add('hidden');
        resultScreen.classList.remove('hidden');

        try {
            const response = await fetch('/api/submit', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ answers: userAnswers }),
            });
            const result = await response.json();

            resultTitle.textContent = result.title;
            resultDescription.textContent = result.description;

            // Set and display the character image
            resultImage.src = `/static/character/${result.title}.jpg`;
            resultImage.classList.remove('hidden');

            // Calculate and display percentages
            const totalAnswers = userAnswers.length;
            const typeCounts = {};
            userAnswers.forEach(answer => {
                typeCounts[answer] = (typeCounts[answer] || 0) + 1;
            });

            resultPercentages.innerHTML = '';
            for (let i = 0; i < 4; i++) {
                const percentage = ((typeCounts[i] || 0) / totalAnswers) * 100;
                const percentageElement = document.createElement('p');
                const resultType = resultsData.find(r => r.type === i.toString());
                percentageElement.textContent = `${resultType.title}: ${percentage.toFixed(2)}%`;
                resultPercentages.appendChild(percentageElement);
            }
        } catch (error) {
            console.error("Error submitting answers:", error);
            resultTitle.textContent = "오류";
            resultDescription.textContent = "결과를 불러오는 데 실패했습니다. 다시 시도해주세요.";
        }
    }

    function restartTest() {
        resultScreen.classList.add('hidden');
        startScreen.classList.remove('hidden');
        progressBar.style.width = '0%'; // Reset progress bar
    }

    // Event Listeners
    startBtn.addEventListener('click', () => {
        startScreen.classList.add('hidden');
        genderSelectionScreen.classList.remove('hidden');
    });

    maleBtn.addEventListener('click', () => {
        userGender = 'male';
        fetchQuestions();
    });

    femaleBtn.addEventListener('click', () => {
        userGender = 'female';
        fetchQuestions();
    });

    navStartBtn.addEventListener('click', (e) => {
        e.preventDefault(); // Prevent anchor link behavior
        startScreen.classList.add('hidden');
        genderSelectionScreen.classList.remove('hidden');
    });
    restartBtn.addEventListener('click', restartTest);

    shareFacebookBtn.addEventListener('click', () => {
        const url = window.location.href;
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`);
    });

    shareInstagramBtn.addEventListener('click', () => {
        alert("인스타그램은 직접 앱에서 공유 기능을 사용해주세요.");
    });
});
