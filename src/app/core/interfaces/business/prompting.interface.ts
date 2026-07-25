export interface ChatMessage{
    role:string,
    content:string
}

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
export interface RandomWorldsCharacter extends QuestCharacter{
    moods?: string[],
    ambiences?: string[]
}

export interface MintCharacterRequest {
    currency: string,
    price: string,
    txHash: string,
    character: RandomWorldsCharacter,
    base64: string
}

export interface TicketDto{
    id?:string,
    txHash?: string,
    currency: string,
    price: string,
    wallet:string,
    contractAddress:string,
    createDate:Date,
    redeemDate?:Date, 
    isRedeemed: boolean,
    tokenType:string,
    base64: string,
    character:RandomWorldsCharacter,
    imageCid?: string,
    metaCid?: string,
    metaUri?: string
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

export interface FinalOptionsResponse{
    happy_end_choice:string,
    uncertain_end_choice:string,
    game_over_choice:string
}