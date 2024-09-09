import React, { useState } from 'react'; // Removed unused hooks
import FlashcardContainer from './components/FlashcardContainer';
import GifDisplay from './components/GifDisplay';
import Input from './components/Input';
import OpenAI from 'openai'; // Import OpenAI client

function App() {
  const [flashcards, setFlashcards] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [gifUrl, setGifUrl] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [currentFlashcardAnswers, setCurrentFlashcardAnswers] = useState([]);
  const [fileUploaded, setFileUploaded] = useState(false);
  const [apiKeySubmitted, setApiKeySubmitted] = useState(false);

  // Function to shuffle array
  const shuffleArray = (array) => {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  };

  // Handle file upload and process content
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target.result;
      const lines = text.split('\n');
      const parsedFlashcards = lines
        .map((line) => {
          const [question, correctAnswer] = line.split(',');
          if (question && correctAnswer) {
            return [correctAnswer.trim(), question.trim()];
          }
          return null;
        })
        .filter((flashcard) => flashcard !== null); // Remove invalid entries

      if (parsedFlashcards.length > 0) {
        setFlashcards(parsedFlashcards);
        setCurrentIndex(0); // Reset to the first flashcard
        setFileUploaded(true); // Mark that the file has been uploaded
      }
    };
    reader.readAsText(file);
  };

  // Function to generate wrong answers using OpenAI client
  const generateWrongAnswers = async () => {
    try {
      if (flashcards.length === 0) return;

      const correctAnswer = flashcards[currentIndex][0]; // Correct answer for the current flashcard

      // Initialize OpenAI client with dynamic API key
      const openai = new OpenAI({
        apiKey: apiKey, // Use the dynamically input API key
        dangerouslyAllowBrowser: true
      });

      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini', // Model you're using
        messages: [
          { role: 'user', content: `Generate 3 wrong answers for: "${correctAnswer}"` }
        ],
        temperature: 0.7,
      });

      const wrongAnswers = response.choices[0].message.content
        .split(',')
        .map((answer) => answer.trim());

      // Ensure there are 3 wrong answers
      while (wrongAnswers.length < 3) {
        wrongAnswers.push('');
      }

      const allAnswers = shuffleArray([correctAnswer, ...wrongAnswers]);
      setCurrentFlashcardAnswers(allAnswers);

    } catch (error) {
      console.error('Error generating wrong answers:', error);
    }
  };

  // Function to display a random gif from the correct folder
  const displayRandomGif = (folder) => {
    const randomNum = Math.floor(Math.random() * 5) + 1;
    setGifUrl(`${process.env.PUBLIC_URL}/${folder}/${randomNum}.gif`);
  };

  const handleAnswer = (answer) => {
    const correctAnswer = flashcards[currentIndex][0];
    if (answer === correctAnswer) {
      displayRandomGif('kibahappy'); // Show happy gif
    } else {
      displayRandomGif('kibasad'); // Show sad gif
    }
  };

  // Only make the API call when both file and API key are submitted
  const handleSubmit = () => {
    if (fileUploaded && apiKeySubmitted) {
      generateWrongAnswers();
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-100">
      <Input type="file" onChange={handleFileUpload} accept=".txt" />
      <Input
        type="text"
        placeholder="Enter API Key"
        onChange={(e) => setApiKey(e.target.value)}
      />
      <button
        className="p-3 bg-blue-600 text-white rounded-lg mb-4 w-full max-w-md text-center text-lg hover:bg-blue-700"
        onClick={() => {
          setApiKeySubmitted(true);
          handleSubmit();
        }}
      >
        Upload and Generate
      </button>
      <GifDisplay gifUrl={gifUrl} />

      {flashcards.length > 0 && currentFlashcardAnswers.length > 0 && (
        <FlashcardContainer
          question={flashcards[currentIndex][1]}  // Pass the question
          answers={currentFlashcardAnswers}      // Pass the answers
          handleAnswer={handleAnswer}
        />
      )}
    </div>
  );
}

export default App;
