// 'use server'
import axios from 'axios';

export async function transcript(prevState: any, formData: FormData) {
    console.log("Previous state", prevState);
    const id = Math.random().toString(36);

    if (process.env.REV_AI_API_KEY === undefined) {
        console.error("Rev.ai API Key is not set");
        return {
            sender: "",
            response: "Rev.ai API Key is not set"
        };
    }

    const file = formData.get("audio") as File;
    if (file.size === 0) {
        return {
            sender: "",
            response: "No audio file is there",
        };
    }
    console.log(">>", file);

    const uploadResponse = await uploadAudioToRevAI(file);
    if (!uploadResponse || !uploadResponse.upload_url) {
        return {
            sender: "",
            response: "Failed to upload audio to Rev.ai",
        };
    }

    const transcriptionResult = await getTranscriptionFromRevAI(uploadResponse.upload_url);
    if (!transcriptionResult || !transcriptionResult.text) {
        return {
            sender: "",
            response: "Failed to transcribe audio",
        };
    }

    const resultText = transcriptionResult.text;

    const response = await getChatResponse(resultText);

    return {
        sender: resultText,
        response: response,
        id,
    };
}

async function uploadAudioToRevAI(file: File) {
    const formData = new FormData();
    formData.append("audio", file);

    try {
        const response = await axios.post('https://api.rev.ai/revspeech/v1beta/jobs', formData, {
            headers: {
                'Authorization': `Bearer ${process.env.REV_AI_API_KEY}`,
                'Content-Type': 'multipart/form-data',
            }
        });
        return response.data;
    } catch (error) {
        console.error("Error uploading audio to Rev.ai:", error);
        return null;
    }
}

async function getTranscriptionFromRevAI(uploadUrl: string) {
    try {
        const response = await axios.get(`https://api.rev.ai/revspeech/v1beta/jobs/${uploadUrl}`, {
            headers: {
                'Authorization': `Bearer ${process.env.REV_AI_API_KEY}`,
            }
        });

        const transcriptId = response.data.id;
        return await pollTranscriptionResultRevAI(transcriptId);
    } catch (error) {
        console.error("Error fetching transcription from Rev.ai:", error);
        return null;
    }
}

async function pollTranscriptionResultRevAI(transcriptId: string) {
    try {
        let isCompleted = false;
        let transcriptionResult = null;
        while (!isCompleted) {
            const response = await axios.get(`https://api.rev.ai/revspeech/v1beta/jobs/${transcriptId}`, {
                headers: {
                    'Authorization': `Bearer ${process.env.REV_AI_API_KEY}`,
                }
            });

            transcriptionResult = response.data;
            if (transcriptionResult.status === 'completed') {
                isCompleted = true;
            } else if (transcriptionResult.status === 'failed') {
                throw new Error('Transcription failed');
            } else {
                await new Promise(resolve => setTimeout(resolve, 5000));
            }
        }

        return transcriptionResult;
    } catch (error) {
        console.error("Error polling transcription result:", error);
        return null;
    }
}

async function getChatResponse(transcriptionText: string) {
    return `I heard: ${transcriptionText}`;
}
