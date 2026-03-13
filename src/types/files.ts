export interface IFile {
    type: 'video' | 'photo' | 'gif' | 'audio';
    url: File;
    remove?: string;
}