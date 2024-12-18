export interface BasePromptDto{
    system_message:string,
    message:string,
    temperature:number,
    max_tokens:number
}
export interface ChatPromptRequest extends BasePromptDto{
    chat_history:any
}
export interface InitSessionRequest extends ChatPromptRequest{
    username:string,
    tag:string
}
export interface SessionPromptRequest{
    session_id:string,
    user_message:string,
    system_message:string
}

export interface EndSessionRequest{
    session_id:string,
    should_trigger_on_background: boolean,
    should_trigger_full_summary:  boolean,
    should_update_session:boolean,
    max_tokens:number,
    temperature:number
    exclude_chat_sys_msg: boolean
}

export interface ChatDocDto{
    id: string,
    sessionId:string,
    username:string,
    tag:string,
    model:string,
    temperature:number,
    maxTokens:number,
    messages:any[]
}
