import { DocumentTemplate } from "./DocumentTemplate"; // Update the path to the correct location

export interface Variable {
    id: number;
    nomVariable: string;
    documentTemplates: DocumentTemplate[];
}
