# DSBDAO

## What is DSBDAO
A group of builders [started chatting on Farcaster](https://warpcast.com/boscolo.eth/0x05e69062) about a service to curate known scammer addresses/ens names. The thread was started by [@betashop.eth](https://warpcast.com/betashop.eth), founder of Airstack. [@dawufi](https://warpcast.com/dawufi) proposed we set up a repo with to curate address and then named the effort the *Decentralized spam bustaz*, and DSBDAO was born.

## DSBDAO Blocked Address Database
One aspect of this spam prevention is to reject requests from known spam addresses. It cost nothing to generate an Ethereum address, and spammers can generate a unique address for each spam address sent to each victim. But, there are two important reasons we should collect these addresses anyway.
 1. By collecting these addresses, any other assets associated with the address such as an NFT or and ENS Name can also be identified and curated into a list of blocked assets.
 2. In cases where addresses are reused because the scammers have built up some onchain history, collecting signal that multiple users blocked the address can be used to create an in immediate update to the block list used by applications.

### Where is the DSBDAO Blocked Address Database
The initial version of the blocked address database is a simple (one-page) cloudflare worker and D1 database that collects Ethereum addresses from registered applications that identified and marked the address as blocked. *This is usually the result of a user blocking the address as spam.*

The API supports two calls. One to add an address to the DB, and one to query the list of adresses.

The cloudflare project is currently being hosted by [3NUM](https://3num.co), but we will move it to an account managed by the DSBDAO if there is interest.

## Setting up and API Key
The project uses a `X-API-Key` header to gate access to the API. 

This is admitidly a very centralized v1. If this effort grows in paopularity, this registration step could be moved to a smart contract. This contract could also form the basis of membership into this DAO for managing this effort.

You can request and API key by pinging `chris.boscolo.eth` on XMTP. API keys are intended for projects that want to either contribute blocked addresses or use them for anallysis and curation. 

### Getting started and deploying to production

```sh
# Make sure you've logged in
npx wrangler login

# Create the D1 Database
npx wrangler d1 create dsbdao

# Add config to wrangler.toml as instructed

# Fill the DB with seed data from an SQL file:
npx wrangler d1 execute dsbdao --file ./blocks.sql

# Add an App API key
npx wrangler d1 execute dbsdao --command="INSERT INTO ApiKeys (app_name,api_key) VALUES ('3NUM','0x1234123ab1234123ab1234123ab1234123ab')"

# Deploy the worker
npx wrangler deploy
```

To send addresses to the DB here's an example via curl:
```
curl  http://worker.host.name/block \
-d '{"appName": "MyApp", "ethAddress": "0x1234567890123456789012345678901234567890"}' \
-H "Content-Type: application/json" \
-H "X-API-Key: 12345678"
```

### Developing locally

To develop on your worker locally, this project uses the staging environment.
 it can be super helpful to be able to copy down a copy of your production DB to work on. To do that with D1:

```sh
# Create the D1 Database
npx wrangler -e staging d1 create dsbdao-staging --local

# Setup the DB:
npx wrangler -e staging d1 execute dsbdao-staging --local --file ./blocks.sql

# Add an App API key
npx wrangler -e staging d1 execute dbsdao-staging --local --command="INSERT INTO ApiKeys (app_name,api_key) VALUES ('MyApp','12345678')"

# Run the local server on port 5757
npx wrangler -e staging dev --port 5757
```

#### Downloading data from production
```sh
# Make sure you have the directory where wrangler dev looks for local D1
mkdir -p wrangler-local-state/d1

# Copy the `id` of the backup, and download the backup into that directory
npx wrangler d1 backup download dbsdao ${BACKUP_ID} --output ./wrangler-local-state/d1/DB.sqlite3
```
