CREATE TABLE `users`(
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(255) NOT NULL,
    `lastname` VARCHAR(255) NOT NULL,
    `email` VARCHAR(255) NOT NULL,
    `nickname` VARCHAR(255) NULL,
    `birthday` DATE NULL,
    `whatsapp` BIGINT NULL,
    `sports_complex_id` BIGINT NOT NULL,
    `rol_id` BIGINT NOT NULL,
    `isActive` BOOLEAN NOT NULL
);
ALTER TABLE
    `users` ADD INDEX `users_rol_id_index`(`rol_id`);
CREATE TABLE `roles`(
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(255) NOT NULL,
    `isActive` BOOLEAN NOT NULL
);
CREATE TABLE `categories`(
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(255) NOT NULL,
    `isActive` BIGINT NOT NULL
);
CREATE TABLE `sports_complex`(
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(255) NOT NULL,
    `address` VARCHAR(255) NOT NULL,
    `whatsapp` VARCHAR(255) NOT NULL,
    `location` VARCHAR(255) NOT NULL,
    `courts_number` INT NOT NULL,
    `isActive` BOOLEAN NOT NULL
);
CREATE TABLE `tournaments`(
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `name` BIGINT NOT NULL,
    `start_date` DATE NOT NULL,
    `end_date` DATE NOT NULL,
    `sports_complex_id` BIGINT NOT NULL,
    `isActive` BOOLEAN NOT NULL
);
ALTER TABLE
    `tournaments` ADD INDEX `tournaments_sports_complex_id_index`(`sports_complex_id`);
CREATE TABLE `players`(
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `points` BIGINT NOT NULL,
    `level` INT NOT NULL,
    `position` ENUM('') NOT NULL,
    `user_id` BIGINT NOT NULL,
    `category_id` BIGINT NOT NULL,
    `partner` BIGINT NULL,
    `isActive` BOOLEAN NOT NULL
);
CREATE TABLE `tournament_category`(
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `tournament_id` BIGINT NOT NULL,
    `category_id` BIGINT NOT NULL,
    `registration_fee` FLOAT(53) NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `isActive` BOOLEAN NOT NULL
);
ALTER TABLE
    `tournament_category` ADD INDEX `tournament_category_tournament_id_index`(`tournament_id`);
ALTER TABLE
    `tournament_category` ADD INDEX `tournament_category_category_id_index`(`category_id`);
CREATE TABLE `tournament_registration`(
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `tournament_category_id` BIGINT NOT NULL,
    `player_id` BIGINT NOT NULL,
    `isActive` BOOLEAN NOT NULL,
    `payed` BOOLEAN NOT NULL
);
ALTER TABLE
    `tournament_registration` ADD INDEX `tournament_registration_tournament_category_id_index`(`tournament_category_id`);
ALTER TABLE
    `tournament_registration` ADD INDEX `tournament_registration_player_id_index`(`player_id`);
CREATE TABLE `awards`(
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `tournament_register_id` BIGINT NOT NULL,
    `position` INT NOT NULL,
    `point` INT NOT NULL,
    `comments` VARCHAR(255) NULL,
    `isActive` BOOLEAN NOT NULL
);
ALTER TABLE
    `awards` ADD INDEX `awards_tournament_register_id_index`(`tournament_register_id`);
ALTER TABLE
    `awards` ADD CONSTRAINT `awards_tournament_register_id_foreign` FOREIGN KEY(`tournament_register_id`) REFERENCES `tournament_registration`(`id`);
ALTER TABLE
    `tournament_registration` ADD CONSTRAINT `tournament_registration_player_id_foreign` FOREIGN KEY(`player_id`) REFERENCES `players`(`id`);
ALTER TABLE
    `tournaments` ADD CONSTRAINT `tournaments_sports_complex_id_foreign` FOREIGN KEY(`sports_complex_id`) REFERENCES `sports_complex`(`id`);
ALTER TABLE
    `players` ADD CONSTRAINT `players_category_id_foreign` FOREIGN KEY(`category_id`) REFERENCES `categories`(`id`);
ALTER TABLE
    `tournament_registration` ADD CONSTRAINT `tournament_registration_tournament_category_id_foreign` FOREIGN KEY(`tournament_category_id`) REFERENCES `tournament_category`(`id`);
ALTER TABLE
    `players` ADD CONSTRAINT `players_user_id_foreign` FOREIGN KEY(`user_id`) REFERENCES `users`(`id`);
ALTER TABLE
    `users` ADD CONSTRAINT `users_rol_id_foreign` FOREIGN KEY(`rol_id`) REFERENCES `roles`(`id`);
ALTER TABLE
    `users` ADD CONSTRAINT `users_sports_complex_id_foreign` FOREIGN KEY(`sports_complex_id`) REFERENCES `sports_complex`(`id`);
ALTER TABLE
    `tournament_category` ADD CONSTRAINT `tournament_category_category_id_foreign` FOREIGN KEY(`category_id`) REFERENCES `categories`(`id`);
ALTER TABLE
    `tournament_category` ADD CONSTRAINT `tournament_category_tournament_id_foreign` FOREIGN KEY(`tournament_id`) REFERENCES `tournaments`(`id`);