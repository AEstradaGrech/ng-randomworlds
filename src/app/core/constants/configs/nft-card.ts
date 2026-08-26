import { EAppButtons } from "src/app/modules/shared/models/common-enums";
import { MatBadgeConfig, RoundedButtonConfig } from "src/app/modules/shared/models/common-interfaces";

export const defaultNftCardButtons: RoundedButtonConfig[] = [
    {
        id: EAppButtons.VIEW,
        iconName: 'visibility',
        color: 'var(--primary-btn-color)',
        hoverColor: 'var(--primary-btn-hover)',
        borderColor: 'var(--primary-btn-border)',
        withSpinner: false
    },
    {
        id: EAppButtons.SELECT,
        iconName: 'check',
        color: 'var(--primary-btn-color)',
        hoverColor: 'var(--primary-btn-hover)',
        borderColor: 'var(--primary-btn-border)',
        withSpinner: false
    }
]

export const defaultButtonBadge: MatBadgeConfig = {
    position: 'after',
    size: 'small',
    color: 'white',
    background: 'var(--primary-btn-hover)'
} 

export function replaceEndpoint(url: string, replaced: string, provider: string){
    let replacedEndpoint = endpointByTag(replaced);
    let newEndpoint = endpointByTag(provider);
    return url.includes(replacedEndpoint) ? url.replace(replacedEndpoint, newEndpoint) : url;
}
export function endpointByTag(tag:string): string{
    switch(tag.toUpperCase()){
        case('IPFS'):
            return IPFS_ENDPOINT;
        case('ALCHEMY'):
            return ALCHEMY_ENDPOINT;
      default:
        return '';
    }
}

export const IPFS_ENDPOINT = 'https://ipfs.io/ipfs/';
export const ALCHEMY_ENDPOINT = 'https://alchemy.mypinata.cloud/ipfs/';