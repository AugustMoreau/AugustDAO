'use client'

import { useWallet } from '@solana/wallet-adapter-react'
import { FC, useCallback, useMemo, useState, useEffect } from 'react'
import { Button, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from '@nextui-org/react'
import { FaWallet, FaCopy, FaSignOutAlt } from 'react-icons/fa'
import toast from 'react-hot-toast'

interface WalletDisplayProps {
  className?: string
}

export const WalletDisplay: FC<WalletDisplayProps> = ({ className = '' }) => {
  const { publicKey, disconnect, wallet } = useWallet()
  const [copied, setCopied] = useState(false)
  const [walletType, setWalletType] = useState<string | null>(null)

  const base58 = useMemo(() => publicKey?.toBase58(), [publicKey])
  
  useEffect(() => {
    if (wallet?.adapter?.name) {
      setWalletType(wallet.adapter.name.toLowerCase())
    }
  }, [wallet])
  
  const content = useMemo(() => {
    if (!base58) return null
    return `${base58.slice(0, 4)}...${base58.slice(-4)}`
  }, [base58])
  
  const copyAddress = useCallback(async () => {
    if (base58) {
      await navigator.clipboard.writeText(base58)
      setCopied(true)
      toast.success('Address copied to clipboard')
      setTimeout(() => setCopied(false), 400)
    }
  }, [base58])
  
  const handleDisconnect = useCallback(() => {
    disconnect()
    toast.success('Wallet disconnected')
  }, [disconnect])

  const getWalletIcon = () => {
    if (walletType?.includes('phantom')) {
      return (
        <div className="w-5 h-5 bg-purple-600 rounded-full flex items-center justify-center shadow-md mr-1">
          <span className="text-white text-xs font-bold">P</span>
        </div>
      )
    } else if (walletType?.includes('solflare')) {
      return (
        <div className="w-5 h-5 bg-orange-600 rounded-full flex items-center justify-center shadow-md mr-1">
          <span className="text-white text-xs font-bold">S</span>
        </div>
      )
    } else {
      return <FaWallet className="text-blue-400 mr-1" />
    }
  }
  
  if (!base58) return null
  
  return (
    <Dropdown className={className}>
      <DropdownTrigger>
        <Button 
          className="bg-gradient-to-r from-blue-700 to-purple-700 text-white border-none shadow-lg shadow-blue-900/20 font-medium py-0 h-10 min-w-[120px]"
          startContent={getWalletIcon()}
          size="sm"
        >
          <span className="text-sm">{content}</span>
        </Button>
      </DropdownTrigger>
      <DropdownMenu 
        aria-label="Wallet Actions"
        className="bg-gray-900 border border-gray-800 shadow-xl"
      >
        <DropdownItem
          key="copy"
          description="Copy your full address"
          startContent={<FaCopy className="text-blue-400" />}
          onClick={copyAddress}
          className="data-[hover=true]:bg-blue-800 text-white"
        >
          Copy Address
        </DropdownItem>
        <DropdownItem
          key="disconnect"
          className="data-[hover=true]:bg-red-900 text-red-400"
          color="danger"
          description="Disconnect your wallet"
          startContent={<FaSignOutAlt className="text-red-400" />}
          onClick={handleDisconnect}
        >
          Disconnect
        </DropdownItem>
      </DropdownMenu>
    </Dropdown>
  )
} 