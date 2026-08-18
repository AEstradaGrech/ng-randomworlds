export interface DecryptedMetadataRequest{
    contract:string,
    metaUri:string
}

export interface PlayerGameSession{
    player: string,
    wager: number,
    epoch: number,
    startedAt: number
}