'use client'

import { useState } from 'react'
import { Card, CardBody, Chip, Progress, Button } from '@nextui-org/react'
import { FaThumbsUp, FaThumbsDown, FaCheck, FaTimes, FaCircle } from 'react-icons/fa'

// Mock data for proposals
const mockProposals = [
  {
    id: '1',
    title: 'Fund Treasury with 1000 SOL',
    description: 'Allocate 1000 SOL from the DAO community pool to the treasury.',
    votesFor: 1500,
    votesAgainst: 50,
    status: 'active',
    quorum: 1000,
    deadline: new Date(Date.now() + 86400000 * 2) // 2 days from now
  },
  {
    id: '2',
    title: 'Approve Marketing Budget',
    description: 'Approve a budget of 500 AUGUST for marketing initiatives.',
    votesFor: 10000,
    votesAgainst: 1000,
    status: 'passed',
    quorum: 5000,
    deadline: new Date(Date.now() - 86400000) // 1 day ago
  },
  {
    id: '3',
    title: 'Elect New Community Manager',
    description: 'Vote to elect a new community manager for AugustDAO.',
    votesFor: 200,
    votesAgainst: 300,
    status: 'rejected',
    quorum: 1000,
    deadline: new Date(Date.now() - 86400000 * 2) // 2 days ago
  }
]

type ProposalStatus = 'active' | 'passed' | 'rejected'

export function ProposalList() {
  const [proposals] = useState(mockProposals)

  const getStatusChip = (status: ProposalStatus) => {
    switch (status) {
      case 'active':
        return (
          <Chip
            startContent={<FaCircle className="text-xs" />}
            color="warning"
            variant="flat"
            className="text-warning-500"
          >
            Active
          </Chip>
        )
      case 'passed':
        return (
          <Chip
            startContent={<FaCheck className="text-xs" />}
            color="success"
            variant="flat"
            className="text-success-500"
          >
            Passed
          </Chip>
        )
      case 'rejected':
        return (
          <Chip
            startContent={<FaTimes className="text-xs" />}
            color="danger"
            variant="flat"
            className="text-danger-500"
          >
            Failed
          </Chip>
        )
    }
  }

  const calculateProgress = (votesFor: number, votesAgainst: number) => {
    const total = votesFor + votesAgainst
    if (total === 0) return 50
    return (votesFor / total) * 100
  }

  const getCardClassName = (status: ProposalStatus) => {
    const baseClasses = "hover:scale-[1.01] transition-transform duration-300 shadow-lg backdrop-blur-md border"
    
    switch(status) {
      case 'active':
        return `${baseClasses} bg-gradient-to-r from-gray-800/80 to-gray-900 border-gray-800`
      case 'passed':
        return `${baseClasses} bg-gradient-to-r from-gray-800/80 to-gray-900/80 border-green-900/30 shadow-green-900/10`
      case 'rejected':
        return `${baseClasses} bg-gradient-to-r from-gray-800/80 to-gray-900/80 border-red-900/30 shadow-red-900/10`
      default:
        return baseClasses
    }
  }

  return (
    <div className="space-y-6 p-4">
      {proposals.map((proposal) => (
        <Card 
          key={proposal.id} 
          className={getCardClassName(proposal.status as ProposalStatus)}
        >
          <CardBody className="p-5">
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1 pr-4">
                <h3 className="text-xl font-bold text-white mb-1">{proposal.title}</h3>
                <p className="text-gray-400 mb-4">{proposal.description}</p>
              </div>
              <div className="flex-shrink-0">
                {getStatusChip(proposal.status as ProposalStatus)}
              </div>
            </div>
            
            <div className="mb-5">
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center text-green-500 bg-green-500/10 px-3 py-1 rounded-full shadow-sm">
                  <FaThumbsUp className="mr-2" /> {proposal.votesFor.toLocaleString()}
                </div>
                <div className="text-gray-400 text-xs font-medium">
                  {calculateProgress(proposal.votesFor, proposal.votesAgainst).toFixed(1)}% approval
                </div>
                <div className="flex items-center text-red-500 bg-red-500/10 px-3 py-1 rounded-full shadow-sm">
                  <FaThumbsDown className="mr-2" /> {proposal.votesAgainst.toLocaleString()}
                </div>
              </div>
              <Progress 
                aria-label="Voting progress"
                value={calculateProgress(proposal.votesFor, proposal.votesAgainst)}
                className="h-3 rounded-full overflow-hidden"
                classNames={{
                  indicator: proposal.status === 'passed'
                    ? 'bg-gradient-to-r from-green-500 to-blue-500 shadow-inner'
                    : proposal.status === 'rejected'
                      ? 'bg-gradient-to-r from-red-500 to-orange-500 shadow-inner'
                      : 'bg-gradient-to-r from-green-500 to-blue-500 shadow-inner'
                }}
              />
            </div>
            
            {proposal.status === 'active' && (
              <div className="border-t border-gray-700 pt-4 mt-4">
                <div className="flex justify-end space-x-3">
                  <Button 
                    size="md" 
                    color="success" 
                    variant="ghost"
                    startContent={<FaThumbsUp className="group-hover:scale-110 transition-transform" />}
                    className="px-6 group hover:bg-green-500/10 transition-all duration-300"
                  >
                    Approve
                  </Button>
                  <Button 
                    size="md" 
                    color="danger" 
                    variant="ghost"
                    startContent={<FaThumbsDown className="group-hover:scale-110 transition-transform" />}
                    className="px-6 group hover:bg-red-500/10 transition-all duration-300"
                  >
                    Reject
                  </Button>
                </div>
              </div>
            )}
            
            {proposal.status === 'passed' && (
              <div className="mt-4 flex justify-end">
                <div className="flex items-center text-green-500 text-sm">
                  <FaCheck className="mr-1" /> Proposal passed on {proposal.deadline.toLocaleDateString()}
                </div>
              </div>
            )}
            
            {proposal.status === 'rejected' && (
              <div className="mt-4 flex justify-end">
                <div className="flex items-center text-red-500 text-sm">
                  <FaTimes className="mr-1" /> Proposal rejected on {proposal.deadline.toLocaleDateString()}
                </div>
              </div>
            )}
          </CardBody>
        </Card>
      ))}
    </div>
  )
} 