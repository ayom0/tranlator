let API_KEY = "AIzaSyDnvv6dI03DR0JNvE2v_Ynck6jwRAWuI8E"; // Ganti dengan API Key dari Google atau Gemini API

// Mendapatkan referensi ke elemen-elemen HTML
const promptInput = document.getElementById("promptInput");
const targetLanguageSelect = document.getElementById("targetLanguageSelect");
const output = document.getElementById("output");

document.getElementById("translateBtn").addEventListener("click", async () => {
  output.textContent = "Translating...";

  try {
    const textToTranslate = promptInput.value.trim();
    const targetLanguage = targetLanguageSelect.value;

    if (!textToTranslate) {
      alert("Please enter text to translate!");
      output.textContent = "";
      return;
    }

    const response = await fetch(
      `https://translation.googleapis.com/language/translate/v2?key=${API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          q: textToTranslate,
          target: targetLanguage,
          format: "text",
        }),
      }
    );

    const data = await response.json();
    if (data.data && data.data.translations) {
      output.textContent = data.data.translations[0].translatedText;
    } else {
      output.textContent = "Translation failed. Please try again.";
    }
  } catch (error) {
    console.error(error);
    output.textContent = "An error occurred. Please check the console for details.";
  }
});
