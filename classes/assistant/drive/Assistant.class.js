const openai = require("openai"); // Ensure the 'openai' package is installed
const fs = require("fs");
const Assistant = require("../../../models/assistantAndThreads/Assistant.model");

class VanillaAssistant {
  constructor(apiKey, id) {
    this.apiKey = apiKey;
    this.id = id;
    this.threadId = null;
    this.openaiApi = new openai.OpenAI(); // Initialize the OpenAI API with the apiKey
    this.model = "gpt-4-1106-preview";
  }

  async createAssistant(
    assistantName,
    description,
    instructions,
    tools,
    model,
    fileIds
  ) {
    try {
      const date=Date()
      console.log(date)
      // Create the assistant with all available tools
      const response = await this.openaiApi.beta.assistants.create({
        name: assistantName,
        description: description,
        instructions: instructions,
         tools : [
          { 
            type: "code_interpreter"
          },
          { 
            type: "retrieval"
          },
          {
            type: "function",
            function: {
              name: "generate_image",
              description: "Generate an image based on provided description",
              parameters: {
                type: "object",
                properties: {
                  prompt: {
                    type: "string",
                    description: "The detailed description of the image to generate"
                  },
                  style: {
                    type: "string",
                    description: "The style of the image and the texture and feeling (e.g., realistic, cartoon)"
                  }
                },
                required: ["prompt"]
              }
            }
          },
          {
            type: "function",
            function: {
              name: "Add",
              description: `The Add function collects and prepares data for a note entry, including its date, time, and text content, for storage. It intelligently processes relative date references (e.g., 'tomorrow', 'after tomorrow', 'next week') by utilizing ${date} as the reference point, ensuring entries are correctly dated. This facilitates the organization of entries before saving in the user's backend system.`,
              parameters: {
                type: "object",
                properties: {
                  "time": {
                    "type": "string",
                    "format": "time",
                    "description": "the time provided by the user."
                  },
                  date: {
                    type: "string",
                    format: "date",
                    description: "The date and time provided from the user if not ask for one , formatted as YYYY-MM-DD. It organizes the entry by its creation or event date."
                  },
                  entry: {
                    type: "string",
                    description: "The text content of the note entry. This is the substantive content of the note that the user wants to record."
                  },
                  entrykind: {
                    type: "string",
                    description: "REQUIRED: One of the three types of entries: note, diary, or calendar.",
                    enum: ["note", "diary", "calendar"]
                  }
                },
                required: ["date", "entry", "entryKind"]
              }
            }
          }
        ],
        
        model: "gpt-4-1106-preview",
        file_ids: fileIds,
      });
      console.log(response);
      return response;
    } catch (error) {
      console.error("Error creating assistant:", error);
    }
  }

  //Listing the assistants that OpenAi has in its DB d
  async listOpenaiAssistants() {
    const myAssistants = await this.openaiApi.beta.assistants.list({
      order: "desc",
      limit: "20",
    });

    return myAssistants.data;
  }

  async deleteAssistant(id) {
    const response = await this.openaiApi.beta.assistants.del(id);

    return response;
  }

  async retrieveAssistant(assistantId) {
    const myAssistant = await this.openaiApi.beta.assistants.retrieve(
      assistantId
    );

    return myAssistant;
  }

  async modifyAssistant(assistantId, name, description, instructions, model) {
    const myUpdatedAssistant = await this.openaiApi.beta.assistants.update(
      assistantId,
      {
        name: name,
        description: description,
        instructions: instructions,
        model: model,
      }
    );

    return myUpdatedAssistant;
  }

  // DB FUNCTIONS

  async listAssistants() {
    return await Assistant._id.find();
  }
}

module.exports = VanillaAssistant;
