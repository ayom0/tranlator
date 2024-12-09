import { GoogleGenerativeAI, HarmBlockThreshold, HarmCategory } from "@google/generative-ai";
        
const chatBox = document.getElementById("chat-box");
const userInput = document.getElementById("user-input");
const sendButton = document.getElementById("send-button");
const refreshButton = document.getElementById("refresh-button");
const fileUpload = document.getElementById("file-upload");
const chatHeader = document.querySelector(".chat-header");

const API_KEY = 'AIzaSyCKuXj-IFUyaH1GRrgDaSL2FqFT2pacPN4'; // Ganti dengan API Key Gemini
let lastAnswer = null;

sendButton.addEventListener("click", sendMessage);
userInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
        sendMessage();
    }
});
refreshButton.addEventListener("click", refreshAnswer);
fileUpload.addEventListener("change", handleFileUpload);

// Tambahkan event listener untuk perubahan input
userInput.addEventListener("input", updateSendButtonIcon);

// Fungsi untuk memperbarui ikon tombol send
function updateSendButtonIcon() {
    const message = userInput.value.trim();
    const icon = message ? 'fa-arrow-right' : 'fa-microphone';
    sendButton.innerHTML = `<i class="fa-solid ${icon}"></i>`; // Ganti ikon tombol
}

async function sendMessage() {
    const message = userInput.value.trim();
    const file = fileUpload.files[0];

    if (!message && !file) {
        alert("Masukkan pesan atau unggah file terlebih dahulu.");
        return;
    }

    // Mengubah teks header saat pesan diproses
    updateChatHeader("Menyiapkan jawaban Anda...");
    
    appendMessage("user", message || `File "${file.name}" diunggah.`);
    userInput.value = "";
    fileUpload.value = "";

    try {
        const context = lastAnswer ? `Jawaban sebelumnya adalah \"${lastAnswer}\". ` : "";
        const query = `${context}${message}`;

        const contents = [{ role: 'user', parts: [{ text: query }] }];

        if (file) {
            // Mengubah teks header saat file diproses
            updateChatHeader("Memproses file Anda...");
            const fileContent = await readFileContent(file);
            contents.push({ role: 'user', parts: [{ text: `Konten file yang diunggah: ${fileContent}` }] });
        }

        const genAI = new GoogleGenerativeAI(API_KEY);
        const model = genAI.getGenerativeModel({
            model: "gemini-1.5-flash",
            safetySettings: [
                {
                    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
                    threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
                },
            ],
        });

        const result = await model.generateContentStream({ contents });
        let buffer = [];
        for await (let response of result.stream) {
            buffer.push(response.text());
        }
        const answer = buffer.join('');
        lastAnswer = answer;

        appendMessage("ai", formatBoldText(answer || "Jawaban tidak tersedia. Coba lagi nanti."));

        // Mengubah teks header kembali setelah jawaban diterima
        updateChatHeader("Ada yang bisa saya bantu?");
    } catch (error) {
        console.error("Error sending message:", error);
        appendMessage("ai", "Terjadi kesalahan saat mengirim pesan.");
        
        // Mengubah teks header kembali setelah kesalahan
        updateChatHeader("Ada yang bisa saya bantu?");
    }
}

function updateChatHeader(text) {
    chatHeader.textContent = text; // Update teks header
}

function appendMessage(sender, message) {
    const messageElement = document.createElement("div");
    messageElement.classList.add("chat-message", sender);
    messageElement.innerHTML = `<p>${message}</p>`;
    chatBox.appendChild(messageElement);
    chatBox.scrollTop = chatBox.scrollHeight;
}

function formatBoldText(text) {
    return text.replace(/(\*\*|__)(.*?)\1/g, "<strong>$2</strong>");
}



function handleFileUpload() {
    const file = fileUpload.files[0];
    if (file) {
        appendMessage("user", `File "${file.name}" diunggah.`);
        
        // Menangani file berdasarkan jenisnya
        if (file.type.startsWith("image/")) {
            const reader = new FileReader();
            reader.onload = function (e) {
                const img = `<img src="${e.target.result}" alt="Uploaded Image" style="max-width: 100%; border-radius: 8px;"/>`;
                appendMessage("user", img);
            };
            reader.readAsDataURL(file);
        } else if (file.type === "application/pdf") {
            appendMessage("user", `File PDF "${file.name}" diunggah.`);
        } else if (file.type === "application/msword" || file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
            appendMessage("user", `File Word "${file.name}" diunggah.`);
        } else if (file.type === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet") {
            appendMessage("user", `File Excel "${file.name}" diunggah.`);
        }
    }
}

function refreshAnswer() {
    lastAnswer = null;
    appendMessage("ai", "Jawaban telah di-refresh.");
}