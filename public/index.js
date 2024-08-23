let flashcards = [];
let currentFlashcardIndex = 0;

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

async function generateWrongAnswers(apiKey, correctAnswer) {
    try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: "gpt-3.5-turbo",
                messages: [
                    {
                        role: "system",
                        content: "You are a helpful assistant."
                    },
                    {
                        role: "user",
                        content: `Generate 3 contextually similar but incorrect answers for the following answer: "${correctAnswer}". Separate each answer with a comma.`
                    }
                ],
                max_tokens: 60,
                temperature: 0.7,
                n: 1
            })
        });

        if (!response.ok) {
            throw new Error(`API request failed with status ${response.status}`);
        }

        const data = await response.json();
        const wrongAnswers = data.choices[0].message.content.trim().split(',').map(answer => answer.trim()).filter(answer => answer);

        // Ensure there are exactly 3 wrong answers
        while (wrongAnswers.length < 3) {
            wrongAnswers.push(""); // Add empty strings if there are fewer than 3 answers
        }

        return wrongAnswers;

    } catch (error) {
        console.error('Error generating wrong answers:', error);
        return []; // Return an empty array if there's an error
    }
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
    const apiKeyInput = document.getElementById('apiKeyInput');

    flashcardContainer.innerHTML = ""; // Clear previous flashcards
    feedback.innerHTML = "";
    nextButton.classList.add('hidden');

    if (index >= flashcards.length) {
        feedback.textContent = "End of flashcards.";
        return;
    }

    const currentFlashcard = flashcards[index];
    const correctAnswer = currentFlashcard[0];

    generateWrongAnswers(apiKeyInput.value, correctAnswer).then(wrongAnswers => {
        const questionDiv = document.createElement("div");
        questionDiv.className = "bg-white shadow-lg rounded-lg p-6 m-4 text-center text-2xl font-semibold";
        questionDiv.textContent = currentFlashcard[1]; // Display the question
        flashcardContainer.appendChild(questionDiv);

        const allAnswers = [correctAnswer, ...wrongAnswers];
        shuffleArray(allAnswers).forEach(answer => {
            const div = document.createElement("div");
            div.className = "flashcard bg-white shadow-lg rounded-lg border border-gray-200 p-6 m-4 text-center text-2xl font-semibold cursor-pointer transition-transform transform hover:-translate-y-2 hover:bg-blue-50";
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
    });
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

    const reader = new FileReader();
    reader.onload = async function(event) {
        const fileContent = event.target.result;
        const lines = fileContent.split('\n');
        flashcards = [];

        for (let line of lines) {
            const [question, correctAnswer] = line.split(',');
            if (question && correctAnswer) {
                flashcards.push([correctAnswer.trim(), question.trim()]);
            }
        }

        currentFlashcardIndex = 0;
        displayFlashcard(currentFlashcardIndex);
    };
    reader.readAsText(file);
}

document.getElementById("nextButton").onclick = function() {
    currentFlashcardIndex++;
    if (currentFlashcardIndex < flashcards.length) {
        displayFlashcard(currentFlashcardIndex);
    } else {
        document.getElementById("feedback").textContent = "End of flashcards.";
        this.classList.add('hidden');
    }
};
