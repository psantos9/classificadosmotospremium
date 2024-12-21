CREATE TABLE `cadastro` (
	`id` text PRIMARY KEY NOT NULL,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL,
	`cpfCnpj` text NOT NULL,
	`nomeRazaoSocial` text NOT NULL,
	`nomeFantasia` text,
	`dataNascimento` text,
	`email` text NOT NULL,
	`emailValidado` integer DEFAULT false,
	`celular` text NOT NULL,
	`cep` text NOT NULL,
	`logradouro` text NOT NULL,
	`complemento` text NOT NULL,
	`numero` text,
	`bairro` text NOT NULL,
	`localidade` text NOT NULL,
	`uf` text(2) NOT NULL,
	`superadmin` integer DEFAULT false,
	`password` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `cadastro_cpfCnpj_unique` ON `cadastro` (`cpfCnpj`);--> statement-breakpoint
CREATE UNIQUE INDEX `cadastro_email_unique` ON `cadastro` (`email`);