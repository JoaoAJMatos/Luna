# Luna

## API Endpoints (v0.8-Alpha)

| Endpoint                    | Type   | Args                | Description                                 |
|-----------------------------|:------:|:-------------------:|---------------------------------------------|
| `/api/blocks`               | `GET`  | `None`              | Returns a JSON of the blockchain            |
| `/api/mine-transactions`    | `GET`  | `None`              | Mines the block inside the transaction pool |
| `/api/transact`             | `POST` | `Amount, Recipient` | Conduct a transaction                       |
| `/api/transaction-pool-map` | `GET`  | `None`              | Returns JSON of the transaction pool        |
