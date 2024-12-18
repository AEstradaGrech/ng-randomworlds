export interface SessionDto{
    id:string,
    username:string,
    tag:string,
    summary:string,
    current_chat_id:string
}

export interface SessionHistoryUpdateRequest{
    session_id:string,
    chat_history:any[]
}

export interface SessionRetagRequest{
    session_id:string,
    tag:string,
    retag_chats:boolean
}
export interface CharacterProfileDto{
    char_name:string,
    description:string
}

export interface AvailableDiffusersDto{
    local: string[],
    api:string[]
}

export interface SystemMessageDto{
    id:string,
    type:number,
    description:string,
    tag:string,
    message:string
}

export interface SysMessageTypeDto{
    type:number,
    description:string
}

export interface ChatSummaryDto{
    id:string,
    sysMessageTag:string,
    summary:string
}

export interface SummaryDto{
    id:string,
    sysMessageTag:string,
    sysMessage:string | null, //TODO
    sessionId:string,
    chatId:string,
    creationDate:string,
    prompt:string,
    summary:string,
    observations:string[]
}

export interface ChatSummaryRequest{
    sysMessageTag:string,
    sessionId: string,
    maxTokens:number,
    temperature:number,
    excludeChatSysMsg:boolean,
    contextLength:number
}

export interface ChatSummaryResponse{
    sessionId: string,
    chatId: string,
    prompt:string,
    summary: string,
}
