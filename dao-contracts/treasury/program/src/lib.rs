use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Transfer};
use anchor_spl::associated_token::AssociatedToken;

declare_id!("Treasury1111111111111111111111111111111111111");

#[program]
pub mod treasury {
    use super::*;

    pub fn initialize_treasury(
        ctx: Context<InitializeTreasury>,
    ) -> Result<()> {
        let treasury = &mut ctx.accounts.treasury;
        treasury.authority = ctx.accounts.authority.key();
        treasury.bump = *ctx.bumps.get("treasury").unwrap();
        Ok(())
    }

    pub fn deposit_funds(
        ctx: Context<DepositFunds>,
        amount: u64,
    ) -> Result<()> {
        // Transfer tokens from depositor to treasury
        token::transfer(
            CpiContext::new(
                ctx.accounts.token_program.to_account_info(),
                Transfer {
                    from: ctx.accounts.depositor_token_account.to_account_info(),
                    to: ctx.accounts.treasury_token_account.to_account_info(),
                    authority: ctx.accounts.depositor.to_account_info(),
                },
            ),
            amount,
        )?;

        Ok(())
    }

    pub fn withdraw_funds(
        ctx: Context<WithdrawFunds>,
        amount: u64,
    ) -> Result<()> {
        // Verify the governance program's authority
        require!(
            ctx.accounts.governance_program.key() == ctx.accounts.treasury.governance_program,
            TreasuryError::Unauthorized
        );

        // Transfer tokens from treasury to recipient
        token::transfer(
            CpiContext::new_with_signer(
                ctx.accounts.token_program.to_account_info(),
                Transfer {
                    from: ctx.accounts.treasury_token_account.to_account_info(),
                    to: ctx.accounts.recipient_token_account.to_account_info(),
                    authority: ctx.accounts.treasury.to_account_info(),
                },
                &[&[
                    b"treasury",
                    ctx.accounts.treasury.authority.as_ref(),
                    &[ctx.accounts.treasury.bump],
                ]],
            ),
            amount,
        )?;

        Ok(())
    }
}

#[derive(Accounts)]
pub struct InitializeTreasury<'info> {
    #[account(
        init,
        payer = authority,
        space = Treasury::LEN,
        seeds = [b"treasury", authority.key().as_ref()],
        bump
    )]
    pub treasury: Account<'info, Treasury>,
    
    #[account(mut)]
    pub authority: Signer<'info>,
    
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct DepositFunds<'info> {
    #[account(
        seeds = [b"treasury", treasury.authority.as_ref()],
        bump = treasury.bump,
    )]
    pub treasury: Account<'info, Treasury>,
    
    #[account(mut)]
    pub depositor: Signer<'info>,
    
    #[account(
        mut,
        constraint = depositor_token_account.owner == depositor.key(),
    )]
    pub depositor_token_account: Account<'info, TokenAccount>,
    
    #[account(
        mut,
        constraint = treasury_token_account.owner == treasury.key(),
        constraint = treasury_token_account.mint == depositor_token_account.mint,
    )]
    pub treasury_token_account: Account<'info, TokenAccount>,
    
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct WithdrawFunds<'info> {
    #[account(
        mut,
        seeds = [b"treasury", treasury.authority.as_ref()],
        bump = treasury.bump,
    )]
    pub treasury: Account<'info, Treasury>,
    
    /// CHECK: This is the governance program that authorized the withdrawal
    pub governance_program: AccountInfo<'info>,
    
    /// CHECK: This is the recipient of the funds
    pub recipient: AccountInfo<'info>,
    
    #[account(
        mut,
        constraint = treasury_token_account.owner == treasury.key(),
    )]
    pub treasury_token_account: Account<'info, TokenAccount>,
    
    #[account(
        mut,
        constraint = recipient_token_account.owner == recipient.key(),
        constraint = recipient_token_account.mint == treasury_token_account.mint,
    )]
    pub recipient_token_account: Account<'info, TokenAccount>,
    
    pub token_program: Program<'info, Token>,
}

#[account]
pub struct Treasury {
    pub authority: Pubkey,
    pub governance_program: Pubkey,
    pub bump: u8,
}

impl Treasury {
    pub const LEN: usize = 8 + // discriminator
        32 + // authority
        32 + // governance_program
        1; // bump
}

#[error_code]
pub enum TreasuryError {
    #[msg("Unauthorized")]
    Unauthorized,
} 