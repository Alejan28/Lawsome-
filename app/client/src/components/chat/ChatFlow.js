export class ChatFlow {
    constructor(documentTypes) {
        this.documentTypes = documentTypes;
        this.reset();
    }

    reset() {
        this.selectedDoc = null;
        this.currentStep = 0;
        this.formData = {};
    }

    isDocumentSelected() {
        return !!this.selectedDoc;
    }

    selectDocument(type) {
        if (!this.documentTypes[type]) {
            throw new Error("Invalid document type");
        }
        this.selectedDoc = type;
        return this.documentTypes[type].questions[0];
    }

    handleAnswer(answer) {
        const doc = this.documentTypes[this.selectedDoc];
        const field = doc.fields[this.currentStep];

        this.formData[field] = answer;

        if (this.currentStep < doc.questions.length - 1) {
            this.currentStep++;
            return {
                done: false,
                nextQuestion: doc.questions[this.currentStep]
            };
        }

        return {
            done: true,
            payload: {
                ...this.formData,
                DocumentType: this.selectedDoc
            }
        };
    }
}
