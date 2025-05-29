import { Connection, clusterApiUrl } from '@solana/web3.js'

const ENDPOINT = process.env.NEXT_PUBLIC_RPC_ENDPOINT || clusterApiUrl('devnet')

export function getConnection() {
  return new Connection(ENDPOINT, 'confirmed')
}

export function formatAddress(address: string, chars = 4): string {
  return `${address.substring(0, chars)}...${address.substring(address.length - chars)}`;
} 