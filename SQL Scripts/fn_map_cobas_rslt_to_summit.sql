SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:		Jacob Blaylock
-- Create date: 1/12/2017
-- Description:	Map result values from Cobas to Summit
-- =============================================
CREATE FUNCTION fn_map_cobas_rslt_to_summit
(
	@code varchar(20), @result varchar(50)
)
RETURNS varchar(50)
AS
BEGIN
	DECLARE @mappedResult varchar(50)

	SELECT @mappedResult =
		CASE
			WHEN @result LIKE 'NEG%' THEN 'Negative'
			WHEN @result LIKE 'POS%' THEN 'Positive'
			WHEN @result LIKE 'INV%' AND @code IN ('01CT', '01NG') THEN 'QNS'
			WHEN @result LIKE 'INV%' AND @code IN ('02HPVOHR', '02HPV16', '02HPV18') THEN 'Indeterminate'
			WHEN @result LIKE 'INV%' AND @code IN ('02HPVALL') THEN 'Invalid'
			ELSE @result
			END

	RETURN @mappedResult

END
GO

