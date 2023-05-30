"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LegendaryPlayer = void 0;
const POOP_1 = require("./POOP");
const PoopDifficulty_1 = require("./PoopDifficulty");
class LegendaryPlayer {
    static getBot(key) {
        POOP_1.globalValues.Logger.warning(`requested bot type ${key} from cache`);
        if (POOP_1.globalValues.botGenerationCacheService.storedBots.has(key)) {
            const cachedOfType = POOP_1.globalValues.botGenerationCacheService.storedBots.get(key);
            if (cachedOfType.length > 0) {
                //this logic is fcuked up.   assault is included in cursedassault and assaultGroup?
                if (LegendaryPlayer.assaultTypes.includes(key.toLowerCase())) {
                    let chance = POOP_1.globalValues.botGenerator.randomUtil.getChance100(POOP_1.globalValues.config.aiChanges.chanceChangeScavToWild);
                    if (chance) {
                        let newrole = POOP_1.globalValues.botGenerator.randomUtil.getArrayValue(POOP_1.globalValues.config.aiChanges.scavAltRolesPickList);
                        newrole = POOP_1.globalValues.roleCase[newrole];
                        cachedOfType[cachedOfType.length - 1].Info.Settings.Role = newrole;
                        cachedOfType[cachedOfType.length - 1].Info.Side = "Savage";
                        POOP_1.globalValues.Logger.info(`POOP: Substituting ${key} with ${newrole}!`);
                        return cachedOfType.pop();
                    }
                    POOP_1.globalValues.Logger.info(`POOP: Not Substituting ${key}!`);
                }
                return cachedOfType.pop();
            }
            POOP_1.globalValues.Logger.error(POOP_1.globalValues.botGenerationCacheService.localisationService.getText("bot-cache_has_zero_bots_of_requested_type", key));
        }
        POOP_1.globalValues.Logger.error(POOP_1.globalValues.botGenerationCacheService.localisationService.getText("bot-no_bot_type_in_cache", key));
        return undefined;
    }
    static saveToFile(data, filePath) {
        var fs = require('fs');
        fs.writeFile(POOP_1.globalValues.modFolder + filePath, JSON.stringify(data, null, 4), function (err) {
            if (err)
                throw err;
        });
    }
    //does it know if it should be a death or survival?
    static progDifficultygenerated(survivalcount, threshold, step) {
        let change = Math.round(Math.pow(step, survivalcount) * 100) / 100;
        change -= 1;
        if (change > threshold) {
            return threshold;
        }
        else {
            let output = change.toFixed(2);
            return parseFloat(output);
        }
    }
    static recordWinLoss(url, info, sessionId) {
        let threshold = 8;
        let step = 1.05;
        if (POOP_1.globalValues.config.enableAutomaticDifficulty) {
            if (info.exit == "survived") //If they survived
             {
                POOP_1.globalValues.progressRecord[sessionId].winStreak += 1;
                POOP_1.globalValues.progressRecord[sessionId].deathStreak = 0;
                let diffAdjustment = this.progDifficultygenerated(POOP_1.globalValues.progressRecord[sessionId].winStreak, threshold, step);
                POOP_1.globalValues.progressRecord[sessionId].diffMod += diffAdjustment;
                POOP_1.globalValues.Logger.info(`POOP: Added ${diffAdjustment} ... New Difficulty =  ${POOP_1.globalValues.progressRecord[sessionId].diffMod}`);
            }
            else if (info.exit == "killed") //If they perished
             {
                POOP_1.globalValues.progressRecord[sessionId].winStreak = 0;
                POOP_1.globalValues.progressRecord[sessionId].deathStreak += 1;
                let diffAdjustment = this.progDifficultygenerated(POOP_1.globalValues.progressRecord[sessionId].deathStreak, threshold, step);
                POOP_1.globalValues.progressRecord[sessionId].diffMod -= diffAdjustment;
                POOP_1.globalValues.Logger.info(`POOP: Subtracted ${diffAdjustment} ... New Difficulty =  ${POOP_1.globalValues.progressRecord[sessionId].diffMod}`);
            }
            PoopDifficulty_1.PoopDifficulty.adjustDifficulty(url, info, sessionId);
        }
        this.saveToFile(POOP_1.globalValues.progressRecord, "donottouch/progress.json");
        //return globalValues.nullResponse()
        return;
    }
    static serialize(data, prettify = false) {
        if (prettify) {
            return JSON.stringify(data, null, "\t");
        }
        else {
            return JSON.stringify(data);
        }
    }
    static clone(data) {
        return JSON.parse(JSON.stringify(data));
    }
}
exports.LegendaryPlayer = LegendaryPlayer;
LegendaryPlayer.assaultTypes = ["assaulteasy", "assaultnormal", "assaulthard", "cursedassaulteasy",
    "cursedassaultnormal", "cursedassaulthard"];
LegendaryPlayer.pmcTypes = ["sptbeareasy", "sptbearnormal", "sptbearhard", "sptuseceasy",
    "sptusecnormal", "sptusechard"];
