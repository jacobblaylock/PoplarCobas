SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE PROCEDURE stprc_get_batch_details @batchNumber varchar(20)
AS
BEGIN

--Testing
/*
DECLARE @batchNumber varchar(20)
SELECT @batchNumber = ''
*/

SET NOCOUNT ON
SET TRANSACTION ISOLATION LEVEL READ UNCOMMITTED
SET CONCAT_NULL_YIELDS_NULL OFF

SELECT batchNumber, batchDateString, batchRunUser, accessionNumber, code, result
FROM Batch b
	JOIN Accession a ON a.BatchId = b.id
	JOIN Test t ON t.AccessionId = a.id
WHERE b.batchNumber = @batchNumber


END


