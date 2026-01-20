from googletrans import Translator

translator = Translator()

def translate_text(text, lang):
    if lang == "en":
        return text
    return translator.translate(text, dest=lang).text
