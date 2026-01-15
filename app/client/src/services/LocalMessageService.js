import IMessageService from "./IMessageService";

export default class LocalMessageService extends IMessageService {
    async sendMessage(message) {
        return {
            sender: "bot",
            text: `Ai trimis: ${message}`
        };
    }
}
