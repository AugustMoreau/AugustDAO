import { Program, AnchorProvider, BN } from '@project-serum/anchor'
import { PublicKey, SystemProgram } from '@solana/web3.js'
import { IDL } from '@/types/august_token'
import { getConnection } from './solana'

const GOVERNANCE_PROGRAM_ID = new PublicKey('Govz1VyoyU5Bqe9Xe36hpYT2v7FqCaVQFZ4n2M2XzP1')

// Flag to use mock data when contracts aren't deployed
const USE_MOCK_DATA = true
let mockDelegations = [
  {
    id: 'mock-delegation-1',
    delegatee: 'DEV9KnoyFcmENTgJ1S1p5KVJ1T4yeymDB3qRUKNoWZd4',
    amount: 100,
    timestamp: Date.now() / 1000,
  },
  {
    id: 'mock-delegation-2',
    delegatee: 'EzYfF5kvbgTNcSMyhoMbuAGNXSBkgetnVKYNgJTyxQpP',
    amount: 250,
    timestamp: (Date.now() / 1000) - 86400, // 1 day ago
  }
];

export async function getGovernanceProgram(wallet: any) {
  const connection = getConnection()
  const provider = new AnchorProvider(connection, wallet, {})
  return new Program(IDL as any, GOVERNANCE_PROGRAM_ID, provider)
}

export async function createDelegation(
  program: Program,
  delegatee: PublicKey,
  amount: number
) {
  if (USE_MOCK_DATA) {
    console.log('Creating mock delegation:', delegatee.toString(), amount)
    
    const newId = `mock-delegation-${Date.now()}`
    mockDelegations.push({
      id: newId,
      delegatee: delegatee.toString(),
      amount,
      timestamp: Date.now() / 1000,
    })
    
    return newId
  }

  const [delegationPda] = PublicKey.findProgramAddressSync(
    [
      Buffer.from('delegation'),
      program.provider.publicKey!.toBuffer(),
      delegatee.toBuffer(),
    ],
    program.programId
  )

  return program.methods
    .delegateVotes(new BN(amount))
    .accounts({
      delegation: delegationPda,
      delegator: program.provider.publicKey,
      delegatee,
      systemProgram: SystemProgram.programId,
    })
    .rpc()
}

export async function revokeDelegation(
  program: Program,
  delegationId: PublicKey
) {
  if (USE_MOCK_DATA) {
    console.log('Revoking mock delegation:', delegationId.toString())
    mockDelegations = mockDelegations.filter(d => d.id !== delegationId.toString())
    return delegationId.toString()
  }

  return program.methods
    .revokeDelegation()
    .accounts({
      delegation: delegationId,
      delegator: program.provider.publicKey,
    })
    .rpc()
}

export async function getDelegations(program: Program) {
  if (USE_MOCK_DATA) {
    return mockDelegations
  }

  const delegations = await program.account.delegation.all([
    {
      memcmp: {
        offset: 8, // Skip discriminator
        bytes: program.provider.publicKey!.toBase58(),
      },
    },
  ])

  return delegations.map((delegation) => ({
    id: delegation.publicKey.toBase58(),
    delegatee: delegation.account.delegatee.toBase58(),
    amount: delegation.account.amount.toNumber(),
    timestamp: delegation.account.timestamp.toNumber(),
  }))
} 