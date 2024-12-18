import { Subject } from "rxjs";

export class NavBarTab{
    name:string;
    link!: string | null;
    withSelectIcon:boolean;
    disabled?: boolean;
    isActive: boolean;
    matIcon: string;
    onClickSub: Subject<string> = new Subject<string>()
    constructor(name:string, link:string|null = null, withSelectIcon: boolean = false, disabled: boolean = false, matIcon: string = '' ){
        this.name = name;      
        this.link = link;
        this.withSelectIcon = withSelectIcon;
        this.disabled = disabled;
        this.isActive = false;
        this.matIcon = matIcon;
    }
}