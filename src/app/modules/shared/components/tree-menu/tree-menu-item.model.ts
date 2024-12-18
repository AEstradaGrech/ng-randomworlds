export class TreeMenuItem{
    name:string;
    level: number;
    link?: string;
    expandable:boolean;
    isOpen: boolean;
    isVisible:boolean;
    matIcon: string;
    constructor(name:string, level: number, link:string = '', expandable:boolean = false, isOpen: boolean = false, isVisible: boolean = true, matIcon: string = '' ){
        this.name = name;
        this.level = level;
        this.link = link;
        this.expandable = expandable;
        this.isOpen = isOpen;
        this.isVisible = isVisible;
        this.matIcon = matIcon;
    }
}