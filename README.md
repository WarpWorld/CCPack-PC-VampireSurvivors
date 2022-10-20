Instructions:

1. Copy crowd-control.js, index.html, and the latest provided main.crowd-control.[version].bundle.js file to [VampireSurvivorsInstall]\resources\app\.webpack\renderer\
You will replace the existing index.html which will now load the crowd-control.js and the updated main.crowd-control.bundle.js files. 
2. Load up vsforcc.cs in your crowd control SDK; ensure that your SDK is running (as it will need to start the websocket server) prior to starting vampire survivors. 
3. Start Vampire Survivors. 
Note that if you launch Vampire Survivors directly from steam and an update is pending, the update will automatically be installed, which may likely break the CC integration. 
Vampire Survivors will automatically connect to the CC websocket server when you enter a level. Press the tilde '`' key to access the ingame debug menu. 

Current issues/limitations: 

1. Not all enemy types have been imported into the vsforcc.cs file. It will be necessary to grep the exported EA_ENEMY_DATA.json export file for enemy titles and add them to the vsforcc.cs file.
2. I've updated the item/powerup spawns to pass the name of the powerup as a parameter. It may clean up the code on the crowd-control.js side significantly to do the same with the enemy/boss types. 
3. The crowd-control.js integration does not queue effects, it just keeps track of the most recent requested effect - it would be more appropriate to implement a queue where effects can be resolved and responded to in FIFO order. Also see #4 below. 
4. The crowd-control.js integration does not handle exceptional cases; if the game is not in a proper state to execute effects, the effect may fizzle rather than be enqueued or refunded. 
6. There are some console alerts that are intrusive but useful for debugging that should be removed once things are stabilized. 
7. Parameterize WS port number on both sides