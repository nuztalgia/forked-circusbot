import { bot } from '../../bot';
import { arrayRandom } from '../../utils';

let hard_modes = {
    'Eternity Vault': [
        `Hopefully nobody unironically dies to pylons`,
        `Can you beat the world's longest EV run of 84 hours? Only true gamers can`,
        `Would you believe that some people only kill the trash?`
    ],
    'Karagga\'s Palace': [
        `I'll understand if you want to reroll`,
        `At least you get a hat sometimes. It's the only good part of this op`,
        `Watch as people fail to figure out a basic puzzle`
    ],
    'Explosive Conflict': [
        `HM EC is always a fun op!`,
        `Seriously, the trash is the hardest part of this op`
    ],
    'Terror from Beyond': [
        `Better watch out for those tentacles <:uwuThonk:859325583255404545>`,
        `You better not skip the frog boss`
    ],
    'Scum and Villainy': [
        `At least it gives a good amount of tech frags`,
        `Seven bosses is at least six too many for this op`
    ],
    'The Dread Fortress': [
        `Fastest HM Op around, how fast can you do it?`,
        `Probably the only way you'll ever kill Brontes`,
        `Stop simping for Brontes`
    ],
    'The Dread Palace': [
        `Spin ever downward. Fall. Disappear.`,
    ],
    'The Ravagers': [
        `It's all fun and games until Master drops down`,
        `Hope your tanks know what they're doing`,
        `Hope you enjoy getting flung off the map repeatedly`,
        `Enjoy being a meatshield for the Master tank`,
        `I'll probably see how your run went in #streams-n-clips later`
    ],
    'Temple of Sacrifice': [
        `I hope you have someone to call abs. Any people who can listen for ab callouts. And good healers. Maybe you should pick another raid.`,
        `Can your DPS drop their stacks or are they going to dummy parse til they die?`,
        `"Desync", ya right, thats what they all say. Left and Right is hard`,
        `"This is the easiest boss", right until your DPS stand in the conal until they die`,
        `Everyone's worst nightmare. Understanding analog clocks.`
    ],
    'Gods from the Machine': [
        `The pinnacle of operation design. Good luck on the puzzle before Izax!`,
        `The only way you're getting swiped right is if your tank loses aggro during Izax`,
        `"I don't need a timer" -everyone who has ever died to inversion`,
        `"I'm set to the right color" -the dps with the highest dtps for unrelated reasons`,
        `Watch everyone try to get out of battery duty for nahut. It's not that hard guys, I change my batteries all the time.`
    ],
    'Nature of Progress': [
        `It's fine until you get to Apex and nobody knows how to run battery`,
        `It's easy as long as your DPS can focus the adds instead of dummy parsing`,
        `Enjoy desynced bulls that knock you from across the map`,
        `"Oh I thought we were killing the reapers"`,
        `Nothing sadder then pushing a trandoshan right before he gets on the tracks. Dummy parsing is bad.`,
    ],
    'R4 Anomaly': [
        `Let's be real, it's gonna be IP-CPT prog or you're gonna ask for a lockout`,
        `Watchdog seems like it should be simple, so why isn't it?`,
        `I can't wait for the adds to fall through the floor and then kill your healer before the tank can taunt them`
    ],
};

let nightmare_ops = {
    'Explosive Conflict': [
        `It's all fun and games until your DPS can't push the walker in four bombs`,
        `Kephess tanking be like: <a:rooSlide:1012385894998745198>`,
        `The only good part about tanks is seeing if you can out-DPS everyone as a tank doing stormcaller`,
        `"I don't think I damaged the shield" -the only person with damage in the raid challenge`,
        `Catye probably has the defusal kit`,
        `Imagine wiping at the end of minefield because somebody drops an enraged bomb on top of the entire group`
    ],
    'Terror from Beyond': [
        `Its an easy op as long as nobody dies to tentacle slams four times in one pull`,
        `Dread Guards or Dread Prog?`,
        `Its KEPHESS not QWEPHESS`,
        `If you wipe to Writhing Horror, we'll be judging you`,
        `Always fun to hear the tanks yelling at their DPS for taking too long with the adds`,
        `"I was nowhere near that add" -person who auto attacked the add`
    ],
    'Scum and Villainy': [
        `I'll be here for you when you wipe 16 minutes into Styrak due to a bad knock and need to cry`,
        `You know what tanks love? People who drop the firebomb in the middle of the arena`,
        `I dare you to save Horric for last`,
        `Time to figure out who will be doing knocks. JK, it's always the same people`,
        `Styrak can choke me anytime <:uwuThonk:859325583255404545>`
    ],
    'The Dread Fortress': [
        `Hopefully you don't get stuck with a tank who RP walks to the boss`,
        `Hahahahaha, good luck with Brontes`,
        `Six finger phase, where you get to prog figuring out what clockwise means`,
        `Don't worry if you shadow stride to Brontes, we've all done it at least once`,
        `If Brontes is over 40% in first burn, maybe you should try out SM`,
        `Whichever tank eats the most orbs is superior`,
    ],
    'The Dread Palace': [
        `What can I say, I was built by a sadist. Enjoy council if you get that far!`,
        `You can aim tblast at the people you dislike on your team`,
        `"I have rebounders, I swear" -tank that doesn't have rebounders`,
        `"AHHHHHHhhhhhhhhhhhhhhHHHHHHHHHAAAAAAAAAAhhhhhhhhhhh" -doubles tank who brought their sin`
    ],
    'Gods from the Machine': [
        `Listen, you should probably just reroll for a different op. Or do SM, thats more your speed.`,
        `I hope you enjoy only seeing one boss for the entire raid`,
        `There is no easy boss for this one`,
        `"I'M A GOD!" -tank who died three seconds later`,
        `Despite what some guildmasters might say, there are magma droids at the start of Tyth`
    ],
    'Nature of Progress': [
        `Better lube up for when you get to Apex`,
        `Can your DPS focus adds, or are you gonna be progging Red all night?`,
        `Don't leap to huntmaster until AFTER your grenade drops. Easy mistake.`,
        `I hope you enjoy bosses that can kill you in two hits`,
        `Destack or die`,
        `If you bring Arsenal to Apex, you're a bad person`
    ],
};

let all_ops = Object.assign({}, hard_modes, nightmare_ops);

bot.registerCommand('raid', ['ops', `op`, `nim`, `hm`], message => {
    let [options] = bot.parseCommand(message, /(.*)/);
    let roll, msg = '';

    if (options.match(/(hm|hard|vet|vm)/i)) {
        roll = arrayRandom(Object.entries(hard_modes));
        msg = `Selecting a random HM op for you. **${roll[0]}**. ${arrayRandom(roll[1])}`;
    } else if (options.match(/(nim|nightmare|master|mm)/i)) {
        roll = arrayRandom(Object.entries(nightmare_ops));
        msg = `Selecting a random NiM op for you. **${roll[0]}**. ${arrayRandom(roll[1])}`;
    } else {
        roll = arrayRandom(Object.entries(all_ops));
        msg = `Selecting a random HM/NiM op for you. **${roll[0]}**. ${arrayRandom(roll[1])}`;
    }

    bot.replyTo(message, bot.COLORS.DM, msg);
});
