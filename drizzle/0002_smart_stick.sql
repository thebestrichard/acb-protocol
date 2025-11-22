CREATE TABLE `borrowOrders` (
	`id` int AUTO_INCREMENT NOT NULL,
	`orderId` varchar(64) NOT NULL,
	`borrower` varchar(42) NOT NULL,
	`amount` varchar(64) NOT NULL,
	`maxInterestRate` int NOT NULL,
	`duration` int NOT NULL,
	`creditScore` int NOT NULL,
	`status` enum('pending','matched','cancelled','expired') NOT NULL DEFAULT 'pending',
	`txHash` varchar(66),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `borrowOrders_id` PRIMARY KEY(`id`),
	CONSTRAINT `borrowOrders_orderId_unique` UNIQUE(`orderId`)
);
--> statement-breakpoint
CREATE TABLE `lendOrders` (
	`id` int AUTO_INCREMENT NOT NULL,
	`orderId` varchar(64) NOT NULL,
	`lender` varchar(42) NOT NULL,
	`amount` varchar(64) NOT NULL,
	`minInterestRate` int NOT NULL,
	`minCreditScore` int NOT NULL,
	`status` enum('pending','matched','cancelled','withdrawn') NOT NULL DEFAULT 'pending',
	`txHash` varchar(66),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `lendOrders_id` PRIMARY KEY(`id`),
	CONSTRAINT `lendOrders_orderId_unique` UNIQUE(`orderId`)
);
--> statement-breakpoint
CREATE TABLE `matchRecords` (
	`id` int AUTO_INCREMENT NOT NULL,
	`matchId` varchar(64) NOT NULL,
	`borrowOrderId` varchar(64) NOT NULL,
	`lendOrderId` varchar(64) NOT NULL,
	`borrower` varchar(42) NOT NULL,
	`lender` varchar(42) NOT NULL,
	`amount` varchar(64) NOT NULL,
	`interestRate` int NOT NULL,
	`duration` int NOT NULL,
	`matchedAt` timestamp NOT NULL,
	`dueDate` timestamp NOT NULL,
	`settledAt` timestamp,
	`status` enum('active','settled','defaulted') NOT NULL DEFAULT 'active',
	`matchingProof` varchar(66) NOT NULL,
	`txHash` varchar(66),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `matchRecords_id` PRIMARY KEY(`id`),
	CONSTRAINT `matchRecords_matchId_unique` UNIQUE(`matchId`)
);
