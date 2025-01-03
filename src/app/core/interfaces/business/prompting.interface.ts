export interface QuestInitRequest{
    username:string,
    charname:string,
    charTokenId: number,
    charCollectionAddress:string,
    charInfo:string //TODO: CharNFTData (ahora mismo hacer rebujito en front)
    ambiences:string[]
    genres:string[]
    moods: string[]
    constraints: string[]
    suggestion:string
    maxBlocks:number
}
export interface RandomQuestDto{
    id:string,
    username:string,
    charname:string,
    maxBlocks:number,
    userPreferences:string,
    intro:string | null
    status:string,
    blocks:QuestBlockDto[]
}
export interface QuestBlockDto{
    id:number,
    scene:string,
    options:string[]
    choice:string | null
}
export interface CharacterNFT_Mock{
    id:number,
    name: string,
    description:string,
    ambiences:string[],
    moods:string[],
    fileName:string,
    imageType:string
}

export interface SceneOptionsRequest{
    id:string,
    scene:string
}
export interface SceneOptionsResponse{
    options: string[],
    bad_choice:string
}