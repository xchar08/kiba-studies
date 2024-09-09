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
