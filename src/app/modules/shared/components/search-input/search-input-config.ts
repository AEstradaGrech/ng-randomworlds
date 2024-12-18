export class SearchInputConfig{
    url:string;
    method: string;
    key:string;
    formLabel:string;
    params:any;
    constructor(url:string='', method:string='GET', key='', formLabel:string='', params={}){
        this.url = url;
        this.method = method;
        this.key = key;
        this.params = params;
        this.formLabel = formLabel;
    }

}