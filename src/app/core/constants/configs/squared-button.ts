import { SquaredButtonConfig } from "src/app/modules/shared/components/squared-button/squared-button.model";

export const defaultSquaredButton: SquaredButtonConfig = {
    textColor: 'black',
    borderColor: 'black',
    textColorHover: 'white',
    borderColorHover: 'white',
    backgroundHover: 'black',
    textColorOutlined: 'green',
    borderColorOutlined: 'green',
    textColorDisabled: 'grey',
    borderColorDisabled: 'grey',
    dangerColor: 'red',
}

export const appSquaredButton: SquaredButtonConfig = {
    textColor: 'var(--fuchsia)',
    borderColor: 'var(--fuchsia)',
    textColorHover: 'white',
    borderColorHover: 'white',
    backgroundHover: 'var(--teal)',
    textColorOutlined: 'var(--teal)',
    borderColorOutlined: 'var(--teal)',
    textColorDisabled: 'grey',
    borderColorDisabled: 'grey',
    dangerColor: 'var(--danger)',
}