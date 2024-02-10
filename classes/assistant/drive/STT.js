const  OpenAIAPI  = require('openai'); // Make sure this import matches the actual SDK
const fs = require('fs');

class STT {
    constructor(apiKey) {
        this.openai = new OpenAIAPI(apiKey ); // Instantiate a new OpenAI object with the API key
    }

    async generateSpeech(filePath) {
        try {
            // Ensure you are using the correct method as per the SDK's documentation
            const transcription = await this.openai.audioTranscription.create({
                file: fs.createReadStream(filePath),
                model: "whisper-1",
            });
            
            return transcription;
        } catch (error) {
            console.error('Error in generating speech:', error);
            throw error;
        }
    }
}

module.exports = STT;
