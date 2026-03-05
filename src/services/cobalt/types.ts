interface IMetadata {
    album: string;
    composer: string;
    genre: string;
    copyright: string;
    title: string;
    artist: string;
    album_artist: string;
    track: string;
    date: string;
    sublanguage: string;
}

interface IOutput {
    type: string;
    filename: string;
    metadata?: IMetadata;
    subtitles: boolean;
}

interface IAudio {
    copy: boolean;
    format: string;
    bitrate: string;
    cover?: boolean;
    cropCover?: boolean;
}

interface IPicker {
    type: 'photo' | 'video' | 'gif';
    url: string;
    thumb?: string;
}

interface IErrorContext {
    service?: string;
    limit?: number;
}

interface IError {
    code: string;
    context?: IErrorContext;
}

export interface IResponsePicker {
    status: 'picker';
    audio?: string;
    audioFilename?: string;
    picker: IPicker[];
}

export interface IResponseTunnelRedirect {
    status: 'tunnel' | 'redirect';
    url: string;
    filename: string;
}

export interface IResponseLocalProcessing {
    status: 'local-processing';
    type: 'merge' | 'mute' | 'audio' | 'gif' | 'remux';
    service: string;
    tunnel: string;
    output: IOutput;
    audio?: IAudio;
    isHLS?: boolean;
}

export interface IResponseError {
    status: 'error';
    error: IError;
}

export type IResponseCobalt =
    | IResponsePicker
    | IResponseTunnelRedirect
    | IResponseLocalProcessing
    | IResponseError;