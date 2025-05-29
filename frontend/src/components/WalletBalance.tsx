'use client'

import { useWallet } from '@solana/wallet-adapter-react';
import { useEffect, useState } from 'react';
import { Card, CardBody, Tooltip } from '@nextui-org/react';
import { SiSolana } from 'react-icons/si';

export function WalletBalance() {
  const { publicKey } = useWallet();
  const [balance, setBalance] = useState(2.0);

  useEffect(() => {
    if (publicKey) {
      // Mock balance update - would be replaced with actual balance fetch
      const timer = setTimeout(() => {
        setBalance(Math.random() * 2 + 1);
      }, 10000);
      
      return () => clearTimeout(timer);
    }
  }, [publicKey]);

  if (!publicKey) return null;

  return (
    <Tooltip
      content="Demo balance (not actual)"
      placement="bottom"
      classNames={{
        content: "bg-gradient-to-r from-gray-900 to-gray-800 border border-gray-700",
      }}
    >
      <Card className="bg-gradient-to-r from-blue-800/20 to-purple-800/20 border border-blue-900/30 shadow-inner shadow-blue-500/5">
        <CardBody className="p-2 flex items-center justify-center">
          <div className="flex items-center space-x-2">
            <SiSolana className="text-blue-400 animate-pulse" />
            <span className="font-bold text-white">{balance.toFixed(5)} <span className="text-blue-400">SOL</span></span>
          </div>
        </CardBody>
      </Card>
    </Tooltip>
  );
} 