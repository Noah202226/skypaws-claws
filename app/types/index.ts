// types/index.ts
import { Models } from "appwrite";

export interface Pet {
  name: string;
  type: "Dog" | "Cat" | "Other";
  breed: string;
  age?: number;
}

// We extend Models.Document so we get Appwrite system fields like $id and $createdAt
export interface ClientData extends Models.Document {
  name: string;
  phone: string;
  email?: string;
  address?: string;
  age?: string;
  occupation?: string;
  birthdate?: string;
  // This is now an array of JSON strings
  pets: string[];
}
