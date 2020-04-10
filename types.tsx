export interface Store {
    id: string
    owner: string
    name: string
    symbol: string
    tokenCount: string
    valueCount: string
    transferCount: string
    boughtCount: string
    things: Thing[]
}

export interface Thing {
    id: string
    metaId: string
    tokens: Token[]
}

export interface Token {
    price: string
    tokenId: string
    state: string
    resolveOwner: Owner
}

export interface TokenId {
    id: string
}

export interface Owner {
    id: string
}

export interface Speaker {
    key: string
    fname: string
    lname: string
    score: number
    profilePic: string
}

export interface Boost {
    amount: number
    speaker: string
    tokenId: string
    by: string
    timestamp: any
    key: string
}

export interface UserInfo {
    id: string
    votes: string[]
}


export type BoostStatus = "boosting" | "complete" 