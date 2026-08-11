export interface UserUploadDto {
  id: string;
  imageUrl: string;
  originalName: string | null;
  uploaderEmail: string;
  promoted: boolean;
  createdAt: string;
}
