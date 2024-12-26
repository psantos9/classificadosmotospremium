PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_anuncio` (
	`id` text PRIMARY KEY NOT NULL,
	`createdAt` integer NOT NULL,
	`updatedAt` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`publishedAt` integer,
	`userId` text NOT NULL,
	`status` text DEFAULT 'draft' NOT NULL,
	`codigoFipe` text NOT NULL,
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
INSERT INTO `__new_anuncio`("id", "createdAt", "updatedAt", "publishedAt", "userId", "status", "codigoFipe", "anoModelo", "ano", "placa", "quilometragem", "preco", "cor", "descricao", "acessorios", "fotos") SELECT "id", "createdAt", "updatedAt", "publishedAt", "userId", "status", "codigoFipe", "anoModelo", "ano", "placa", "quilometragem", "preco", "cor", "descricao", "acessorios", "fotos" FROM `anuncio`;--> statement-breakpoint
DROP TABLE `anuncio`;--> statement-breakpoint
ALTER TABLE `__new_anuncio` RENAME TO `anuncio`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE TABLE `__new_cadastro` (
	`id` text PRIMARY KEY NOT NULL,
	`createdAt` integer NOT NULL,
	`updatedAt` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
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
INSERT INTO `__new_cadastro`("id", "createdAt", "updatedAt", "cpfCnpj", "nomeRazaoSocial", "nomeFantasia", "dataNascimento", "email", "emailValidado", "celular", "cep", "logradouro", "complemento", "numero", "bairro", "localidade", "uf", "superadmin", "password") SELECT "id", "createdAt", "updatedAt", "cpfCnpj", "nomeRazaoSocial", "nomeFantasia", "dataNascimento", "email", "emailValidado", "celular", "cep", "logradouro", "complemento", "numero", "bairro", "localidade", "uf", "superadmin", "password" FROM `cadastro`;--> statement-breakpoint
DROP TABLE `cadastro`;--> statement-breakpoint
ALTER TABLE `__new_cadastro` RENAME TO `cadastro`;--> statement-breakpoint
CREATE UNIQUE INDEX `cadastro_cpfCnpj_unique` ON `cadastro` (`cpfCnpj`);--> statement-breakpoint
CREATE UNIQUE INDEX `cadastro_email_unique` ON `cadastro` (`email`);