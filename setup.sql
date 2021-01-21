CREATE DATABASE rpgbrawl_discord;
USE rpgbrawl_discord;

CREATE TABLE `channel` (
    `guild` varchar(255) PRIMARY KEY,
    `category` varchar(255) NOT NULL,
    `staff` varchar(255) NOT NULL,
    `ta_standings` varchar(255) NOT NULL,
    `linking` varchar(255) NOT NULL
);
CREATE TABLE `admin` (
    `id` int PRIMARY KEY AUTO_INCREMENT,
    `guild` varchar(255) NOT NULL,
    `type` ENUM('role', 'user') NOT NULL,
    `admin` varchar(255) NOT NULL
);
CREATE TABLE `spreadsheet` (
    `guild` varchar(255) PRIMARY KEY,
    `spreadsheet` varchar(255) NOT NULL,
    `name` varchar(255) NOT NULL,
    `range` varchar(255) NOT NULL
);
CREATE TABLE `player` (
    `login` varchar(255) PRIMARY KEY,
    `discord_id` varchar(255) NOT NULL
);
CREATE TABLE `match` (
    `id` int PRIMARY KEY AUTO_INCREMENT,
    `round` varchar(255) NOT NULL,
    `match` varchar(255) NOT NULL,
    `seed1` varchar(255) NOT NULL,
    `seed2` varchar(255) NOT NULL,
    `seed3` varchar(255) NOT NULL,
    `seed4` varchar(255) NOT NULL,
    `category` varchar(255) NOT NULL,
    `channel` varchar(255) NOT NULL
)