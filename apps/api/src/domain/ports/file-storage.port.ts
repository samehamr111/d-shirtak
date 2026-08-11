export type UploadCategory = "products" | "colors" | "fonts" | "assets" | "designs" | "user-uploads";

export interface SavedFile {
  /** Publicly reachable URL, safe to store on an entity and hand to the frontend. */
  url: string;
  /** Path relative to the storage root, used internally when deleting. */
  relativePath: string;
}

export interface IFileStorage {
  saveBuffer(category: UploadCategory, originalFileName: string, buffer: Buffer): Promise<SavedFile>;
  saveBase64Image(category: UploadCategory, base64DataUrl: string): Promise<SavedFile>;
  delete(relativePath: string): Promise<void>;
}
