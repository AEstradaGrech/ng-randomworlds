export interface GeneratedImageDto{
    id:string,
    name:string,
    diffuser:string,
    tag:string,
    prompt:string,
    base64:string,
    height:number,
    width:number,
    guidance:number,
    inference_steps: number | null
}

export interface GenerateImageRequest{
    name:string,
    diffuser_name:string,
    tag:string,
    prompt:string,
    height:number,
    width:number,
    guidance:number,
    seed:number | null,
    num_gen:number,
    inference_steps: number | null
    file_save:boolean,
    db_save: boolean,
    cache_diffusion_pipe: boolean 
}

export interface GenerateImageResponse{
    name: string,
    diffuser: string,
    prompt: string,
    height: number,
    width: number
    db_doc?: GeneratedImageDto,
    base64: string
}

export interface IntegrationSettingsDto{
    name:string,
    current_model?:string,
    current_device?: string,
    current_quantization?:string,
    auto_offload_enabled:boolean,
    current_memory_usage:string,
    available_models: string[]
    default_model:string
}
export interface ProviderSettingsDto{
    init:boolean,
    available:boolean,
    available_integrations:string[],
    current_integration_settings: IntegrationSettingsDto
}

export interface SetIntegrationRequest{
    with_cached_model:boolean
}
