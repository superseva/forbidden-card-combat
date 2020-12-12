class CardCombat extends Application {
    constructor(options = {}) {
        if (CardCombat._instance) {
            throw new Error("CardCombat already has an instance!!!");
        }
        super(options);
        CardCombat._instance = this;
        this.data = {};
        console.warn("EVO EVO PRAVIM");
    }
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            template: "modules/forbidden-card-combat/templates/combat-table.html",
            classes: ["forbidden-lands", "sheet", "actor"],
            id: "forbidden-combat-card-app",
            width: "750",
            height: "500",
        });
    }

    activateListeners(html) {
        super.activateListeners(html);
        console.warn("ACTIVATING LISTENERS");
    }

    handle_OpenCombatSheet() {
        CardCombat._instance.render(true);
    }

    handleMyEvent(data) {
        console.log(`User [${data.user}] says: ${data.content}`);
    }
    handleMyOtherEvent(data) {
        // do something
    }
}

Hooks.once("ready", () => {
    if (CardCombat._instance) return;
    new CardCombat();
    //CardCombat._instance.render(true);
    //console.warn(CardCombat._instance.rendered);
    game.socket.on(`module.forbidden-card-combat`, (data) => {
        //console.warn(data);
        if (data.operation === "OpenCombatSheet") CardCombat._instance.handle_OpenCombatSheet(data);
        if (data.operation === "myEvent") CardCombat._instance.handleMyEvent(data);
        if (data.operation === "myOtherEvent") CardCombat._instance.handleMyOtherEvent(data);
    });
});
