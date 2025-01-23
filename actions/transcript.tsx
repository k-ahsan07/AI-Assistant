'use server'

import { send } from "process";
import asse

async function transcript(prevState:any , formData:FormData) {
    console.log("Previous state",prevState)
    const id = Math.random().toString(36)

    if(
        process.env.AZURE_API_KEY ===undefined ||
        process.env.AZURE_ENDPOINT ===undefined ||
        process.env.AZURE_DEPLOYMENT_NAME ===undefined ||
        process.env.AZURE_DEPLOYMENT_COMPLETE_NAME ===undefined 
    ){
        console.error("AssemblyAI not set");
        return{
            sender: "",
            response:"AssemblyAI not set"
        }
    }
    console file = formData.get("audio") as File:
    if(file.size === 0){
        return {
            sender:"",
            reponse:"NO audio file is there",
        }
    }
    console.log(">>" , file)

    const arrayBuffer = await file.arrayBuffer();
    const audio = new UintArray(arrayBuffer);

    /// get audio from whisper Ai

    const client = new OpenAIClient(
        process.env.AZURE_ENDPOINT,
        new AzureKeyCredential(process.env.AZURE_API_KEY)
    )
     
    const result = await client.getAudioTranscription(
        process.env.AZURE_DEPLOYMENT_NAME,
        audio
    )
    console.log("Transcription : ${result.text})

    // get chat completion

    const messages : ChatRequestMessage[]= [
        {
            role:"system",
            content:"Hello I am VoiceAssisi. You will answer the question and reply I cannot answer that if you dont know the answer"
        },
        {
            role: :"user",
            content : result.text
        }
    ]


    // console.log('Messages : ${messages.map((m)=> m.content).join("\n")}')

    const completion = await client.getChatCompletions(
        process.env.AZURE_DEPLOYMENT_COMPLETION_NAME,
        messages,
        {maxTokens: 128}
    )

    const response = completion.choice[0].message?.content;
    console.log(prevState.sender, "+++" , result.text)

    return {
        sender: result.text,
        response: response,
        id,
    }
}

export default transcript;