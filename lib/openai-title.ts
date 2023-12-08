import OpenAI from 'openai';
import { OpenAIStream, StreamingTextResponse } from 'ai';
import { JustinaChatMessage, cleanMessages } from './justina';

// Create an OpenAI API client (that's edge friendly!)
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

// Set the runtime to edge for best performance
export const runtime = 'edge';

const role_map: { [key: string]: string } = {
    user: 'User',
    assistant: 'Assistant',
    system: 'System',
};

export async function get_title_from_openai(messages: JustinaChatMessage[]) {
    const clean_messages = cleanMessages(messages);

    const prompt_comvo = clean_messages
        .map((message) => `${role_map[message.role]}: ${message.content}`)
        .join('\n\n');

    // Ask OpenAI for a streaming completion given the prompt
    const response = await openai.completions.create({
        model: 'text-davinci-003',
        temperature: 0.6,
        max_tokens: 300,
        prompt: `Create a short title for the following conversation.

        ${prompt_comvo}`,
    });

    const convo_title = response.choices[0].text;

    return convo_title
    // Convert the response into a friendly text-stream
    // const stream = OpenAIStream(response);
    // // Respond with the stream
    // return new StreamingTextResponse(stream);
}