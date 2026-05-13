# DIDcompliance MVP Backend

## Overview

This project is an MVP backend built on XRPL Testnet.

It uses:
- XRPL Testnet for transaction testing
- `data/workers.json` as a temporary mock database
- a custodial wallet model for MVP only

`workers.json` stores local worker records and may include transaction metadata produced during XRPL Testnet testing.

## Current Signup Flow

When a user completes signup on the frontend:

1. The frontend sends a request to the backend with the user ID.
2. The backend creates a new XRPL wallet for that user.
3. The backend maps the new wallet address to the user ID.
4. The backend stores the wallet seed in encrypted form for MVP purposes.
5. The treasury wallet sends `1.3 XRP` to the new wallet to activate it on XRPL Testnet.

At that point, the signup and wallet provisioning flow is complete.

## DID and Credential Flows

`DIDSet` and `CredentialCreate` are separate backend-triggered flows.

The backend can submit those transactions later when specific product events occur. For example, this may happen when a user enters a remittance-related flow through the Vistafi product.

## MVP Notes

This implementation is currently custodial:
- the backend creates user wallets
- the backend stores encrypted wallet seeds
- the backend can submit transactions on behalf of user wallets

This model is for MVP and testing purposes and is not the intended long-term production custody design.
