import crypto from 'crypto';
export class StorageService {
  static async uploadFile(file: File, folder: string = 'medical-records'): Promise<{
    url: string;
    hash: string;
    size: number;
  }> {
    try {
      const buffer = await file.arrayBuffer();
      const hash = crypto.createHash('sha256').update(Buffer.from(buffer)).digest('hex');
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const url = `/api/files/${folder}/${hash}`;
      
      return {
        url,
        hash,
        size: file.size
      };
    } catch (error) {
      console.error('File upload error:', error);
      throw new Error('Failed to upload file');
    }
  }

  static async deleteFile(url: string): Promise<boolean> {
    try {
      console.log('Deleting file:', url);
      return true;
    } catch (error) {
      console.error('File deletion error:', error);
      return false;
    }
  }

  static getFilePreviewUrl(url: string): string {
    return `${url}?preview=true`;
  }
}