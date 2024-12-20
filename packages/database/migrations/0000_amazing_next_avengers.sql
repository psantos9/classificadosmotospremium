CREATE TABLE `cadastro` (
	`id` text PRIMARY KEY NOT NULL,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL,
	`cpfCnpj` text NOT NULL,
	`nomeRazaoSocial` text NOT NULL,
	`email` text NOT NULL,
	`celular` text NOT NULL,
	`cep` text NOT NULL,
	`logradouro` text NOT NULL,
	`complemento` text NOT NULL,
	`numero` text,
	`bairro` text NOT NULL,
	`cidade` text NOT NULL,
	`estado` text NOT NULL,
	`superadmin` integer DEFAULT false,
	`password` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `cadastro_email_unique` ON `cadastro` (`email`);