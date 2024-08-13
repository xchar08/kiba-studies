const express = require('express');
const fileUpload = require('express-fileupload');
const { OpenAI } = require('openai'); // Correctly import OpenAI class
const fs = require('fs').promises;
const path = require('path');
const os = require('os');

const app = express();

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(fileUpload({ useTempFiles: true, tempFileDir: os.tmpdir() }));

app.post('/generate-answers', async (req, res) => {
    const file = req.files?.file;
    const apiKey = req.body?.apiKey;

    if (!file || !apiKey) {
        return res.status(400).send('Missing file or API key.');
    }

    try {
        const data = await fs.readFile(file.tempFilePath, 'utf8');
        const lines = data.split('\n').filter(line => line.trim());

        let prompt = "Generate 3 false answers for each question in the format 'Answer, Answer, Answer' based on the correct answer provided. Don't include the question itself in the response.\n\n";

        lines.forEach(line => {
            const [question, correctAnswer] = line.split(',').map(part => part.trim());
            prompt += `Question: ${question}\nCorrect Answer: ${correctAnswer}\n\n`;
        });

        const openai = new OpenAI({
            apiKey,
        });

        const response = await openai.completions.create({
            model: 'gpt-3.5-turbo',
            prompt,
            max_tokens: 150,
        });

        const generatedText = response.data.choices[0]?.text;
        if (!generatedText) throw new Error('No content generated.');

        const flashcards = [];
        const linesWithAnswers = generatedText.trim().split('\n\n');
        linesWithAnswers.forEach(line => {
            const [answers] = line.split('\n');
            flashcards.push(answers.split(',').map(answer => answer.trim()));
        });

        res.json(flashcards);
    } catch (error) {
        console.error('Error:', error.message);
        if (error.response?.status === 429) {
            res.status(429).send('Quota exceeded. Please check your plan and billing details.');
        } else {
            res.status(500).send('An error occurred while processing your request.');
        }
    } finally {
        if (file?.tempFilePath) {
            await fs.unlink(file.tempFilePath).catch(err => console.error('Cleanup Error:', err.message));
        }
    }
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server started on http://localhost:${PORT}`);
});
