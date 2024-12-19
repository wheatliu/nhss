# NFT Holder Syncing Service (NHSS)

## Project Overview

A TypeScript and NestJS-based service designed to sync and track NFT holders by accessing the Alchemy API. The service monitors ERC721 NFT contract transactions and maintains an up-to-date list of token holders in Redis.


## Key Features

- Real-time NFT holder tracking via Alchemy API
- Support for multiple ERC721 contract addresses
- Redis-based storage for optimized data access

## Getting Started

### Prerequisites

- Node.js (v16+)
- npm or yarn
- Redis server
- Alchemy API key

### Installation

Run the following command in the project's root directory to install the dependencies:

```bash
npm install
# Or
yarn install
```

### Starting the Application

To start the NestJS application, follow these steps:

1. Run the following command in the project's root directory to start the application:

   ```bash
   nest start
   ```

### Configuration

Create a `.env` file in the project's root directory and configure the following environment variables:

```dotenv
ALCHEMY_API_KEY=YOUR_ALCHEMY_API_KEY
ALCHEMY_NETWORK=YOUR_ALCHEMY_NETWORK

NFT_CONTRACT_ADDRESS=YOUR_NFT_CONTRACT_ADDRESS
NFT_BLOCK_NUMBER_WHEN_CREATED=YOUR_NFT_BLOCK_NUMBER_WHEN_CREATED

REDIS_HOST=YOUR_REDIS_HOST
REDIS_PORT=YOUR_REDIS_PORT

DATABASE_HOST=YOUR_DATABASE_HOST
DATABASE_TYPE=YOUR_DATABASE_TYPE
DATABASE_PORT=YOUR_DATABASE_PORT
DATABASE_USER=YOUR_DATABASE_USER
DATABASE_PASSWORD=YOUR_DATABASE_PASSWORD
DATABASE_DB=YOUR_DATABASE_DB_NAME
```
