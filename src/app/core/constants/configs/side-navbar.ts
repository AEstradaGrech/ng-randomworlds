import { TreeMenuItem } from "../../../modules/shared/components/tree-menu/tree-menu-item.model";

export const adventuresViewSidebarConfig = [
    new TreeMenuItem('Story', 1, undefined, true, false, true),
    new TreeMenuItem('Quest', 2, undefined, false, false, false),
    new TreeMenuItem('Quest Info', 1, undefined, true, false, true),
    new TreeMenuItem('General', 2, undefined, false, false, false),
    new TreeMenuItem('Locations', 2, undefined, false, false, false),
    new TreeMenuItem('Characters', 2, undefined, false, false, false),
    new TreeMenuItem('Default actions', 1, undefined, true, false, true),
    new TreeMenuItem('Check Inventory', 2, undefined, false, false, false),
    new TreeMenuItem('Back to Tavern', 2, undefined, false, false, false)
    
]
export const questsViewSidebarConfig = [
    new TreeMenuItem('Quest Info', 1, undefined, true, true, true),
    new TreeMenuItem('Preferences', 2, undefined, false, false, true),
    new TreeMenuItem('Character', 2, undefined, false, false, true),
    new TreeMenuItem('Intro', 2, undefined, false, false, true),
    new TreeMenuItem('Story', 1, undefined, true, true, true),
]

export const chatSideBarConfig = [
    new TreeMenuItem('Prompting', 1, 'characterstudio/home', true, false, true),
    new TreeMenuItem('Session', 1, 'characterstudio/chat', false, false, false),
    new TreeMenuItem('Simple Prompt', 1, 'simple-prompt', false, false, false)
    
]