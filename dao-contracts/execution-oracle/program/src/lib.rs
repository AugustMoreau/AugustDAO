use anchor_lang::prelude::*;

declare_id!("Oracle1111111111111111111111111111111111111");

#[program]
pub mod execution_oracle {
    use super::*;

    pub fn initialize_oracle(
        ctx: Context<InitializeOracle>,
    ) -> Result<()> {
        let oracle = &mut ctx.accounts.oracle;
        oracle.authority = ctx.accounts.authority.key();
        oracle.governance_program = ctx.accounts.governance_program.key();
        oracle.bump = *ctx.bumps.get("oracle").unwrap();
        Ok(())
    }

    pub fn verify_snapshot_vote(
        ctx: Context<VerifySnapshotVote>,
        snapshot_id: String,
        outcome: SnapshotOutcome,
        signature: Vec<u8>,
    ) -> Result<()> {
        // Verify the oracle's authority
        require!(
            ctx.accounts.oracle.authority == ctx.accounts.verifier.key(),
            OracleError::Unauthorized
        );

        // Verify the signature (this would be implemented with actual signature verification)
        // For now, we'll just check that the signature is not empty
        require!(!signature.is_empty(), OracleError::InvalidSignature);

        // Call the governance program to update the proposal status
        let cpi_accounts = governance::cpi::accounts::UpdateProposalStatus {
            proposal: ctx.accounts.proposal.to_account_info(),
            dao_config: ctx.accounts.dao_config.to_account_info(),
            oracle_authority: ctx.accounts.verifier.to_account_info(),
        };

        let cpi_program = ctx.accounts.governance_program.to_account_info();
        let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);

        governance::cpi::update_proposal_status(cpi_ctx, outcome)?;

        Ok(())
    }
}

#[derive(Accounts)]
pub struct InitializeOracle<'info> {
    #[account(
        init,
        payer = authority,
        space = Oracle::LEN,
        seeds = [b"oracle"],
        bump
    )]
    pub oracle: Account<'info, Oracle>,
    
    #[account(mut)]
    pub authority: Signer<'info>,
    
    /// CHECK: This is the governance program that will be called
    pub governance_program: AccountInfo<'info>,
    
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct VerifySnapshotVote<'info> {
    #[account(
        seeds = [b"oracle"],
        bump = oracle.bump,
    )]
    pub oracle: Account<'info, Oracle>,
    
    #[account(mut)]
    pub verifier: Signer<'info>,
    
    /// CHECK: This is the proposal account that will be updated
    pub proposal: AccountInfo<'info>,
    
    /// CHECK: This is the DAO config account
    pub dao_config: AccountInfo<'info>,
    
    /// CHECK: This is the governance program that will be called
    pub governance_program: AccountInfo<'info>,
}

#[account]
pub struct Oracle {
    pub authority: Pubkey,
    pub governance_program: Pubkey,
    pub bump: u8,
}

impl Oracle {
    pub const LEN: usize = 8 + // discriminator
        32 + // authority
        32 + // governance_program
        1; // bump
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub enum SnapshotOutcome {
    Passed,
    Failed,
}

#[error_code]
pub enum OracleError {
    #[msg("Unauthorized")]
    Unauthorized,
    #[msg("Invalid signature")]
    InvalidSignature,
} 