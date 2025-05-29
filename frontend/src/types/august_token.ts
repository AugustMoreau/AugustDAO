import { PublicKey } from '@solana/web3.js'

export type AugustToken = {
  version: '0.1.0'
  name: 'august_token'
  instructions: {
    initializeToken: {
      accounts: {
        authority: PublicKey
        tokenConfig: PublicKey
        systemProgram: PublicKey
      }
      args: {
        name: string
        symbol: string
        decimals: number
      }
    }
    mintTokens: {
      accounts: {
        authority: PublicKey
        tokenConfig: PublicKey
        recipient: PublicKey
        tokenAccount: PublicKey
        tokenProgram: PublicKey
        systemProgram: PublicKey
      }
      args: {
        amount: number
      }
    }
    burnTokens: {
      accounts: {
        authority: PublicKey
        tokenConfig: PublicKey
        tokenAccount: PublicKey
        tokenProgram: PublicKey
      }
      args: {
        amount: number
      }
    }
  }
  accounts: {
    tokenConfig: {
      name: string
      symbol: string
      decimals: number
      authority: PublicKey
      totalSupply: number
    }
  }
  errors: {
    Unauthorized: {
      code: 6000
      msg: 'You are not authorized to perform this action'
    }
    InvalidAmount: {
      code: 6001
      msg: 'Invalid amount'
    }
  }
}

export const IDL: AugustToken = {
  version: '0.1.0',
  name: 'august_token',
  instructions: [
    {
      name: 'initializeToken',
      accounts: [
        {
          name: 'authority',
          isMut: true,
          isSigner: true,
        },
        {
          name: 'tokenConfig',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'systemProgram',
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: 'name',
          type: 'string',
        },
        {
          name: 'symbol',
          type: 'string',
        },
        {
          name: 'decimals',
          type: 'u8',
        },
      ],
    },
    {
      name: 'mintTokens',
      accounts: [
        {
          name: 'authority',
          isMut: true,
          isSigner: true,
        },
        {
          name: 'tokenConfig',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'recipient',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'tokenAccount',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'tokenProgram',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'systemProgram',
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: 'amount',
          type: 'u64',
        },
      ],
    },
    {
      name: 'burnTokens',
      accounts: [
        {
          name: 'authority',
          isMut: true,
          isSigner: true,
        },
        {
          name: 'tokenConfig',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'tokenAccount',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'tokenProgram',
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: 'amount',
          type: 'u64',
        },
      ],
    },
  ],
  accounts: [
    {
      name: 'tokenConfig',
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'name',
            type: 'string',
          },
          {
            name: 'symbol',
            type: 'string',
          },
          {
            name: 'decimals',
            type: 'u8',
          },
          {
            name: 'authority',
            type: 'publicKey',
          },
          {
            name: 'totalSupply',
            type: 'u64',
          },
        ],
      },
    },
  ],
  errors: [
    {
      code: 6000,
      name: 'Unauthorized',
      msg: 'You are not authorized to perform this action',
    },
    {
      code: 6001,
      name: 'InvalidAmount',
      msg: 'Invalid amount',
    },
  ],
} 