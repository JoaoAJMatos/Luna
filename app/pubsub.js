// Publish-Subscribe pattern implementation
const redis = require('redis');

const CHANNELS = {
    TEST: 'TEST',
    BLOCKCHAIN: 'BLOCKCHAIN'
}

class PubSub {
    constructor({ blockchain }) {
        this.blockchain = blockchain;

        this.publisher  = redis.createClient();
        this.subscriber = redis.createClient();

        this.subscribeToChannels();

        this.subscriber.on('message', (channel, message) => this.handleMessage(channel, message));
    }

    handleMessage(channel, message) {
        console.log(`Message received | Channel: ${channel} | Message: ${message}`);

        const parsedMessage = JSON.parse(message);

        if (channel = CHANNELS.BLOCKCHAIN) { // Update chain if incoming chain is valid
            this.blockchain.replaceChain(parsedMessage);
        }
    }

    subscribeToChannels() { // Subscribe client to all available channels
        Object.values(CHANNELS).forEach(channel => { 
            this.subscriber.subscribe(channel); 
        });
    }

    publish({ channel, message }) {
        this.subscriber.unsubscribe(channel, () => { // Unsubscribe to the channel
            this.publisher.publish(channel, message, () => { // Send msg
                this.subscriber.subscribe(channel);  // Resubscribe to the channel
            });
        });
        
    }

    broadcastChain() {
        this.publish({
            channel: CHANNELS.BLOCKCHAIN,
            message: JSON.stringify(this.blockchain.chain)
        });
    }
}

module.exports = PubSub;