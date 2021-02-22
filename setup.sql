CREATE DATABASE rpgbrawl_discord;
USE rpgbrawl_discord;

CREATE TABLE `channel` (
    `guild` varchar(255) PRIMARY KEY,
    `category` varchar(255) NOT NULL,
    `help` varchar(255) NOT NULL,
    `staff` varchar(255) NOT NULL,
    `ta-standings` varchar(255) NOT NULL,
    `linking` varchar(255) NOT NULL
) CHARACTER SET 'utf8mb4' COLLATE 'utf8mb4_unicode_ci';
CREATE TABLE `admin` (
    `guild` varchar(255) NOT NULL,
    `type` ENUM('role', 'user') NOT NULL,
    `admin` varchar(255) NOT NULL,
    PRIMARY KEY(guild, admin)
) CHARACTER SET 'utf8mb4' COLLATE 'utf8mb4_unicode_ci';
CREATE TABLE `spreadsheet` (
    `guild` varchar(255) NOT NULL,
    `spreadsheet` varchar(255) NOT NULL,
    `name` varchar(255) NOT NULL,
    `range` varchar(255) NOT NULL,
    PRIMARY KEY(guild, name)
) CHARACTER SET 'utf8mb4' COLLATE 'utf8mb4_unicode_ci';
CREATE TABLE `player` (
    `guild` varchar(255) NOT NULL,
    `login` varchar(255) NOT NULL,
    `discord_id` varchar(255) NOT NULL,
    PRIMARY KEY(guild, login)
) CHARACTER SET 'utf8mb4' COLLATE 'utf8mb4_unicode_ci';
CREATE TABLE `match` (
    `guild` varchar(255) PRIMARY KEY,
    `match` varchar(255) NOT NULL,
    `round` varchar(255) NOT NULL,
    `seed1` varchar(255) NOT NULL,
    `seed2` varchar(255) NOT NULL,
    `seed3` varchar(255) NOT NULL,
    `seed4` varchar(255) NOT NULL,
    `role` varchar(255) NOT NULL,
    `channel` varchar(255) NOT NULL
) CHARACTER SET 'utf8mb4' COLLATE 'utf8mb4_unicode_ci'