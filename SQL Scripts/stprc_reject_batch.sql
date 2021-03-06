/****** Object:  StoredProcedure [dbo].[stprc_reject_batch]    Script Date: 1/12/2017 1:24:05 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE PROCEDURE [dbo].[stprc_reject_batch] @batchNumber varchar(20), @batchReleaseUser varchar(30)
AS
BEGIN

--Testing
/*
DECLARE @batchNumber varchar(20), @batchReleaseUser varchar(30)
SELECT @batchNumber = '19010101120000', @batchReleaseUser = 'jblaylock'
EXEC stprc_reject_batch @batchNumber, @batchReleaseUser
*/

SET NOCOUNT ON
SET TRANSACTION ISOLATION LEVEL READ UNCOMMITTED
SET CONCAT_NULL_YIELDS_NULL OFF

DECLARE @BatchId int, @errorMessage varchar(1000), @errorCode varchar(4), @successMessage varchar(1000), @releaseStatus varchar(15), @prevReleaseUser varchar(30), @batchDateString varchar(20)

SELECT @BatchId = id, @releaseStatus = releaseStatus, @prevReleaseUser = batchReleaseUser, @batchDateString = batchDateString
FROM Batch
WHERE batchNumber = @batchNumber

IF @BatchId IS NULL
BEGIN
	SELECT @errorCode = 'E1',  @errorMessage = 'Update to Batch failed.  Batch ' + @batchDateString + ' was not found.'
	GOTO errorSection
END ELSE IF @releaseStatus IS NOT NULL
BEGIN
	SELECT @errorCode = 'E2',  @errorMessage = 'Update to Batch failed.  Batch ' + @batchDateString + ' (Id = ' + CAST(@BatchId AS varchar) + ') has already been reviewed and ' + @releaseStatus + ' by user ' + @prevReleaseUser + '.'
	GOTO errorSection
END ELSE
BEGIN
	BEGIN TRANSACTION
	BEGIN TRY
		UPDATE Batch
		SET batchReleaseUser = @batchReleaseUser, releaseDate = GETDATE(), releaseStatus = 'REJECTED'
		WHERE id = @BatchId
	END TRY
	BEGIN CATCH
		SELECT @errorCode = 'E3',  @errorMessage = 'Update to Batch failed for batch ' + @batchDateString + ' (Id = ' + CAST(@BatchId AS varchar) + ').  -  ' + ERROR_MESSAGE()
	END CATCH
 	IF @@TRANCOUNT > 0 COMMIT
	SELECT @successMessage = 'Batch ' + @batchDateString + ' (Id = ' + CAST(@BatchId AS varchar) + ') has been marked as rejected by user ' + @batchReleaseUser + '.'
END

SELECT @successMessage AS message

RETURN

--ERROR SECTION
errorSection:

SELECT @errorCode + ':  ' + @errorMessage AS message

END


