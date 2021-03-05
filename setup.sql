CREATE TYPE  adminenum AS ENUM('role', 'user');
CREATE TABLE channel (
    guild varchar(90) PRIMARY KEY,
    category varchar(90) NOT NULL,
    help varchar(90) NOT NULL,
    staff varchar(90) NOT NULL,
    ta_standings varchar(90) NOT NULL,
    linking varchar(90) NOT NULL
);
CREATE TABLE admin (
    guild varchar(90) NOT NULL,
    type adminenum NOT NULL,
    admin varchar(90) NOT NULL,
    PRIMARY KEY(guild, admin)
);
CREATE TABLE spreadsheet (
    guild varchar(90) NOT NULL,
    spreadsheet varchar(255) NOT NULL,
    name varchar(90) NOT NULL,
    range varchar(90) NOT NULL,
    PRIMARY KEY(guild, name)
);
CREATE TABLE player (
    guild varchar(90) NOT NULL,
    login varchar(90) NOT NULL,
    discord_id varchar(90) NOT NULL,
    PRIMARY KEY(guild, login)
);
CREATE TABLE match (
    guild varchar(90) PRIMARY KEY,
    match varchar(90) NOT NULL,
    round varchar(90) NOT NULL,
    seed1 varchar(90) NOT NULL,
    seed2 varchar(90) NOT NULL,
    seed3 varchar(90) NOT NULL,
    seed4 varchar(90) NOT NULL,
    role varchar(90) NOT NULL,
    channel varchar(90) NOT NULL
)
