CREATE TABLE `credit_pools` (
	`id` int AUTO_INCREMENT NOT NULL,
	`total_liquidity` varchar(78) NOT NULL DEFAULT '0',
	`total_borrowed` varchar(78) NOT NULL DEFAULT '0',
	`base_interest_rate` int NOT NULL DEFAULT 500,
	`utilization_coefficient` int NOT NULL DEFAULT 1000,
	`credit_coefficient` int NOT NULL DEFAULT 500,
	`risk_reserve` varchar(78) NOT NULL DEFAULT '0',
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `credit_pools_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `credit_scores` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`score` int NOT NULL DEFAULT 500,
	`tier` enum('A','B','C','D') NOT NULL DEFAULT 'C',
	`total_loans` int NOT NULL DEFAULT 0,
	`successful_repayments` int NOT NULL DEFAULT 0,
	`defaults` int NOT NULL DEFAULT 0,
	`last_calculated` timestamp NOT NULL DEFAULT (now()),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `credit_scores_id` PRIMARY KEY(`id`),
	CONSTRAINT `credit_scores_user_id_unique` UNIQUE(`user_id`)
);
--> statement-breakpoint
CREATE TABLE `loans` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`pool_id` int NOT NULL DEFAULT 1,
	`amount` varchar(78) NOT NULL,
	`interest_rate` int NOT NULL,
	`duration` int NOT NULL,
	`status` enum('active','repaid','defaulted') NOT NULL DEFAULT 'active',
	`borrowed_at` timestamp NOT NULL DEFAULT (now()),
	`due_date` timestamp NOT NULL,
	`repaid_at` timestamp,
	`repaid_amount` varchar(78) DEFAULT '0',
	`credit_score_at_borrow` int NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `loans_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `lp_positions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`pool_id` int NOT NULL DEFAULT 1,
	`deposited_amount` varchar(78) NOT NULL,
	`lp_tokens` varchar(78) NOT NULL,
	`earned_interest` varchar(78) NOT NULL DEFAULT '0',
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `lp_positions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `transactions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`type` enum('deposit','withdraw','borrow','repay','liquidation') NOT NULL,
	`amount` varchar(78) NOT NULL,
	`related_loan_id` int,
	`related_pool_id` int DEFAULT 1,
	`tx_hash` varchar(66),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `transactions_id` PRIMARY KEY(`id`)
);
