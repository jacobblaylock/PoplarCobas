SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE PROCEDURE stprc_ins_test @AccessionId int, @code varchar(30), @result varchar(50)
AS
BEGIN

--Testing
/*
DECLARE @AccessionId int, @code varchar(30), @result varchar(50)
SELECT @AccessionId = 1, @code = '02HPVOHR', @result = 'NEG Other HR HPV'
EXEC stprc_ins_test 1, '02HPVOHR', 'NEG Other HR HPV'
EXEC stprc_ins_test 1, '02HPV16', 'NEG HPV16'
EXEC stprc_ins_test 1, '02HPV18', 'NEG HPV18'
*/

SET NOCOUNT ON
SET TRANSACTION ISOLATION LEVEL READ UNCOMMITTED
SET CONCAT_NULL_YIELDS_NULL OFF

DECLARE @TestId int, @accessionNumber varchar(20), @errorMessage varchar(1000), @errorCode varchar(4), @successMessage varchar(1000)
SELECT @accessionNumber = accessionNumber
FROM Accession
WHERE id = @AccessionId


-- Insert Test
IF NOT EXISTS(SELECT id FROM Test WHERE AccessionId = @AccessionId AND code = @code)
BEGIN
		BEGIN TRANSACTION
		BEGIN TRY
			INSERT INTO Test(AccessionId, Code, Result)
			SELECT @AccessionId, @code, @result
		END TRY
		BEGIN CATCH
			SELECT @errorCode = 'E1',  @errorMessage = 'Insert into "Test" failed on test ' + @code + ' for accesssion ' + @accessionNumber + ' (Id = ' + CAST(@AccessionId AS varchar) + ').  -  ' + ERROR_MESSAGE()
			IF @@TRANCOUNT > 0 ROLLBACK
			GOTO errorSection
		END CATCH
  		IF @@TRANCOUNT > 0 COMMIT
  		SELECT @TestId = @@IDENTITY

		SELECT @successMessage = 'Added row to "Test" for test ' + @code + ' with result ' + @result +  '(Id = ' + CAST(@TestId AS varchar) + ').  Case is ' + @accessionNumber + '(Id = ' + CAST(@AccessionId AS varchar) + ').  '
END ELSE
BEGIN
	SELECT @TestId = id FROM Test WHERE AccessionId = @AccessionId AND code = @code
	SELECT @successMessage = 'Row already exists (Id = ' + CAST(@TestId AS varchar) + ') for test ' + @code + ' for case ' + @accessionNumber + '.'
END

SELECT @successMessage AS message, @TestId AS TestId

RETURN

--ERROR SECTION
errorSection:

SELECT @errorCode + ':  ' + @errorMessage AS message, @TestId AS TestId

END


