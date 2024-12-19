import { NavBarTab } from "../../../modules/shared/components/tabs-nav-bar/nav-bar-tab.model";

export const demoNavBarConfig = [
    new NavBarTab('Play', 'randomworlds/home', false),
    new NavBarTab('Chat', 'randomworlds/home', false),
    new NavBarTab('Assets', 'randomworlds/home', false),
    new NavBarTab('Marketplace', 'auth/login', false)
]

export const chatSessionNavBarConfig = [
    new NavBarTab('System message', null, false),
    new NavBarTab('Chat', null, false)
]

export const sessionChatsReviewNavBarConfig = [
    new NavBarTab('System message', null, false),
    new NavBarTab('Chat', null, false),
    new NavBarTab('Summary', null, false)
]

export const summarizeSessionNavBarConfig = [
    new NavBarTab('Summarization message', null, false),
    new NavBarTab('Summary', null, false),
    new NavBarTab('Prompt', null, false)
]

export const summarizedSessionReviewNavBarConfig = [
    new NavBarTab('Chat', null, false),
    new NavBarTab('Summary', null, false)
]