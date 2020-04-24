export interface CMSRecord extends Record<string, string | AirtableImage[]> {
  key: string;
  en: string;
  image: AirtableImage[];
}

export interface AirtableImage {
  id: string;
  url: string;
  filename: string;
  size: number;
  type: string;
  width: number;
  height: number;
  thumbnails: {
    small: AirtableImageThumbnail;
    large: AirtableImageThumbnail;
  };
}

export interface AirtableImageThumbnail {
  url: string;
  height: number;
  width: number;
}
