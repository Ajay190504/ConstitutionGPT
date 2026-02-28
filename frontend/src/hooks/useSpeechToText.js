import { useState, useEffect, useCallback } from 'react';

const useSpeechToText = () => {
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [error, setError] = useState(null);

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    const recognition = SpeechRecognition ? new SpeechRecognition() : null;

    if (recognition) {
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-IN'; // Optimized for Indian English, can be changed
    }

    const startListening = useCallback(() => {
        if (!recognition) {
            setError('Speech recognition not supported in this browser.');
            return;
        }

        setTranscript('');
        setError(null);
        setIsListening(true);

        try {
            recognition.start();
        } catch (e) {
            setError('Already listening or recognition failed.');
            setIsListening(false);
        }
    }, [recognition]);

    const stopListening = useCallback(() => {
        if (recognition) {
            recognition.stop();
            setIsListening(false);
        }
    }, [recognition]);

    useEffect(() => {
        if (!recognition) return;

        recognition.onresult = (event) => {
            const currentTranscript = event.results[0][0].transcript;
            setTranscript(currentTranscript);
            setIsListening(false);
        };

        recognition.onerror = (event) => {
            setError(event.error);
            setIsListening(false);
        };

        recognition.onend = () => {
            setIsListening(false);
        };

        return () => {
            recognition.stop();
        };
    }, [recognition]);

    return { isListening, transcript, error, startListening, stopListening };
};

export default useSpeechToText;
