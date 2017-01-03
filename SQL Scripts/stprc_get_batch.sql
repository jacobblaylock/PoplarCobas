USE [CobasDI]
GO

SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE PROCEDURE stprc_get_batch @all char(1) = 'N'
AS
BEGIN

--Testing
/*
DECLARE @all char(1)
SET @all = 'N'
*/

SET NOCOUNT ON
SET TRANSACTION ISOLATION LEVEL READ UNCOMMITTED
SET CONCAT_NULL_YIELDS_NULL OFF

IF @all = 'N'
BEGIN
	SELECT batchNumber, batchRunUser, batchReleaseUser, releaseDate
	FROM Batch
	WHERE releaseDate IS NULL
END ELSE
BEGIN
	SELECT batchNumber, batchRunUser, batchReleaseUser, releaseDate
	FROM Batch
END

RETURN 

END


