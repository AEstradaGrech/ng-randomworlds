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
    seed:number,
    num_gen:number,
    inference_steps: number | null
    file_save:boolean,
    db_save: boolean 
}

export interface GenerateImageResponse{
    name: string,
    diffuser: string,
    prompt: string,
    height: number,
    width: number
    base64: string
}