export interface QueryFilter{
    conditions: QueryCondition[],
    page: number
    page_size:number
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