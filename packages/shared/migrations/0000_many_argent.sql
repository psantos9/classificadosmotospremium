CREATE TABLE `acessorio` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`label` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `anuncio` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`expires_at` integer,
	`published_at` integer,
	`user_id` integer NOT NULL,
	`status` text DEFAULT 'draft' NOT NULL,
	`revision` integer NOT NULL,
	`codigo_fipe` text NOT NULL,
	`marca` text NOT NULL,
	`modelo` text NOT NULL,
	`ano_modelo` integer NOT NULL,
	`ano` integer NOT NULL,
	`placa` text NOT NULL,
	`quilometragem` integer NOT NULL,
	`preco` integer NOT NULL,
	`cor` integer NOT NULL,
	`descricao` text,
	`informacoes_adicionais` text NOT NULL,
	`acessorios` text NOT NULL,
	`fotos` text NOT NULL,
	`cep` text NOT NULL,
	`localidade` text NOT NULL,
	`uf` text(2) NOT NULL,
	`atualizacao` text,
	`review_workflow_id` text,
	FOREIGN KEY (`user_id`) REFERENCES `usuario`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`cor`) REFERENCES `cor`(`id`) ON UPDATE no action ON DELETE restrict,
	CONSTRAINT "anuncioStatus" CHECK(status IN ('draft','rejected','published','paused','expired','finished','archived'))
);
--> statement-breakpoint
CREATE TABLE `cor` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`label` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `informacao_adicional` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`label` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `usuario` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`locked` integer,
	`cpf_cnpj` text NOT NULL,
	`nome_razao_social` text NOT NULL,
	`nome_fantasia` text,
	`data_nascimento` text,
	`email` text NOT NULL,
	`email_validado` integer DEFAULT false,
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
CREATE UNIQUE INDEX `usuario_cpfCnpj_unique` ON `usuario` (`cpf_cnpj`);--> statement-breakpoint
CREATE UNIQUE INDEX `usuario_email_unique` ON `usuario` (`email`);