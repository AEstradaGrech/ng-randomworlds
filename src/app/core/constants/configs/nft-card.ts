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
 