export interface CreateCharacterRequest{
    name: string | null,
    age: string | null,
    ambiences: string[],
    moods: string [],
    suggestions: string | null,
    constraints: string []
}
export interface QuestIntroRequest {
    character: QuestCharacter | null,
    preferences: QuestPreferences,
    desiredName:string | null,
    useRandomCharacter: boolean
}
export interface QuestIntroResponse{
    intro:string,
    character:QuestCharacter
}
export interface QuestPreferences{
    ambiences: string[],
    moods: string[],
    genres: string[], 
    constraints: string[],
    suggestion: string,
}
export interface QuestCharacter{
    name:string,
    age:string,
    appereance:string,
    background:string,
    personality: string,
    motivations: string,
    iconicMoment: string,
    comment:string
}
export interface QuestInitRequest{
    username:string,
    charTokenId: string,
    charCollectionAddress:string,
    character:QuestCharacter,
    isRandomCharacter:boolean,
    preferences: QuestPreferences,
    intro: string,
    maxBlocks:number
}
export interface RandomQuestDto{
    id:string,
    username:string,
    charTokenId:string,
    charCollectionAddress:string,
    character:string,
    preferences:string,
    intro:string | null
    maxBlocks:number,
    status:string,
    blocks:QuestBlockDto[]
}
export interface QuestBlockDto{
    id:number,
    scene:string,
    options:string[],
    choice:string | null,
    summary:string
}
export interface CharacterProfileMock{
    id:number,
    name: string,
    age: string,
    appereance:string,
    background:string,
    personality:string,
    motivations:string,
    iconicMoment:string,
    comment:string,
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