export async function textToSpeech(text, voiceId) {
  const response = await fetch('http://localhost:3000/speech', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      text: text,
      voiceId: voiceId
    })
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const blob = await response.blob();
  return URL.createObjectURL(blob);
}
