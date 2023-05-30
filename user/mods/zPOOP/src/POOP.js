"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.globalValues = void 0;
const ConfigTypes_1 = require("C:/snapshot/project/obj/models/enums/ConfigTypes");
const PoopDifficulty_1 = require("./PoopDifficulty");
const legendaryPlayer_1 = require("./legendaryPlayer");
//add escort mode - npcs with guard ai escort player.. random pmc generated with level below yours
class globalValues {
}
exports.globalValues = globalValues;
globalValues.modName = "POOP";
globalValues.roleCase = {
    "assault": "assault",
    "exusec": "exUsec",
    "marksman": "marksman",
    "pmcbot": "pmcBot",
    "sectantpriest": "sectantPriest",
    "sectantwarrior": "sectantWarrior",
    "assaultgroup": "assaultGroup",
    "bossbully": "bossBully",
    "bosstagilla": "bossTagilla",
    "bossgluhar": "bossGluhar",
    "bosskilla": "bossKilla",
    "bosskojaniy": "bossKojaniy",
    "bosssanitar": "bossSanitar",
    "followerbully": "followerBully",
    "followergluharassault": "followerGluharAssault",
    "followergluharscout": "followerGluharScout",
    "followergluharsecurity": "followerGluharSecurity",
    "followergluharsnipe": "followerGluharSnipe",
    "followerkojaniy": "followerKojaniy",
    "followersanitar": "followerSanitar",
    "followertagilla": "followerTagilla",
    "cursedassault": "cursedAssault",
    "usec": "usec",
    "bear": "bear",
    "bosstest": "bossTest",
    "followertest": "followerTest",
    "gifter": "gifter",
    "bossknight": "bossKnight",
    "followerbigpipe": "followerBigPipe",
    "followerbirdeye": "followerBirdEye",
    "test": "test",
    "bosszryachiy": "bossZryachiy",
    "followerzryachiy": "followerZryachiy"
};
globalValues.pmcTypes = [
    "sptbear",
    "sptusec",
    "assaultgroup"
];
globalValues.raiderTypes = [
    "pmcbot"
];
globalValues.rogueTypes = [
    "exusec"
];
globalValues.scavTypes = [
    "assault",
    "cursedassault",
    "marksman"
];
globalValues.bossTypes = [
    "sectantpriest",
    "sectantwarrior",
    "bossbully",
    "bosstagilla",
    "bossgluhar",
    "bosskilla",
    "bosskojaniy",
    "bosssanitar",
    "bossknight",
    "bosszryachiy"
];
globalValues.followerTypes = [
    "followerbully",
    "followergluharassault",
    "followergluharscout",
    "followergluharsecurity",
    "followergluharsnipe",
    "followerkojaniy",
    "followersanitar",
    "followertagilla",
    "followerbigpipe",
    "followerbirdeye",
    "followerzryachiy"
];
globalValues.locationNames = ["interchange", "bigmap", "rezervbase", "woods", "shoreline", "laboratory", "lighthouse", "factory4_day", "factory4_night", "tarkovstreets"];
globalValues.locationNamesVerbose = ["interchange", "customs", "reserve", "woods", "shoreline", "labs", "lighthouse", "factory", "factory", "tarkovstreets"];
class POOP {
    preAkiLoad(container) {
        globalValues.Logger = container.resolve("WinstonLogger");
        globalValues.config = require("../config/config.json");
        //set config checks early in case i need to not setup dynamic/static routers.
        const dynamicRouterModService = container.resolve("DynamicRouterModService");
        const staticRouterModService = container.resolve("StaticRouterModService");
        //Raid Saving (End of raid)
        staticRouterModService.registerStaticRouter(`StaticAkiRaidSave${globalValues.modName}`, [{
                url: "/raid/profile/save",
                action: (url, info, sessionId, output) => {
                    this.onRaidSave(url, info, sessionId, output);
                    return output;
                }
            }], "aki");
        //Game start
        staticRouterModService.registerStaticRouter(`StaticAkiGameStart${globalValues.modName}`, [{
                url: "/client/game/start",
                action: (url, info, sessionId, output) => {
                    this.runOnGameStart(url, info, sessionId);
                    return output;
                }
            }], "aki");
        if (!globalValues.config.disableAllAIChanges) {
            container.afterResolution("BotGenerationCacheService", (_t, result) => {
                //globalValues.Logger.info(`POOP: BotGenerationCacheService calling LegendaryPlayer.getBot`);
                result.getBot = legendaryPlayer_1.LegendaryPlayer.getBot;
            }, { frequency: "Always" });
        }
    }
    postAkiLoad(container) {
        this.setupInitialValues(container);
        PoopDifficulty_1.PoopDifficulty.difficultyFunctions(globalValues.locations, globalValues.config, globalValues.botTypes, globalValues.BotConfig, globalValues.database, globalValues.Logger, globalValues.advAIConfig, globalValues.baseAI);
        PoopDifficulty_1.PoopDifficulty.setRogueNeutral(globalValues.botTypes, globalValues.config);
        if (globalValues.config.allowHealthTweaks.enabled) {
            this.adjustHealthValues(globalValues.config.allowHealthTweaks.multipliers.PMCHealthMult, globalValues.config.allowHealthTweaks.multipliers.scavHealthMult, globalValues.config.allowHealthTweaks.multipliers.raiderHealthMult, globalValues.config.allowHealthTweaks.multipliers.bossHealthMult, globalValues.config.allowHealthTweaks.multipliers.cultistHealthMult);
        }
        globalValues.Logger.info("POOP: Finished");
    }
    setupInitialValues(container) {
        globalValues.Logger.info('POOP: SetupInitialValues');
        globalValues.profileHelper = container.resolve("ProfileHelper");
        globalValues.botHelper = container.resolve("BotHelper");
        globalValues.configServer = container.resolve("ConfigServer");
        globalValues.botController = container.resolve("BotController");
        globalValues.botGenerator = container.resolve("BotGenerator");
        globalValues.botGenerationCacheService = container.resolve("BotGenerationCacheService");
        globalValues.matchController = container.resolve("MatchController");
        globalValues.hashUtil = container.resolve("HashUtil");
        globalValues.databaseServer = container.resolve("DatabaseServer");
        globalValues.database = globalValues.databaseServer.getTables();
        globalValues.locations = globalValues.database.locations;
        globalValues.botTypes = globalValues.database.bots.types;
        globalValues.scavAltRolesPickList = globalValues.config.aiChanges.scavAltRolesPickList;
        let dir = __dirname;
        let dirArray = dir.split("\\");
        globalValues.modFolder = (`${dirArray[dirArray.length - 4]}/${dirArray[dirArray.length - 3]}/${dirArray[dirArray.length - 2]}/`);
        // Setup Base AI Difficulty
        globalValues.baseAI = POOP.clone(globalValues.botTypes.pmcbot.difficulty.hard);
        //Load Config Files
        globalValues.BotConfig = globalValues.configServer.getConfig(ConfigTypes_1.ConfigTypes.BOT);
        globalValues.InRaidConfig = globalValues.configServer.getConfig(ConfigTypes_1.ConfigTypes.IN_RAID);
        globalValues.advAIConfig = require("../config/advanced AI config.json");
        globalValues.progressRecord = require("../donottouch/progress.json");
        globalValues.legendaryFile = require("../donottouch/legendary.json");
    }
    //All functions that need to be run when the route "/raid/profile/save" is used should go in here, as config-reliant conditionals can't be used on the initial load function
    onRaidSave(url, info, sessionId, output) {
        globalValues.playerLevelPMC = globalValues.profileHelper.getPmcProfile(sessionId).Info.Level;
        globalValues.Logger.info('POOP: onRaidSave');
        legendaryPlayer_1.LegendaryPlayer.recordWinLoss(url, info, sessionId);
        //delete database.globals.config.genVals
        return output;
    }
    //This is for things that I want to run exactly once upon the game actually starting.
    runOnGameStart(url, info, sessionId) {
        //setting these default values seems to be an annoyance so removing it.
        //globalValues.InRaidConfig.raidMenuSettings.aiAmount = "AsOnline"
        //globalValues.InRaidConfig.raidMenuSettings.aiDifficulty = "AsOnline"
        PoopDifficulty_1.PoopDifficulty.setDifficulty(globalValues.config.aiChanges.lowLevelAIDifficultyMod_Neg3_3, globalValues.config.aiChanges.highLevelAIDifficultyMod_Neg3_3, globalValues.config.aiChanges.midLevelAIDifficultyMod_Neg3_3, globalValues.config.aiChanges.midLevelAIDifficultyMod_Neg3_3, globalValues.config.aiChanges.midLevelAIDifficultyMod_Neg3_3);
        for (let i in globalValues.database.globals.bot_presets)
            globalValues.database.globals.bot_presets[i].UseThis = false;
        //Autmatic difficulty adjustments. THESE ONLY ADJUST WHEN THE SERVER RESTARTS
        if (globalValues.config.enableAutomaticDifficulty && sessionId) {
            PoopDifficulty_1.PoopDifficulty.adjustDifficulty(url, info, sessionId);
        }
        globalValues.Logger.info(`progressRecord[sessionID]: ${JSON.stringify(globalValues.progressRecord[sessionId])}`);
        //create progressRecord in mem if it doesn't exist. Will write later to json file.
        if (!globalValues.progressRecord[sessionId]) {
            globalValues.progressRecord[sessionId] = {};
            globalValues.progressRecord[sessionId].diffMod = 0;
            globalValues.progressRecord[sessionId].raids = 0;
            globalValues.progressRecord[sessionId].deaths = 0;
            globalValues.progressRecord[sessionId].survives = 0;
            globalValues.progressRecord[sessionId].winStreak = 0;
            globalValues.progressRecord[sessionId].deathStreak = 0;
            globalValues.progressRecord[sessionId].lock = false;
        }
        return;
    }
    changeHealth(bot, botName, mult) {
        globalValues.Logger.info(`Fins AI Tweaks: Setting Health of ${botName}`);
        if (globalValues.config.overallDifficultyMultipliers.setTheseBotsToDefaultPlayerHPBeforeMultsAreUsed.includes(botName))
            bot.health.BodyParts = [{ "Head": { "min": 35, "max": 35 }, "Chest": { "min": 85, "max": 85 }, "Stomach": { "min": 70, "max": 70 }, "LeftArm": { "min": 60, "max": 60 }, "RightArm": { "min": 60, "max": 60 }, "LeftLeg": { "min": 65, "max": 65 }, "RightLeg": { "min": 65, "max": 65 } }];
        for (let variants in bot.health.BodyParts)
            for (let limb in bot.health.BodyParts[variants])
                if (limb.toLowerCase() != "head" || globalValues.config.overallDifficultyMultipliers.changeHeadHPValues)
                    for (let maxMin in bot.health.BodyParts[variants][limb])
                        bot.health.BodyParts[variants][limb][maxMin] = Math.round(bot.health.BodyParts[variants][limb][maxMin] * mult);
    }
    adjustHealthValues(PMC, scav, raider, boss, cultist) {
        for (let i in globalValues.botTypes) {
            let bot = globalValues.botTypes[i];
            if (["assault", "marksman", "cursedassault"].includes(i)) {
                this.changeHealth(bot, i, scav);
            }
            else if (["pmcbot", "exusec"].includes(i)) {
                this.changeHealth(bot, i, PMC);
            }
            else if (["followergluharassault", "followergluharsnipe", "followergluharscout", "followergluharsecurity", "followerbully", "followerkojaniy",
                "followersanitar", "followertagilla", "followerbirdeye", "followerbigpipe"].includes(i)) {
                this.changeHealth(bot, i, raider);
            }
            else if (["sectantpriest", "sectantwarrior"].includes(i)) {
                this.changeHealth(bot, i, cultist);
            }
            else if (["bossbully", "bossgluhar", "bosskilla", "bosskojaniy", "bosssanitar", "bosstagilla", "bossknight"].includes(i)) {
                this.changeHealth(bot, i, boss);
            }
        }
    }
    static clearString(s) {
        return s.replace(/[\b]/g, "")
            .replace(/[\f]/g, "")
            .replace(/[\n]/g, "")
            .replace(/[\r]/g, "")
            .replace(/[\t]/g, "")
            .replace(/[\\]/g, "");
    }
    static getBody(data, err = 0, errmsg = null) {
        return POOP.clearString(POOP.getUnclearedBody(data, err, errmsg));
    }
    static nullResponse() {
        return POOP.getBody(null);
    }
    static getUnclearedBody(data, err = 0, errmsg = null) {
        return POOP.serialize({
            "err": err,
            "errmsg": errmsg,
            "data": data
        });
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
module.exports = { mod: new POOP() };
