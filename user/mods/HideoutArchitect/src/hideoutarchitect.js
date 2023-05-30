"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class HideoutArchitect {
    preAkiLoad(container) {
        this.router = container.resolve("DynamicRouterModService");
        this.path = require("path");
        this.json = container.resolve("JsonUtil");
        this.mod = require("../package.json");
        this.translations = require("../res/translations.json");
        this.hookRoutes();
    }
    postAkiLoad(container) {
        this.modLoader = container.resolve("PreAkiModLoader");
        this.database = container.resolve("DatabaseServer");
        this.table = this.database.getTables();
        this.globalLocale = this.table.locales.global;
        this.loadLocalization();
    }
    loadLocalization() {
        for (const language in this.translations) {
            if (!(language in this.globalLocale)) {
                continue;
            }
            const attrKvPair = this.translations[language];
            for (const attrKey in attrKvPair) {
                const attrValue = attrKvPair[attrKey];
                this.globalLocale[language][attrKey] = attrValue;
            }
        }
    }
    hookRoutes() {
        this.router.registerDynamicRouter("HideoutArchitect", [
            {
                url: "/HideoutArchitect/GetInfo",
                action: (url, info, sessionId, output) => {
                    return this.getModInfo(url, info, sessionId, output);
                }
            }
        ], "HideoutArchitect");
    }
    getModInfo(url, info, sessionId, output) {
        const modOutput = {
            status: 1,
            data: null
        };
        modOutput.data = { ...this.mod, ...{ path: this.path.resolve(this.modLoader.getModPath("HideoutArchitect")) } };
        modOutput.status = 0;
        return this.json.serialize(modOutput);
    }
}
module.exports = { mod: new HideoutArchitect() };
