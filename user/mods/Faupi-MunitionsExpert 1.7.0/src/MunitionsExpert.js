"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class MunitionsExpert {
    constructor() {
        this.cfg = require("./config.json");
    }
    postAkiLoad(container) {
        this.database = container.resolve("DatabaseServer");
        this.items = this.database.getTables().templates.items;
        this.changeBulletColour();
    }
    changeBulletColour() {
        if (this.cfg.BulletBackgroundColours) {
            for (const i in this.items) {
                //set background colour of ammo depending on pen
                if (this.items[i]._parent === "5485a8684bdc2da71d8b4567") {
                    const pen = this.items[i]._props.PenetrationPower;
                    switch (true) {
                        case (pen > 60):
                            this.items[i]._props.BackgroundColor = "red";
                            break;
                        case (pen > 50):
                            this.items[i]._props.BackgroundColor = "yellow";
                            break;
                        case (pen > 40):
                            this.items[i]._props.BackgroundColor = "violet";
                            break;
                        case (pen > 30):
                            this.items[i]._props.BackgroundColor = "blue";
                            break;
                        case (pen > 20):
                            this.items[i]._props.BackgroundColor = "green";
                            break;
                        default:
                            this.items[i]._props.BackgroundColor = "grey";
                            break;
                    }
                }
            }
        }
    }
}
module.exports = { mod: new MunitionsExpert() };
