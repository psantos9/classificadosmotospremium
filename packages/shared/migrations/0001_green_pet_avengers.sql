CREATE INDEX `anuncio_marca_idx` ON `anuncio` (`marca`);--> statement-breakpoint
CREATE INDEX `anuncio_status_user_id_idx` ON `anuncio` (`status`,`user_id`);--> statement-breakpoint
CREATE INDEX `anuncio_uf_localidade_idx` ON `anuncio` (`uf`,`localidade`);