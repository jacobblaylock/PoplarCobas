USE [CobasDI]
GO

SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE PROCEDURE stprc_get_batch @releaseStatus varchar(15) = NULL
AS
BEGIN

--Testing
/*
DECLARE @releaseStatus char(1)
SET @releaseStatus = 'REJECTED'
*/

SET NOCOUNT ON
SET TRANSACTION ISOLATION LEVEL READ UNCOMMITTED
SET CONCAT_NULL_YIELDS_NULL OFF

IF @releaseStatus IS NOT NULL AND @releaseStatus NOT IN ('ALL', 'RELEASED', 'REJECTED')
BEGIN
	SET @releaseStatus = NULL
END

IF @releaseStatus = 'ALL'
BEGIN
	SELECT batchNumber, batchRunUser, batchReleaseUser, releaseDate
	FROM Batch
END ELSE
BEGIN
	SELECT batchNumber, batchRunUser, batchReleaseUser, releaseDate
	FROM Batch
	WHERE releaseStatus = @releaseStatus
END

END


