export const DOCUMENT_TYPES = {
    cerere: {
        fields: [
            "TipCerere",
            "PartiImplicate",
            "Context",
            "Conflict",
            "Argumente",
            "Termen"

        ],
        questions: [
            "Ce tip de cerere dorești să generezi?",
            "Care sunt părțile implicate?",
            "Care este contextul cererii?",
            "Există un conflict juridic?",
            "Ce argumente sau probe detii?",
            "Care este termenul dorit?"

        ]
    },
    contract: {
        fields: [
            "TipContract",
            "PartiContractante",
            "Obiect",
            "Context",
            "Obligatii",
            "Durata",
            "Pret",
            "ClauzeSpeciale"
        ],
        questions: [
            "Ce tip de contract dorești să generezi?",
            "Caresunt părțile contractului?",
            "Care este obiectul contractului?",
            "Care este contextul contractului?",
            "Care sunt obligațiile?",
            "Care este durata?",
            "Care este prețul?",
            "Există clauze speciale, daca da care sunt acestea?"
        ]
    },
    procura: {
        fields: [
            "TipProcura",
            "Mandant",
            "Mandatar",
            "Obiect",
            "Context",
            "Puterile",
            "Durata",
            "ClauzeSpeciale"
        ],
        questions: [
            "Ce tip de procură dorești?",
            "Cine este mandantul?",
            "Cine este mandatarul?",
            "Care este obiectul?",
            "Care este contextul?",
            "Ce drepturi se acordă?",
            "Care este durata?",
            "Exista clauze speciale, daca da care sunt acestea?"
        ]
    }
};