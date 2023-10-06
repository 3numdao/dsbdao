# DSBDAO Blocked Address Database

## What is DSBDAO
A group of builders started chatting on [Farcaster](https://warpcast.com/boscolo.eth/0xfd94ac7c) about setting up a community effort to create shared resources for dealing with spam on the XMTP network. One aspect of this spam prevention is to reject requests from known spam addresses. Some spam we are seeing are attempting to create some on chain history, or reverse ENS entries. Adding these addresses to a list of known malicious addresses can help protect users from them.

## What is DSBDAO Blocked Address Database
It is a cloudflare worker and D1 database for collecting Ethereum addresses that an app has marked as blocked.

## Setting up and API Key
The project uses a simple API Key to allow apps to add addresses.

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
