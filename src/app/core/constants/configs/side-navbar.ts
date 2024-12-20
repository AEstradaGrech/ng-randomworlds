import { TreeMenuItem } from "../../../modules/shared/components/tree-menu/tree-menu-item.model";

export const questViewSidebarConfig = [
    new TreeMenuItem('Story', 1, undefined, true, false, true),
    new TreeMenuItem('Quest', 2, undefined, false, false, false),
    new TreeMenuItem('World Info', 1, undefined, true, false, true),
    new TreeMenuItem('General', 2, undefined, false, false, false),
    new TreeMenuItem('Locations', 2, undefined, false, false, false),
    new TreeMenuItem('Characters', 2, undefined, false, false, false),
    new TreeMenuItem('Default actions', 1, undefined, true, false, true),
    new TreeMenuItem('Check Inventory', 2, undefined, false, false, false),
    new TreeMenuItem('Back to Tavern', 2, undefined, false, false, false)
    
]

export const chatSideBarConfig = [
    new TreeMenuItem('Prompting', 1, 'characterstudio/home', true, false, true),
    new TreeMenuItem('Session', 1, 'characterstudio/chat', false, false, false),
    new TreeMenuItem('Simple Prompt', 1, 'simple-prompt', false, false, false)
    
]