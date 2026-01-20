from gtts import gTTS
import uuid

def speak(text, lang):
    filename = f"audio_{uuid.uuid4()}.mp3"
    tts = gTTS(text=text, lang=lang)
    tts.save(filename)
    return filename
