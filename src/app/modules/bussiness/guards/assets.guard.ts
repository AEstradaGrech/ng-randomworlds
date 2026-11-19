import { inject } from "@angular/core";
import { CanActivateFn } from "@angular/router";
import { SmartContractsService } from "../services/smart-contracts.service";
import { NotificationService } from "../../shared/services/notification.service";
import { ESnackAlertType } from "../../shared/models/common-enums";

export const hasAssetsGuard: CanActivateFn = async(route, state) =>{
    const notificationsService = inject(NotificationService);
    const smartContractsService = inject(SmartContractsService);
    const assets = await smartContractsService.getWalletNFTs();
    let canActivate = assets.length > 0;
    if(!canActivate)
        notificationsService.openSnack(ESnackAlertType.WARN, 'You don\'t have any NFT to select. Buy one in the marketplace or generate a custom one');
    return canActivate;
}