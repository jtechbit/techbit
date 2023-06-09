import axios, { AxiosResponse } from 'axios';

export default async (request: any): Promise<AxiosResponse> => {
  const headers = {
    'Authorization': 'Bearer XSvQWWkM-FbYpTVgy2R__2IoFi-WJOueYdGZDgtWp6gSv4rv29_-mQ',
  };

  const data = {
    'text': request.body.text,
    'VoiceId': 'YOUR_VOICE_ID',
    'AudioFormat': 'mp3',
    'BitRate': '192k',
  };

  try {
    const response = await axios({
      method: 'post',
      url: 'https://api.v5.unrealspeech.com/speech',
      headers: headers,
      data: data,
      responseType: 'stream'
    });

    return response; // Return the audio file as the result of the function
  } catch (error) {
    console.error(error);
    throw new Error('Error converting text to speech');
  }
};
