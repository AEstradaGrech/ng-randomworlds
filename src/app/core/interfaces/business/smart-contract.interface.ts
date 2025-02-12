
export interface CatalogueCollection {
    contractAddress:string,
    name:string,
    description:string,
    symbol:string,
    isFree:boolean,
    isLimited:boolean,
    logoImage:string
}
export interface AssetsCollectionSummary extends CatalogueCollection {
    isOutOfStock:boolean,
    models:string[],
    maxMints: number,
    mints: number,
    modelsCid:string,
    metaCid:string,
    tokenName: string
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
export interface WalletNFT{
    id:number,
    contractType:string,
    collectionName:string,
    tokenAddress:string,
    symbol:string,
    owner:string,
    name: string,
    description:string,
    imageUrl:string //TODO: metadata.external_link (actual 'endpoint')
    metadataUrl: string //"token_uri": "ipfs://QmUV8P9e47Zo43dEk3HyeMXHRCGfcH5VXeBxEGC9JM8zQP/Kazimir_Koldun.json". replace(ipfs://) 
    /*
    "rarity_label": null,
    "normalized_metadata": {
      "name": "Kazimir Koldun",
      "description": "'The spirits whisper secrets in my ear, and I am the vessel for their wrath.'",
      "animation_url": null,
      "external_link": null,
      "image": "ipfs://QmUhKuo2c32hrwgG6As3B7oWHLxM31a4T9ovpTwF8xiHaU/Kazimir_Koldun.png",
      "attributes": []
    },
    "collection_logo": null,
    "collection_banner_image": null,
    */
}
export interface AssetModel extends WalletNFT {
    metadata: CharacterMetadata,
    collectionLogoUrl: string
}
export interface AssetsCollection{
    summary: AssetsCollectionSummary,
    assets: AssetModel[]
}
export interface ModelInfo{
    name:string,
    description: string,
    price: number,
    fileName: string,
    fileExtension: string,
    mints: number,
    maxMints: number,
    available: boolean
}
export interface CatalogueModel extends ModelInfo{
    contractAddress: string,
    collectionSymbol:string,
    collectionName:string,
    collectionDescription: string,
    logoUrl: string,
    collectionUrl:string,
    imageUrl: string,
    metadataUrl: string,
    paymentTokens:string[]
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

export interface TokenDetails{
    tokenContract:string,
    multiplier:number,
    decimals:number
}