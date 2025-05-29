# AugustDAO

AugustDAO is a decentralized autonomous organization (DAO) framework built on the Solana blockchain, designed for transparency, fairness, and easy governance.

## Project Status

This project is currently in **DEMO MODE**. The frontend is functional but is using mock data as the smart contracts are not yet deployed to the Solana devnet.

### Current Status:
- ✅ Frontend developed with Next.js
- ✅ Mock data integration for UI demonstration
- ⚠️ Solana smart contracts (written in Rust using Anchor) have build issues
- ❌ Smart contracts not yet deployed to devnet

## Repository Structure

- `frontend/` - Next.js application with Solana wallet integration
- `dao-contracts/` - Anchor/Rust smart contracts (governance, treasury, token)

## Frontend Features (Demo Mode)

- View active proposals
- Connect Solana wallet
- Delegate voting power (simulated)
- Revoke delegations (simulated)
- View proposal status and voting results

## Development Setup

### Frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend will run in demo mode with mock data.

### Smart Contracts

The smart contracts are currently experiencing build issues on Apple Silicon Macs. We're working on resolving these issues.

```bash
cd dao-contracts
anchor build  # Note: This currently fails on macOS Apple Silicon
```

## Debugging Note

If you encounter the error "Module not found: Can't resolve 'pino-pretty'", install the dependency:

```bash
cd frontend
npm install pino-pretty
```

## Roadmap

1. Fix Solana BPF toolchain issues for Apple Silicon Macs
2. Complete and deploy smart contracts to Solana devnet
3. Integrate frontend with actual on-chain contracts
4. Implement Snapshot integration for off-chain voting
5. Add Proof-of-Humanity integration for Sybil resistance

## License

MIT 