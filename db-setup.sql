BEGIN TRANSACTION;
CREATE TABLE "Words" (
	`Word`	TEXT,
	`ID`	INTEGER,
	`Frequency`	INTEGER,
	`EndFrequency`	INTEGER,
	`StartFrequency`	INTEGER,
	PRIMARY KEY(`ID`)
);
CREATE TABLE `Urls` (
	`URL`	TEXT,
	PRIMARY KEY(`URL`)
);
CREATE TABLE "IDs" (
	`WordID`	INTEGER,
	`FollowingWordID1`	INTEGER,
	`FollowingWordID2`	INTEGER,
	`FollowingWordID3`	INTEGER,
	`TrailingWordID1`	INTEGER,
	`TrailingWordID2`	INTEGER,
	`TrailingWordID3`	INTEGER,
	`RecordID`	INTEGER,
	PRIMARY KEY(`RecordID`)
);
CREATE TABLE `Commands` (
	`Command`	TEXT,
	`Response`	TEXT,
	PRIMARY KEY(`Command`)
);
COMMIT;
