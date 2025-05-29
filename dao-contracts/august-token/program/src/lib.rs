use anchor_lang::prelude::*;
use anchor_spl::token::{self, Mint, Token, TokenAccount};
use anchor_spl::associated_token::AssociatedToken;

declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");

#[program]
pub mod august_token {
    use super::*;

    pub fn initialize_token(
        ctx: Context<InitializeToken>,
        name: String,
        symbol: String,
        decimals: u8,
        initial_supply: u64,
    ) -> Result<()> {
        let token_config = &mut ctx.accounts.token_config;
        token_config.authority = ctx.accounts.authority.key();
        token_config.mint = ctx.accounts.mint.key();
        token_config.name = name;
        token_config.symbol = symbol;
        token_config.decimals = decimals;
        token_config.total_supply = initial_supply;
        token_config.bump = *ctx.bumps.get("token_config").unwrap();

        // Mint initial supply to the treasury
        token::mint_to(
            CpiContext::new(
                ctx.accounts.token_program.to_account_info(),
                token::MintTo {
                    mint: ctx.accounts.mint.to_account_info(),
                    to: ctx.accounts.treasury_token_account.to_account_info(),
                    authority: ctx.accounts.authority.to_account_info(),
                },
            ),
            initial_supply,
        )?;

        Ok(())
    }

    pub fn mint_tokens(
        ctx: Context<MintTokens>,
        amount: u64,
    ) -> Result<()> {
        // Verify the authority
        require!(
            ctx.accounts.token_config.authority == ctx.accounts.authority.key(),
            TokenError::Unauthorized
        );

        // Mint tokens to the recipient
        token::mint_to(
            CpiContext::new(
                ctx.accounts.token_program.to_account_info(),
                token::MintTo {
                    mint: ctx.accounts.mint.to_account_info(),
                    to: ctx.accounts.recipient_token_account.to_account_info(),
                    authority: ctx.accounts.authority.to_account_info(),
                },
            ),
            amount,
        )?;

        // Update total supply
        ctx.accounts.token_config.total_supply = ctx.accounts.token_config.total_supply.checked_add(amount).unwrap();

        Ok(())
    }

    pub fn burn_tokens(
        ctx: Context<BurnTokens>,
        amount: u64,
    ) -> Result<()> {
        // Burn tokens from the holder
        token::burn(
            CpiContext::new(
                ctx.accounts.token_program.to_account_info(),
                token::Burn {
                    mint: ctx.accounts.mint.to_account_info(),
                    from: ctx.accounts.holder_token_account.to_account_info(),
                    authority: ctx.accounts.holder.to_account_info(),
                },
            ),
            amount,
        )?;

        // Update total supply
        ctx.accounts.token_config.total_supply = ctx.accounts.token_config.total_supply.checked_sub(amount).unwrap();

        Ok(())
    }
}

#[derive(Accounts)]
pub struct InitializeToken<'info> {
    #[account(
        init,
        payer = authority,
        space = TokenConfig::LEN,
        seeds = [b"token_config"],
        bump
    )]
    pub token_config: Account<'info, TokenConfig>,
    
    #[account(
        init,
        payer = authority,
        mint::decimals = 9,
        mint::authority = authority,
    )]
    pub mint: Account<'info, Mint>,
    
    #[account(
        init,
        payer = authority,
        associated_token::mint = mint,
        associated_token::authority = treasury,
    )]
    pub treasury_token_account: Account<'info, TokenAccount>,
    
    /// CHECK: This is the treasury account
    pub treasury: AccountInfo<'info>,
    
    #[account(mut)]
    pub authority: Signer<'info>,
    
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
pub struct MintTokens<'info> {
    #[account(
        mut,
        seeds = [b"token_config"],
        bump = token_config.bump,
    )]
    pub token_config: Account<'info, TokenConfig>,
    
    #[account(
        mut,
        constraint = mint.key() == token_config.mint,
    )]
    pub mint: Account<'info, Mint>,
    
    #[account(
        mut,
        constraint = recipient_token_account.owner == recipient.key(),
        constraint = recipient_token_account.mint == mint.key(),
    )]
    pub recipient_token_account: Account<'info, TokenAccount>,
    
    /// CHECK: This is the recipient account
    pub recipient: AccountInfo<'info>,
    
    #[account(mut)]
    pub authority: Signer<'info>,
    
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct BurnTokens<'info> {
    #[account(
        mut,
        seeds = [b"token_config"],
        bump = token_config.bump,
    )]
    pub token_config: Account<'info, TokenConfig>,
    
    #[account(
        mut,
        constraint = mint.key() == token_config.mint,
    )]
    pub mint: Account<'info, Mint>,
    
    #[account(
        mut,
        constraint = holder_token_account.owner == holder.key(),
        constraint = holder_token_account.mint == mint.key(),
    )]
    pub holder_token_account: Account<'info, TokenAccount>,
    
    #[account(mut)]
    pub holder: Signer<'info>,
    
    pub token_program: Program<'info, Token>,
}

#[account]
pub struct TokenConfig {
    pub authority: Pubkey,
    pub mint: Pubkey,
    pub name: String,
    pub symbol: String,
    pub decimals: u8,
    pub total_supply: u64,
    pub bump: u8,
}

impl TokenConfig {
    pub const LEN: usize = 8 + // discriminator
        32 + // authority
        32 + // mint
        100 + // name (max length)
        10 + // symbol (max length)
        1 + // decimals
        8 + // total_supply
        1; // bump
}

#[error_code]
pub enum TokenError {
    #[msg("Unauthorized")]
    Unauthorized,
} 