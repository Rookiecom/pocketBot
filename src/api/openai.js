import axios from 'axios';

const { apiKey } = require('../constants');

const client = axios.create({
    headers: {
        "Authorization": "Bearer "+ apiKey,
        "Content-Type": "application/json"
    }
})

const chatgptUrl = 'https://api.chatanywhere.com.cn/v1/chat/completions' ;
const dalleUrl = 'https://api.chatanywhere.com.cn/v1/images/generations' ;

export const apiCall = async (prompt, messages) => {
    try {
        const res = await client.post(chatgptUrl, {
            model: "gpt-3.5-turbo",
            messages: [{
                role: 'user',
                content: `Does this message want to generate an AI picture, image, art or anything similar? ${prompt} . Simply answer with a yes or no.`
            }]
        })
        isImage = res.data?.choices[0]?.message?.content;
        isImage = isImage.trim();
        if( isImage.toLowerCase().includes('yes')) {
            console.log('call dalle');
            return dalleCall(prompt, messages);
        } else {
            console.log('call chatgpt');
            return chatgptCall(prompt, messages);
        }
    }catch(error){
        console.log('error: ',error)
        return Promise.resolve({success: false, msg: error.message})
    }
}


const chatgptCall = async (prompt, messages) => {
    try{
        const res = await client.post(chatgptUrl, {
            model: "gpt-3.5-turbo",
            messages
        })

        let answer = res.data?.choices[0]?.message?.content;
        messages.push({role: 'assistant', content: answer.trim()});
        return Promise.resolve({success: true, data: messages}); 

    }catch(err){
        console.log('error: ',err);
        return Promise.resolve({success: false, msg: err.message});
    }
}

const dalleCall = async (prompt, messages)=>{
    try{
        const res = await client.post(dalleUrl, {
            prompt,
            n: 1,
            size: "512x512"
        })

        let url = res?.data?.data[0]?.url;
        // console.log('got image url: ',url);
        messages.push({role: 'assistant', content: url});
        return Promise.resolve({success: true, data: messages});

    }catch(err){
        console.log('error: ',err);
        return Promise.resolve({success: false, msg: err.message});
    }
}
