

export interface CollectionSummary {
    owner: string,
    address: string,
    name:string,
    symbol:string,
    tokenName:string,
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
    logoImage:string
}
export interface CharacterMetadata{
    name:string,
    description:string,
    image:string,
    profile: CharacterProfile,
    attributes: any[]
}

export interface WalletNFT{
    tokenId:number,
    tokenType:string,
    contractAddress:string,
    ownerAddress:string,
    collection:string,
    symbol:string,
    image: string,
    metadataEndpoint: string,
    imageEndpoint: string,
    metadata: CharacterMetadata
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
    collectionLogoUrl: string,
    isLocked?: boolean,
    isInGame?: boolean, 
    lockedUntil?: number
}
export interface AssetsCollection{
    summary: CollectionSummary,
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
    imageEndpoint: string,
    metadata?: CharacterMetadata,
    paymentTokens:string[]
}

export interface NftDetailModel{
    name:string,
    price: number,
    imageEndpoint: string,
    metadata?: CharacterMetadata,
    mints?: number,
    maxMints?:number,
}
//TODO: borrar y usar solo RandomWorldsCharacter
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

export interface CustomCharsCatalogue{
    contractAddress: string,
    name: string,
    symbol: string,
    // uint256: never a JS number. 1 ETH = 1e18 wei, already past MAX_SAFE_INTEGER.
    weiMintPrice: bigint
}

export interface CustomCharsCollection extends CustomCharsCatalogue{
    assets: AssetModel[]
}
