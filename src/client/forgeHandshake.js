const ProtoDef = require('protodef').ProtoDef;
const mcData = require('minecraft-data')
const assert = require('assert');
const debug = require('../../debug');

const proto = new ProtoDef();
// copied from ../../dist/transforms/serializer.js TODO: refactor
proto.addType("string", ["pstring", {
      countType: "varint"
    }]);


// http://wiki.vg/Minecraft_Forge_Handshake
// TODO: move to https://github.com/PrismarineJS/minecraft-data
proto.addType('fml|hsMapper',
  [
    "mapper",
    {
      "type": "i8",
      "mappings": {
        "0": "ServerHello",
        "1": "ClientHello",
        "2": "ModList",
        "3": "RegistryData",
        "-1": "HandshakeAck",
        "-2": "HandshakeReset"
      },
    }
  ]
);

proto.addType('FML|HS',
  [
    "container",
    [
      {
        "name": "discriminator",
        "type": "fml|hsMapper"
      },

      {
        "anon": true,
        "type":
        [
          "switch",
          {
            "compareTo": "discriminator",
            "fields":
            {
              "ServerHello":
              [
                "container",
                [
                  {
                    "name": "fmlProtocolVersion",
                    "type": "i8"
                  },
                  {
                    "name": "overrideDimension",
                    "type":
                    [
                      "switch",
                      {
                        // "Only sent if protocol version is greater than 1."
                        "compareTo": "fmlProtocolVersion",
                        "fields":
                        {
                          "0": "void",
                          "1": "void"
                        },
                        "default": "i32"
                      }
                    ]
                  },
                ],
              ],

              "ClientHello":
              [
                "container",
                [
                  {
                    "name": "fmlProtocolVersion",
                    "type": "i8"
                  }
                ]
              ],

              "ModList":
              [
                "container",
                [
                  {
                    "name": "mods",
                    "type":
                    [
                      "array",
                      {
                        "countType": "varint",
                        "type":
                        [
                          "container",
                          [
                            {
                              "name": "modid",
                              "type": "string"
                            },
                            {
                              "name": "version",
                              "type": "string"
                            }
                          ]
                        ],
                      },
                    ]
                  }
                ],
              ],

              "RegistryData":
              [
                "container",
                [
                  {
                    "name": "hasMore",
                    "type": "bool"
                  },

                  /* TODO: support all fields http://wiki.vg/Minecraft_Forge_Handshake#RegistryData
                   * TODO: but also consider http://wiki.vg/Minecraft_Forge_Handshake#ModIdData
                   *  and https://github.com/ORelio/Minecraft-Console-Client/pull/100/files#diff-65b97c02a9736311374109e22d30ca9cR297
                  {
                    "name": "registryName",
                    "type": "string"
                  },
                  */
                ],
              ],

              "HandshakeAck":
              [
                "container",
                [
                  {
                    "name": "phase",
                    "type": "i8"
                  },
                ],
              ],

            },
          }
        ]
      }
    ]
  ]
);

// FML2
proto.addType('fml:handshakeMapper',
  [
      "mapper",
      {
          "type": "varint",
          "mappings": {
              1: "mod_list",
              2: "mod_list_reply",
              3: "server_registry",
              4: "configuration_data",
              99: "acknowledgement"
          },
      }
  ]
);

proto.addType('fml:handshake',
  [
  "container",
  [
    {
      "name": "discriminator",
      "type": "fml:handshakeMapper"
    },

    {
      "anon": true,
      "type":
      [
        "switch",
        {
          "compareTo": "discriminator",
          "fields":
          {
            "mod_list":
            [
              "container",
              [
                {
                  "name": "mods",
                  "type": [
                    "array",
                    {
                        "countType": "varint",
                        "type": "string"
                    }
                  ]
                },
                {
                  "name": "channels",
                  "type":
                  [
                    "array",
                    {
                        "countType": "varint",
                        "type": [
                            "container",
                            [
                                {
                                    "name": "key",
                                    "type": "string"
                                },
                                {
                                    "name": "value",
                                    "type": "string"
                                }
                            ]
                        ]
                    }
                  ]
                },
                {
                    "name": "registries",
                    "type": [
                      "array",
                      {
                          "countType": "varint",
                          "type": "string"
                      }
                    ]
                  },
              ],
            ],

            "mod_list_reply":
            [
              "container",
              [
                {
                  "name": "mods",
                  "type": [
                    "array",
                    {
                        "countType": "varint",
                        "type": "string"
                    }
                  ]
                },
                {
                  "name": "channels",
                  "type":
                  [
                    "array",
                    {
                        "countType": "varint",
                        "type": [
                            "container",
                            [
                                {
                                    "name": "key",
                                    "type": "string"
                                },
                                {
                                    "name": "value",
                                    "type": "string"
                                }
                            ]
                        ]
                    }
                  ]
                },
                {
                    "name": "registries",
                    "type": 
                    [
                      "array",
                      {
                        "countType": "varint",
                        "type": [
                            "container",
                            [
                                {
                                    "name": "key",
                                    "type": "string"
                                },
                                {
                                    "name": "value",
                                    "type": "string"
                                }
                            ]
                        ]
                      }
                    ]
                },
              ],
            ],
            "server_registry":
            [
                "container",
                [
                    {
                        "name": "registry_name",
                        "type": "string"
                    },
                    {
                        "name": "snapshot_present",
                        "type": "bool"
                    },
                    {
                        "name": "snapshot",
                        "type": [
                            "option",
                            "void"
                        ]
                    }
                ]
            ],
            "configuration_data":
            [
                "container",
                [
                    {
                        "name": "file_name",
                        "type": "string"
                    },
                    {
                        "name": "data", 
                        "type": "void"
                    }
                ]
            ],
            "acknowledgement": "void"
          },
        }
      ]
    }
    ]
  ]
);

proto.addType('fml:loginwrapper',
  [
  "container",
  [
      {
          "name": "channel",
          "type": "string"
      },
      {
          "name": "data",
          "type": [
              "buffer",
              {
                  "countType": "varint"
              }
          ]
      }
  ]
]);

function writeAck(client, phase) {
  const ackData = proto.createPacketBuffer('FML|HS', {
    discriminator: 'HandshakeAck', // HandshakeAck,
    phase: phase
  });
  client.write('custom_payload', {
    channel: 'FML|HS',
    data: ackData
  });
}

const FMLHandshakeClientState = {
  START: 1,
  WAITINGSERVERDATA: 2,
  WAITINGSERVERCOMPLETE: 3,
  PENDINGCOMPLETE: 4,
  COMPLETE: 5,
};

function fmlHandshakeStep(client, data, options)
{
  const parsed = proto.parsePacketBuffer('FML|HS', data);
  debug('FML|HS',parsed);

  const fmlHandshakeState = client.fmlHandshakeState || FMLHandshakeClientState.START;

  switch(fmlHandshakeState) {
    case FMLHandshakeClientState.START:
    {
      assert.ok(parsed.data.discriminator === 'ServerHello', `expected ServerHello in START state, got ${parsed.data.discriminator}`);

      client.write('custom_payload', {
        channel: 'REGISTER',
        data: Buffer.from(['FML|HS', 'FML', 'FML|MP', 'FML', 'FORGE'].join('\0'))
      });

      const clientHello = proto.createPacketBuffer('FML|HS', {
        discriminator: 'ClientHello',
        fmlProtocolVersion: parsed.data.fmlProtocolVersion
      });

      client.write('custom_payload', {
        channel: 'FML|HS',
        data: clientHello
      });

      debug('Sending client modlist');
      const modList = proto.createPacketBuffer('FML|HS', {
        discriminator: 'ModList',
        mods: options.forgeMods || []
      });
      client.write('custom_payload', {
        channel: 'FML|HS',
        data: modList
      });
      writeAck(client, FMLHandshakeClientState.WAITINGSERVERDATA);
      client.fmlHandshakeState = FMLHandshakeClientState.WAITINGSERVERDATA;
      break;
    }

    case FMLHandshakeClientState.WAITINGSERVERDATA:
    {
      assert.ok(parsed.data.discriminator === 'ModList', `expected ModList in WAITINGSERVERDATA state, got ${parsed.data.discriminator}`);
      debug('Server ModList:',parsed.data.mods);
      // Emit event so client can check client/server mod compatibility
      client.emit('forgeMods', parsed.data.mods);
      client.fmlHandshakeState = FMLHandshakeClientState.WAITINGSERVERCOMPLETE;
      break;
    }

    case FMLHandshakeClientState.WAITINGSERVERCOMPLETE:
    {
      assert.ok(parsed.data.discriminator === 'RegistryData', `expected RegistryData in WAITINGSERVERCOMPLETE, got ${parsed.data.discriminator}`);
      debug('RegistryData',parsed.data);
      console.log('RegistryData',parsed);
      if (client.version === '1.7.10' // actually ModIdData packet, and there is only one of those TODO: avoid hardcoding version, allow earlier
          || parsed.data.hasMore === false) { // RegistryData packet 1.8+ hasMore boolean field, set to false when ready to ack
        debug('LAST RegistryData');

        writeAck(client, FMLHandshakeClientState.WAITINGSERVERCOMPLETE);
        client.fmlHandshakeState = FMLHandshakeClientState.PENDINGCOMPLETE;
      }
      break;
    }

    case FMLHandshakeClientState.PENDINGCOMPLETE:
    {
      assert.ok(parsed.data.discriminator === 'HandshakeAck', `expected HandshakeAck in PENDINGCOMPLETE, got ${parsed.data.discrimnator}`);
      assert.ok(parsed.data.phase === 2, `expected HandshakeAck phase WAITINGACK, got ${parsed.data.phase}`);
      writeAck(client, FMLHandshakeClientState.PENDINGCOMPLETE4);
      client.fmlHandshakeState = FMLHandshakeClientState.COMPLETE
      break;
    }

    case FMLHandshakeClientState.COMPLETE:
    {
      assert.ok(parsed.data.phase === 3, `expected HandshakeAck phase COMPLETE, got ${parsed.data.phase}`);

      writeAck(client, FMLHandshakeClientState.COMPLETE);
      debug('HandshakeAck Complete!');
      break;
    }

    default:
      console.error(`unexpected FML state ${fmlHandshakeState}`);
  }
}

function fml2HandshakeStep(client, messageId, data, options) {
  const parsed = proto.parsePacketBuffer('fml:loginwrapper', data)
  if(parsed.data.channel != 'fml:handshake') return;

  const handshakeData = proto.parsePacketBuffer('fml:handshake', parsed.data.data);
  let responseData;

  switch(handshakeData.data.discriminator) {
    case "mod_list":
      client.emit('forgeMods', handshakeData.data.mods);
      responseData = {
        discriminator: "mod_list_reply",
        mods: options.autoMods ? handshakeData.data.mods : options.forgeMods || [],
        channels: handshakeData.data.channels,
        registries: handshakeData.data.registries.map(registryName => { 
          return { "key": registryName, "value": "" }
        })
      }
      break;
    case "server_registry":
      responseData = {
        discriminator: "acknowledgement"
      }
      break;
    case "configuration_data":
      responseData = {
        discriminator: "acknowledgement"
      }
      break;
  }

  const response = proto.createPacketBuffer('fml:loginwrapper', {
    channel: "fml:handshake",
    data: proto.createPacketBuffer('fml:handshake', responseData)
  });

  client.write('login_plugin_response', {
    messageId: messageId,
    data: response
  });
}

module.exports = function(client, options) {
  const data = mcData(client.version);
  if(data.version.version >= 393) {
    client.tagHost =  '\0FML2\0'; // passed to src/client/setProtocol.js, signifies client supports FML/Forge
    client.on('login_plugin_request', packet => {
      if(packet.channel == 'fml:loginwrapper') {
        fml2HandshakeStep(client, packet.messageId, packet.data, options);
      }
    });
  } else {
    client.tagHost =  '\0FML\0'; // passed to src/client/setProtocol.js, signifies client supports FML/Forge
    client.on('custom_payload', function(packet) {
      // TODO: channel registration tracking in NMP, https://github.com/PrismarineJS/node-minecraft-protocol/pull/328
      if (packet.channel === 'FML|HS') {
        fmlHandshakeStep(client, packet.data, options);
      }
    });
  }
};
