import { inject } from "@angular/core";
import { CanActivateFn } from "@angular/router";
import { SmartContractsService } from "../services/smart-contracts.service";
import { NotificationService } from "../../shared/services/notification.service";
import { ESnackAlertType } from "../../shared/models/common-enums";
import { GameData } from "../../shared/models/common-interfaces";

export const hasAssetsGuard: CanActivateFn = async(route, state) =>{
    const notificationsService = inject(NotificationService);
    const gameData = localStorage.getItem('game-data');
    if(gameData){
        const parsedData:GameData = JSON.parse(gameData);
        if(parsedData.selectedCharacter) return true;
    }
    notificationsService.openSnack(ESnackAlertType.SUCCESS, 'Checking assets...');
    const smartContractsService = inject(SmartContractsService);
    let canActivate = await smartContractsService.hasAssets();
    if(!canActivate)
        notificationsService.openSnack(ESnackAlertType.WARN, 'You don\'t have any NFT to select. Buy one in the marketplace or generate a custom one');
    return canActivate;
}