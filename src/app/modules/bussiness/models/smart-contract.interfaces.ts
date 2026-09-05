export interface DecryptedMetadataRequest{
    contract:string,
    metaUri:string
}

export interface PlayerGameSession{
    chainId: number,
    contract: string,
    player: string,
    wager: number,
    epoch: number,
    startedAt: number
}

export interface TxError{
    error:any,
    receipt?:any
}