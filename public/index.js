let flashcards = [];
let currentFlashcardIndex = 0;

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function generateWrongAnswers(correctAnswer) {
    const wrongAnswers = [];
    while (wrongAnswers.length < 3) {
        const randomNumber = Math.floor(Math.random() * 100) + 1;
        const answer = `Fake ${randomNumber}`; // Simple fake answers
        if (answer !== correctAnswer && !wrongAnswers.includes(answer)) {
            wrongAnswers.push(answer);
        }
    }
    return wrongAnswers;
}

function displayRandomGif(gifFolder) {
    const randomNum = Math.floor(Math.random() * 5) + 1;
    const gifUrl = `${gifFolder}${randomNum}.gif`;
    document.getElementById('random-gif').src = gifUrl;
}

function displayFlashcard(index) {
    const flashcardContainer = document.getElementById("flashcardContainer");
    const feedback = document.getElementById("feedback");
    const nextButton = document.getElementById("nextButton");

    flashcardContainer.innerHTML = "";
    feedback.innerHTML = "";
    nextButton.classList.add('hidden');

    if (index >= flashcards.length) {
        feedback.textContent = "End of flashcards.";
        return;
    }

    const currentFlashcard = flashcards[index];
    const correctAnswer = currentFlashcard[0];
    const wrongAnswers = generateWrongAnswers(correctAnswer);

    const questionDiv = document.createElement("div");
    questionDiv.textContent = currentFlashcard[1]; // Display the question
    flashcardContainer.appendChild(questionDiv);

    const allAnswers = [correctAnswer, ...wrongAnswers];
    shuffleArray(allAnswers).forEach(answer => {
        const div = document.createElement("div");
        div.className = "flashcard";
        div.textContent = answer;
        div.onclick = function() {
            if (answer === correctAnswer) {
                displayRandomGif('./kibahappy/');
            } else {
                displayRandomGif('./kibasad/');
            }
            nextButton.classList.remove('hidden');
        };
        flashcardContainer.appendChild(div);
    });

    nextButton.onclick = function() {
        currentFlashcardIndex++;
        displayFlashcard(currentFlashcardIndex);
    };
}

async function handleFile() {
    const fileInput = document.getElementById('fileInput');
    const apiKeyInput = document.getElementById('apiKeyInput');
    const file = fileInput.files[0];
    const apiKey = apiKeyInput.value;

    if (!file || !apiKey) {
        alert('Please provide both a file and an API key.');
        return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('apiKey', apiKey);

    try {
        const response = await fetch('/generate-answers', {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            throw new Error('Failed to generate answers');
        }

        const generatedFlashcards = await response.json();
        flashcards = generatedFlashcards.map(([correctAnswer, ...wrongAnswers]) => [correctAnswer, ...wrongAnswers]);
        currentFlashcardIndex = 0;
        displayFlashcard(currentFlashcardIndex);
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred while generating answers. Check the console for details.');
    }
}

