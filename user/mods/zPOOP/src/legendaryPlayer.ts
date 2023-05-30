import { IBotBase } from "@spt-aki/models/eft/common/tables/IBotBase";
import { globalValues } from "./POOP";
import { PoopDifficulty } from "./PoopDifficulty";
import { HashUtil } from "@spt-aki/utils/HashUtil";

export class LegendaryPlayer {

	public static assaultTypes: string[] = ["assaulteasy", "assaultnormal", "assaulthard", "cursedassaulteasy",
		"cursedassaultnormal", "cursedassaulthard"];

	public static pmcTypes: string[] = ["sptbeareasy", "sptbearnormal", "sptbearhard", "sptuseceasy",
		"sptusecnormal", "sptusechard"];

	static getBot(key: string): IBotBase {
		globalValues.Logger.warning(`requested bot type ${key} from cache`);
		if (globalValues.botGenerationCacheService.storedBots.has(key)) {
			const cachedOfType = globalValues.botGenerationCacheService.storedBots.get(key);

			if (cachedOfType.length > 0) {
				//this logic is fcuked up.   assault is included in cursedassault and assaultGroup?
				if (LegendaryPlayer.assaultTypes.includes(key.toLowerCase())) {
					let chance = globalValues.botGenerator.randomUtil.getChance100(globalValues.config.aiChanges.chanceChangeScavToWild);

					if (chance) {
						let newrole: string = globalValues.botGenerator.randomUtil.getArrayValue(globalValues.config.aiChanges.scavAltRolesPickList);
						newrole = globalValues.roleCase[newrole];
						cachedOfType[cachedOfType.length - 1].Info.Settings.Role = newrole;
						cachedOfType[cachedOfType.length - 1].Info.Side = "Savage";
						
						
						globalValues.Logger.info(`POOP: Substituting ${key} with ${newrole}!`);
						return cachedOfType.pop();
					}
					globalValues.Logger.info(`POOP: Not Substituting ${key}!`);
				}

				return cachedOfType.pop();
			}

			globalValues.Logger.error(globalValues.botGenerationCacheService.localisationService.getText("bot-cache_has_zero_bots_of_requested_type", key));
		}

		globalValues.Logger.error(globalValues.botGenerationCacheService.localisationService.getText("bot-no_bot_type_in_cache", key));

		return undefined;
	}



	static saveToFile(data, filePath) {
		var fs = require('fs');
		fs.writeFile(globalValues.modFolder + filePath, JSON.stringify(data, null, 4), function (err) {
			if (err) throw err;
		});
	}

	//does it know if it should be a death or survival?
	static progDifficultygenerated(survivalcount: number, threshold: number, step: number): number {
		let change = Math.round(Math.pow(step, survivalcount) * 100) / 100
		change -= 1;

		if (change > threshold) {
			return threshold
		} else {
			let output = change.toFixed(2)
			return parseFloat(output);
		}
	}


	static recordWinLoss(url, info, sessionId): void {

		let threshold = 8;
		let step = 1.05;
		if (globalValues.config.enableAutomaticDifficulty) {
			
			if (info.exit == "survived")//If they survived
			{
				globalValues.progressRecord[sessionId].winStreak += 1
				globalValues.progressRecord[sessionId].deathStreak = 0
				let diffAdjustment = this.progDifficultygenerated(globalValues.progressRecord[sessionId].winStreak, threshold, step)
				globalValues.progressRecord[sessionId].diffMod += diffAdjustment;
				globalValues.Logger.info(`POOP: Added ${diffAdjustment} ... New Difficulty =  ${globalValues.progressRecord[sessionId].diffMod}`)
			}
			else if (info.exit == "killed")//If they perished
			{
				globalValues.progressRecord[sessionId].winStreak = 0
				globalValues.progressRecord[sessionId].deathStreak += 1
				let diffAdjustment = this.progDifficultygenerated(globalValues.progressRecord[sessionId].deathStreak, threshold, step)
				globalValues.progressRecord[sessionId].diffMod -= diffAdjustment;
				globalValues.Logger.info(`POOP: Subtracted ${diffAdjustment} ... New Difficulty =  ${globalValues.progressRecord[sessionId].diffMod}`)
			}

			PoopDifficulty.adjustDifficulty(url, info, sessionId)
		}

		this.saveToFile(globalValues.progressRecord, "donottouch/progress.json");

		//return globalValues.nullResponse()
		return;
	}

	static serialize(data: { err: number; errmsg: any; data: any; }, prettify = false) {
		if (prettify) {
			return JSON.stringify(data, null, "\t");
		}
		else {
			return JSON.stringify(data);
		}
	}

	static clone(data: any) {
		return JSON.parse(JSON.stringify(data));
	}

}