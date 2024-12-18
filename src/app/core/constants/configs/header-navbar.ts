import { NavBarTab } from "../../../modules/shared/components/tabs-nav-bar/nav-bar-tab.model";

export const demoNavBarConfig = [
    new NavBarTab('Tab 1', 'home', false),
    new NavBarTab('Tab 2', 'home', false),
    new NavBarTab('Tab 3', 'home', false),
    new NavBarTab('Tab 4', 'home', false),
    new NavBarTab('Tab 5', 'home', false)
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