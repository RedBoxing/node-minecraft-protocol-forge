'use strict';

var forgeHandshake = require('./forgeHandshake');

module.exports = function(client, options) {
  if (!client.autoVersionHooks) client.autoVersionHooks = [];

  client.autoVersionHooks.push(function(response, client, options) {
    if ((!response.modinfo || response.modinfo.type !== 'FML') && (!response.forgeData || response.forgeData.fmlNetworkVersion != 2)) {
      return; // not ours
    }

    let autoMods = false;

    if(response.modinfo != undefined) { // fml1
      // Use the list of Forge mods from the server ping, so client will match server
      var forgeMods = response.modinfo.modList;
      console.log('Using forgeMods:',forgeMods);
    } else { // fml2
      autoMods = true; // we will use the mods that the server send us
    }

    // Install the FML|HS plugin with the given mods
    forgeHandshake(client, {forgeMods: forgeMods, autoMods: autoMods});
  });
};
