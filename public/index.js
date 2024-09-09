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

        while (wrongAnswers.length < 3) {
            wrongAnswers.push("");
        }

        return wrongAnswers;

    } catch (error) {
        console.error('Error generating wrong answers:', error);
        return [];
    }
}

function displayRandomGif(gifFolder) {
    const randomNum = Math.floor(Math.random() * 5) + 1;
    const gifUrl = `${gifFolder}${randomNum}.gif`;
    console.log('displayRandomGif called with:', gifFolder);
    console.log('Gif URL:', gifUrl);
    const gifElement = document.getElementById('random-gif');
    gifElement.src = gifUrl;
}

function displayFlashcard(index) {
    const flashcardContainer = document.getElementById("flashcardContainer");
    const feedback = document.getElementById("feedback");
    const nextButton = document.getElementById("nextButton");
    const apiKeyInput = document.getElementById('apiKeyInput');

    flashcardContainer.innerHTML = "";
    feedback.innerHTML = "";
    nextButton.classList.add('hidden');

    if (index >= flashcards.length) {
        feedback.textContent = "End of flashcards.";
        return;
    }

    const currentFlashcard = flashcards[index];
    const correctAnswer = currentFlashcard[0];

    async function generateWrongAnswers(apiKey, correctAnswer) {
        try {
            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: "gpt-4-turbo",  // Updated to GPT-4 Turbo
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
    
            // Ensure the response is valid
            if (!data.choices || data.choices.length === 0 || !data.choices[0].message.content) {
                throw new Error("API returned an invalid format");
            }
    
            const wrongAnswers = data.choices[0].message.content.trim()
                .split(',')
                .map(answer => answer.trim())
                .filter(answer => answer);
    
            // Ensure 3 wrong answers even if the API returns less
            while (wrongAnswers.length < 3) {
                wrongAnswers.push("");
            }
    
            return wrongAnswers;
    
        } catch (error) {
            console.error('Error generating wrong answers:', error);
    
            // Display error message to user
            const feedbackElement = document.getElementById('feedback');
            feedbackElement.textContent = "Error generating wrong answers. Please check your API key or try again later.";
            feedbackElement.classList.add('text-red-500');
    
            return [];  // Return empty array in case of failure
        }
    }
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
