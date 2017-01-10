CREATE TABLE Batch(
	id int IDENTITY(1,1) PRIMARY KEY,
	batchNumber varchar(20) NOT NULL UNIQUE,
	batchRunUser varchar(30) NOT NULL,
	batchReleaseUser varchar(30) NULL,
	releaseDate datetime NULL,
	releaseStatus varchar(15) NULL
)

CREATE TABLE Accession(
	id int IDENTITY(1,1) PRIMARY KEY,
	BatchId int FOREIGN KEY REFERENCES Batch(id),
	accessionNumber varchar(20) NOT NULL
)

CREATE TABLE Test(
	id int IDENTITY(1,1) PRIMARY KEY,
	AccessionId int FOREIGN KEY REFERENCES Accession(id),
	code varchar(20) NOT NULL,
	result varchar(50) NOT NULL
	CONSTRAINT UQ_test UNIQUE (AccessionId, code, result)
)


