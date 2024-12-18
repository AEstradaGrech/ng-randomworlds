import { AfterViewInit, Component, ElementRef, inject, ViewChild } from '@angular/core';

import { SearchInputConfig } from '../../../../../shared/components/search-input/search-input-config';
import { SessionDto } from '../../../../../shared/models/mgmt-interfaces';
import { NavBarTab } from '../../../../../shared/components/tabs-nav-bar/nav-bar-tab.model';
import { summarizedSessionReviewNavBarConfig } from '../../../../../../core/constants/configs/header-navbar';
import { HeaderNavbarComponent } from '../../../../../shared/components/header-navbar/header-navbar.component';
import { ChatPromptsMgmtService } from '../../../../services/chat-prompts-mgmt.service';
import { SessionsMgmtService } from '../../../../services/sessions-mgmt.service';

@Component({
  selector: 'app-summarized-session-review',
  templateUrl: './summarized-session-review.component.html',
  styleUrl: './summarized-session-review.component.scss'
})
export class SummarizedSessionReviewComponent implements AfterViewInit {
  public headBarConfig: Array<NavBarTab> = summarizedSessionReviewNavBarConfig;
  searchConfig = new SearchInputConfig('session/containing-tag', 'GET', 'tag', 'Tag')
  @ViewChild('navTabs') navTabs!: HeaderNavbarComponent
  session!: SessionDto
  currentTab:string = 'Chat'
  chatText:string = ''
  summaryText:string = ''
  private _service = inject(SessionsMgmtService)
  ngAfterViewInit(): void {
    this.navTabs.getTabsComponent().forceActive("Chat")
  }

  onSessionSelected(session:SessionDto){
    console.log(session)
    this.session = session
    this.summaryText = this.session.summary
    if(this.session.current_chat_id && this.session.current_chat_id !== ''){
      this._service.getSessionChatById(this.session.current_chat_id).subscribe(res => {
        this._historyToText(res.messages)
      })
    }
  }

  getSelectedSession(){
    return this.session
  }

  onMenuTabClick(event:NavBarTab) {
    this.currentTab = event.name
  }

  private _historyToText(history:any[]){
    let text = ''
    history.forEach(kvp => {
      console.log(kvp)
      let key = Object.keys(kvp)[0];
      let prefix = ''
      switch(key){
        case 'system':
          prefix = '\n### CONTEXTUAL: '
          break;
        case 'user' :
          prefix = '\n- User: '
          break;
        case 'assistant' :
          prefix = '\n- Assistant: '
          break;
      }
      if(key === 'system'){
        let msg = kvp[key].replace('[ctx-update]: ', '')
        text += (prefix + `(... ${msg})` + '\n')
      }
      else text += (prefix + kvp[key] + '\n')
    })
    console.log("-- total text -- \n" + text)
    this.chatText = text;
  }
}
