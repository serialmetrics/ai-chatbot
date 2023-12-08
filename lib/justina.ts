const BASE_URL = "http://localhost:8000";

export interface JustinaChatMessage {
    content: string;
    role: string;
}

export interface JustinaCallbacks {
    /** `onStart`: Called once when the stream is initialized. */
    onStart?: () => Promise<void> | void;
    /** `onCompletion`: Called for each tokenized message. */
    onCompletion?: (completion: string) => Promise<void> | void;
    /** `onFinal`: Called once when the stream is closed with the final completion message. */
    onFinal?: (completion: string) => Promise<void> | void;
    /** `onToken`: Called for each tokenized message. */
    onToken?: (token: string) => string;
}

interface JustinaChatParams {
    id: string;
    messages: JustinaChatMessage[];
    cb?: JustinaCallbacks;
}

function createEmptyReadableStream() {
    return new ReadableStream({
        start(controller) {
            controller.close();
        }
    });
}

export function cleanMessages(messages: JustinaChatMessage[]) {
    return messages.map(({ role, content }) => {
        if (role === 'assistant' && content.lastIndexOf("justina-msg") > -1) {
            let got_json = null;
            let parts = content.trim().split('\n');
            const last_part = parts[parts.length - 1];
            try {
                got_json = JSON.parse(last_part);
            } catch (e) {
                // console.error('message.content =>', last_part);
                // console.error(e);
            }
            if (!!got_json && got_json.status === "final") {
                const { answer, source_info } = got_json.data;
                if (source_info) {
                    return { role, content: `${answer}\n\n${source_info}`}
                }
                return { role, content: answer };
            }
        }
        return { role, content }
    });
}


export async function JustinaStream(
    { id, messages, cb }: JustinaChatParams
): Promise<ReadableStream> {

    const baseURL = process.env.JUSTINA_API_URL ?? BASE_URL;
    const chatURL = `${baseURL}/chat/completions`;
    // const chatURL = `${baseURL}/chat/testcompletions`;
    // const chatURL = `${baseURL}/chat/openaicompletions`;
    const fetchResponse = fetch(
        chatURL,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                // Include other headers as required by your external API
            },
            body: JSON.stringify({
                id,
                messages: cleanMessages(messages)
            }),
        }
    );

    // Retrieve its body as ReadableStream
    const fetch_stream = await fetchResponse.then((response) => {
        const reader = response.body?.getReader();
        let fullText = '';
        return new ReadableStream({
            start(controller) {
                const td = new TextDecoder("utf-8");
                if (cb?.onStart) {
                    cb.onStart();
                }
                return pump();
                function pump(): any {
                    return reader?.read().then(({ done, value }) => {
                        // When no more data needs to be consumed, close the stream
                        if (done) {
                            if (cb?.onCompletion) {
                                cb.onCompletion(fullText);
                            }
                            controller.close();
                            return;
                        }
                        // Enqueue the next data chunk into our target stream
                        let text = td.decode(value, { stream: true });
                        if (cb?.onToken) {
                            text = cb.onToken(text);
                        }
                        console.log('>> decoded:', text);
                        fullText += text;
                        // console.log('>> decoded:', text);
                        // if (text.startsWith("json:")) {
                        //     const json_text = text.split("json:")[1];
                        //     // controller.enqueue(json_text);
                        //     // return pump();
                        //     const json = JSON.parse(json_text);
                        //     console.log('>> json:', json);
                        //     const content = json.choices[0].delta.content;
                        //     if (content) {
                        //         fullText += content;
                        //         console.log('>> content:', content);
                        //         controller.enqueue(content);
                        //     }
                        //     return pump();
                        // }
                        controller.enqueue(text);
                        return pump();
                    });
                }
            },
        });
    })
        // Create a new response out of the stream
        .then((stream) => {
            console.log('Stream:', stream);
            return new Response(stream);
        })
        .catch((err) => console.error(err));

    if (!fetch_stream) {
        throw new Error('fetch_stream is null');
    }

    return (fetch_stream.body || createEmptyReadableStream());
}