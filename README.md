
# Celo Charity Dapp

# Proposal Creator View:
![Celo-Charity-img-creator](https://user-images.githubusercontent.com/49669209/193618319-aec4d777-c980-489f-b298-e2438bbba9ac.png)

# Donater/Contributor view:
![Celo-Charity-img-contributor](https://user-images.githubusercontent.com/49669209/193618433-0f8b4720-63a6-4324-b015-80346aefdda2.png)


## Description
Fund raising platform for NGO's with simple Charity Dapp built in Celo blockchain.
* Main motivate & goal: To decentralise the charity applications and provide better transparency in fund raising platforms.
* It helps to avoid the 3rd party platform fees/service cost.
* We have two module:
  1. Creator (one who creates the proposal).
  2. Contributor (who wish to donate for the proposal).
* Contributor can donate with cUSD.


## Live Demo
[Celo Charity Dapp](https://santhoshsiva97.github.io/celo-charity-dapp/)

## Tech Stacks:
1. HTML
2. CSS
3. JavaScript
4. Solidity
5. Celo integration kit
6. Remix

### Requirements
1. Install the [CeloExtensionWallet](https://chrome.google.com/webstore/detail/celoextensionwallet/kkilomkmpmkbdnfelcpgckmpcaemjcdh?hl=en) from the Google Chrome Store.
2. Create a wallet.
3. Go to [https://celo.org/developers/faucet](https://celo.org/developers/faucet) and get tokens for the alfajores testnet.
4. Switch to the alfajores testnet in the CeloExtensionWallet.

## Testing follows in two stages: Creator & Contributor

### Creator - test cases:
1. "Add proposal" button - Create a proposal with default account.
2. "Edit button" - Modify & Save the proposal
3. Try deactivate & activing proposals using "Active" checkbox.
4. Track the raised amount in right top of the proposal.
5. "Cancel" button - To delete the proposal.

### Contributor - test cases:
1. Create a second account in your extension wallet and send them cUSD tokens.
2. Contribute to the proposal with secondary account.
3. Check if balance of default account increased.

### NOTE:
1. EDIT & CANCEL functionality will be shown to proposal creator.
2. User cannot contribute, when proposal is deactivated or Maximum amount limit reached.


## Future development:
1. Creating Proposal start & end time.
2. Will introduce DAO approach, Enabling the contract to manage funds based on Success or Failure proposal.
   * Success -> Send funds to desired wallet address automatically.
   * Failure -> Return back of funds to contributors.
3. Multiple cryptocurrency payments.
4. UI Enhancements, Etc.,


## Project Setup

### Install
```
npm install
```

### Start
```
npm run dev
```

### Build
```
npm run build
``` 
