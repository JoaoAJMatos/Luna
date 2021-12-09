# Luna

## API Endpoints (v0.8-Alpha)

| Endpoint                    | Type   | Args                | Description                                 |
|-----------------------------|:------:|:-------------------:|---------------------------------------------|
| `/api/blocks`               | `GET`  | `None`              | Returns a JSON of the blockchain            |
| `/api/block/index`          | `GET`  | `index (int)`       | Returns block at specified index            |
| `/api/block/hash`           | `GET`  | `hash (str)`        | Returns block with specified hash           |
| `/api/mine-transactions`    | `GET`  | `None`              | Mines the block inside the transaction pool |
| `/api/transact`             | `POST` | `Amount, Recipient (JSON)`| Conduct a transaction                       |
| `/api/transaction-pool-map` | `GET`  | `None`              | Returns JSON of the transaction pool        |
