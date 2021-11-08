# Luna
A blockchain implementation with it's own cryptocurrency and a fully developed API

## Try Luna (0.8 Alpha)
In order to run Luna and experiment with the service in it's early stages of development all you need to do is __clone__ the repo or [download](https://github.com/JoaoAJMatos/Luna/archive/refs/tags/0.7-alpha.zip) the latest stable release.

> To clone the repo: `git clone https://github.com/JoaoAJMatos/Luna.git`

After that, you must install the necessary dependencies using: `npm i dependencies`

##

To run Luna, you can start up the root node by executing `npm run dev` in the root folder of the project. Although optional, you can add different nodes to the network by executing `npm run dev-peer`.

You can now interact with the service by sending http requests to the API. 

All the available endpoints can be found [here](https://github.com/JoaoAJMatos/Luna/blob/main/endpoints.md).

In order to mine the blocks you can fire up the `dedicated-miner` using the following command: `python dedicated-miner.py`. This script will automate the mining process.

> :warning: Attention: You must change the [API URLs](https://github.com/JoaoAJMatos/Luna/blob/cb3fe71badf79ded89dd4d4a7d742a49851231c7/dedicated-miner.py#L8-L9) according to the port your node is running on :warning:

If you encounter a bug, please follow the security procedures stated in the [security policy](https://github.com/JoaoAJMatos/Luna/blob/main/SECURITY.md) file.

## Requirements

| Requirement | Version            |
|-------------|--------------------|
| [Node](https://nodejs.org/en/)        | 12.22.5 (or above) |
| [Python](https://www.python.org/)      | 3.0.0 (or above)   |
| [Redis-Server](https://redis.io/) | 6.0.15 (or above)

## Is it safe to use Luna?

Luna is rubust and (mostly) safe. You can find more information on that in the [wiki](https://github.com/JoaoAJMatos/Luna/wiki).
