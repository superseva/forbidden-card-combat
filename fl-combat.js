class CardCombat extends Application {
    constructor(options = {}) {
        if (CardCombat._instance) {
            throw new Error("CardCombat already has an instance!!!");
        }
        super(options);
        CardCombat._instance = this;
        this.data = { select1: null, select2: null, submitted: false, opponentSelect1: null, opponentSelect2: null, reveal1: false, reveal2: false };
    }
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            title: "Hidden Combinations",
            template: "modules/forbidden-card-combat/templates/combat-table.html",
            classes: ["forbidden-lands", "sheet", "actor"],
            id: "forbidden-combat-card-app",
            width: "720",
            height: "550",
        });
    }

    getData() {
        this.data["isGM"] = game.user.isGM;
        return this.data;
    }

    activateListeners(html) {
        super.activateListeners(html);
        // Select Card Click
        html.find(".stage .combat-card-box.selectable").click(this._onCardBoxClick.bind(this));
        // Reset Selection Click
        html.find(".stage .reset-selection").click(this._onResetSelection.bind(this));
        // Submit Selection Click
        html.find(".stage .submit-selection").click(this._onSubmitSelection.bind(this));
        // Reveal Click
        html.find(".stage .combat-card-box.reveal").click(this._onRevealStep.bind(this));
    }

    /**GM INITIATES COMBAT with the opponent he selects through the macro dialog
     * this function is called only by GM
     * @oponentId id of selected oponent
     */
    initiateCombat(opponentId) {
        const content = {};
        content["opponentId"] = opponentId;
        game.socket.emit("module.forbidden-card-combat", {
            operation: "InitiateCombat",
            user: game.user.id,
            content: content,
        });
        this.startCombat(opponentId);
    }

    /**On Starting The Combat reset the data and open the board */
    startCombat(opponentId) {
        if (game.user.isGM) {
            this.data["opponentId"] = opponentId;
        }
        this.data["select1"] = null;
        this.data["select2"] = null;
        this.data["submitted"] = false;
        this.data["opponentSelect1"] = null;
        this.data["opponentSelect2"] = null;
        this.data["reveal1"] = false;
        this.data["reveal2"] = false;
        CardCombat._instance.render(true);
    }

    /** ----------------------------------------------
     * CLICK Handlers
     * ----------------------------------------------- */

    // Handle the card selections
    _onCardBoxClick(evt) {
        evt.preventDefault();
        const el = evt.currentTarget;
        if (this.data["select1"] && this.data["select2"]) {
            ui.notifications.warn("Both hidden combinations are already selected! Please reset if you want new ones.");
            return;
        }
        if (!this.data["select1"]) {
            this.data["select1"] = el.dataset.card;
            $(el).addClass("step1");
            CardCombat._instance.render(true);
            return;
        }
        if (!this.data["select2"]) {
            this.data["select2"] = el.dataset.card;
            $(el).addClass("step2");
            CardCombat._instance.render(true);
            return;
        }
    }

    _onResetSelection(evt) {
        evt.preventDefault();
        this.data["select1"] = null;
        this.data["select2"] = null;
        $(".stage .combat-card-box").removeClass("step1");
        $(".stage .combat-card-box").removeClass("step2");
        CardCombat._instance.render(true);
    }

    // Handle Click Submit by opponent
    _onSubmitSelection(evt) {
        evt.preventDefault();
        if (!this.data["select1"] || !this.data["select2"]) {
            ui.notifications.warn("Please select two cards.");
            return;
        }

        if (!game.user.isGM) {
            const content = { select1: this.data.select1, select2: this.data.select2 };
            game.socket.emit("module.forbidden-card-combat", {
                operation: "SubmitSelection",
                user: game.user.id,
                content: content,
            });
            this.data["submitted"] = true;
            // PLAYER GO TO RELEVATION STAGE
            this.switchToStage2();
        } else {
            if (this.data.submitted) {
                // GM GO TO RELEVATION STAGE
                this.switchToStage2();
            } else {
                ui.notifications.warn("Please wait for the opponent to select cards.");
            }
        }
    }

    //Only Gm can trigger this
    _onRevealStep() {
        let revealData = {
            step1: {
                step: 1,
                gmCard: this.data.select1,
                playerCard: this.data.opponentSelect1,
            },
            step2: {
                step: 2,
                gmCard: this.data.select2,
                playerCard: this.data.opponentSelect2,
            },
        };
        let currentStep = 0;
        if (this.data.reveal1) {
            currentStep = 2;
            this.data.reveal2 = true;
        } else {
            currentStep = 1;
            this.data.reveal1 = true;
        }
        if (game.user.isGM) {
            this.revealStep(currentStep, revealData);
            game.socket.emit("module.forbidden-card-combat", {
                operation: "RevealStep",
                user: game.user.id,
                content: { step: currentStep, revealData: revealData, opponentId: this.data.opponentId },
            });
        }
    }

    /** ----------------------------------------
     * SOCKET Handlers
     * ----------------------------------------- */

    handle_StartCombat(socketData) {
        //open the board only for the opponent and not the other users
        if (socketData.content.opponentId == game.user.id) this.startCombat(socketData.content.opponentId);
    }

    // GM Recieves this when opponent submits the selected cards
    handle_SubmitSelection(socketData) {
        if (socketData.user != this.data.opponentId) return;
        this.data["submitted"] = true;
        this.data["opponentSelect1"] = socketData.content.select1;
        this.data["opponentSelect2"] = socketData.content.select2;
        CardCombat._instance.render(true);
    }

    handle_RevealStep(socketData) {
        if (socketData.content.opponentId != game.user.id) return;
        this.revealStep(socketData.content.step, socketData.content.revealData);
    }

    handle_OpenCombatSheet() {
        CardCombat._instance.render(true);
    }
    /** ----------------------------------------
     * Helper Functions
     * ----------------------------------------- */
    switchToStage1() {
        $(".stage.stage2").addClass("hidden");
        $(".stage.stage1").removeClass("hidden");
    }

    switchToStage2() {
        $(".stage.stage1").addClass("hidden");
        $(".stage.stage2").removeClass("hidden");
    }

    revealStep(step, stepData) {
        //console.warn(`REVEALING STEP: ${step}`);
        //console.warn(stepData["step" + step]);
        let selectorGM = ".step" + step + " .gm-card .card-face";
        let cardGM = "modules/forbidden-card-combat/assets/en/card-" + stepData["step" + step].gmCard + ".png";
        $(selectorGM).attr("src", cardGM);
        let selectorPlayer = ".step" + step + " .player-card .card-face";
        let cardPlayer = "modules/forbidden-card-combat/assets/en/card-" + stepData["step" + step].playerCard + ".png";
        $(selectorPlayer).attr("src", cardPlayer);
        if (game.user.isGM) {
            let chatContent = `<h2 class="step-center">STEP ${step}</h2>
            <div class="step-center">GM: <strong>${String(stepData["step" + step].gmCard).toUpperCase()}</strong></div>
            <div class="step-center">vs.</div>
            <div class="step-center">Player: <strong>${String(stepData["step" + step].playerCard).toUpperCase()}</strong></div>`;
            ChatMessage.create({ content: chatContent });
        }
    }
}

Hooks.once("ready", () => {
    if (CardCombat._instance) return;
    new CardCombat();
    game.socket.on(`module.forbidden-card-combat`, (data) => {
        if (data.operation === "InitiateCombat") CardCombat._instance.handle_StartCombat(data);
        if (data.operation === "SubmitSelection") CardCombat._instance.handle_SubmitSelection(data);
        if (data.operation === "RevealStep") CardCombat._instance.handle_RevealStep(data);
    });
});

Hooks.once("init", () => {
    Handlebars.registerHelper("ifCond", function (v1, operator, v2, options) {
        switch (operator) {
            case "==":
                return v1 == v2 ? options.fn(this) : options.inverse(this);
            case "===":
                return v1 === v2 ? options.fn(this) : options.inverse(this);
            case "!=":
                return v1 != v2 ? options.fn(this) : options.inverse(this);
            case "!==":
                return v1 !== v2 ? options.fn(this) : options.inverse(this);
            case "<":
                return v1 < v2 ? options.fn(this) : options.inverse(this);
            case "<=":
                return v1 <= v2 ? options.fn(this) : options.inverse(this);
            case ">":
                return v1 > v2 ? options.fn(this) : options.inverse(this);
            case ">=":
                return v1 >= v2 ? options.fn(this) : options.inverse(this);
            case "&&":
                return v1 && v2 ? options.fn(this) : options.inverse(this);
            case "||":
                return v1 || v2 ? options.fn(this) : options.inverse(this);
            default:
                return options.inverse(this);
        }
    });
});
