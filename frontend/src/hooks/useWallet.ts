import { useConnection, useWallet as useSolanaWallet } from '@solana/wallet-adapter-react'
import { PublicKey } from '@solana/web3.js'
import { useCallback, useEffect, useState } from 'react'
import toast from 'react-hot-toast'

export function useWallet() {
  const { connection } = useConnection()
  const { publicKey, connected } = useSolanaWallet()
  const [balance, setBalance] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)

  const fetchBalance = useCallback(async () => {
    if (!publicKey) return

    try {
      setLoading(true)
      const balance = await connection.getBalance(publicKey)
      setBalance(balance / 1e9) // Convert lamports to SOL
    } catch (error) {
      console.error('Error fetching balance:', error)
      toast.error('Failed to fetch balance')
    } finally {
      setLoading(false)
    }
  }, [connection, publicKey])

  useEffect(() => {
    if (connected) {
      fetchBalance()
    } else {
      setBalance(null)
    }
  }, [connected, fetchBalance])

  return {
    publicKey,
    connected,
    balance,
    loading,
    fetchBalance,
  }
} 