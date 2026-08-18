import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { Component, signal, computed, ElementRef, EventEmitter, inject, OnInit, ViewChild, DestroyRef } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { CreateCharacterRequest, MintCharacterRequest, QuestCharacter, RandomWorldsCharacter, SaveDatasetCharacter, TicketDto } from 'src/app/core/interfaces/business/prompting.interface';
import { ImagesService } from 'src/app/modules/bussiness/services/images.service';
import { QuestsService } from 'src/app/modules/bussiness/services/quests.service';
import { BaseComponent } from 'src/app/modules/shared/components/base.component';
import { ESnackAlertType } from 'src/app/modules/shared/models/common-enums';
import { SystemMessageDto } from 'src/app/modules/shared/models/mgmt-interfaces';
import { GenerateImageRequest, GenerateImageResponse, ProviderSettingsDto } from 'src/app/modules/shared/models/images.interfaces';
import { DomSanitizer } from '@angular/platform-browser';
import { MgmtService } from 'src/app/modules/bussiness/services/mgmt.service';
import { SmartContractsService } from 'src/app/modules/bussiness/services/smart-contracts.service';
import { CustomCharsCatalogue, TokenDetails } from 'src/app/core/interfaces/business/smart-contract.interface';
import web3 from 'web3';
import { catchError, of } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-character-creator-dialog',
  templateUrl: './character-creator-dialog.component.html',
  styleUrl: './character-creator-dialog.component.scss'
})
export class CharacterCreatorDialogComponent extends BaseComponent implements OnInit {

  data = inject(MAT_DIALOG_DATA);
  
  @ViewChild('ambienceInput') ambienceInput!: ElementRef<HTMLInputElement>;
  @ViewChild('moodInput') moodInput!: ElementRef<HTMLInputElement>;
  @ViewChild('suggestbox') suggestbox!: ElementRef<HTMLTextAreaElement>;
  @ViewChild('constraintsbox') constraintsbox!: ElementRef<HTMLTextAreaElement>;
  @ViewChild('displaybox') displaybox!: ElementRef<HTMLTextAreaElement>;
  @ViewChild('imagepromptbox') imagepromptbox!: ElementRef<HTMLTextAreaElement>;
  @ViewChild('charsPaginator') charsPaginator!: MatPaginator;
  @ViewChild('imagepromptPaginator') imagepromptPaginator!: MatPaginator;

  isLoading: boolean = false;
  isEnhancing: boolean = false;
  isGeneratingImage: boolean = false;
  separatorKeysCodes: number[] = [ENTER, COMMA];
  availableAmbiences:string[] = [];
  selectedAmbiences:string[] = [];
  availableMoods:string[] = [];
  selectedMoods:string[] = [];
  isFemaleChar: boolean = false;
  isRandomGenre: boolean = false;
  showSettings: boolean = true;
  form!: FormGroup;
  currentProfile = signal<RandomWorldsCharacter | null>(null);
  imagePrompts = signal<string[]>([]);
  generatedProfiles = signal<RandomWorldsCharacter[]>([]);
  currentImage = signal<GenerateImageResponse | null>(null);
  availableTokens = signal<string[]>(['ETH']);
  diffusionSettings!: ProviderSettingsDto;
  isMinting: boolean = false;
  selectedCurrency = signal<string>('ETH');
  availablePurchases = signal<number | null>(null);

  readonly UNKNOWN_CHAR_IMG: string = 'assets/images/UnknownChar.png';
  readonly MALE_CHAR_IMG: string = 'assets/images/MaleChar.png';
  readonly FEMALE_CHAR_IMG: string = 'assets/images/FemaleChar.png';

  public currentTicket = signal<TicketDto | null>(null);
  private _connectedWallet!: string;
  private _dialogRef: MatDialogRef<CharacterCreatorDialogComponent> = inject(MatDialogRef<CharacterCreatorDialogComponent>);
  private _mgmtService: MgmtService = inject(MgmtService);
  private _imagesService: ImagesService = inject(ImagesService);
  private _charactersService: QuestsService = inject(QuestsService); // TODO: CharactersService
  private _web3Service: SmartContractsService = inject(SmartContractsService);
  private _formBuilder: FormBuilder = inject(FormBuilder);
  private _sanitizer: DomSanitizer = inject(DomSanitizer);
  private _destroyRef: DestroyRef = inject(DestroyRef);
  private _currentImageUrl:string = '';
  private _currentProfileIdx:number = 0;
  private _charsContractInfo!: CustomCharsCatalogue;
  private _paymentTokens: Map<string, TokenDetails> = new Map<string, TokenDetails>();
  private onContractLoaded: EventEmitter<string> = new EventEmitter<string>();
  private onTokenUploaded: EventEmitter<TicketDto> = new EventEmitter<TicketDto>();
  private onTicketPurchased: EventEmitter<any> = new EventEmitter<any>();

  public get charImageUrl(): string{
    return this._currentImageUrl;
  }

  /**
   * Human-readable price of one mint, denominated in `multiplier` units per ETH.
   * The exchange ratio is dimensionless, so it applies in wei-space and stays
   * exact (BigInt throughout, no float). Pass multiplier 1 for plain ETH.
   */
  private _displayPrice(weiMintPrice: bigint, multiplier: number): string {
    return web3.utils.fromWei(weiMintPrice * BigInt(multiplier), 'ether');
  }

  /** The same price as an integer in the token's own base units, for the contract.
   * 
   * The one-line takeaway: decimals answers "where is the decimal point in this token's integers?" — nothing more. 
   * It's a per-currency rendering convention, it never touches the chain's math, 
   * and it never participates in an exchange between two different currencies
   * 
   * Real tokens genuinely differ, which is why you must read decimals from the contract and never assume 18:
   *   -- USDC / USDT	6	it's cents-ish money --
   * Assume 18 for USDC and you're off by 10¹² — you'd approve a millionth of a cent, or a trillion dollars.:
   */
  private _baseUnits(weiMintPrice: bigint, details: TokenDetails): string {
    return web3.utils.toWei(this._displayPrice(weiMintPrice, details.multiplier), details.decimals);
  }

private getDefaultCurrencyTitle() : string {
    return this._charsContractInfo === undefined ? 'ETH' :
      `ETH - ${web3.utils.fromWei(this._charsContractInfo.weiMintPrice, 'ether')}`;
  }

  tokenSelectorTitle = computed(() => {
    let currentToken: string = this.selectedCurrency();
    if(currentToken !== 'ETH') {
      if(currentToken && currentToken.length > 0){
        if(this._paymentTokens.has(currentToken)){
          let details:TokenDetails | undefined = this._paymentTokens.get(currentToken);
          return details ? `${currentToken} - ${this._displayPrice(this._charsContractInfo.weiMintPrice, details.multiplier)}` : '';
        }
        else return currentToken;
      }
      else return this.getDefaultCurrencyTitle();
    }
    else return this.getDefaultCurrencyTitle();
  });

  imageUrl = computed(() => {
    console.log('-on image computed --');
    let currentImg: GenerateImageResponse | null = this.currentImage();
    let currentTicket: TicketDto | null = this.currentTicket();
    if(currentImg){
      let b64:string = currentImg.base64;
      return this._sanitizer.bypassSecurityTrustResourceUrl(`data:image/png;base64,${b64}`);
    }
    else {
      if(currentTicket){
        let b64:string = currentTicket.base64;
        return this._sanitizer.bypassSecurityTrustResourceUrl(`data:image/png;base64,${b64}`);
      }
      else return this.isFemaleChar ? this.FEMALE_CHAR_IMG : this.MALE_CHAR_IMG;
    }
  });
  charsProfilePage = computed(() => Math.max(this.generatedProfiles().length -1, 0));
  imagePromptsPage = computed(() => Math.max(this.imagePrompts().length -1, 0));
  profileImagesCount = computed(() => {
    let profile: RandomWorldsCharacter | null = this.currentProfile();
    if(profile && this.currentImage()){
      return this.characterImages.has(profile) ? this.characterImages.get(profile)?.length : 0;
    }
    else return 0;
  });
  characterPrompts: Map<RandomWorldsCharacter, string[]> = new Map<RandomWorldsCharacter, string[]>();
  characterImages: Map<RandomWorldsCharacter, GenerateImageResponse[]> = new Map<RandomWorldsCharacter, GenerateImageResponse[]>();

  ngOnInit(): void {
    this._web3Service.getCurrentChainId().then(id => {
      console.log('-- CONNECTED CHAIN --')
    })
    this.onContractLoaded.subscribe((contractAddress:string) => {
      if(this._web3Service.connectedWallet){
        this._mgmtService.getCurrentTicket(this._web3Service.connectedWallet, contractAddress, true)
          .pipe(takeUntilDestroyed(this._destroyRef))
          .subscribe(res => {
            console.log('-- UNREDEEMED TICKET --', res);
            if(res && !res.isRedeemed) {
              this.currentTicket.set(res);
              this._web3Service.getAvailableCharPurchases(contractAddress).then(res => {
                if(res && res > 0){
                  this.availablePurchases.update(v => res);
                  this.availableTokens.set(["REDEEM"]);
                  this.selectedCurrency.set(this.availableTokens()[0]);
                  this._displayUnredeemedTicket();
                  // ONPAYCLICK_IF_REDEEM -> GET_CURRENT_TICKET_META & REDEEM ELSE PAY
                }
                else this._setForPurchase(contractAddress, this.currentTicket());
              });
            }
            else this._setForPurchase(contractAddress, res);
          })
      }
    });
    this.onTicketPurchased.subscribe((data: any) => {
      console.log('purchase transaction', data.receipt.transactionHash);
      let wallet:string | null = data.receipt.from;
      let profile: RandomWorldsCharacter | null = this.currentProfile();
      let image: GenerateImageResponse | null = this.currentImage();
      this._web3Service.getCurrentChainId().then(chain => {
        if(wallet && profile && image){
          let ticket: MintCharacterRequest = {
            chainId: Number(chain),
            txHash: data.receipt.transactionHash,
            currency: data.currency,
            price: web3.utils.fromWei(data.price, 'ether'),
            character: profile,
            base64: image.base64
          }
          this._mgmtService.uploadCustomCharacter(wallet, this._charsContractInfo.contractAddress, ticket)
            .pipe(catchError(e => {
              this.isLoading = false; 
              this.isMinting = false;
              return of(e);
            }))
            .subscribe((res: TicketDto | Error) => {
              console.log('-- on character IPFS upload completed --', res);
              if(res as unknown as TicketDto !== undefined)
                this.onTokenUploaded.emit(res as unknown as TicketDto);
              else this._notificationsService.openSnack(ESnackAlertType.ERROR, `${(res as unknown as Error).message}`, true);
          });
        }
        else {
          this.isLoading = false;
          this.isMinting = false;
          this._notificationsService.openSnack(ESnackAlertType.ERROR, 'An error has occured while gathering wallet | profile | image values, try again');
        }
      })
    });

    this.onTokenUploaded.subscribe(ticket => {
      if(ticket.metaUri && ticket.mintSignature){
        console.log('redeeming ticket w/metaUri: ', ticket.metaUri);
        this._web3Service.redeemCustomCharNFT(this._charsContractInfo.contractAddress, ticket.metaUri, ticket.mintSignature)
          .on('receipt', (receipt:any) => {
            console.log('-- on etherMint receipt --', receipt);
              this.isLoading = false;
              this.isMinting = false;
              if(ticket.id){
                this._mgmtService.setTicketRedeemed(ticket.id)
                  .pipe(takeUntilDestroyed(this._destroyRef))
                  .subscribe(res => {
                    this._dialogRef.close(res);   
                  });
              }
              else this._dialogRef.close(ticket);
          })
          .on('error', (error:any, receipt:any) => {
            console.log('-- on ether collection mint error --', error, receipt); 
            this.isLoading = false;
            this.isMinting = false;
          });
      }
    });

    let wallet = this._web3Service.connectedWallet;
    if(!wallet){
      this._notificationsService.openSnack(ESnackAlertType.ERROR, 'No wallet connected', true);
      this._dialogRef.close();
    }
    this._web3Service.getCustomCharsCatalogue().then(cat => {
      if(!cat) {
        this._notificationsService.openSnack(ESnackAlertType.ERROR, 'No Immutable Characters Contract deployed. Cannot mint NFT', true, 5000);
        this._dialogRef.close();
      }
      this._charsContractInfo = cat;
      this._notificationsService.openSnack(ESnackAlertType.SUCCESS, `Current Characters contract: ${cat.name}`, true, 5000);
      this.selectedCurrency.update(v => 'ETH');
      this.onContractLoaded.emit(cat.contractAddress);
    });

    this._currentImageUrl = this.isFemaleChar ? this.FEMALE_CHAR_IMG : this.MALE_CHAR_IMG;
    this._connectedWallet = this.data.connectedWallet;
    if(!this._connectedWallet){
      this._notificationsService.openSnack(ESnackAlertType.WARN, "No connected wallet found, mint service unavailable");
    }
    this._imagesService.getAmbiences().subscribe(res => {
      console.log('-- on ambiences response --', res);
      this.availableAmbiences = res.data.map((item:SystemMessageDto) => item.description);
      console.log('-- mapped ambiences --', this.availableAmbiences);
    });
    this._imagesService.getMoods().subscribe(res => {
      console.log('-- on moods response --', res);
      this.availableMoods = res.data.map((item:SystemMessageDto) => item.description);
      console.log('-- mapped moods --', this.availableMoods);
    });
    this.form = this._formBuilder.group({
      name: new FormControl(''),
      age: new FormControl(''),
      isFemaleChar: new FormControl(this.isFemaleChar)
    })
    this._imagesService.getProviderSettings().subscribe(res => {
      if(res){
        this.diffusionSettings = res;
        this._notificationsService.openSnack(ESnackAlertType.WARN, `Diffusion Settings: ${this.diffusionSettings.current_integration_settings.name}/${this.diffusionSettings.current_integration_settings.current_model}`, false, 3000);
      }
      else this._notificationsService.openSnack(ESnackAlertType.ERROR, 'DIFFUSION API SERVICE NOT AVAILABLE', false, 3000);
    })
    this._displayTabChangeAlerts("Ambiences");
  }
  
  private _setForPurchase(contractAddress: string, invalidTicket: TicketDto | null){
    if(invalidTicket && invalidTicket.id){
      this._mgmtService.deleteTicket(invalidTicket.id)
        .pipe(takeUntilDestroyed(this._destroyRef))
        .subscribe(res => {
          if(!res){
            this._notificationsService.openSnack(ESnackAlertType.ERROR, 'An error has occured while deleting an invalid ticket');  
          }
      })
    }
    this.currentTicket.set(null);
    this._setupWordsTokenDetails(contractAddress).then(response => {
    if(response && response.tokenContract === this._paymentTokens.get("WORDS")?.tokenContract)
      this._notificationsService.openSnack(ESnackAlertType.WARN, 'WORDS token enabled', false);
    });
  }
  
  drop(event: CdkDragDrop<string[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex,
      );
    }
  }
  //selectedCurrency = signal<string>
  // tabTitle=computed => currency - value
  onSelectedTokenChange(event: string){
    this.selectedCurrency.update(v => event);
  }

  async onSelectedTokenPay(event: string){
    if(event !== this.selectedCurrency()){
      this._notificationsService.openSnack(ESnackAlertType.ERROR, 'The selected currency does not match the input currency', true)
      return;
    }
    const contract: CustomCharsCatalogue | null = this._charsContractInfo;
    if(!contract) return;

    if(this.selectedCurrency() !== 'ETH') {
      if(this.selectedCurrency() === 'REDEEM') {
        if(this.currentTicket() && this.currentTicket()?.contractAddress && this.currentTicket()?.metaUri && this.currentTicket()?.metaCid && this.currentTicket()?.mintSignature){
          this.isMinting = true;
          this._web3Service.redeemCustomCharNFT(this.currentTicket()?.contractAddress ?? '', this.currentTicket()?.metaUri ?? '', this.currentTicket()?.mintSignature ?? '')
          .on('receipt', (receipt:any) => {
            console.log('-- on etherMint receipt --', receipt);
              this.isLoading = false;
              this.isMinting = false;
              this._dialogRef.close(this.currentTicket());
          })
          .on('error', (error:any, receipt:any) => {
            console.log('-- on ether collection mint error --', error, receipt); 
            this.isLoading = false;
            this.isMinting = false;
          });
        }
      }
      else{
        const tokenDetails: TokenDetails | undefined = this._paymentTokens.get(this.selectedCurrency());
        // Never fall through to the ETH branch when the token details are missing:
        // that would charge the user in ETH for a purchase they made in tokens.
        if(!tokenDetails){
          this._notificationsService.openSnack(ESnackAlertType.ERROR, `No token details loaded yet for ${this.selectedCurrency()}, try again in a moment`, true);
          return;
        }
        this.isLoading = true;
        this.isMinting = true;
        // The contract wants an integer in the token's own base units - a
        // different number from the one we render in the title.
        const amount: string = this._baseUnits(contract.weiMintPrice, tokenDetails);
        await this._web3Service.getCoinContract(this.selectedCurrency()).methods
          .approve(contract.contractAddress, amount)
          .send({from: this._web3Service.connectedWallet})
          .on('receipt', (receipt:any) => {
            console.log('-- on etherMint receipt --', receipt);
            this._web3Service.mintCustomCharacter(this._charsContractInfo.contractAddress, this.selectedCurrency())
            .on('receipt', (pur_receipt: any) => {
              this.onTicketPurchased.emit({ currency: this.selectedCurrency(), price: amount, receipt: pur_receipt });
            })
            .on('error', (error:any, pur_receipt:any) => {
              console.log('-- on ether collection mint error --', error, pur_receipt);
              this._notificationsService.openSnack(ESnackAlertType.ERROR, `${error}`, true, 5000);
              this.isLoading = false;
              this.isMinting = false;
          });
          })
          .on('error', (error:any, receipt:any) => {
            console.log('-- on ether collection mint error --', error, receipt);
            this._notificationsService.openSnack(ESnackAlertType.ERROR, `${error}`, true, 5000);
            this.isLoading = false;
            this.isMinting = false;
          }); 
      }
    }
    else{
      this.isLoading = true;
      this.isMinting = true;
      // Paying in ETH: weiMintPrice is already in wei, which is exactly what
      // `value` wants. No conversion at all.
      await this._web3Service.getCustomCharactersContract(contract.contractAddress).methods
        .etherPurchase()
        .send({from: this._web3Service.connectedWallet, value: contract.weiMintPrice})
        .on('receipt', (receipt:any) => {
            console.log('-- on etherMint receipt --', receipt);
            this.onTicketPurchased.emit({ currency: this.selectedCurrency(), price: contract.weiMintPrice, receipt: receipt })
          })
          .on('error', (error:any, receipt:any) => {
            console.log('-- on ether collection mint error --', error, receipt);
            this._notificationsService.openSnack(ESnackAlertType.ERROR, `${error}`, true, 5000);
            this.isLoading = false;
            this.isMinting = false;
          });
    } 
  }


  onShowSettings(){
    this.showSettings = true;
  }
  onHideSettings(){
    this.showSettings = false;
  }
  onTabChange(event: MatTabChangeEvent){
    console.log('-- on tab change --', event.tab.textLabel);
    this._displayTabChangeAlerts(event.tab.textLabel);
  }
  onGenerateProfileClick(){
    console.log('-- on generate character profile --');
    if(this.selectedAmbiences.length === 0 && this.selectedMoods.length === 0){
      this._notificationsService.openSnack(ESnackAlertType.ERROR, "Cannot create a character profile without at least one selected AMBIENCE and/or MOOD");
      return;
    }
    
    let req: CreateCharacterRequest = {
      name: this.form.get('name')?.value.trim(),
      age: this.form.get('age')?.value.trim(),
      ambiences: this.selectedAmbiences,
      moods: this.selectedMoods,
      suggestions: this.suggestbox.nativeElement.value.trim(),
      constraints: this.constraintsbox.nativeElement.value.trim().length > 0 ? [this.constraintsbox.nativeElement.value] : []
    }

    if(!this.isRandomGenre)
      req.constraints.push(this.form.get('isFemaleChar')?.value ? 'The generated character MUST be a female.' : 'The generated character MUST be a male.');
    console.log('on generate profile click', req);
    this.isLoading = true;
    this._charactersService.generateCharacterProfile(req).subscribe(res => {
      console.log('-- on char profile response --', res);
      if(this.showSettings)
        this.showSettings = false;
      
      this._updateProfiles(res, false);
      
      this.isLoading = false;
    });
  }

  public onSaveDatasetChar(){
    let profile: RandomWorldsCharacter | null = this.currentProfile();
    if(profile){
       let req: SaveDatasetCharacter = {
        name: this.form.get('name')?.value,
        age: this.form.get('age')?.value,
        ambiences: this.selectedAmbiences,
        moods: this.selectedMoods,
        suggestions: this.suggestbox.nativeElement.value.trim(),
        constraints: this.constraintsbox.nativeElement.value.trim().length > 0 ? [this.constraintsbox.nativeElement.value] : [],
        profile: profile
      }

      if(!this.isRandomGenre)
        req.constraints.push(this.form.get('isFemaleChar')?.value ? 'The generated character MUST be a female' : 'The generated character MUST be a male');
        console.log('on generate profile click', req);
        this.isLoading = true;
        this._charactersService.generateCharacterProfile(req)
        .subscribe(res => {
          console.log('-- on char profile response --', res);
          this._notificationsService.push('Character saved for dataset');
          this.isLoading = false;
        });
    }
  }
  private _updateProfiles(res: QuestCharacter, isFromTicket: boolean){
    let profile: RandomWorldsCharacter = res;
    if(!isFromTicket){
      profile.moods = this.selectedMoods;
      profile.ambiences = this.selectedAmbiences;
    }
    this.generatedProfiles.update(v => [...v, profile]);
    this.currentProfile.set(profile);
    this._currentProfileIdx = this.charsProfilePage();
    this.characterPrompts.set(profile, profile.iconicMoment ? [...this.characterPrompts.get(profile) ?? [], profile.iconicMoment] : []);
    this._renderCurrentProfile();
  }

  onEnhanceImagePromptClick(){
    console.log('-- on enhance image --', this.currentProfile());
    this.isLoading = true;
    this.isEnhancing = true;
    let profile:RandomWorldsCharacter|null = this.currentProfile();

    if(profile){
      this._charactersService.generateCharacterImagePrompt(profile).subscribe(res => {
        console.log('-- on image prompt generated --', res);
        this.characterPrompts.get(profile)?.push(res.content);
        console.log(this.characterPrompts.get(profile));
        this.imagePrompts.update(v => [...this.characterPrompts.get(profile) ?? []]);
        this.imagepromptbox.nativeElement.value = res.content;
        this.isLoading = false;
        this.isEnhancing = false;
      });
    }
  }

  onGenerateImageClick(){
    console.log('-- on generate image --', this.currentProfile);
    this.isLoading = true;
    this.isGeneratingImage = true;
    let profile: RandomWorldsCharacter | null = this.currentProfile();
    if(profile){
      let req: GenerateImageRequest = {
        name:'chartest',
        diffuser_name: this.diffusionSettings.current_integration_settings.current_model ?? '',
        tag: '',
        prompt: `Hand draw illustration. ${profile.ambiences}, ${profile.moods}. Image Description: ${this.imagepromptbox.nativeElement.value}`,
        height: 800,
        width: 512,
        guidance: 5.5,
        num_gen: 1,
        inference_steps: 3,
        seed: null,
        db_save: false,
        file_save: true,
        cache_diffusion_pipe: true
      }
      this._imagesService.generate(this.diffusionSettings.current_integration_settings.name, req).subscribe(res => {
        console.log('-- on generated image --', res);
        this.isGeneratingImage = false;
        this.isLoading = false;
        if(res.length > 0){
          let profile: RandomWorldsCharacter | null = this.currentProfile();
          if(profile){
            this.currentImage.set(res[0]);
            if(this.characterImages.has(profile))
              this.characterImages.get(profile)?.push(res[0]);

            else this.characterImages.set(profile,res);
          }
        }
        else this._notificationsService.openSnack(ESnackAlertType.ERROR, "An error has occured while generating the NFT image");
      })
    }
  }

  onCharacterGenreToggle(event: MatSlideToggleChange){
    console.log('-- on toggle change --');
    this.isFemaleChar = event.checked;
    this.form.get('isFemaleChar')?.setValue(this.isFemaleChar);
    this._updateImageUrl(this.form.get('isFemaleChar')?.value);
  }
  onRandomGenreCharacter(event: MouseEvent){
    console.log('-- on random btn --', event);
    this.isRandomGenre = !this.isRandomGenre;
    this.form.get('isFemaleChar')?.setValue(this.isRandomGenre ? undefined : this.isFemaleChar);
    this._updateImageUrl(this.form.get('isFemaleChar')?.value);
  }
  removeAmbience(item:string){
    if(this.selectedAmbiences.includes(item))
      this.selectedAmbiences = this.selectedAmbiences.filter(x => x !== item);
    if(!this.availableAmbiences.includes(item))
      this.availableAmbiences.push(item);
  }
  removeMood(item: string){
    if(this.selectedMoods.includes(item))
      this.selectedMoods = this.selectedMoods.filter(x => x !== item);
    if(!this.availableMoods.includes(item))
      this.availableMoods.push(item);
  }
  onImagePromptPageChange(event:PageEvent){
    console.log('-- on image prompt page --', event);
    if(event.pageIndex >= this.imagePrompts().length) return;
    let prompt = this.imagePrompts()[event.pageIndex];
   
    this.imagepromptbox.nativeElement.value = prompt;
  }
  onProfilePageChange(event:PageEvent){
    console.log('-- on profile page --',event);
    if(event.pageIndex >= this.generatedProfiles().length) return;
    let profile = this.generatedProfiles()[event.pageIndex];
    this._currentProfileIdx = event.pageIndex;
    if(profile) {
      this.currentProfile.set(profile);
      this._renderCurrentProfile();
    }
  }

  public onSkipImage(dir:string){
    let profile:RandomWorldsCharacter | null = this.currentProfile();
    let currentImage: GenerateImageResponse | null = this.currentImage();
    if(profile){
      let profileImages: GenerateImageResponse[] = this.characterImages.get(profile) ?? [];
      if(profileImages.length == 0) return;
      if(!currentImage){
        this.currentImage.set(profileImages[0]);
        return;
      }
      let idx = profileImages.indexOf(currentImage);
      switch(dir){
        case('left'):
          if(idx > 0)
            this.currentImage.set(profileImages[idx -1]);
          break;
        case('right'):
            if(idx + 1 < profileImages.length)
              this.currentImage.set(profileImages[idx +1]);
          break;
        default:break;
      }
    }
  }

  public onSettingsHidden() {
    this._renderCurrentProfile();
  }
  private _renderCurrentProfile(){
    let profile = this.currentProfile();
    if(profile){
      this.imagePrompts.set(this.characterPrompts.get(profile) ?? []);
      this.imagepromptPaginator.firstPage();
      this.imagepromptbox.nativeElement.value = this.imagePrompts()[0];
      this.displaybox.nativeElement.value = this._renderCharacterProfile(profile);
      this.charsPaginator.pageIndex = this._currentProfileIdx;
    } 
  }

  private _updateImageUrl(isFemaleChar: boolean | undefined){
    if(isFemaleChar === undefined){
      this._currentImageUrl = this.UNKNOWN_CHAR_IMG;
    }
    else{
      this._currentImageUrl = isFemaleChar ? this.FEMALE_CHAR_IMG : this.MALE_CHAR_IMG;
    }
  }

  private _displayTabChangeAlerts(tabLabel: string){
    switch(tabLabel){
      case("Ambiences"):
        this._notificationsService.openSnack(ESnackAlertType.SUCCESS, 'Select at least one AMBIENCE style and up to five (counting up the MOODS too)');  
      break;
      case("Moods"):
        this._notificationsService.openSnack(ESnackAlertType.SUCCESS, 'Select at least one MOOD style and up to five (counting up the AMBIENCES too)');
        break;
      case("Character"):
        if(this.selectedAmbiences.length == 0 && this.selectedMoods.length == 0){
          this._notificationsService.openSnack(ESnackAlertType.WARN, 'No character styles selected. Select at least one AMBIENCE and one MOOD');
        }
        break;
      default: break;
    }
  }

  private _renderCharacterProfile(profile: RandomWorldsCharacter | null){
    if(!profile) return '';
    let text = ''
    let exclusions: string[] = ['id', '_id']
    Object.keys(profile).forEach((k:any) => {
      if(!exclusions.includes(k))
        text += `\n${k}: ${Object(profile)[k]}`;
    })
    return text.trim()
  }

  private async _setupWordsTokenDetails(collectionAddress: string) : Promise<TokenDetails | null>{
    let address = await this._web3Service.getWordsTokenAddress(collectionAddress, false)
    let symbol = await this._web3Service.getWordsContract().methods.symbol().call();
    let decimals = await this._web3Service.getWordsContract().methods.decimals().call();
    let exchange = await this._web3Service.getCustomCharactersContract(collectionAddress).methods.wordsExchangeRate().call();
    if(symbol !== 'WORDS') return null;

    let tokenDetails: TokenDetails = {
      tokenContract:address,
      multiplier: exchange,
      decimals: decimals
    }
    this._paymentTokens.set(symbol, tokenDetails);
    if(!this.currentTicket())
      this.availableTokens.update(v => [...v, symbol]);
    
    return tokenDetails;
  }

  private _displayUnredeemedTicket(){
    if(!this.currentTicket()) return;
    let profile: RandomWorldsCharacter | undefined = this.currentTicket()?.character;
    if(profile) {
      if(this.showSettings)
        this.showSettings = false;
      
      if(profile.ambiences)
        this.selectedAmbiences = [...profile.ambiences];
      
      if(profile.moods)
        this.selectedMoods = [...profile.moods];

      this.form.controls['name'].setValue(profile.name);
      this.form.controls['age'].setValue(profile.age);
      this._updateProfiles(profile, true);

    }
  }
}
