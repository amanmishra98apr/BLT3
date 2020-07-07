const { WaterfallDialog, ComponentDialog } = require('botbuilder-dialogs');

const { ConfirmPrompt, ChoicePrompt, DateTimePrompt, NumberPrompt, TextPrompt } = require('botbuilder-dialogs');

const { DialogSet, DialogTurnStatus } = require('botbuilder-dialogs');

const { ActivityHandler, MessageFactory } = require('botbuilder');

var myapp = {};


const CHOICE_PROMPT = 'CHOICE_PROMPT';
const CONFIRM_PROMPT = 'CONFIRM_PROMPT';
const TEXT_PROMPT = 'TEXT_PROMPT';
const NUMBER_PROMPT = 'NUMBER_PROMPT';
const DATETIME_PROMPT = 'DATETIME_PROMPT';
const WATERFALL_DIALOG = 'WATERFALL_DIALOG';
var endDialog = '';

class MakeReservationDialog extends ComponentDialog {

    constructor(conservsationState, userState) {
        super('makeReservationDialog');



        this.addDialog(new TextPrompt(TEXT_PROMPT));
        this.addDialog(new ChoicePrompt(CHOICE_PROMPT));
        this.addDialog(new ConfirmPrompt(CONFIRM_PROMPT));
        this.addDialog(new NumberPrompt(NUMBER_PROMPT, this.noOfParticipantsValidator));
        this.addDialog(new DateTimePrompt(DATETIME_PROMPT));


        this.addDialog(new WaterfallDialog(WATERFALL_DIALOG, [

            this.getName.bind(this),    // Get name from user
            this.getNumberOfParticipants.bind(this),  // Number of participants for reservation
            this.getPowerOptions.bind(this),
            this.getEquipments.bind(this),
            // this.inPowerStatusOff.bind(this),
            //this.inPowerOutage.bind(this),
            this.inPowerOptions.bind(this),

            this.forPoeorModem.bind(this),
            this.routerPortLight.bind(this),
            this.visible.bind(this),
            this.check.bind(this),
            this.officeTime.bind(this),
            this.rootTop.bind(this),
            this.confirmStep.bind(this), // Show summary of values entered by user and ask confirmation to make reservation

        ]));




        this.initialDialogId = WATERFALL_DIALOG;


    }

    async run(turnContext, accessor) {
        const dialogSet = new DialogSet(accessor);
        dialogSet.add(this);

        const dialogContext = await dialogSet.createContext(turnContext);
        const results = await dialogContext.continueDialog();
        if (results.status === DialogTurnStatus.empty) {
            await dialogContext.beginDialog(this.id);
        }
    }



    async getName(step) {
        endDialog = false;
        console.log(step.result + "from make r dialog");

        return await step.prompt(TEXT_PROMPT, 'Enter Name');



    }

    async getNumberOfParticipants(step) {

        step.values.name = step.result
        return await step.prompt(TEXT_PROMPT, 'Enter Address');

    }

    async getPowerOptions(step) {
        step.values.power_options = step.result
        var reply = MessageFactory.suggestedActions(['Available', 'Not Available'], 'select power status Available/Not Available');
        //var reply = "yes ,No"
        // var msg1 = 'select yes or select no'
        //await step.context.sendActivity(reply)
        return await step.prompt(TEXT_PROMPT, reply)
    }

    async getEquipments(step) {
        step.values.inPower = step.result;
        console.log("as "+step.values.inPower)
        if (step.values.inPower == 'Available') {
            myapp.flag = true;
            console.log("not2avail: "+myapp.flag );
            var equipment = MessageFactory.suggestedActions(['POE', 'Modem', 'MUX'], 'select equipment POE/Modem/MUX');
            //await step.context.sendActivity(equipment);
            return await step.prompt(TEXT_PROMPT, equipment);
        }
        else {
            myapp.flag = false;
            //step.values.inPowerOff = step.result;
            console.log("notavail: "+myapp.flag );
            console.log(step.values.inPower)
            var pops = MessageFactory.suggestedActions(['Power Outage', 'Power Shutdown'], 'Confirm Power Outage/Power Shutdown');

            //await step.context.sendActivity(pops)
            return await step.prompt(TEXT_PROMPT, pops)

        }

    }



    ///////////////////////////////////
    async inPowerOptions(step) {
        console.log("hiie aman")
        step.values.equip = step.result
        console.log("hii aman2222")
        if (myapp.flag == true) {
            if (step.values.equip == "POE") {
                myapp.flag2 = true;
                //console.log("result"+step.values.inPower)
                var poe = MessageFactory.suggestedActions(['Red', 'Green', 'Amber'], 'POE light indication Red/Green/Amber');
                //await step.context.sendActivity(poe)
                return await step.prompt(TEXT_PROMPT, poe)
            }
            else if (step.values.equip == "Modem") {
                myapp.flag2 = true;
                //console.log("result"+step.values.inPower)
                var modem = MessageFactory.suggestedActions(['Red', 'Green', 'Amber'], 'Modem light indication Red/Green/Amber');
                //await step.context.sendActivity(modem);
                return await step.prompt(TEXT_PROMPT, modem);
            }
            else if (step.values.equip == "MUX") {
                myapp.flag2 = true;
                //console.log("result"+step.values.inPower)
                var mux = MessageFactory.suggestedActions(['Red', 'Green', 'Amber'], 'MUX light indication Red/Green/Amber');
                //await step.context.sendActivity(mux);
                return await step.prompt(TEXT_PROMPT, mux);
            }
        }
        else {
            myapp.flag2 = false;
            step.values.equip = step.result;
            if (step.values.equip == 'Power Outage') {

                endDialog = true;
                //return await step.prompt(TEXT_PROMPT, 'update the ticket')
                return await step.context.sendActivity('Update the ticket')
            }
            else {
                endDialog = true;
                //return await step.prompt(TEXT_PROMPT, 'Ask for ETR')
                return await step.context.sendActivity('Ask for ETR')
            }

        }


    }





    //here
    async forPoeorModem(step) {
        step.values.ce = step.result;
        if (myapp.flag2 == true) {
            if (myapp.flag2 == true) {
                if (step.values.equip == 'POE' || step.values.equip == 'Modem') {
                    myapp.flag3 = 1;
                    console.log(step.values.equip)
                    return await step.prompt(TEXT_PROMPT, 'Router port no');
                }
            
            else {
                myapp.flag3 = 0;
                console.log("mux: " + step.values.mux);
                return await step.prompt(TEXT_PROMPT, 'Router port no');

            }
        }
        }
    }

    async routerPortLight(step) {
        step.values.rPort = step.result;
        if (myapp.flag3 == 1) {
            myapp.flag4 = 1;
            var rpl = MessageFactory.suggestedActions(['Admin light', 'Data light', 'Both'], 'Select rout port light indication Admin light/Data light/Both');
            return await step.prompt(TEXT_PROMPT, rpl)
        }
        else {
            myapp.flag4 = 0;
            var rpl = MessageFactory.suggestedActions(['Admin light', 'Data light', 'Both'], 'Select rout port light indication Admin light/Data light/Both');
            return await step.prompt(TEXT_PROMPT, rpl)
        }
    }

    async visible(step) {
        step.values.rpl = step.result;
        if (myapp.flag4 == 1) {
            myapp.flag5 = 1;
            if (step.values.rpl == 'Admin light' || step.values.rpl == 'Data light' || step.values.rpl == 'Both') {
                var joji = MessageFactory.suggestedActions(['yes', 'no'], 'JOJI device at POE yes/no');
                return await step.prompt(TEXT_PROMPT, joji);
            }
        }
        else {
            myapp.flag5 = 0;
            if (step.values.rpl == 'Admin light' || step.values.rpl == 'Data light' || step.values.rpl == 'Both') {
                //return await step.context.sendActivity("coutomer office time?")
                return await step.prompt(DATETIME_PROMPT, "customer office time?")
            }
        }
    }

    async check(step) {
        step.values.joji = step.result;
        if (myapp.flag5 == 1) {
            if (step.values.joji == 'yes') {
                return await step.context.sendActivity("check for result");
            }
            else {
                myapp.flag6 = 'b';
                var chk = MessageFactory.suggestedActions(['yes', 'no'], 'POE rebooted yes/no');
                return await step.prompt(TEXT_PROMPT, chk)
            }
        }
        else if (myapp.flag5 == 0) {
            myapp.flag6 = 'a';
            var rt = MessageFactory.suggestedActions(['yes', 'no'], 'roof top permission availablity yes/no');
            endDialog = true;
            return await step.prompt(TEXT_PROMPT, rt)
        }
    }
    async officeTime(step) {
        step.values.ckeck = step.result;
        console.log("office time: " + step.values.ckeck)
        if (myapp.flag6 == 'b') {
            console.log("office time: " + step.values.ckeck)
            if (step.values.ckeck == 'yes') {
                myapp.flag7 = true;
                //return await step.context.sendActivity("customer office time?")
                return await step.prompt(DATETIME_PROMPT, "customer office time?")
            }
            else {
                myapp.flag7 = false;
                return await step.context.sendActivity("Please reboot PS")
            }
        }
        return await step.context.sendActivity("Thanks")
    }

    async rootTop(step) {
        if (myapp.flag7 == true) {
            var rt = MessageFactory.suggestedActions(['yes', 'no'], 'Roof top permission availablity yes/no');
            return await step.prompt(TEXT_PROMPT, rt)

        }
    }


    async confirmStep(step) {
        console.log("flag2: " + myapp.flag2)

        step.values.noOfParticipants = step.result

        //var msg = ` You have entered following values: \n Your Name: ${step.values.name}\n Your: ${step.values.noOfParticipants}\n `

        //await step.context.sendActivity(msg);
        endDialog = true;
        return await step.prompt(TEXT_PROMPT, 'Thanks');
    }






    async isDialogComplete() {
        return endDialog;
    }


}

module.exports.MakeReservationDialog = MakeReservationDialog;







