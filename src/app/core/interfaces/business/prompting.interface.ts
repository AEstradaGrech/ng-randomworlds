export interface BeginQuestRequest{
    userId:string,
    charName:string
    //WorldSettings
}

export interface CharacterNFT_Mock{
    id:number,
    name: string,
    description:string,
    genres:string[],
    fileName:string,
    imageType:string
}