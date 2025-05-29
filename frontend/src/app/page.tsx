'use client'

import { useWallet } from '@solana/wallet-adapter-react'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { DelegationManager } from '@/components/DelegationManager'
import { ProposalList } from '@/components/ProposalList'
import { WalletBalance } from '@/components/WalletBalance'
import { WalletDisplay } from '@/components/WalletDisplay'
import { Card, CardHeader, CardBody, Button, Chip, Divider } from '@nextui-org/react'
import { SiSolana } from 'react-icons/si'
import { HiOutlineInformationCircle } from 'react-icons/hi'

export default function Home() {
  const { publicKey } = useWallet()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    setTimeout(() => setIsLoading(false), 300)
  }, [])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen animated-bg">
        <div className="animate-spin rounded-full h-32 w-32 border-t-4 border-b-4 border-white"></div>
      </div>
    )
  }

  return (
    <main className="container mx-auto p-4 min-h-screen bg-gradient-to-b from-gray-900 to-black">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 p-4 glass-card rounded-xl">
        <div className="flex items-center space-x-4 mb-4 md:mb-0">
          <div className="flex items-center">
            <SiSolana className="text-4xl text-blue-400 mr-3 animate-pulse" />
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">AugustDAO</h1>
          </div>
          <Chip color="warning" variant="dot" className="animate-pulse">Demo Version</Chip>
        </div>
        <div className="flex items-center space-x-4">
          <WalletBalance />
          {publicKey ? (
            <WalletDisplay />
          ) : (
            <div className="wallet-container">
              <WalletMultiButton className="!bg-gradient-to-r !from-blue-700 !to-purple-700 !text-white !border-none !shadow-lg !h-10 !rounded-md !font-medium !text-sm" />
            </div>
          )}
        </div>
      </div>
      
      <div className="bg-gradient-to-r from-amber-900/30 to-orange-900/20 p-4 rounded-xl mb-8 flex items-center shadow-lg border border-amber-700/30">
        <HiOutlineInformationCircle className="text-amber-500 text-2xl mr-3 flex-shrink-0" />
        <p className="text-amber-400 text-sm">
          This is a demonstration version running with mock data. Smart contracts are not currently deployed to the Solana devnet.
        </p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card className="glass-card shadow-xl border-none shadow-blue-900/20">
            <CardHeader className="border-b border-gray-800 bg-gradient-to-r from-gray-900 to-gray-800">
              <h2 className="text-xl font-bold text-white">Active Proposals</h2>
            </CardHeader>
            <CardBody className="p-0">
              <ProposalList />
            </CardBody>
          </Card>
        </div>
        
        <div>
          <DelegationManager />
        </div>
      </div>
      
      <Divider className="my-12 bg-gray-700" />
      
      <div className="mt-8 text-center">
        <p className="text-sm text-gray-400">This is a demonstration version of AugustDAO running with mock data.</p>
        <p className="text-xs text-gray-500 mt-2">Smart contracts are not currently deployed to the Solana devnet.</p>
      </div>
    </main>
  )
} 