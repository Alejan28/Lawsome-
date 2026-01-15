const BASE_URL = "https://unilingual-tanisha-dissidently.ngrok-free.dev";

export const messageService = {
    // 1. GENERATION (Returns Blob)
    async sendMessage(payload) {
        const response = await fetch(`${BASE_URL}/api/generate`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            throw new Error("Eroare server la generare");
        }

        return await response.blob();
    },

    // 2. ANALYSIS (Uploads File, Returns JSON/Text)
    async analyzeDocument(file) {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch(`${BASE_URL}/api/explain`, {
            method: "POST",
            body: formData
        });

        if (!response.ok) {
            throw new Error("Eroare server la analiză");
        }

        return await response.json(); // Expecting { result: "Analysis text..." }
    },

    // 3. Q&A (Sends Text, Returns JSON/Text)
    async askQuestion(question) {
        const response = await fetch(`${BASE_URL}/api/qa`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ question })
        });

        if (!response.ok) {
            throw new Error("Eroare server la Q&A");
        }

        return await response.json(); // Expecting { answer: "Answer text..." }
    }
};
