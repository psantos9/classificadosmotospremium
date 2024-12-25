PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_anuncio` (
	`id` text PRIMARY KEY NOT NULL,
	`createdAt` integer DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`updatedAt` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`userId` text NOT NULL,
	`status` text DEFAULT 'draft' NOT NULL,
	`codigoFipe` text NOT NULL,
	`anoModelo` integer NOT NULL,
	`ano` integer NOT NULL,
	`quilometragem` integer NOT NULL,
	`preco` integer NOT NULL,
	`cor` integer NOT NULL,
	`descricao` text,
	`acessorios` text NOT NULL,
	`fotos` text NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `cadastro`(`id`) ON UPDATE no action ON DELETE cascade,
	CONSTRAINT "anuncioStatus" CHECK(status IN ('draft','to_review','rejected','published','finalized'))
);
--> statement-breakpoint
INSERT INTO `__new_anuncio`("id", "createdAt", "updatedAt", "userId", "status", "codigoFipe", "anoModelo", "ano", "quilometragem", "preco", "cor", "descricao", "acessorios", "fotos") SELECT "id", "createdAt", "updatedAt", "userId", "status", "codigoFipe", "anoModelo", "ano", "quilometragem", "preco", "cor", "descricao", "acessorios", "fotos" FROM `anuncio`;--> statement-breakpoint
DROP TABLE `anuncio`;--> statement-breakpoint
ALTER TABLE `__new_anuncio` RENAME TO `anuncio`;--> statement-breakpoint
PRAGMA foreign_keys=ON;