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
	`aceita_troca` integer,
	`cor` text NOT NULL,
	`descricao` text,
	`informacoes_adicionais` text NOT NULL,
	`acessorios` text NOT NULL,
	`fotos` text NOT NULL,
	`cep` text NOT NULL,
	`localidade` text NOT NULL,
	`uf` text(2) NOT NULL,
	`location` text,
	`pj` integer,
	`atualizacao` text,
	`review_workflow_id` text,
	FOREIGN KEY (`user_id`) REFERENCES `usuario`(`id`) ON UPDATE no action ON DELETE cascade,
	CONSTRAINT "anuncioStatus" CHECK(status IN ('draft','rejected','published','paused','expired','finished','archived'))
);
--> statement-breakpoint
CREATE TABLE `mensagem` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`created_at` integer NOT NULL,
	`unread` integer NOT NULL,
	`thread_id` text NOT NULL,
	`recipient_id` integer,
	`recipient_email` text,
	`ad_id` integer NOT NULL,
	`sender_id` integer,
	`unauthenticated_sender` text,
	`content` text NOT NULL,
	FOREIGN KEY (`recipient_id`) REFERENCES `usuario`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`ad_id`) REFERENCES `anuncio`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`sender_id`) REFERENCES `usuario`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `ad_sender_idx` ON `mensagem` (`ad_id`,`sender_id`);--> statement-breakpoint
CREATE INDEX `thread_idx` ON `mensagem` (`recipient_id`,`thread_id`);--> statement-breakpoint
CREATE TABLE `usuario` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`locked` integer,
	`is_cnpj` integer NOT NULL,
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
	`location` text,
	`superadmin` integer DEFAULT false,
	`password` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `usuario_cpfCnpj_unique` ON `usuario` (`cpf_cnpj`);--> statement-breakpoint
CREATE UNIQUE INDEX `usuario_email_unique` ON `usuario` (`email`);