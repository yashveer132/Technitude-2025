export class AccessibilityService {
  constructor() {
    this.speechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    this.speechSynthesis = window.speechSynthesis;
  }

  startVoiceInput() {
    return new Promise((resolve, reject) => {
      if (!this.speechRecognition) {
        reject(new Error("Speech recognition not supported"));
        return;
      }

      const recognition = new this.speechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        resolve(transcript);
      };

      recognition.onerror = (error) => {
        reject(error);
      };

      recognition.start();
    });
  }

  speak(text) {
    return new Promise((resolve, reject) => {
      if (!this.speechSynthesis) {
        reject(new Error("Speech synthesis not supported"));
        return;
      }

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.onend = () => resolve();
      utterance.onerror = (error) => reject(error);
      this.speechSynthesis.speak(utterance);
    });
  }
}
