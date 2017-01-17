USE [Summit-ProdBeta]
GO
/****** Object:  StoredProcedure [dbo].[stprc_peak_ins_di_rslt_summit]    Script Date: 1/16/2017 11:40:06 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE PROCEDURE [dbo].[stprc_peak_ins_di_rslt_summit] @BatchId int, @barcode varchar(20), @testCode varchar(30), @result varchar(255), @personnelLogin varchar(30)
AS
BEGIN

SET NOCOUNT ON
SET TRANSACTION ISOLATION LEVEL READ UNCOMMITTED
SET CONCAT_NULL_YIELDS_NULL OFF

DECLARE @personnelId int, @PersonnelUri varchar(255), @caseId int, @CaseUri varchar(255), @Task_Id int, @Step_Id int, @StepUri varchar(255),
		@ResultTypeId int, @ResultTypeUri varchar(255), @SampleUri varchar(255), @Result_Id int, @ObsTypeId int, @ObsTypeUri varchar(255),
		@resultRowInsId int, @obsRowInsId int, @taskFinalizedId int, @Obs_Id int,
		@errorMessage varchar(max), @errorCode varchar(4), @alertSent datetime

/*******Error Code Legend*********
L - For logging purposes only.
A - Should trigger alert to Poplar.
E - Database or technical error. Should trigger alert to Peak.
*/

DECLARE @okayToFinalize char(1), @ParentTaskId int
SET @okayToFinalize = 'Y'

--Testing
-----------------------------------------------------------------------------------------------------
--DECLARE @BatchId varchar(255), @testCode varchar(30), @barcode varchar(20), @result varchar(255), @personnelLogin varchar(30)
--SELECT @BatchId = 1,
--	@testCode = '02HPVALL',
--	@result = 'Positive',
--	@barcode = 'WHC-17-000009',
--	@personnelLogin = 'srichmond'

-----------------------------------------------------------------------------------------------------


--**************GET ID's AND URI'S****************--
----------------------------------------------------

--Get PersonnelId
SELECT @personnelId = pp.Id, @PersonnelUri = 'https://summitiis/summitbeta/Personnel/Personnel/v1/' + CAST(pp.Id AS varchar(5))
FROM Personnel_Person pp
	JOIN Personnel_Account pa ON pa.Person_Id = pp.Id
	--JOIN peak_di_user_map m ON m.summitUser = pa.[Identity]
WHERE pa.[Identity] = @personnelLogin
--default to admin account
IF @personnelId IS NULL
	BEGIN
		SELECT @personnelId = 1, @PersonnelUri = 'https://summitiis/summitbeta/Personnel/Personnel/v1/1'
	END



--Get Case Id
SELECT @caseId = Id, @CaseUri = 'https://summitiis/summitbeta/Cases/Cases/v1/' + CAST(Id AS varchar(10))
FROM Case_Case
WHERE label = @barcode

IF @caseId IS NULL
	BEGIN
		SELECT @errorCode = 'A1', @errorMessage = 'Case ' + @barcode + ' does not exist in SummitProd'
		GOTO errorSection
	END


--Get Case/Task/Step Id's.   Step cannot be 'skipped', 'condition not met', 'not required', or 'cancelled'
SELECT @Task_Id = pt.Id, @Step_Id = ps.Id, @StepUri = 'https://summitiis/summitbeta/Process/Tasks/v1/' + CAST(pt.Id AS varchar(10)) + '/Steps/' + CAST(ps.Id AS varchar(10))
FROM Process_Task pt (nolock)
	JOIN Process_TaskDefinition ptd (nolock) ON ptd.Id = pt.TaskDefinition_Id
	JOIN Process_Step ps (nolock) ON ps.Task_Id = pt.Id
	JOIN Peak_DI_Cobas_Map map ON map.taskCode = ptd.Code
WHERE pt.CaseUri = @CaseUri
	AND pt.status NOT IN (4,5,6,7)
	AND ps.status NOT IN (4,5,6,7)
	AND map.cobasCode = @testCode

IF @Task_Id IS NULL OR @Step_Id IS NULL
	BEGIN
		SELECT @errorCode = 'A2', @errorMessage = 'No valid tasks were found for case ' + @barcode + ' that correspond to test code ' + @testCode +'.'
		GOTO errorSection
	END

--Check that parent task is completed
SELECT @ParentTaskId = ppt.Parent_Id
FROM Process_ParentTask ppt
	JOIN Process_Task pt ON pt.Id = ppt.Parent_Id
	JOIN Process_TaskDefinition ptd On ptd.Id = pt.TaskDefinition_Id
WHERE ppt.Task_Id = @Task_Id
	AND pt.Status = 3
	AND ptd.code LIKE '%Cobas%'

IF @ParentTaskId IS NULL
	BEGIN
		SELECT @errorCode = 'A3', @errorMessage = 'The parent task for case ' + @barcode + ' that correspond to test code ' + @testCode +' for the Cobas has not been completed.'
		GOTO errorSection
	END




--Get Specimen URI
SELECT @SampleUri = CASE
						WHEN ps.InputMaterialUri IS NOT NULL AND ps.InputMaterialUri <> '' THEN ps.InputMaterialUri
						WHEN pt.OutputSampleUri IS NOT NULL AND pt.OutputSampleUri <> '' THEN pt.OutputSampleUri
						WHEN pt.InputSampleUri IS NOT NULL AND pt.InputSampleUri <> '' THEN pt.InputSampleUri
					ELSE NULL END
FROM Process_Task pt
	JOIN Process_Step ps ON ps.Task_Id = pt.Id
WHERE pt.Id = @Task_Id

IF @SampleUri IS NULL
	BEGIN
		SELECT @SampleUri = CASE
								WHEN pt.OutputSampleUri IS NOT NULL AND pt.OutputSampleUri <> '' THEN pt.OutputSampleUri
								WHEN pt.InputSampleUri IS NOT NULL AND pt.InputSampleUri <> '' THEN pt.InputSampleUri
							ELSE NULL END
		FROM Process_Task pt
		WHERE pt.Id = @ParentTaskId

	END

IF @SampleUri IS NULL
	BEGIN
		SELECT @errorCode = 'A4', @errorMessage = 'No SampleUri found for task ' + CAST(@Task_Id AS varchar) + ' on case ' + @barcode + '.'
		GOTO errorSection
	END ELSE

BEGIN TRANSACTION

	BEGIN TRY

		UPDATE Process_Task
		SET OutputSampleUri = @SampleUri, InputSampleUri = @SampleUri
		WHERE Id = @Task_Id

	END TRY
	BEGIN CATCH
		SELECT @errorCode = 'E1',  @errorMessage = 'Error updating task ' + CAST(@Task_Id AS varchar) + ' with sample ' + @SampleUri + ' - ' + ERROR_MESSAGE()
		IF @@TRANCOUNT > 0 ROLLBACK
		GOTO errorSection
	END CATCH

	BEGIN TRY
		UPDATE Process_Step
		SET InputMaterialUri = @SampleUri
		WHERE Id = @Step_Id
	END TRY
	BEGIN CATCH
		SELECT @errorCode = 'E2',  @errorMessage = 'Error updating step ' + CAST(@Step_Id AS varchar) + ' with sample ' + @SampleUri + ' - ' + ERROR_MESSAGE()
		IF @@TRANCOUNT > 0 ROLLBACK
		GOTO errorSection
	END CATCH
IF @@TRANCOUNT > 0 COMMIT

--Get Result Type and Uri for the test code
SELECT @ResultTypeId = id, @ResultTypeUri = 'https://summitiis/summitbeta/Process/ResultTypes/v1/' + CAST(id AS varchar(5))
FROM Process_ResultType prt
	JOIN Peak_DI_Cobas_Map map ON map.resultTypeCode = prt.Code
WHERE map.cobasCode = @testCode

--Get Observation Type for the test code
SELECT @ObsTypeId = Id, @ObsTypeUri = 'https://summitiis/summitbeta/Process/ObservationTypes/v1/' + CAST(Id AS varchar(5))
FROM Process_ObservationType pot
	JOIN Peak_DI_Cobas_Map map ON map.obsTypeCode = pot.Code
WHERE map.cobasCode = @testCode



--**************INSERT PROCESS_RESULT*************--
----------------------------------------------------
IF NOT EXISTS(SELECT *
				FROM Process_Result
				WHERE CaseUri = @CaseUri
					AND Type_Id = @ResultTypeId)
	BEGIN
		BEGIN TRANSACTION
		BEGIN TRY
			INSERT INTO Process_Result
			SELECT @ResultTypeUri, @SampleUri, @CaseUri, @StepUri, 0, @Step_Id, CAST(@ResultTypeId AS varchar(5)), 0
		END TRY
		BEGIN CATCH
			SELECT @errorCode = 'E3',  @errorMessage = 'Process_Result INSERT failed for the ' + @testCode + ' cobas result on case ' + @barcode + '.  -  ' + ERROR_MESSAGE()
			IF @@TRANCOUNT > 0 ROLLBACK
			GOTO errorSection
		END CATCH
  		IF @@TRANCOUNT > 0 COMMIT
  		SELECT @resultRowInsId = @@IDENTITY

	END

--**************INSERT PROCESS_OBSERVATION********--
----------------------------------------------------

--Set Result_Id for observation insert
SELECT @Result_Id = MAX(Id)
FROM Process_Result
WHERE TaskStep_Id = @Step_Id

IF @Result_Id IS NULL
	BEGIN
		SELECT @errorCode = 'A5',  @errorMessage = 'No Process_Result found for step ' + @StepUri + ' on case ' + @barcode + ' for the ' + @testCode + ' result.'
		GOTO errorSection
	END

--Check if CT/NG result is already marked as technically invalid, and if so, ignore the result.
IF @testCode IN ('01CT', '01NG')
	AND EXISTS(
		SELECT pr.Id
		FROM Process_Result pr
			JOIN Process_Observations po ON po.Result_Id = pr.Id
			JOIN Process_ObservationType pot ON pot.Id = po.Type_Id
		WHERE pr.Id = @Result_Id
			AND pot.code IN ('MOL-CT-TECH-INVALID', 'MOL-NG-TECH-INVALID')
			AND po.stringValue = 'Yes')
	BEGIN
		SELECT  @errorCode = 'A6', @errorMessage = 'The ' + @testCode + ' result for case ' + @barcode + ' has been marked as technically invalid.  The Cobas result was ignored.'
		GOTO errorSection
	END

--Check if invalid result has been sent for the third time.  If not, the result can be updated, but not finalized.
DECLARE @invalidCount int
SELECT @invalidCount = isNull(COUNT(distinct mirthMessageId),0)
FROM peak_di_ins_rslt_log
WHERE barcode = @barcode
	AND testCode = @testCode
	AND result IN ('QNS', 'Invalid', 'Indeterminate')

IF @result IN ('QNS', 'Invalid', 'Indeterminate')
	BEGIN
		SELECT @invalidCount = @invalidCount + 1
	END
	ELSE BEGIN
		SET @invalidCount = 0
	END
--Do not finalize Invalid results until the 3rd value is received.
IF @invalidCount > 0 AND @invalidCount < 3
	BEGIN
		SET @okayToFinalize = 'N'
		SELECT @errorCode = 'A7', @errorMessage = 'The result for test ' + @testcode + ' on case ' + @barcode + ' is invalid.  It will need to be reprocessed to verify that is correct before the result can be finalized.'
	END

--Check if a valid observation already exists.
IF  EXISTS(
	SELECT po.Id
	FROM Process_Observations po
	WHERE po.Result_Id = @Result_Id
		AND po.Type_Id = @ObsTypeId
		AND po.StringValue NOT IN ('QNS', 'Invalid', 'Indeterminate')
	)
	BEGIN
		SELECT @errorCode = 'L1',  @errorMessage = 'An observation has already been entered for the ' + @testCode + ' test on case ' + @barcode +'.'
		GOTO errorSection
	END
	ELSE IF EXISTS(
		SELECT po.Id
		FROM Process_Observations po
		WHERE po.Result_Id = @Result_Id
			AND po.Type_Id = @ObsTypeId
			AND po.StringValue IN ('QNS', 'Invalid', 'Indeterminate')
		)
		AND @result NOT IN ('QNS', 'Invalid', 'Indeterminate')
	BEGIN
		BEGIN TRANSACTION
		BEGIN TRY
			UPDATE Process_Observations
			SET StringValue = @result
			WHERE Result_Id = @Result_Id
				AND Type_Id = @ObsTypeId
				AND StringValue IN ('QNS', 'Invalid', 'Indeterminate')
		END TRY
		BEGIN CATCH
			SELECT @errorCode = 'E4', @errorMessage = 'Process_Observation UPDATE failed for the ' + @testCode + ' cobas result on case ' + @barcode + '.  -  ' + ERROR_MESSAGE()
			IF @@TRANCOUNT > 0 ROLLBACK
			GOTO errorSection
		END CATCH
		IF @@TRANCOUNT > 0 COMMIT
	END ELSE
	BEGIN
		BEGIN TRANSACTION
		BEGIN TRY
			--Insert Observation
			INSERT INTO Process_Observations(ObservationTypeUri, Updated_When, Updated_WhoUri, StringValue, Type_Id, Result_Id, Type, Updated_WhyReasonUri, Updated_WhyReasonText)
			SELECT @ObsTypeUri, GETDATE(), @PersonnelUri, @result, @ObsTypeId, @Result_Id, 'String', '', 'Cobas Result'
		END TRY
		BEGIN CATCH
			SELECT @errorCode = 'E5', @errorMessage = 'Process_Observation INSERT failed for the ' + @testCode + ' cobas result on case ' + @barcode + '.  -  ' + ERROR_MESSAGE()
			IF @@TRANCOUNT > 0 ROLLBACK
			GOTO errorSection
		END CATCH
		IF @@TRANCOUNT > 0 COMMIT
		SELECT @obsRowInsId = @@IDENTITY
	END

IF @obsRowInsId IS NOT NULL
	BEGIN
		SET @Obs_Id = @obsRowInsId
	END ELSE
	BEGIN
		SELECT @Obs_Id = MAX(po.id)
		FROM Process_Observation po
		WHERE po.Result_Id = @Result_Id
			AND po.Type_Id = @ObsTypeId
	END

--**************UPDATE PROCESS_TASK/STEP**********--
----------------------------------------------------

--For HPV16/18 check that the other observation has already been entered and is valid, or if invalid that it has been ran 3 times and verified before finalizing the result.
IF @testCode IN ('02HPV16', '02HPV18')
	BEGIN
		IF NOT EXISTS(
			SELECT po.id
			FROM Process_Observations po
			WHERE po.Result_Id = @Result_Id
				AND po.Id <> @Obs_Id
				AND po.Type_Id <> @ObsTypeId
				AND (
						po.StringValue IN ('Negative', 'Positive')
						OR (
							po.StringValue IN ('QNS', 'Invalid', 'Indeterminate')
							AND 3 < (
								SELECT isNull(COUNT(mirthMessageId),0)
								FROM peak_di_ins_rslt_log
								WHERE barcode = @barcode
									AND testCode = @testCode
									AND result IN ('QNS', 'Invalid', 'Indeterminate')
								GROUP BY mirthMessageId)
							)
					)
				)
			BEGIN
				SET @okayToFinalize = 'N'
			END
	END

IF @okayToFinalize <> 'N'
	BEGIN
		BEGIN TRANSACTION
			BEGIN TRY
				UPDATE Process_Task
				SET status = 3
				WHERE Id = @Task_Id

			END TRY
			BEGIN CATCH
				SELECT @errorCode = 'E6', @errorMessage = 'Error finalizing task ' + CAST(@Task_Id AS varchar) + ' with sample ' + @SampleUri + ' - ' + ERROR_MESSAGE()
				IF @@TRANCOUNT > 0 ROLLBACK
				GOTO errorSection
			END CATCH

			BEGIN TRY
				UPDATE Process_Step
				SET AssignedPersonUri = @PersonnelUri, status = 3, Completed_When = GETDATE(), Completed_WhoUri = @PersonnelUri
				WHERE Id = @Step_Id
			END TRY
			BEGIN CATCH
				SELECT @errorCode = 'E7', @errorMessage = 'Error finalizing step ' + CAST(@Task_Id AS varchar) + ' with sample ' + @SampleUri + ' - ' + ERROR_MESSAGE()
				IF @@TRANCOUNT > 0 ROLLBACK
				GOTO errorSection
			END CATCH
		IF @@TRANCOUNT > 0 COMMIT
		SET @taskFinalizedId = @Task_Id

	END

--**********LOG DATA IN CUSTOM TABLE********--
----------------------------------------------
INSERT INTO peak_di_ins_rslt_log
SELECT	CAST(@BatchId AS varchar), @barcode, @testCode, @result, @personnelLogin,
		@personnelId, @PersonnelUri, @caseId, @CaseUri, @Task_Id, @Step_Id, @StepUri, @ResultTypeId, @ResultTypeUri, @SampleUri, @Result_Id, @Obs_Id, @ObsTypeId, @ObsTypeUri,
		@resultRowInsId, @obsRowInsId, @taskFinalizedId, getdate(),
		@errorMessage, @errorCode, @alertSent

RETURN

--ERROR SECTION
errorSection:

INSERT INTO peak_di_ins_rslt_log
SELECT	CAST(@BatchId AS varchar), @barcode, @testCode, @result, @personnelLogin,
		@personnelId, @PersonnelUri, @caseId, @CaseUri, @Task_Id, @Step_Id, @StepUri, @ResultTypeId, @ResultTypeUri, @SampleUri, @Result_Id, @Obs_Id, @ObsTypeId, @ObsTypeUri,
		@resultRowInsId, @obsRowInsId, @taskFinalizedId, getdate(),
		@errorMessage, @errorCode, @alertSent


--SELECT isNull(@errorMessage, '') AS errorMessage


END


--EXEC stprc_peak_di_ins_rslt '', 'WHC-16-014286', '02HPV18', 'Negative', 'srichmond'