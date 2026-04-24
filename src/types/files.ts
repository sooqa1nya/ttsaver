export interface IFile {
    type: 'video' | 'photo' | 'gif' | 'audio';
    url: string | File;
    remove?: string;
}