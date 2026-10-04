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
import { catchError, concatMap, defer, EMPTY, exhaustMap, filter, finalize, forkJoin, map, Observable, of, switchMap, tap, throwError } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';

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
  private _router: Router = inject(Router);
  private _currentImageUrl:string = '';
  private _currentProfileIdx:number = 0;
  private _charsContractInfo!: CustomCharsCatalogue;
  private _paymentTokens: Map<string, TokenDetails> = new Map<string, TokenDetails>();
  private onContractLoaded: EventEmitter<string> = new EventEmitter<string>();
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
      return this.characterImages.get(profile)?.length ?? 0;
    }
    else return 0;
  });
  characterPrompts: Map<RandomWorldsCharacter, string[]> = new Map<RandomWorldsCharacter, string[]>();
  characterImages: Map<RandomWorldsCharacter, GenerateImageResponse[]> = new Map<RandomWorldsCharacter, GenerateImageResponse[]>();

  ngOnInit(): void {
    this.onContractLoaded.pipe(
      filter(() => !!this._connectedWallet),
      switchMap(address => 
        this._ticketState$(address)
          .pipe(
            map(state => ({address, ...state}))
          )
      ),
      switchMap(
        ({address, ticket, purchases}) => {
          return ticket && !ticket.isRedeemed && purchases > 0 ?
            of(this._setForRedeem(ticket, purchases)) :
            this._setForPurchase$(address, ticket)
        }
      ),
      takeUntilDestroyed(this._destroyRef)
    ).subscribe({ 
      error: (err: HttpErrorResponse) => this._notificationsService.openSnack(ESnackAlertType.ERROR, `Could not load your pending ticket: ${err.message}`, true),
    });

     this.onTicketPurchased.pipe(
      concatMap(data => this._uploadCustomChar$(data)
        .pipe(
          tap(ticket => {
            if(!ticket.metaUri || !ticket.mintSignature)
              throw new Error('Invalid redeem data. missing contract info | metaUri | mintSignature');
          }),
          switchMap(ticket => this._redeemTicket$(ticket)),
          catchError(error => { 
            this._notificationsService.openSnack(ESnackAlertType.ERROR, error.message);
            // reset UI for redeem 
            this.onContractLoaded.emit(this._charsContractInfo.contractAddress);
            return EMPTY;
          }),
          finalize(() => { this.isLoading = false; this.isMinting = false;})
        )), 
      takeUntilDestroyed(this._destroyRef),
    ).subscribe({ 
      next: result => this._dialogRef.close(result)
    });
    let wallet = this._web3Service.connectedWallet;
    if(!wallet)
      this._dialogRef.close('No wallet connected');
    defer(() => this._web3Service.getCustomCharsCatalogue())
      .pipe(
        takeUntilDestroyed(this._destroyRef)
      ).subscribe({
        next: cat => {
          this._charsContractInfo = cat;
          this._notificationsService.push(`Current Characters contract: ${cat.name}`, 5000);
          this.selectedCurrency.update(v => 'ETH');
          this.onContractLoaded.emit(cat.contractAddress);
        },
        error: error => {
          setTimeout(() => this._dialogRef.close('No Immutable Characters Contract deployed. Cannot mint NFT'), 1000);
        }
      })
    this._currentImageUrl = this.isFemaleChar ? this.FEMALE_CHAR_IMG : this.MALE_CHAR_IMG;
    this._connectedWallet = this.data.connectedWallet;
    if(!this._connectedWallet){
      this._notificationsService.openSnack(ESnackAlertType.WARN, "No connected wallet found, mint service unavailable");
    }

    forkJoin({
      ambiences: this._imagesService.getAmbiences(), 
      moods: this._imagesService.getMoods()
    }).pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe({
        next: ({ambiences, moods}) => {
          this.availableAmbiences = this._mapSysMessageDescriptions(ambiences.data);
          this.availableMoods = this._mapSysMessageDescriptions(moods.data)
        },
        error: (error:HttpErrorResponse) => {
          this._notificationsService.openSnack(ESnackAlertType.ERROR, `An error has occured while loading the ambiences and moods: ${error.message}`);
        }
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
  
  private _mapSysMessageDescriptions(data :any) : string[]{
    return data.map((item: SystemMessageDto) => item.description);
  }
  
  private _uploadCustomChar$(data: any) : Observable<TicketDto>{
     if(!this._charsContractInfo)
      throw new Error('No Characters contract info');
    return defer(() => this._web3Service.getCurrentChainId()).pipe(
      catchError(error => throwError(() => new Error(`An error has occured while retrieving the current chain ID >> ${error.message}`))),
      switchMap(chain => {
        const wallet:string | null = data.receipt.from;
        const profile: RandomWorldsCharacter | null = this.currentProfile();
        const image: GenerateImageResponse | null = this.currentImage();
        if (!wallet || !profile || !image)
          return throwError(() => new Error('Payment received, but wallet/profile/image is missing. Please retry.'));
        let ticket: MintCharacterRequest = {
          chainId: chain,
          txHash: data.receipt.transactionHash,
          currency: data.currency,
          price: web3.utils.fromWei(data.price, 'ether'),
          character: profile,
          base64: image.base64
        }
        return this._mgmtService.uploadCustomCharacter(wallet, this._charsContractInfo.contractAddress, ticket)
          .pipe(
            catchError(e =>  throwError(() => new Error(`An error has occured while uploading the NFT data >> ${e}`))) 
          )
      })
    )}

  private _ticketState$(address:string) : Observable<{ticket:TicketDto | null, purchases: number}>{
    return this._mgmtService.getCurrentTicket(this._connectedWallet!, address, true)
      .pipe(
        catchError((error: HttpErrorResponse) => error.status === 404 ? of(null) : throwError(() => error)),
        switchMap(ticket => !ticket || ticket.isRedeemed ? 
          of({ticket, purchases: 0}) :
          defer(() => this._web3Service.getAvailableCharPurchases(address))
            .pipe(
              map(purchases => ({ticket, purchases}))
            )
        )
      )
  }

  private _setForPurchase$(contractAddress: string, invalidTicket: TicketDto | null) : Observable<TokenDetails | null>{
    const cleanup$ = invalidTicket && invalidTicket.id ?
     this._mgmtService.deleteTicket(invalidTicket?.id).pipe(
      catchError(error => {
        this._notificationsService.openSnack(ESnackAlertType.ERROR, 'An error has occured while deleting an invalid ticket');  
        return of(null)
      })
    ) : of(null);
    const wordsSetup$ = defer(() => this._setupWordsTokenDetails(contractAddress)).pipe(
      tap(details => {
        if(details && details.tokenContract === this._paymentTokens.get("WORDS")?.tokenContract)
          this._notificationsService.push('WORDS token enabled', 3000);
      })
    )
    return forkJoin([cleanup$, wordsSetup$]).pipe(
      map(([,details]) => details)
    )
  }

  private _setForRedeem(ticket:TicketDto, purchases: number){
    this.currentTicket.set(ticket);
    this.availablePurchases.update(v => purchases);
    this.availableTokens.set(["REDEEM"]);
    this.selectedCurrency.set(this.availableTokens()[0]);
    this._displayUnredeemedTicket();
  }

  private _redeemTicket$(ticket: TicketDto) : Observable<TicketDto>{
    return defer(() => this._web3Service.redeemCustomCharNFT(ticket.contractAddress!, ticket.metaUri!, ticket.mintSignature!))
      .pipe(
        switchMap(() =>  ticket.id ? 
          this._mgmtService.deleteTicket(ticket.id)
          .pipe(
            catchError(error => { 
              this._notificationsService.openSnack(ESnackAlertType.WARN, 'Character minted, but the ticket could not be marked as redeemed');
              return of(ticket);
            })
          )
          : of(ticket)
        ),
        catchError(error => throwError(() => new Error(`An error has ocurred while redeeming the NFT in the smart contract >> ${error.message}`)))
      )
  }

  public canDropElement = (): boolean => this.selectedAmbiences.length + this.selectedMoods.length < 6;
  
  public notifyDropFail(baseMessage:string){
    this._notificationsService.openSnack(ESnackAlertType.WARN, `${baseMessage}. You have already selected 6 moods and ambiences`, false, 5000);
  }

  onSelectedTokenChange(event: string){
    this.selectedCurrency.update(v => event);
  }

  onSelectedTokenPay(event: string){
    if(!this._web3Service.connectedWallet){
      defer(() => this._web3Service.tryMetamaskLogin())
        .pipe(
          takeUntilDestroyed(this._destroyRef)
        ).subscribe({
          next: loged => { 
            if(!loged){
              this._dialogRef.close();
              this._router.navigateByUrl('');
            }
            else this._handlePayment(event);
          },
          error: error => this._router.navigateByUrl('')
        })
    }
    else this._handlePayment(event); 
  }

  private _handlePayment(currency: string){
    if(this.isMinting) return;
    if(currency !== this.selectedCurrency()){
      this._notificationsService.openSnack(ESnackAlertType.ERROR, 'The selected currency does not match the input currency', true)
      return;
    }
    const contract: CustomCharsCatalogue | null = this._charsContractInfo;
    if(!contract) return;
    if(currency !== 'ETH') {
      if(currency === 'REDEEM') {
        const unredeemedTicket: TicketDto | null = this.currentTicket();
        if(!unredeemedTicket){
          this._notificationsService.openSnack(ESnackAlertType.WARN, `No unredeemed ticket to redeem`);
          return;
        }
        this.isLoading = true;
        this.isMinting = true;
        this._redeemTicket$(unredeemedTicket) 
          .pipe(
            finalize(() => { this.isLoading = false; this.isMinting = false;}),
            takeUntilDestroyed(this._destroyRef)
          )
          .subscribe({
            next: redeemedTicket => this._dialogRef.close(redeemedTicket),
            error: error => this._notificationsService.openSnack(ESnackAlertType.ERROR, `An error has occured while redeeming the current ticket >> ${error.message}`)
          })
      }
      else{
        const tokenDetails: TokenDetails | undefined = this._paymentTokens.get(currency);
        // Never fall through to the ETH branch when the token details are missing:
        // that would charge the user in ETH for a purchase they made in tokens.
        if(!tokenDetails){
          this._notificationsService.openSnack(ESnackAlertType.ERROR, `No token details loaded yet for ${currency}, try again in a moment`, true);
          return;
        }
        this.isLoading = true;
        this.isMinting = true;
        // The contract wants an integer in the token's own base units - a
        // different number from the one we render in the title.
        const amount: string = this._baseUnits(contract.weiMintPrice, tokenDetails);
        defer(() => this._web3Service.getCoinContract(currency).methods
          .approve(contract.contractAddress, amount)
          .send({from: this._web3Service.connectedWallet}))
          .pipe(
            switchMap(receipt => this._customTokenPurchase$(contract.contractAddress, currency)),
            takeUntilDestroyed(this._destroyRef)
          ).subscribe({
            next: purchase_receipt => this.onTicketPurchased.emit({currency: currency, price: amount, receipt: purchase_receipt}), 
            error: error => {
              this._notificationsService.openSnack(ESnackAlertType.ERROR, error.message, true, 5000);
              this.isLoading = false; 
              this.isMinting = false;
            }
          })
      }
    }
    else{
      this.isLoading = true;
      this.isMinting = true;
      defer(() => this._web3Service.getCustomCharactersContract(contract.contractAddress).methods
        .etherPurchase()
        .send({from: this._web3Service.connectedWallet, value: contract.weiMintPrice})
      ).pipe(
        takeUntilDestroyed(this._destroyRef)
      ).subscribe({
        next: receipt => this.onTicketPurchased.emit({ currency: currency, price: contract.weiMintPrice, receipt: receipt }),
        error: error => {
          this._notificationsService.openSnack(ESnackAlertType.ERROR, `${error.message}`, true, 5000);
          this.isLoading = false
          this.isMinting = false;
        }
      })
    } 
  }
  private _customTokenPurchase$(address: string, currency: string) : Observable<any>{
    return defer(() => this._web3Service.customTokenPurchase(address, currency))
      .pipe(
        catchError(error => throwError(() => new Error(`An error has occured while minting the NFT with ${currency} >> ${error.message}`)))
      );
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
    this.isLoading = true;
    this._charactersService.generateCharacterProfile(req)
      .pipe(
        finalize(() => this.isLoading = false),
        takeUntilDestroyed(this._destroyRef)
      ).subscribe({
        next: res => {
          if(this.showSettings)
            this.showSettings = false;
          this._updateProfiles(res, false);
        },
        error: error => this._notificationsService.openSnack(ESnackAlertType.ERROR, `An error has occured while generating the character profile >> ${error.message}`)
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
        .pipe(
          finalize(() => this.isLoading = false),
          takeUntilDestroyed(this._destroyRef),
        ).subscribe({
          next: res => this._notificationsService.push('Character saved for dataset'),
          error: error => this._notificationsService.openSnack(ESnackAlertType.WARN, `An error has occured while saving the dataset character >> ${error.message}`)
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
    const profile:RandomWorldsCharacter|null = this.currentProfile();
    if(profile){
      this.isLoading = true;
      this.isEnhancing = true;
      this._charactersService.generateCharacterImagePrompt(profile)
        .pipe(
          finalize(() => {this.isLoading = false; this.isEnhancing = false}),
          takeUntilDestroyed(this._destroyRef)
      ).subscribe({ 
        next: res => {
          this.characterPrompts.get(profile)?.push(res.content);
          console.log(this.characterPrompts.get(profile));
          this.imagePrompts.update(v => [...this.characterPrompts.get(profile) ?? []]);
          this.imagepromptbox.nativeElement.value = res.content;
        },
        error: error => this._notificationsService.push(`An error has occured while generating the enhanced image prompt >> ${error.message}`)
      });
    }
  }

  onGenerateImageClick(){
    const profile: RandomWorldsCharacter | null = this.currentProfile();
    if(profile){
      this.isLoading = true;
      this.isGeneratingImage = true;
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
      this._imagesService.generate(this.diffusionSettings.current_integration_settings.name, req)
        .pipe(
          finalize(() => { this.isGeneratingImage = false; this.isLoading = false;}),
          takeUntilDestroyed(this._destroyRef)
        ).subscribe({
          next: res => {
            if(res.length > 0){
              this.currentImage.set(res[0]);
              if(this.characterImages.has(profile))
                this.characterImages.get(profile)?.push(res[0]);

              else this.characterImages.set(profile,res);
            }
          },
          error: error =>  this._notificationsService.openSnack(ESnackAlertType.ERROR, `An error has occured while generating the NFT image >> ${error.message}`)
      })
    }
    else this._notificationsService.openSnack(ESnackAlertType.WARN, 'No character profile has been generated');
  }

  onCharacterGenreToggle(event: MatSlideToggleChange){
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
    if(event.pageIndex >= this.imagePrompts().length) return;
    let prompt = this.imagePrompts()[event.pageIndex];
   
    this.imagepromptbox.nativeElement.value = prompt;
  }
  onProfilePageChange(event:PageEvent){
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
        this._notificationsService.openSnack(ESnackAlertType.SUCCESS, 'Select at least one AMBIENCE style and up to six (counting up the MOODS too)');  
      break;
      case("Moods"):
        this._notificationsService.openSnack(ESnackAlertType.SUCCESS, 'Select at least one MOOD style and up to six (counting up the AMBIENCES too)');
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
    //Si no hay ticket por redimir, se añade opcion de pago con WORDS
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
