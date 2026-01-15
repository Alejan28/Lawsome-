import IMessageService from "./IMessageService";

export default class ApiMessageService extends IMessageService {
    async sendMessage(message) {
        const response = await fetch("/api/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message })
        });

        const data = await response.json();
        return data;
    }
}
