<!-- AudioControl.svelte -->
<script>
  import { onMount } from 'svelte';
  import axios from 'axios';

  let audioUrl = '';

  async function convertTextToSpeech() {
    try {
      const MAX_CHARACTERS = 1000;
      const extractedText = document.body.innerText;
      const pageText = extractedText.slice(0, MAX_CHARACTERS);

      const response = await axios.post('https://x8ki-letl-twmt.n7.xano.io/api:uuBBHkp-/attention_audio', {
        text: pageText
      });

      audioUrl = response.data.audio_file; // Assuming the Xano function returns an 'audioUrl' property in the response
    } catch (error) {
      console.error(error);
    }
  }
</script>

<button on:click={convertTextToSpeech}>To Voice</button>
<audio src={audioUrl} controls></audio>
