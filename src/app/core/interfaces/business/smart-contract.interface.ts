export interface CatalogueCollection {
    contractAddress:string,
    name:string,
    description:string,
    symbol:string,
    isFree:boolean,
    isLimited:boolean,
    logoImage:string
}

export interface CollectionSummary {
    name:string,
    symbol:string,
    collectionName:string,
    description:string,
    isFreeCollection: boolean,
    isLimitedCollection: boolean
    isOutOfStock:boolean,
    maxMints: number,
    totalMints: number,
    models:string[],
    modelsCid:string,
    metaCid:string,
    gateway:string,
    owner: string
}
export interface FullSummary extends CollectionSummary{
    modelsCid: string,
    metaCid: string
}
export interface ModelInfo{
    name:string,
    description: string,
    weiPrice: number,
    fileName: string,
    fileExtension: string,
    mints: number,
    maxMints: number,
    available: boolean
}

export interface CharacterMetadata{
    name:string,
    description:string,
    rarity:string,
    image:string,
    profile: CharacterProfile
}
export interface CharacterProfile {
    name: string,
    age: string,
    appereance: string,
    background: string,
    personality: string,
    motivations: string,
    iconicMoment: string,
    comment: string,
    ambiences: string[],
    moods: string[]
}