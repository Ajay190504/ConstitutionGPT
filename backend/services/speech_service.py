import speech_recognition as sr
import io
import base64
from services.text_to_speech import speak
from services.translate import translate_text

class SpeechService:
    @staticmethod
    def speech_to_text(audio_data):
        """Convert speech audio data to text"""
        recognizer = sr.Recognizer()
        
        try:
            # Decode base64 audio data
            audio_bytes = base64.b64decode(audio_data)
            
            # Use io.BytesIO to create a file-like object
            audio_file = io.BytesIO(audio_bytes)
            
            # Use speech recognition
            with sr.AudioFile(audio_file) as source:
                audio = recognizer.record(source)
                text = recognizer.recognize_google(audio)
                return {"success": True, "text": text}
                
        except sr.UnknownValueError:
            return {"success": False, "error": "Could not understand audio"}
        except sr.RequestError as e:
            return {"success": False, "error": f"Speech recognition error: {e}"}
        except Exception as e:
            return {"success": False, "error": f"Error processing audio: {e}"}
    
    @staticmethod
    def text_to_speech(text, lang="en"):
        """Convert text to speech audio file"""
        try:
            filename = speak(text, lang)
            return {"success": True, "filename": filename}
        except Exception as e:
            return {"success": False, "error": f"Error generating speech: {e}"}
    
    @staticmethod
    def translate_and_speak(text, target_lang):
        """Translate text and convert to speech"""
        try:
            # First translate the text
            translated_text = translate_text(text, target_lang)
            
            # Then convert to speech
            result = SpeechService.text_to_speech(translated_text, target_lang)
            
            if result["success"]:
                return {
                    "success": True,
                    "translated_text": translated_text,
                    "filename": result["filename"]
                }
            else:
                return result
                
        except Exception as e:
            return {"success": False, "error": f"Error in translate and speak: {e}"}
