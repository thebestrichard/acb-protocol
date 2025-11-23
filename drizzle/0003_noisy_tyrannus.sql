CREATE TABLE `nft_mints` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`token_id` int NOT NULL,
	`nullifier_hash` varchar(256) NOT NULL,
	`credit_score` int NOT NULL,
	`tier` varchar(10) NOT NULL,
	`minted_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `nft_mints_id` PRIMARY KEY(`id`)
);
