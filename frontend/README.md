# AugustDAO Frontend

This is the frontend application for AugustDAO, a decentralized autonomous organization built on Solana. The frontend is built with Next.js, TypeScript, and Tailwind CSS.

## Features

- Wallet connection with Phantom and Solflare support
- View AUGUST token balance
- View and participate in governance proposals
- Manage token delegations
- Modern, responsive UI with dark mode

## Prerequisites

- Node.js 18.x or later
- npm 9.x or later
- A Solana wallet (Phantom or Solflare)

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Run the development server:
   ```bash
   npm run dev
   ```

3. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Development

The project uses:
- Next.js 14 for the framework
- TypeScript for type safety
- Tailwind CSS for styling
- Solana Web3.js for blockchain interaction
- React Hot Toast for notifications

### Project Structure

```
src/
  ├── app/              # Next.js app directory
  │   ├── layout.tsx    # Root layout with providers
  │   ├── page.tsx      # Home page
  │   └── providers.tsx # Solana wallet providers
  ├── components/       # Reusable components
  ├── hooks/           # Custom React hooks
  ├── lib/             # Utility functions
  └── types/           # TypeScript type definitions
```

### Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
NEXT_PUBLIC_RPC_ENDPOINT=https://api.devnet.solana.com
```

## Building for Production

```bash
npm run build
```

## Testing

```bash
npm run test
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details. 