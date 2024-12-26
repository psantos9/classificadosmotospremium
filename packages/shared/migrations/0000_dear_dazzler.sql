CREATE TABLE `anuncio` (
	`id` text PRIMARY KEY NOT NULL,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL,
	`publishedAt` integer,
	`userId` text NOT NULL,
	`status` text DEFAULT 'draft' NOT NULL,
	`codigoFipe` text NOT NULL,
	`marca` text NOT NULL,
	`modelo` text NOT NULL,
	`anoModelo` integer NOT NULL,
	`ano` integer NOT NULL,
	`placa` text NOT NULL,
	`quilometragem` integer NOT NULL,
	`preco` integer NOT NULL,
	`cor` integer NOT NULL,
	`descricao` text,
	`acessorios` text NOT NULL,
	`fotos` text NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `cadastro`(`id`) ON UPDATE no action ON DELETE cascade,
	CONSTRAINT "anuncioStatus" CHECK(status IN ('draft','to_review','rejected','published','paused','expired'))
);
--> statement-breakpoint
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