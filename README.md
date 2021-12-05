# Luna
A blockchain implementation with it's own cryptocurrency and a fully developed API in node.js because I can and I'm lazy (What? You thought I was going to do all of this in C++? You're mad)

## Try Luna (0.9 Alpha)
In order to run Luna and experiment with the service in it's early stages of development all you need to do is __clone__ the repo or [download](https://github.com/JoaoAJMatos/Luna/archive/refs/tags/0.7-alpha.zip) the latest stable release.

> To clone the repo: `git clone https://github.com/JoaoAJMatos/Luna.git`

After that, you must install the necessary dependencies using: `npm i dependencies`

##

### Run Luna ([requirements](https://github.com/JoaoAJMatos/Luna/blob/main/docs/REQUIREMENTS.md))

To run Luna, you can start up the root node by executing `npm run dev` (or `npm run dev-windows` if you are on Windows) in the root folder of the project. Although optional, you can add different nodes to the network by executing `npm run dev-peer`.

#### Take into consideration:

On startup, the root node will check for the latest blockchain instance inside the host's file system. The file is not created automatically on startup, therefore you will have to add it yourself. If you are on Windows, you must create the following json file `C:\Users\(your_user)\AppData\Roaming\lunaBlockchain.json` with an empty array `[]`. In case you are running the node on a Linux host, you must repeat the process but instead replace the path by `~/.config/lunaBlockchain.json` (the file must have an empty array `[]` inside as well). In the end, your file should look like so:

```
[]
```

In case you want to import a previously stored blockchain instance, you can do that by pasting the blockchain data inside the array as JSON, like so:
```
[
  {
    "timestamp": 1632567704,
    "height": 0,
    "lastHash": "970ec274ca867815174ebe4eff19282000f9495a6c7254e94991d1fb4dc3df30",
    "hash": "todo-hash",
    "difficulty": 10,
    "nonce": 0,
    "data": []
  },
  {
    "timestamp": 1638702178350,
    "height": 1,
    "lastHash": "todo-hash",
    "hash": "006ff240e5107a8f1f36dd2c942181493c5dbb18716555fc1ad16cda519415a7",
    "difficulty": 9,
    "nonce": 351,
    "data": [
      {
        "id": "e62c8c80-55ba-11ec-8230-a3d0fc1e59f8",
        "outputMap": {
          "123": 2,
          "926a72fb4868934574effb083b725f6755f23d810dddb3d575152733eba93699": 8
        },
        "input": {
          "timestamp": 1638702175560,
          "amount": 10,
          "address": "926a72fb4868934574effb083b725f6755f23d810dddb3d575152733eba93699",
          "signature": "8A2E80A4DA34C0407655238878EEBB5E1F057153337DF202558BF610BAF8673674A005847F4601AA9F4B074787FC53ED818162FC8AA7155BADADAA7D5E0C370B"
        }
      },
      {
        "id": "e7d4e550-55ba-11ec-8230-a3d0fc1e59f8",
        "outputMap": {
          "926a72fb4868934574effb083b725f6755f23d810dddb3d575152733eba93699": 2
        },
        "input": {
          "address": "*REWARD*"
        }
      }
    ]
  }
]
```

If no blockchain instance is passed, and the array inside the file is empty, the Root node will create a new blockchain instance and paste the [GENESIS block data](https://gist.github.com/JoaoAJMatos/111dc0aeb10f784c9a8921cf474b2218) as JSON.

##

You can now interact with the service by sending http requests to the API. 

All the available endpoints can be found [here](https://github.com/JoaoAJMatos/Luna/blob/main/docs/endpoints.md).

In order to mine the blocks you can fire up the `dedicated-miner` using the following command: `python dedicated-miner.py`. This script will automate the mining process.

> :warning: Attention: You must change the [API URLs](https://github.com/JoaoAJMatos/Luna/blob/main/dedicated-miner.py#L9-L10) according to the port your node is running on (default port: 3000) :warning:

##

### Bug report

If you encounter a bug, please follow the security procedures stated in the [security policy](https://github.com/JoaoAJMatos/Luna/blob/main/docs/SECURITY.md) file.

## Is it safe to use Luna?

Luna is rubust and (mostly) safe. You can find more information on that in the [wiki](https://github.com/JoaoAJMatos/Luna/wiki).
