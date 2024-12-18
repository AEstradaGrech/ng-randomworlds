import { TreeMenuItem } from "../../../modules/shared/components/tree-menu/tree-menu-item.model";

export const sideNavbarConfig = [
    new TreeMenuItem('Prompting', 1, 'characterstudio/prompting/home', true, false, true),
    new TreeMenuItem('Free Session', 2, 'characterstudio/prompting/chat', false, false, false),
    new TreeMenuItem('Simple Prompt', 2, 'simple-prompt', false, false, false),
    new TreeMenuItem('Summarize', 2, '', true, false, false),
    new TreeMenuItem('Session', 3, 'characterstudio/prompting/summarize/session', false, false, false),
    new TreeMenuItem('Text', 3, 'characterstudio/prompting/summarize/text', false, false, false),
    new TreeMenuItem('Images', 2, '', true, false, false),
    new TreeMenuItem('Prompt Gen', 3, 'characterstudio/prompting/image', false, false, false),
    new TreeMenuItem('Review', 1, 'home', true, false, true),
    new TreeMenuItem('Sessions', 2, 'characterstudio/review/sessions', false, false, false),
    new TreeMenuItem('Chats', 2, 'characterstudio/review/chats', false, false, false),
    new TreeMenuItem('Summaries', 2, 'home', false, false, false),
    new TreeMenuItem('Images', 2, 'characterstudio/review/images', false, false, false),
    new TreeMenuItem('Management', 1, '', true, false, true),
    new TreeMenuItem('API Settings', 2, 'home', false, false, false),
    new TreeMenuItem('System Messages', 2, 'characterstudio/mgmt/system-messages', false, false, false),
    new TreeMenuItem('Characters', 2, 'home', false, false, false),
]

export const chatSideBarConfig = [
    new TreeMenuItem('Prompting', 1, 'characterstudio/home', true, false, true),
    new TreeMenuItem('Session', 1, 'characterstudio/chat', false, false, false),
    new TreeMenuItem('Simple Prompt', 1, 'simple-prompt', false, false, false)
    
]