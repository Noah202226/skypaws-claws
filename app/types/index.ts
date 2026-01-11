// types/index.ts
import { Models } from "appwrite";

// Extend Models.Document to get $id, $createdAt, $collectionId, etc.
export interface Pet extends Models.Document {
  name: string;
  type: "Dog" | "Cat" | "Other" | string;
  breed: string;
  clientId: string; // The relational link to the Client
  age?: string;
  medicalNotes?: string;
}

export interface ClientData extends Models.Document {
  name: string;
  phone: string;
  email?: string;
  address?: string;
  age?: string;
  occupation?: string;
  birthdate?: string;
  // NOTE: We no longer include a 'pets' field here because
  // pets are now a separate collection linked by clientId.
}
