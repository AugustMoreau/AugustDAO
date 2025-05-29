'use client'

import { useWallet } from '@solana/wallet-adapter-react'
import { PublicKey } from '@solana/web3.js'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { getGovernanceProgram, createDelegation, revokeDelegation, getDelegations } from '@/lib/governance'
import { Card, CardHeader, CardBody, Input, Button, Spinner, Tooltip, Chip, Divider } from '@nextui-org/react'
import { FaUser, FaDollarSign, FaTrashAlt, FaExternalLinkAlt, FaInfoCircle, FaLock, FaArrowRight, FaShieldAlt } from 'react-icons/fa'
import { BsArrowRightCircle, BsShieldLock } from 'react-icons/bs'
import { formatAddress } from '@/lib/solana'

type Delegation = {
  id: string
  delegatee: string
  amount: number
  timestamp: number
}

export function DelegationManager() {
  const { publicKey, wallet } = useWallet()
  const [delegations, setDelegations] = useState<Delegation[]>([])
  const [loading, setLoading] = useState(true)
  const [newDelegatee, setNewDelegatee] = useState('')
  const [delegationAmount, setDelegationAmount] = useState('')
  const [isDemo, setIsDemo] = useState(true)

  useEffect(() => {
    const fetchDelegations = async () => {
      if (!publicKey || !wallet) {
        setLoading(false);
        return;
      }

      try {
        const program = await getGovernanceProgram(wallet)
        const delegationsData = await getDelegations(program)
        setDelegations(delegationsData)
      } catch (error) {
        console.error('Error fetching delegations:', error)
        // Don't show error toast since we know the contracts aren't deployed
        setDelegations([])
      } finally {
        setLoading(false)
      }
    }

    fetchDelegations()
  }, [publicKey, wallet])

  const handleDelegate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!publicKey || !wallet) return

    setLoading(true)
    try {
      const program = await getGovernanceProgram(wallet)
      
      let delegateePubkey;
      if (isDemo) {
        if (newDelegatee.length < 10) {
          throw new Error("Please enter a valid-looking address")
        }
        delegateePubkey = new PublicKey("11111111111111111111111111111111")
      } else {
        delegateePubkey = new PublicKey(newDelegatee)
      }
      
      const amount = parseFloat(delegationAmount)

      await createDelegation(program, delegateePubkey, amount)
      toast.success('Delegation created successfully')

      const updatedDelegations = await getDelegations(program)
      setDelegations(updatedDelegations)

      setNewDelegatee('')
      setDelegationAmount('')
    } catch (error) {
      console.error('Error creating delegation:', error)
      toast.error('Failed to create delegation')
    } finally {
      setLoading(false)
    }
  }

  const handleRevoke = async (delegationId: string) => {
    if (!publicKey || !wallet) return

    setLoading(true)
    try {
      const program = await getGovernanceProgram(wallet)
      await revokeDelegation(program, new PublicKey(delegationId))
      toast.success('Delegation revoked successfully')

      // Refresh delegations
      const updatedDelegations = await getDelegations(program)
      setDelegations(updatedDelegations)
    } catch (error) {
      console.error('Error revoking delegation:', error)
      toast.error('Failed to revoke delegation')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 h-full">
        <Spinner size="lg" color="secondary" className="mb-4">
          <div className="animate-pulse text-purple-500">
            Loading Delegations...
          </div>
        </Spinner>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Create Delegation Card with premium design */}
      <Card className="relative overflow-hidden bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800 border-none shadow-xl">
        {/* Decorative background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -right-24 -top-24 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl"></div>
          <div className="absolute -left-24 -bottom-24 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl"></div>
        </div>
        
        <CardHeader className="relative z-10 border-b border-gray-800 bg-black/30 px-6 py-5">
          <div className="flex items-center">
            <div className="p-2 rounded-full bg-gradient-to-r from-purple-500/20 to-blue-500/20 mr-3">
              <FaShieldAlt className="text-xl text-purple-400" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Create Delegation</h3>
              <p className="text-gray-400 text-xs">Delegate your voting power to trusted community members</p>
            </div>
          </div>
          
          {isDemo && (
            <Tooltip content="In demo mode, delegations are simulated">
              <Button size="sm" isIconOnly variant="light">
                <FaInfoCircle className="text-blue-400" />
              </Button>
            </Tooltip>
          )}
        </CardHeader>
        
        <CardBody className="relative z-10 p-6">
          <form onSubmit={handleDelegate} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300 ml-1">Delegatee Address</label>
              <Input
                placeholder="Enter Solana address"
                value={newDelegatee}
                onChange={(e) => setNewDelegatee(e.target.value)}
                startContent={<FaUser className="text-purple-400" />}
                variant="bordered"
                classNames={{
                  inputWrapper: "bg-black/20 border-gray-700 hover:border-purple-500 group-data-[focus=true]:border-purple-500 shadow-inner shadow-purple-900/10",
                  input: "text-gray-200"
                }}
                required
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300 ml-1">Amount (AUGUST)</label>
              <Input
                placeholder="Enter amount to delegate"
                type="number"
                value={delegationAmount}
                onChange={(e) => setDelegationAmount(e.target.value)}
                startContent={<FaDollarSign className="text-purple-400" />}
                endContent={
                  <div className="pointer-events-none flex items-center">
                    <span className="text-sm text-purple-400">AUGUST</span>
                  </div>
                }
                variant="bordered"
                classNames={{
                  inputWrapper: "bg-black/20 border-gray-700 hover:border-purple-500 group-data-[focus=true]:border-purple-500 shadow-inner shadow-purple-900/10",
                  input: "text-gray-200"
                }}
                min="0"
                step="0.000001"
                required
              />
            </div>
            
            <div className="pt-2">
              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:opacity-90 text-white font-medium py-2 shadow-lg shadow-purple-700/20 border-none transition-all duration-300 text-sm h-10"
              >
                {isDemo ? (
                  <div className="flex items-center">
                    <FaInfoCircle className="text-white/80 flex-shrink-0 text-xs mr-2" />
                    <span>Create Demo</span>
                  </div>
                ) : "Delegate"}
              </Button>
            </div>
          </form>
          
          {!publicKey && (
            <div className="mt-6 p-4 rounded-xl bg-gradient-to-r from-amber-900/30 to-amber-900/20 border border-amber-800/30 backdrop-blur-sm">
              <div className="flex items-center justify-center mb-2">
                <div className="p-2 rounded-full bg-amber-500/10 mr-2"> 
                  <FaLock className="text-amber-400" />
                </div>
                <span className="font-semibold text-amber-300">Wallet Connection Required</span>
              </div>
              <p className="text-amber-400/80 text-sm text-center">Please connect your wallet to use delegations.</p>
            </div>
          )}
          
          {publicKey && isDemo && (
            <div className="mt-6 p-4 rounded-xl bg-gradient-to-r from-amber-900/30 to-amber-900/20 border border-amber-800/30 backdrop-blur-sm">
              <div className="flex items-center justify-center mb-2">
                <div className="p-2 rounded-full bg-amber-500/10 mr-2"> 
                  <FaInfoCircle className="text-amber-400" />
                </div>
                <span className="font-semibold text-amber-300">Demo Mode Active</span>
              </div>
              <p className="text-amber-400/80 text-sm text-center">Smart contracts are not deployed to devnet.</p>
            </div>
          )}
        </CardBody>
      </Card>

      <Card className="glass-card shadow-xl border-none shadow-purple-900/20">
        <CardHeader className="bg-gradient-to-r from-gray-900 to-gray-800 border-b border-gray-800 flex justify-between items-center px-6 py-5">
          <div className="flex items-center">
            <div className="p-2 rounded-full bg-gradient-to-r from-gray-800 to-gray-700 mr-3">
              <FaUser className="text-lg text-blue-400" />
            </div>
            <h3 className="text-xl font-bold text-white">Your Delegations</h3>
          </div>
          {isDemo && (
            <Chip size="sm" color="warning" variant="dot" className="animate-pulse">Mock Data</Chip>
          )}
        </CardHeader>
        <CardBody className="p-0">
          {delegations.length === 0 ? (
            <div className="p-10 text-center">
              <div className="flex flex-col items-center justify-center mb-3">
                <div className="p-3 rounded-full bg-gray-800/50 mb-3">
                  <BsShieldLock className="text-2xl text-gray-500" />
                </div>
                <div className="text-gray-400 mb-2">No active delegations</div>
              </div>
              <div className="text-xs text-gray-600 max-w-xs mx-auto">
                Delegate your voting power to trusted community members to participate in governance when you're unavailable
              </div>
            </div>
          ) : (
            <div className="divide-y divide-gray-800">
              {delegations.map((delegation) => (
                <div key={delegation.id} className="p-4 hover:bg-gray-900/50 transition-colors">
                  <div className="flex justify-between items-center mb-3">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Delegatee</p>
                      <p className="font-mono text-sm flex items-center gap-1 text-gray-300">
                         {formatAddress(delegation.delegatee)} 
                         <a href={`https://explorer.solana.com/address/${delegation.delegatee}?cluster=devnet`} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="text-purple-400 hover:text-purple-300 transition-colors">
                            <FaExternalLinkAlt className="text-xs" />
                         </a>
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500 mb-1">Amount</p>
                      <p className="font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                        {delegation.amount} AUGUST
                      </p>
                    </div>
                  </div>
                  <div className="mt-3">
                    <Button
                      onClick={() => handleRevoke(delegation.id)}
                      color="danger"
                      variant="ghost"
                      fullWidth
                      startContent={<FaTrashAlt />}
                      className="hover:bg-danger-900/20"
                    >
                      Revoke Delegation
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  )
} 