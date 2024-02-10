const voice = require('elevenlabs-node');

class TTS {
    constructor(apiKey) {
        this.apiKey = apiKey;
    }

    async generateSpeech(text, voiceId) {
        try {
            console.log("Converting text to audio...");
            const audioStream = await voice.textToSpeechStream(this.apiKey, voiceId, text);
            return audioStream;
        } catch (error) {
            console.error('Error in generating speech:', error);
            throw error;
        }
    }

    async getVoices() {
        try {
            console.log("Fetching available voices...");
            const response = await axios.get(`${this.baseUrl}/voices`, {
                headers: { 'Authorization': `Bearer ${this.apiKey}` }
            });
            console.log(response.usage);
            return response.data; // Assuming the API returns the list of voices directly in response data
        } catch (error) {
            console.error('Error in fetching voices:', error);
            throw error;
        }
    }
}

module.exports = TTS;
