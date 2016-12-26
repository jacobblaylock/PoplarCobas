USE CobasDI
GO

SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

SET ANSI_PADDING ON
GO

CREATE TABLE Batch(
	id int IDENTITY(1,1) NOT NULL,
	batchNumber varchar(20) NOT NULL,
	batchRunUser varchar(30) NOT NULL,
	batchReleaseUser varchar(30) NULL,
	releaseDate datetime NULL
) ON PRIMARY

CREATE TABLE Accession(
	id int IDENTITY(1,1) NOT NULL,
	BatchId int NOT NULL,
	accessionNumber varchar(20) NOT NULL
) ON PRIMARY

CREATE TABLE Test(
	id int IDENTITY(1,1) NOT NULL,
	AccessionId int NOT NULL,
	code varchar(20) NOT NULL,
	result varchar(50) NOT NULL
) ON PRIMARY

GO

SET ANSI_PADDING OFF
GO


