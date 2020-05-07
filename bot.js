// requires
const discord = require('discord.io');
const wallet = require('evox-nodejs')
const request = require('request-promise');
const auth = require('./auth.json');
//const client = new discord.Client(); // this uses the discord.js package to setup a client
var fs = require("fs");
const marketID = '648609336796512269'; //channel id for welcome message 648609336796512269
var log1 = true;
// variable area
const Globals = {
    networkInfo: undefined,
    bitcoinInfo: undefined,
//    arqmaInfo: undefined,
//    evolutionInfo: undefined,
    blockInfo: undefined,
    balanceInfo: undefined,
    coingeckoInfo: undefined,
    emissionInfo: undefined,
    account_index: 0
};

const bot = new discord.Client({
    token: auth.token,
    autorun: true
});

const client = new discord.Client(); // this uses the discord.js package to setup a client

//});

// Added by me, first create object containing the serverStats info
const serverStats = {
	guildID: '648609336796512269',
	totalUsersID: '648609336796512269',
	memberCountID: '648609336796512269',
	botCountID: '648609336796512269'
};

// function to format numbers with commas like currency
function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

// async block
async function update() {
    let networkQuery = await getData('https://pool.evolutionproject.space/api/stats', 'networkQuery');
    if (networkQuery !== undefined) {
        Globals.networkInfo = networkQuery;
    } else {
        console.log('** Got undefined block header data from cache api')
    }
    let bitcoinQuery = (await getData('https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=bitcoin&order=market_cap_desc&per_page=100&page=1&sparkline=false', 'geckoBTCInfo'))[0];
    if (bitcoinQuery !== undefined) {
        Globals.bitcoinInfo = bitcoinQuery;
    } else {
        console.log('** Got undefined bitcoin price data from coingecko');
    }




//    let arqmaQuery = (await getData('https://api.coingecko.com/api/v3/coins/markets?vs_currency=btc&ids=arqma&order=market_cap_desc&per_page=100&page=1&sparkline=false', 'geckoARQInfo'))[0];
//    if (arqmaQuery !== undefined) {
//        Globals.arqmaInfo = arqmaQuery;
//    } else {
//        console.log('** Got undefined ArQmA price data from coingecko');
//    }




	// EVOX price

//     let evolutionQuery = (await getData('https://cratex.io/api/v1/get_markets_json.php?market=EVOX/BTC','cratexEVOXInfo'))[0];
//	 if (evolutionQuery !==undefined) {
//        Globals.evolutionInfo = evolutionQuery;
//	} else {
//        console.log('** Got undefined Evolution price date from cratex');
//	}		








    let blockQuery = await getData('http://explorer.evolutionproject.space/api/networkinfo', 'blockQuery');
    if (blockQuery !== undefined) {
        Globals.blockInfo = blockQuery;
    } else {
        console.log('** Got undefined blocks data from explorer');
    }
    let emissionQuery = await getData('http://explorer.evolutionproject.space/api/emission', 'emissionQuery');
    if (emissionQuery !== undefined) {
        Globals.emissionInfo = emissionQuery;
    } else {
        console.log('** Got undefined emission data from explorer');
    }

}

// refreshes variables every 5s
async function init() {
    await update();
    setInterval(update, 5000);
}

// Initialize Discord Bot
(async () => {
    await init();
})()

// on log in
bot.on('ready', (evt) => {
    console.log(`** Connected, logged in as ${bot.username}-${bot.id} and listening for commands.`);
    bot.setPresence( {game: {name:"Network Stats"}} );
});

// This will run 
client.on('ready', () => console.log('Launched!'));

// Added by me, Next create 2 listener events, one for members leaving the serv one for members that join serv
client.on('guildMemberAdd', member => {

	// we also want to return if the members guild isnt the same as the one with serverStats
	if (member.guild.id !== serverStats.guildID) return;
	
	// Now we want to update the voiceChannel names
	client.channels.get(serverStats.totalUsersID).setName(`Total Users : ${member.guild.memberCount}`); // Total Users
	client.channels.get(serverStats.memberCountID).setName(`Member Count : ${member.guild.members.filter(m => !m.user.bot).size}`); // Total Members (not included bots)
        client.channels.get(serverStats.botCountID).setName(`Bot Count : ${member.guild.members.filter(m => m.user.bot).size}`); // Total Bots
});

client.on('guildMemberRemove', member => {

	if (member.guild.id !== serverStats.guildID) return;

	// We also want the same thing to happen when a mamber leave the guild
        client.channels.get(serverStats.totalUsersID).setName(`Total Users : ${member.guild.memberCount}`); // Total Users
        client.channels.get(serverStats.memberCountID).setName(`Member Count : ${member.guild.members.filter(m => !m.user.bot).size}`); // Total Members (not included bots)
        client.channels.get(serverStats.botCountID).setName(`Bot Count : ${member.guild.members.filter(m => m.user.bot).size}`); // Total Bots

});

// error logging
bot.on('error', console.error);


// reconnect if disconected
bot.on('disconnect', function() {
    console.log('** Bot disconnected, reconnecting...');
    bot.connect()
});

// on new member joining
bot.on('guildMemberAdd', (member) => {
    console.log('** New member joined server, welcome message sent');
    bot.sendMessage({
        to: member.id,
        message: `Hey <@${member.id}>, Welcome to Evolution Project!\n` +
        `Info about project https://evolutionproject.space.\n` +
        `Github https://github.com/evolution-project\n` +
        `Pool list https://miningpoolstats.stream/evolution\n` +
        `In case of any issues or questions ping @ArtFix | EvoX Dev`
    });
});

// on message handling
bot.on('message', (user, userID, channelID, message, evt) => {

    // It will listen for messages that will start with `.`
    if (message[0] === '.') {
        const [cmd, args] = message.substring(1).split(' ');



    // added by me

	if (cmd ==='btc') {
            // check that none of the variables are undefined
	   if (Globals.networkInfo.network.difficulty === undefined) {
                console.log('** Undefined difficulty requested');
                bot.sendMessage({
                    to: channelID,
                    message: 'Whoops! I\'m still gathering data for you, please try again later. 😄'
                });
            } else {
                console.log('** Current BTC price sent');
	 	bot.sendMessage({
		    to: channelID,
		    message: `BTC: $${numberWithCommas(Globals.bitcoinInfo.current_price.toFixed(2))} \n `
		});
		bot.addReaction({
                              channelID: channelID,
                              messageID: evt.d.id,
                reaction: '☑'
              });
            }
        } 



    // added by me

	if (cmd ==='evox') {
            // check that none of the variables are undefined
	   if (Globals.networkInfo.network.difficulty === undefined) {
                console.log('** Undefined difficulty requested');
                bot.sendMessage({
                    to: channelID,
                    message: 'Whoops! I\'m still gathering data for you, please try again later. 😄'
                });
            } else {
                console.log('** Current BTC price sent');
	 	bot.sendMessage({
		    to: channelID,
		    message: `EVOX: $${numberWithCommas(Globals.evoxInfo.current_price.toFixed(2))} \n `
		});
		bot.addReaction({
                              channelID: channelID,
                              messageID: evt.d.id,
                reaction: '☑'
              });
            }
        }









        // difficulty command
        if (cmd === 'diff') {
            // check that none of the variables are undefined
            if (Globals.networkInfo.network.difficulty === undefined) {
                console.log('** Undefined difficulty requested');
                bot.sendMessage({
                    to: channelID,
                    message: 'Whoops! I\'m still gathering data for you, please try again later. 😄'
                });
            } else {
                console.log('** Current difficulty message sent');
                bot.sendMessage({
                    to: channelID,
                    message: `The current difficulty is **${numberWithCommas(Globals.networkInfo.network.difficulty)}**`
                });
                bot.addReaction({
                              channelID: channelID,
                              messageID: evt.d.id,
                reaction: '☑'
              });
            }
        }

        // hashrate command
        if (cmd === 'hash') {
            // check that none of the variables are undefined
            if (Globals.networkInfo.network.difficulty === undefined) {
                console.log('** Undefined hashrate requested');
                bot.sendMessage({
                    to: channelID,
                    message: 'Whoops! I\'m still gathering data for you, please try again later. 😄'
                });
            } else {
                console.log('** Current hashrate message sent');
                bot.sendMessage({
                    to: channelID,
                    message: `The current global hashrate is **${((Globals.networkInfo.network.difficulty / 120) / 1000 / 1000).toFixed(2)} MH/s**`

                });
                bot.addReaction({
                              channelID: channelID,
                              messageID: evt.d.id,
                reaction: '☑'
              });
            }
        }

        // height command
        if (cmd === 'block') {
            // check that none of the variables are undefined
            if (Globals.networkInfo.network.height === undefined) {
                console.log('** Undefined block height requested');
                bot.sendMessage({
                    to: channelID,
                    message: 'Whoops! I\'m still gathering data for you, please try again later. 😄'
                });
            } else {
                console.log('** Current block height message sent');
                bot.sendMessage({
                    to: channelID,
                    message: `The current block height is **${numberWithCommas(Globals.networkInfo.network.height)}**`

                });
                bot.addReaction({
                              channelID: channelID,
                              messageID: evt.d.id,
                reaction: '☑'
              });
            }
        }

        // help command
        if (cmd === 'help') {
            console.log('** Help menu message sent');
            bot.sendMessage({
                to: channelID,
                message: 
                        '\`\`\`.diff       :   Displays current difficulty.\n' +
                               '.status     :   Displays network information.\n' +
                               '.hash       :   Displays current network hashrate.\n' +
                               '.block      :   Displays current block height.\n' +
                               '.pools      :   Displays list of pools.\n' +
                               '.links      :   Displays usefull links.\n' +
                               '.hardfork   :   Displays hardfork information.\n' +
			       '.btc	    :   Display the current price of BTC.\n' +
			       '.exchange   :   Display the exchange BTC-EVOX site. \n' +
                               '.help       :   Displays this menu.\`\`\`'

            });
        }

        // pools command
        if (cmd === 'pools') {
            console.log('** Pools link sent');
            bot.sendMessage({
                to: channelID,
                message:
                        '\`\`\`Evolution Mining Pools Link\`\`\`\n' +
                        'https://miningpoolstats.stream/evolution \n'
            });
        }

        // links command
        if (cmd === 'links') {
            console.log('** Link sent');
            bot.sendMessage({
                to: channelID,
                message:
                        ' BlockChain Explorer \n' +
                        ' https://explorer.evolutionproject.space \n' +
                        ' Evolution Main Site \n' +
                        ' https://evolutionproject.space \n' +
                        ' Offline Web Wallet \n' +
                        ' https://wallet.evolutionproject.space \n' +
                        ' Electron Wallet \n' +
                        ' https://github.com/evolution-project/evolution-electron-wallet/releases/latest \n'
            });
        }



        // exchange command
        if (cmd === 'exchange') {
            console.log('** Link sent');
            bot.sendMessage({
                to: channelID,
                message:
                        ' CrateX Exchange \n' +
                        ' https://cratex.io/index.php?pair=EVOX/BTC \n'
            });
        }
 

        // network command
        if (cmd === 'status') {
            // check that none of the variables are undefined
            if (Globals.networkInfo === undefined) {
                console.log('** Undefined network info requested');
                bot.sendMessage({
                    to: channelID,
                    message: 'Whoops! I\'m still gathering data for you, please try again later. 😄'
                });
            } else {
                console.log('** Network info message sent');
                bot.sendMessage({
                    to: channelID,
                    embed: {
                        color: 1000798,
                        thumbnail: {
                            url: 'https://raw.githubusercontent.com/evolution-project/graphics/master/64x64.png',
                       },
                        fields: [{
                                name: 'Network Stats',
                                value: `Network Hashrate: **${numberWithCommas(((Globals.networkInfo.network.difficulty / 120) / 1000 / 1000).toFixed(2))} MH/s**\n` +
                                    `Height: **${numberWithCommas(Globals.networkInfo.network.height)}**\n` +
                                    `Emission: **${numberWithCommas((Globals.emissionInfo.data.coinbase / 1000000000).toFixed(0))}**\n` +
                                    `Block Reward: **${(Globals.networkInfo.lastblock.reward / 1000000000).toFixed(4)} EVOX**\n` +
                                    `Hard Fork: **v${(Globals.blockInfo.data.current_hf_version)}**\n` +
                                    `Difficulty: **${numberWithCommas(Globals.networkInfo.network.difficulty)}**\n` +  
                                    `Pending Transactions: **${(Globals.blockInfo.data.tx_pool_size)}**\n` +
                                    `Block Hash: **${(Globals.blockInfo.data.top_block_hash)}**`


                            },
                        ],
                        footer: {
                            text: `BTC: $${numberWithCommas(Globals.bitcoinInfo.current_price.toFixed(2))} \n `
                        }
                    }
                });
                bot.addReaction({
                              channelID: channelID,
                              messageID: evt.d.id,
                reaction: '☑'
              });
            }
        }


                    
        // network command
        if (cmd === 'hardfork') {
            // check that none of the variables are undefined
            if (Globals.networkInfo === undefined) {
                console.log('** Undefined network info requested');
                bot.sendMessage({
                    to: channelID,
                    message: 'Whoops! I\'m still gathering data for you, please try again later. 😄'
                });
            } else {
                console.log('** Hardfork info message sent');
                bot.sendMessage({
                    to: channelID,
                    embed: {
                        color: 1000798,
                        thumbnail: {
                            url: 'https://raw.githubusercontent.com/evolution-project/graphics/master/evox-120x120.png',
                        },
                        fields: [{
                                name: 'HardFork Stats',
                                value: `Height: **${numberWithCommas(Globals.networkInfo.network.height)}**\n` +
                                    `Emission: **${numberWithCommas((Globals.emissionInfo.data.coinbase / 1000000000).toFixed(0))}**\n` +
                                    `Current version: **v${(Globals.blockInfo.data.current_hf_version)}**\n`


                            },
                        ],
                        footer: {
                            text: `BTC: $${numberWithCommas(Globals.bitcoinInfo.current_price.toFixed(2))} \n `
                        //  text: `ArQmA Network \n BTC: $${numberWithCommas(Globals.bitcoinInfo.current_price.toFixed(2))} \n ARQ: ${numberWithCommas(Globals.arqmaInfo.current_price.toFixed(8))} sat `
                        //  text: `Evolition Network \n BTC: $${numberWithCommas(Globals.bitcoinInfo.current_price.toFixed(2))} \n EVOX: ${numberWithCommas(Globals.evolutionInfo.current_price.toFixed(8))} sat `
                        }
                    }
                });
                bot.addReaction({
                              channelID: channelID,
                              messageID: evt.d.id,
                reaction: '☑'
              });
            }
        }


}

});

// get data from http request and store it in variable
async function getData(apiURL, name) {
    const requestOptions = {
        method: 'GET',
        uri: apiURL,
        headers: {},
        json: true,
        // gzip: true
    };
    try {
        const result = await request(requestOptions);
        // console.log(apiURL, name, result);
        return result;
    } catch (err) {
        console.log(`Request failed, ${name} API call error: \n`, err);
        return undefined;
    }
}
