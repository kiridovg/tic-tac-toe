use near_sdk::borsh::{self, BorshDeserialize, BorshSerialize};
use near_sdk::{near_bindgen, AccountId, Promise};
use near_sdk::collections::{UnorderedMap};
use near_sdk::{env, PanicOnDefault};
use env::log_str;

type Money = u128;

#[derive(BorshDeserialize, BorshSerialize)]
pub struct GameState {
    pub is_win: bool,
    pub bid: Money,
}

#[near_bindgen]
#[derive(BorshDeserialize, BorshSerialize, PanicOnDefault)]
pub struct Game {
    pub game_bid: UnorderedMap<AccountId, Money>,
    pub bids_all_users: UnorderedMap<AccountId, GameState>,
}

impl GameState {
    pub fn new(is_win: &bool, bid: &Money) -> Self {
        Self {
            is_win: *is_win,
            bid: *bid,
        }
    }
}

#[near_bindgen]
impl Game {

    #[init]
    pub fn new() -> Self {
        Self {
            game_bid: UnorderedMap::new(b"game_bid".to_vec()),
            bids_all_users: UnorderedMap::new(b"bids_all_users".to_vec()),
        }
    }

    #[payable]
    pub fn make_bid(&mut self) {
        assert!(!self.is_bid_made(), "You have already made a bid, start the game.");

        self.game_bid.insert(
            &env::current_account_id(),
            &env::attached_deposit(),
        );
    }

    pub fn double_bit_refund(&mut self) {
        if self.is_bid_made() {
            Promise::new(env::predecessor_account_id()).transfer(self.get_bid() * 2);

            let log_message = format!("User: {}, Double bit refund: {}", env::predecessor_account_id(), self.get_bid() * 2);
            env::log(log_message.as_bytes());

            self.game_bid.remove(&env::current_account_id());
        }
    }

    pub fn delete_bit(&mut self) {
        assert!(self.is_bid_made(), "You don't have a bid.");

        self.items_and_bids.insert(
            &env::current_account_id(),
            &GameState::new(false, &env::attached_deposit()),
        );

        self.game_bid.remove(&env::current_account_id());
    }

    pub fn get_bid(&self) -> Money {
        match self.game_bid.get(&env::current_account_id()) {
            Some(value) => value.clone(),
            None => 0
        }
    }

    pub fn is_bid_made(&self) -> bool {
        match self.game_bid.get(&env::current_account_id()) {
            Some(value) => true,
            None => false,
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn make_bid() {

        let mut game = Game::new();

        game.game_bid.insert(
            &env::current_account_id(),
            &env::attached_deposit(),
        );

        assert_eq!(game.game_bid.get(&env::current_account_id()).unwrap_or_default(), env::attached_deposit());
    }

    #[test]
    fn make_bid_use_method() {

        let mut game = Game::new();

        game.make_bid();

        assert_eq!(game.get_bid(), env::attached_deposit());
    }

    #[test]
    fn remove_bid() {

        let mut game = Game::new();

        game.make_bid();

        assert_eq!(game.get_bid(), env::attached_deposit());

        game.delete_bit();

        assert_eq!(game.is_bid_made(), false);
    }

    #[test]
    fn double_bit_refund() {

        let mut game = Game::new();

        game.make_bid();

        assert_eq!(game.get_bid(), env::attached_deposit());

        game.double_bit_refund();

        assert_eq!(game.is_bid_made(), false);
    }
}