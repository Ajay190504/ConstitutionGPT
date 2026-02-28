from gtts import gTTS
import uuid
import os

def speak(text, lang):
    filename = f"audio_{uuid.uuid4()}.mp3"
    filepath = os.path.join("uploads", filename)
    tts = gTTS(text=text, lang=lang)
    tts.save(filepath)
    return filename
