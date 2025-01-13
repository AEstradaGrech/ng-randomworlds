import { CharacterMetadata, QuestCharacter, QuestPreferences } from "src/app/core/interfaces/business/prompting.interface"

export interface QueryFilter{
    conditions: QueryCondition[],
    page: number
    page_size:number
}

export interface SortedFilter extends QueryFilter{
    sort_var:string,
    is_descending:boolean
}
export interface QueryCondition{
    field:string,
    value:any
}

export interface CollectionResponse<T>{
    data:T[],
    total_records:number | null,
    page:number | null,
    total_pages:number | null
}

export interface UserLogin{
    provider:string //metamask
    username:string //connectedWallet
}

export interface GameData{
    username:string,
    gameType:string,
    gameStatus:string,
    charname:string,
    charTokenId:number,
    charCollectionAddress:string,
    characterMeta?: CharacterMetadata, // retrieved from contract. Contains Char & AvailablePreferences
    character?:QuestCharacter, // CharMeta | RandomChar from preferences
    isRandomCharacter:boolean,
    gameSessionId:string,//dbId RandomQuest | RandomAdventure
    userPreferences?: QuestPreferences,
    currentBlock:number
}