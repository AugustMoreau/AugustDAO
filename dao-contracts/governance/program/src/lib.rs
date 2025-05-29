use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount};
use anchor_spl::associated_token::AssociatedToken;

declare_id!("Govz1VyoyU5Bqe9Xe36hpYT2v7FqCaVQFZ4n2M2XzP1");

#[program]
pub mod governance {
    use super::*;

    pub fn initialize_dao(
        ctx: Context<InitializeDao>,
        config: DaoConfig,
    ) -> Result<()> {
        let dao_config = &mut ctx.accounts.dao_config;
        dao_config.authority = ctx.accounts.authority.key();
        dao_config.token_mint = ctx.accounts.token_mint.key();
        dao_config.proposal_fee = config.proposal_fee;
        dao_config.voting_period = config.voting_period;
        dao_config.quorum_percentage = config.quorum_percentage;
        dao_config.threshold_percentage = config.threshold_percentage;
        dao_config.require_poh = config.require_poh;
        dao_config.bump = *ctx.bumps.get("dao_config").unwrap();
        Ok(())
    }

    pub fn create_proposal(
        ctx: Context<CreateProposal>,
        title: String,
        description: String,
        snapshot_id: String,
        actions: Vec<ProposedAction>,
    ) -> Result<()> {
        let proposal = &mut ctx.accounts.proposal;
        proposal.creator = ctx.accounts.creator.key();
        proposal.title = title;
        proposal.description = description;
        proposal.snapshot_id = snapshot_id;
        proposal.actions = actions;
        proposal.creation_time = Clock::get()?.unix_timestamp;
        proposal.voting_start_time = Clock::get()?.unix_timestamp;
        proposal.voting_end_time = Clock::get()?.unix_timestamp + ctx.accounts.dao_config.voting_period;
        proposal.status = ProposalStatus::Active;
        proposal.for_votes = 0;
        proposal.against_votes = 0;
        proposal.abstain_votes = 0;
        proposal.bump = *ctx.bumps.get("proposal").unwrap();

        // Transfer proposal fee if required
        if ctx.accounts.dao_config.proposal_fee > 0 {
            token::transfer(
                CpiContext::new(
                    ctx.accounts.token_program.to_account_info(),
                    token::Transfer {
                        from: ctx.accounts.creator_token_account.to_account_info(),
                        to: ctx.accounts.dao_token_account.to_account_info(),
                        authority: ctx.accounts.creator.to_account_info(),
                    },
                ),
                ctx.accounts.dao_config.proposal_fee,
            )?;
        }

        Ok(())
    }

    pub fn cast_vote(
        ctx: Context<CastVote>,
        vote_option: VoteOption,
        voter_token_amount: u64,
    ) -> Result<()> {
        let proposal = &mut ctx.accounts.proposal;
        let vote_record = &mut ctx.accounts.vote_record;
        
        // Verify proposal is active
        require!(
            proposal.status == ProposalStatus::Active,
            GovernanceError::ProposalNotActive
        );

        // Verify voting period
        let current_time = Clock::get()?.unix_timestamp;
        require!(
            current_time >= proposal.voting_start_time && current_time <= proposal.voting_end_time,
            GovernanceError::NotInVotingPeriod
        );

        // Record vote
        vote_record.proposal = proposal.key();
        vote_record.voter = ctx.accounts.voter.key();
        vote_record.vote_option = vote_option;
        vote_record.token_amount = voter_token_amount;
        vote_record.timestamp = current_time;
        vote_record.bump = *ctx.bumps.get("vote_record").unwrap();

        // Update proposal vote counts
        match vote_option {
            VoteOption::For => proposal.for_votes = proposal.for_votes.checked_add(voter_token_amount).unwrap(),
            VoteOption::Against => proposal.against_votes = proposal.against_votes.checked_add(voter_token_amount).unwrap(),
            VoteOption::Abstain => proposal.abstain_votes = proposal.abstain_votes.checked_add(voter_token_amount).unwrap(),
        }

        Ok(())
    }

    pub fn delegate_votes(
        ctx: Context<DelegateVotes>,
        amount: u64,
    ) -> Result<()> {
        let delegation = &mut ctx.accounts.delegation;
        delegation.delegator = ctx.accounts.delegator.key();
        delegation.delegatee = ctx.accounts.delegatee.key();
        delegation.amount = amount;
        delegation.timestamp = Clock::get()?.unix_timestamp;
        delegation.bump = *ctx.bumps.get("delegation").unwrap();
        Ok(())
    }

    pub fn revoke_delegation(
        ctx: Context<RevokeDelegation>,
    ) -> Result<()> {
        let delegation = &mut ctx.accounts.delegation;
        require!(
            delegation.delegator == ctx.accounts.delegator.key(),
            GovernanceError::Unauthorized
        );
        delegation.amount = 0;
        Ok(())
    }

    pub fn update_proposal_status(
        ctx: Context<UpdateProposalStatus>,
        snapshot_outcome: SnapshotOutcome,
    ) -> Result<()> {
        let proposal = &mut ctx.accounts.proposal;
        require!(
            proposal.status == ProposalStatus::Active,
            GovernanceError::ProposalNotActive
        );

        // Verify the oracle's authority
        require!(
            ctx.accounts.oracle_authority.key() == ctx.accounts.dao_config.oracle_authority,
            GovernanceError::Unauthorized
        );

        // Update proposal status based on Snapshot outcome
        proposal.status = match snapshot_outcome {
            SnapshotOutcome::Passed => ProposalStatus::Succeeded,
            SnapshotOutcome::Failed => ProposalStatus::Defeated,
        };

        Ok(())
    }

    pub fn execute_proposal(
        ctx: Context<ExecuteProposal>,
    ) -> Result<()> {
        let proposal = &mut ctx.accounts.proposal;
        require!(
            proposal.status == ProposalStatus::Succeeded,
            GovernanceError::ProposalNotSucceeded
        );

        // Execute each action in the proposal
        for action in &proposal.actions {
            match action {
                ProposedAction::TreasuryTransfer { recipient, amount, token_mint } => {
                    // Execute treasury transfer
                    // This would be implemented in the treasury program
                },
                ProposedAction::UpdateConfig { new_config } => {
                    // Update DAO configuration
                    let dao_config = &mut ctx.accounts.dao_config;
                    dao_config.voting_period = new_config.voting_period;
                    dao_config.quorum_percentage = new_config.quorum_percentage;
                    dao_config.threshold_percentage = new_config.threshold_percentage;
                },
            }
        }

        proposal.status = ProposalStatus::Executed;
        Ok(())
    }
}

#[derive(Accounts)]
pub struct InitializeDao<'info> {
    #[account(
        init,
        payer = authority,
        space = DaoConfig::LEN,
        seeds = [b"dao_config"],
        bump
    )]
    pub dao_config: Account<'info, DaoConfig>,
    
    #[account(mut)]
    pub authority: Signer<'info>,
    
    pub token_mint: Account<'info, token::Mint>,
    
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct CreateProposal<'info> {
    #[account(
        init,
        payer = creator,
        space = Proposal::LEN,
        seeds = [b"proposal", creator.key().as_ref()],
        bump
    )]
    pub proposal: Account<'info, Proposal>,
    
    #[account(
        seeds = [b"dao_config"],
        bump = dao_config.bump,
    )]
    pub dao_config: Account<'info, DaoConfig>,
    
    #[account(mut)]
    pub creator: Signer<'info>,
    
    #[account(
        mut,
        constraint = creator_token_account.owner == creator.key(),
        constraint = creator_token_account.mint == dao_config.token_mint,
    )]
    pub creator_token_account: Account<'info, TokenAccount>,
    
    #[account(
        mut,
        constraint = dao_token_account.owner == dao_config.key(),
        constraint = dao_token_account.mint == dao_config.token_mint,
    )]
    pub dao_token_account: Account<'info, TokenAccount>,
    
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct CastVote<'info> {
    #[account(
        mut,
        seeds = [b"proposal", proposal.creator.as_ref()],
        bump = proposal.bump,
    )]
    pub proposal: Account<'info, Proposal>,
    
    #[account(
        init,
        payer = voter,
        space = VoteRecord::LEN,
        seeds = [b"vote", proposal.key().as_ref(), voter.key().as_ref()],
        bump
    )]
    pub vote_record: Account<'info, VoteRecord>,
    
    #[account(mut)]
    pub voter: Signer<'info>,
    
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct DelegateVotes<'info> {
    #[account(
        init,
        payer = delegator,
        space = Delegation::LEN,
        seeds = [b"delegation", delegator.key().as_ref(), delegatee.key().as_ref()],
        bump
    )]
    pub delegation: Account<'info, Delegation>,
    
    #[account(mut)]
    pub delegator: Signer<'info>,
    
    /// CHECK: This is just a pubkey
    pub delegatee: AccountInfo<'info>,
    
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct RevokeDelegation<'info> {
    #[account(
        mut,
        seeds = [b"delegation", delegator.key().as_ref(), delegation.delegatee.as_ref()],
        bump = delegation.bump,
    )]
    pub delegation: Account<'info, Delegation>,
    
    #[account(mut)]
    pub delegator: Signer<'info>,
}

#[derive(Accounts)]
pub struct UpdateProposalStatus<'info> {
    #[account(
        mut,
        seeds = [b"proposal", proposal.creator.as_ref()],
        bump = proposal.bump,
    )]
    pub proposal: Account<'info, Proposal>,
    
    #[account(
        seeds = [b"dao_config"],
        bump = dao_config.bump,
    )]
    pub dao_config: Account<'info, DaoConfig>,
    
    pub oracle_authority: Signer<'info>,
}

#[derive(Accounts)]
pub struct ExecuteProposal<'info> {
    #[account(
        mut,
        seeds = [b"proposal", proposal.creator.as_ref()],
        bump = proposal.bump,
    )]
    pub proposal: Account<'info, Proposal>,
    
    #[account(
        mut,
        seeds = [b"dao_config"],
        bump = dao_config.bump,
    )]
    pub dao_config: Account<'info, DaoConfig>,
    
    pub executor: Signer<'info>,
}

#[account]
pub struct DaoConfig {
    pub authority: Pubkey,
    pub token_mint: Pubkey,
    pub proposal_fee: u64,
    pub voting_period: i64,
    pub quorum_percentage: u8,
    pub threshold_percentage: u8,
    pub require_poh: bool,
    pub oracle_authority: Pubkey,
    pub bump: u8,
}

impl DaoConfig {
    pub const LEN: usize = 8 + // discriminator
        32 + // authority
        32 + // token_mint
        8 + // proposal_fee
        8 + // voting_period
        1 + // quorum_percentage
        1 + // threshold_percentage
        1 + // require_poh
        32 + // oracle_authority
        1; // bump
}

#[account]
pub struct Proposal {
    pub creator: Pubkey,
    pub title: String,
    pub description: String,
    pub snapshot_id: String,
    pub actions: Vec<ProposedAction>,
    pub creation_time: i64,
    pub voting_start_time: i64,
    pub voting_end_time: i64,
    pub status: ProposalStatus,
    pub for_votes: u64,
    pub against_votes: u64,
    pub abstain_votes: u64,
    pub bump: u8,
}

impl Proposal {
    pub const LEN: usize = 8 + // discriminator
        32 + // creator
        100 + // title (max length)
        500 + // description (max length)
        100 + // snapshot_id (max length)
        1000 + // actions (max size)
        8 + // creation_time
        8 + // voting_start_time
        8 + // voting_end_time
        1 + // status
        8 + // for_votes
        8 + // against_votes
        8 + // abstain_votes
        1; // bump
}

#[account]
pub struct VoteRecord {
    pub proposal: Pubkey,
    pub voter: Pubkey,
    pub vote_option: VoteOption,
    pub token_amount: u64,
    pub timestamp: i64,
    pub bump: u8,
}

impl VoteRecord {
    pub const LEN: usize = 8 + // discriminator
        32 + // proposal
        32 + // voter
        1 + // vote_option
        8 + // token_amount
        8 + // timestamp
        1; // bump
}

#[account]
pub struct Delegation {
    pub delegator: Pubkey,
    pub delegatee: Pubkey,
    pub amount: u64,
    pub timestamp: i64,
    pub bump: u8,
}

impl Delegation {
    pub const LEN: usize = 8 + // discriminator
        32 + // delegator
        32 + // delegatee
        8 + // amount
        8 + // timestamp
        1; // bump
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq, Eq)]
pub enum ProposalStatus {
    Pending,
    Active,
    Succeeded,
    Defeated,
    Executed,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq, Eq)]
pub enum VoteOption {
    For,
    Against,
    Abstain,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub enum ProposedAction {
    TreasuryTransfer {
        recipient: Pubkey,
        amount: u64,
        token_mint: Pubkey,
    },
    UpdateConfig {
        new_config: DaoConfigUpdate,
    },
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct DaoConfigUpdate {
    pub voting_period: i64,
    pub quorum_percentage: u8,
    pub threshold_percentage: u8,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct DaoConfig {
    pub proposal_fee: u64,
    pub voting_period: i64,
    pub quorum_percentage: u8,
    pub threshold_percentage: u8,
    pub require_poh: bool,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub enum SnapshotOutcome {
    Passed,
    Failed,
}

#[error_code]
pub enum GovernanceError {
    #[msg("Proposal is not active")]
    ProposalNotActive,
    #[msg("Proposal has not succeeded")]
    ProposalNotSucceeded,
    #[msg("Not in voting period")]
    NotInVotingPeriod,
    #[msg("Unauthorized")]
    Unauthorized,
} 