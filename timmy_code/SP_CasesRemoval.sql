-- ====================================================
-- Author:		Timmy Chang
-- Create date: 2023/09/11
-- Description:	民國111年12月25日(含當日)施政案件資料下架
-- ====================================================
CREATE PROCEDURE [dbo].[SP_CasesRemoval]
	@ReturnMessage NVARCHAR(MAX) OUTPUT,
	@ErrorMessage NVARCHAR(MAX) OUTPUT
AS
BEGIN
	DECLARE @TempMessage NVARCHAR(MAX);
	DECLARE @Now datetime = GETDATE();
	DECLARE @TB_GovernReDataRemoval NVARCHAR(19) = N'GovernReDataRemoval';
	DECLARE @TB_GovernanceDataRemoval NVARCHAR(21) = N'GovernanceDataRemoval';
	
	-- 換行字符
	DECLARE @NewLine CHAR(2) = CHAR(13) + CHAR(10);
	
	SET NOCOUNT ON;
	
	SET @TempMessage = CONCAT(N'[dbo].[SP_CaseRemoval] 流程開始 (時間: ', CONVERT(NVARCHAR(20), @Now, 120), ')');

	-- 判斷並建立存放下架資料的資料表 (GovernReDataRemoval、GovernanceDataRemoval)
	IF NOT EXISTS (SELECT * FROM sys.tables WHERE [name] = @TB_GovernReDataRemoval)
	BEGIN
		CREATE TABLE [dbo].[GovernReDataRemoval](
			[ID] [uniqueidentifier] NOT NULL,
			[D1] [nvarchar](200) NULL,
			[D2] [nvarchar](200) NULL,
			[D3] [nvarchar](50) NULL,
			[D4] [nvarchar](50) NULL,
			[D5] [nvarchar](50) NULL,
			[D6] [nvarchar](50) NULL,
			[D7] [nvarchar](50) NULL,
			[D8] [nvarchar](200) NULL,
			[D9] [nvarchar](50) NULL,
			[D10] [nvarchar](50) NULL,
			[D11] [nvarchar](50) NULL,
			[D12] [nvarchar](50) NULL,
			[D13] [nvarchar](50) NULL,
			[D14] [nvarchar](50) NULL,
			[D15] [nvarchar](max) NULL,
			[D16] [nvarchar](max) NULL,
			[D17] [nchar](50) NULL,
			[D18] [nchar](50) NULL,
			[D19] [nchar](50) NULL,
			[ControlStatus] [nvarchar](10) NOT NULL,
			[WorkProgress] [decimal](5, 2) NOT NULL,
			[EngineeringCategory] [nvarchar](10) NOT NULL,
			[CreateUser] [nvarchar](20) NULL,
			[CreateTime] [datetime] NULL,
			[UpdateUser] [nvarchar](20) NULL,
			[UpdateTime] [datetime] NULL,
			[InclusionInR] [nvarchar](1) NULL,
			[ShowR] [nvarchar](1) NULL,
			[ShowName1R] [nvarchar](100) NULL,
			[ShowName2R] [nvarchar](100) NULL,
			[CategoryR] [nvarchar](2) NULL,
			[LinkURLR] [nvarchar](150) NULL,
			[AfterConstruction1R] [nvarchar](200) NULL,
			[AfterIntroduction1R] [nvarchar](200) NULL,
			[AfterStatus1R] [nvarchar](300) NULL,
			[AfterConstruction2R] [nvarchar](200) NULL,
			[AfterIntroduction2R] [nvarchar](200) NULL,
			[AfterStatus2R] [nvarchar](300) NULL,
			[AfterConstruction3R] [nvarchar](200) NULL,
			[AfterIntroduction3R] [nvarchar](200) NULL,
			[AfterStatus3R] [nvarchar](300) NULL,
			[AfterConstruction4R] [nvarchar](200) NULL,
			[AfterIntroduction4R] [nvarchar](200) NULL,
			[AfterStatus4R] [nvarchar](300) NULL,
			[AfterConstruction5R] [nvarchar](200) NULL,
			[AfterIntroduction5R] [nvarchar](max) NULL,
			[AfterStatus5R] [nvarchar](4) NULL,
			[UnderConstruction1R] [nvarchar](200) NULL,
			[UnderIntroduction1R] [nvarchar](200) NULL,
			[UnderStatus1R] [nvarchar](4) NULL,
			[UnderConstruction2R] [nvarchar](200) NULL,
			[UnderIntroduction2R] [nvarchar](200) NULL,
			[UnderStatus2R] [nvarchar](4) NULL,
			[UnderConstruction3R] [nvarchar](200) NULL,
			[UnderIntroduction3R] [nvarchar](200) NULL,
			[UnderStatus3R] [nvarchar](4) NULL,
			[UnderConstruction4R] [nvarchar](200) NULL,
			[UnderIntroduction4R] [nvarchar](200) NULL,
			[UnderStatus4R] [nvarchar](4) NULL,
			[UnderConstruction5R] [nvarchar](200) NULL,
			[UnderIntroduction5R] [nvarchar](200) NULL,
			[UnderStatus5R] [nvarchar](4) NULL,
			[PreConstruction1R] [nvarchar](200) NULL,
			[PreIntroduction1R] [nvarchar](200) NULL,
			[PreStatus1R] [nvarchar](4) NULL,
			[PreConstruction2R] [nvarchar](200) NULL,
			[PreIntroduction2R] [nvarchar](200) NULL,
			[PreStatus2R] [nvarchar](4) NULL,
			[PreConstruction3R] [nvarchar](200) NULL,
			[PreIntroduction3R] [nvarchar](200) NULL,
			[PreStatus3R] [nvarchar](4) NULL,
			[PreConstruction4R] [nvarchar](200) NULL,
			[PreIntroduction4R] [nvarchar](200) NULL,
			[PreStatus4R] [nvarchar](4) NULL,
			[PreConstruction5R] [nvarchar](200) NULL,
			[PreIntroduction5R] [nvarchar](200) NULL,
			[PreStatus5R] [nvarchar](4) NULL,
			[Park] [nvarchar](200) NULL,
			[InclusionInR1] [bit] NULL,
			[ShowR1] [bit] NULL,
			[Weight] [int] NOT NULL,
			[RemovalTime] [datetime] NULL,
		 CONSTRAINT [PK_GovernReDataRemoval] PRIMARY KEY CLUSTERED 
		(
			[ID] ASC
		)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
		) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
		
		ALTER TABLE [dbo].[GovernReDataRemoval] ADD CONSTRAINT [DF_GovernReDataRemoval_ControlStautus] DEFAULT (N'未結案') FOR [ControlStatus]
		ALTER TABLE [dbo].[GovernReDataRemoval] ADD CONSTRAINT [DF_GovernReDataRemoval_WorkProgress] DEFAULT ((0)) FOR [WorkProgress]
		ALTER TABLE [dbo].[GovernReDataRemoval] ADD CONSTRAINT [DF_GovernReDataRemoval_EngineeringCategory] DEFAULT ('') FOR [EngineeringCategory]
		ALTER TABLE [dbo].[GovernReDataRemoval] ADD CONSTRAINT [DF_GovernReDataRemoval_Weight] DEFAULT ((1)) FOR [Weight]
		ALTER TABLE [dbo].[GovernReDataRemoval] ADD CONSTRAINT [DF_GovernReDataRemoval_RemovalTime] DEFAULT (GETDATE()) FOR [RemovalTime]
		
		EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'資料下架時間', @level0type=N'SCHEMA', @level0name=N'dbo', @level1type=N'TABLE', @level1name=@TB_GovernReDataRemoval, @level2type=N'COLUMN', @level2name=N'RemovalTime'
	END
	
	IF NOT EXISTS (SELECT * FROM sys.tables WHERE [name] = @TB_GovernanceDataRemoval)
	BEGIN
		CREATE TABLE [dbo].[GovernanceDataRemoval](
			[ID] [uniqueidentifier] NOT NULL,
			[GovernReID] [uniqueidentifier] NULL,
			[SubjectName] [nvarchar](50) NOT NULL,
			[ResponsibleUnit] [nvarchar](50) NOT NULL,
			[CarouselSeq] [int] NOT NULL,
			[UploadDate] [datetime] NOT NULL,
			[UploadTime] [char](5) NULL,
			[DownloadDate] [datetime] NOT NULL,
			[DownloadTime] [char](5) NULL,
			[ProcessingStaff] [nvarchar](30) NOT NULL,
			[LinkURL] [nvarchar](150) NULL,
			[Remarks] [nvarchar](100) NULL,
			[ImagePath] [nvarchar](100) NOT NULL,
			[IsActived] [bit] NOT NULL,
			[CreateUser] [varchar](20) NOT NULL,
			[CreateTime] [datetime] NOT NULL,
			[UpdateUser] [varchar](20) NULL,
			[UpdateTime] [datetime] NULL,
			[RemovalTime] [datetime] NULL,
		 CONSTRAINT [PK_GovernanceDataRemoval] PRIMARY KEY CLUSTERED 
		(
			[ID] ASC
		)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
		) ON [PRIMARY]

		ALTER TABLE [dbo].[GovernanceDataRemoval] ADD CONSTRAINT [DF_GovernanceDataRemoval_SubjectName] DEFAULT ('') FOR [SubjectName]
		ALTER TABLE [dbo].[GovernanceDataRemoval] ADD CONSTRAINT [DF_GovernanceDataRemoval_ResponsibleUnit] DEFAULT ('') FOR [ResponsibleUnit]
		ALTER TABLE [dbo].[GovernanceDataRemoval] ADD CONSTRAINT [DF_GovernanceDataRemoval_UploadDate] DEFAULT (getutcdate()) FOR [UploadDate]
		ALTER TABLE [dbo].[GovernanceDataRemoval] ADD CONSTRAINT [DF_GovernanceDataRemoval_UploadTime] DEFAULT ('') FOR [UploadTime]
		ALTER TABLE [dbo].[GovernanceDataRemoval] ADD CONSTRAINT [DF_GovernanceDataRemoval_DownloadTime] DEFAULT ('') FOR [DownloadTime]
		ALTER TABLE [dbo].[GovernanceDataRemoval] ADD CONSTRAINT [DF_GovernanceDataRemoval_ProcessingStaff] DEFAULT ('') FOR [ProcessingStaff]
		ALTER TABLE [dbo].[GovernanceDataRemoval] ADD CONSTRAINT [DF_GovernanceDataRemoval_LinkURL] DEFAULT ('') FOR [LinkURL]
		ALTER TABLE [dbo].[GovernanceDataRemoval] ADD CONSTRAINT [DF_GovernanceDataRemoval_Remarks] DEFAULT ('') FOR [Remarks]
		ALTER TABLE [dbo].[GovernanceDataRemoval] ADD CONSTRAINT [DF_GovernanceDataRemoval_ImagePath] DEFAULT ('') FOR [ImagePath]
		ALTER TABLE [dbo].[GovernanceDataRemoval] ADD CONSTRAINT [DF_GovernanceDataRemoval_IsActived] DEFAULT ('') FOR [IsActived]
		ALTER TABLE [dbo].[GovernanceDataRemoval] ADD CONSTRAINT [DF_GovernanceDataRemoval_CreateUser] DEFAULT ('') FOR [CreateUser]
		ALTER TABLE [dbo].[GovernanceDataRemoval] ADD CONSTRAINT [DF_GovernanceDataRemoval_CreateTime] DEFAULT (getutcdate()) FOR [CreateTime]
		ALTER TABLE [dbo].[GovernanceDataRemoval] ADD CONSTRAINT [DF_GovernanceDataRemoval_UpdateUser] DEFAULT ('') FOR [UpdateUser]
		ALTER TABLE [dbo].[GovernanceDataRemoval] ADD CONSTRAINT [DF_GovernanceDataRemoval_UpdateTime] DEFAULT (getutcdate()) FOR [UpdateTime]
		ALTER TABLE [dbo].[GovernanceDataRemoval] ADD CONSTRAINT [DF_GovernanceDataRemoval_RemovalTime] DEFAULT (GETDATE()) FOR [RemovalTime]
		
		EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'主鍵', @level0type=N'SCHEMA', @level0name=N'dbo', @level1type=N'TABLE', @level1name=@TB_GovernanceDataRemoval, @level2type=N'COLUMN', @level2name=N'ID'
		EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'施政亮點-主題名稱', @level0type=N'SCHEMA', @level0name=N'dbo', @level1type=N'TABLE', @level1name=@TB_GovernanceDataRemoval, @level2type=N'COLUMN', @level2name=N'SubjectName'
		EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'負責單位', @level0type=N'SCHEMA', @level0name=N'dbo', @level1type=N'TABLE', @level1name=@TB_GovernanceDataRemoval, @level2type=N'COLUMN', @level2name=N'ResponsibleUnit'
		EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'輪播順序', @level0type=N'SCHEMA', @level0name=N'dbo', @level1type=N'TABLE', @level1name=@TB_GovernanceDataRemoval, @level2type=N'COLUMN', @level2name=N'CarouselSeq'
		EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'上架日期', @level0type=N'SCHEMA', @level0name=N'dbo', @level1type=N'TABLE', @level1name=@TB_GovernanceDataRemoval, @level2type=N'COLUMN', @level2name=N'UploadDate'
		EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'上架時間', @level0type=N'SCHEMA', @level0name=N'dbo', @level1type=N'TABLE', @level1name=@TB_GovernanceDataRemoval, @level2type=N'COLUMN', @level2name=N'UploadTime'
		EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'下架日期', @level0type=N'SCHEMA', @level0name=N'dbo', @level1type=N'TABLE', @level1name=@TB_GovernanceDataRemoval, @level2type=N'COLUMN', @level2name=N'DownloadDate'
		EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'下架時間', @level0type=N'SCHEMA', @level0name=N'dbo', @level1type=N'TABLE', @level1name=@TB_GovernanceDataRemoval, @level2type=N'COLUMN', @level2name=N'DownloadTime'
		EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'負責人員', @level0type=N'SCHEMA', @level0name=N'dbo', @level1type=N'TABLE', @level1name=@TB_GovernanceDataRemoval, @level2type=N'COLUMN', @level2name=N'ProcessingStaff'
		EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'連結網址', @level0type=N'SCHEMA', @level0name=N'dbo', @level1type=N'TABLE', @level1name=@TB_GovernanceDataRemoval, @level2type=N'COLUMN', @level2name=N'LinkURL'
		EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'備註', @level0type=N'SCHEMA', @level0name=N'dbo', @level1type=N'TABLE', @level1name=@TB_GovernanceDataRemoval, @level2type=N'COLUMN', @level2name=N'Remarks'
		EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'檔案', @level0type=N'SCHEMA', @level0name=N'dbo', @level1type=N'TABLE', @level1name=@TB_GovernanceDataRemoval, @level2type=N'COLUMN', @level2name=N'ImagePath'
		EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'開啟', @level0type=N'SCHEMA', @level0name=N'dbo', @level1type=N'TABLE', @level1name=@TB_GovernanceDataRemoval, @level2type=N'COLUMN', @level2name=N'IsActived'
		EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'建立者', @level0type=N'SCHEMA', @level0name=N'dbo', @level1type=N'TABLE', @level1name=@TB_GovernanceDataRemoval, @level2type=N'COLUMN', @level2name=N'CreateUser'
		EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'建立時間', @level0type=N'SCHEMA', @level0name=N'dbo', @level1type=N'TABLE', @level1name=@TB_GovernanceDataRemoval, @level2type=N'COLUMN', @level2name=N'CreateTime'
		EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'修改者', @level0type=N'SCHEMA', @level0name=N'dbo', @level1type=N'TABLE', @level1name=@TB_GovernanceDataRemoval, @level2type=N'COLUMN', @level2name=N'UpdateUser'
		EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'修改時間', @level0type=N'SCHEMA', @level0name=N'dbo', @level1type=N'TABLE', @level1name=@TB_GovernanceDataRemoval, @level2type=N'COLUMN', @level2name=N'UpdateTime'
		EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'資料下架時間', @level0type=N'SCHEMA', @level0name=N'dbo', @level1type=N'TABLE', @level1name=@TB_GovernanceDataRemoval, @level2type=N'COLUMN', @level2name=N'RemovalTime'
	END
	
	/*
	資料下架(搬移) 流程 (此流程皆在交易與 TRY-CATCH 區塊中進行):
	1. 刪除 RemovalTime 欄位超過 7 天的下架資料。
	2. 將主資料表 (Governance、GovernRe) 搬移(先 INSERT 再 DELETE)存放至下架資料的資料表中 (GovernanceDataRemoval、GovernReDataRemoval)。
	*/
	BEGIN TRANSACTION;
	BEGIN TRY
		-- 1. 刪除 RemovalTime 欄位超過 7 天的下架資料
		DELETE FROM [dbo].[GovernanceDataRemoval] WHERE [RemovalTime] < DATEADD(DAY, -7, CAST(@Now AS DATE));
		SET @TempMessage = CONCAT(@TempMessage, @NewLine, N'刪除 [', @TB_GovernanceDataRemoval, '] 超過 7 天的下架資料: ', @@ROWCOUNT, N' 筆');
		
		DELETE FROM [dbo].[GovernReDataRemoval] WHERE [RemovalTime] < DATEADD(DAY, -7, CAST(@Now AS DATE));
		SET @TempMessage = CONCAT(@TempMessage, N', 刪除 [', @TB_GovernReDataRemoval, '] 超過 7 天的下架資料: ', @@ROWCOUNT, N' 筆');
		
		
		-- 2. 將主資料表 (Governance、GovernRe) 搬移(先 INSERT 再 DELETE)存放至下架資料的資料表中 (GovernanceDataRemoval、GovernReDataRemoval)
		-- Governance 下架至 GovernanceDataRemoval
		INSERT INTO [dbo].[GovernanceDataRemoval] (
			[ID], [GovernReID], [SubjectName], [ResponsibleUnit], [CarouselSeq], [UploadDate], [UploadTime]
		   ,[DownloadDate], [DownloadTime], [ProcessingStaff], [LinkURL], [Remarks], [ImagePath]
		   ,[IsActived], [CreateUser], [CreateTime], [UpdateUser], [UpdateTime], [RemovalTime]
		) SELECT [ID], [GovernReID], [SubjectName], [ResponsibleUnit], [CarouselSeq], [UploadDate], [UploadTime]
		   ,[DownloadDate], [DownloadTime], [ProcessingStaff], [LinkURL], [Remarks], [ImagePath]
		   ,[IsActived], [CreateUser], [CreateTime], [UpdateUser], [UpdateTime], @Now
			FROM [dbo].[Governance]
		   WHERE [GovernReID] IN (
				SELECT [ID] AS [GovernReID] FROM [dbo].[GovernRe]
				 WHERE [D1] IN (
					SELECT [ProjectNo] FROM [dbo].[CasesRemovalList]
				 )
		   )
		   -- 大溪區瑞源市民活動中心新建工程(前瞻): 此案件有兩筆相同的資料, 需要下架其中一筆, 故直接寫在 Stored Procedure 中, 而不加在下架清單資料表
		   OR [GovernReID] = 'D8765BFA-FEF7-45AF-9EF9-D1D1B52F3505';
		SET @TempMessage = CONCAT(@TempMessage, N', [Governance] 下架 ', @@ROWCOUNT, N' 筆資料至 [', @TB_GovernanceDataRemoval, ']');
	
		-- GovernRe 下架至 GovernReDataRemoval
		INSERT INTO [dbo].[GovernReDataRemoval] (
			[ID] ,[D1] ,[D2] ,[D3] ,[D4] ,[D5] ,[D6] ,[D7] ,[D8] ,[D9] ,[D10] ,[D11] ,[D12] ,[D13] ,[D14] ,[D15],
			[D16], [D17], [D18], [D19], [ControlStatus], [WorkProgress], [EngineeringCategory], [CreateUser], [CreateTime],
			[UpdateUser], [UpdateTime], [InclusionInR], [ShowR], [ShowName1R], [ShowName2R], [CategoryR], [LinkURLR],
			[AfterConstruction1R], [AfterIntroduction1R], [AfterStatus1R], [AfterConstruction2R], [AfterIntroduction2R],
			[AfterStatus2R], [AfterConstruction3R], [AfterIntroduction3R], [AfterStatus3R], [AfterConstruction4R],
			[AfterIntroduction4R], [AfterStatus4R], [AfterConstruction5R], [AfterIntroduction5R], [AfterStatus5R],
			[UnderConstruction1R], [UnderIntroduction1R], [UnderStatus1R], [UnderConstruction2R], [UnderIntroduction2R],
			[UnderStatus2R], [UnderConstruction3R], [UnderIntroduction3R], [UnderStatus3R], [UnderConstruction4R],
			[UnderIntroduction4R], [UnderStatus4R], [UnderConstruction5R], [UnderIntroduction5R], [UnderStatus5R],
			[PreConstruction1R], [PreIntroduction1R], [PreStatus1R], [PreConstruction2R], [PreIntroduction2R],
			[PreStatus2R], [PreConstruction3R], [PreIntroduction3R], [PreStatus3R], [PreConstruction4R],
			[PreIntroduction4R], [PreStatus4R], [PreConstruction5R], [PreIntroduction5R], [PreStatus5R], [Park],
			[InclusionInR1], [ShowR1], [Weight], [RemovalTime]
		) SELECT [ID] ,[D1] ,[D2] ,[D3] ,[D4] ,[D5] ,[D6] ,[D7] ,[D8] ,[D9] ,[D10] ,[D11] ,[D12] ,[D13] ,[D14] ,[D15],
			[D16], [D17], [D18], [D19], [ControlStatus], [WorkProgress], [EngineeringCategory], [CreateUser], [CreateTime],
			[UpdateUser], [UpdateTime], [InclusionInR], [ShowR], [ShowName1R], [ShowName2R], [CategoryR], [LinkURLR],
			[AfterConstruction1R], [AfterIntroduction1R], [AfterStatus1R], [AfterConstruction2R], [AfterIntroduction2R],
			[AfterStatus2R], [AfterConstruction3R], [AfterIntroduction3R], [AfterStatus3R], [AfterConstruction4R],
			[AfterIntroduction4R], [AfterStatus4R], [AfterConstruction5R], [AfterIntroduction5R], [AfterStatus5R],
			[UnderConstruction1R], [UnderIntroduction1R], [UnderStatus1R], [UnderConstruction2R], [UnderIntroduction2R],
			[UnderStatus2R], [UnderConstruction3R], [UnderIntroduction3R], [UnderStatus3R], [UnderConstruction4R],
			[UnderIntroduction4R], [UnderStatus4R], [UnderConstruction5R], [UnderIntroduction5R], [UnderStatus5R],
			[PreConstruction1R], [PreIntroduction1R], [PreStatus1R], [PreConstruction2R], [PreIntroduction2R],
			[PreStatus2R], [PreConstruction3R], [PreIntroduction3R], [PreStatus3R], [PreConstruction4R],
			[PreIntroduction4R], [PreStatus4R], [PreConstruction5R], [PreIntroduction5R], [PreStatus5R], [Park],
			[InclusionInR1], [ShowR1], [Weight], @Now
		FROM [dbo].[GovernRe]
		WHERE [D1] IN (
			SELECT [ProjectNo] AS [D1] FROM [dbo].[CasesRemovalList]
		)
		-- 大溪區瑞源市民活動中心新建工程(前瞻): 此案件有兩筆相同的資料, 需要下架其中一筆, 故直接寫在 Stored Procedure 中, 而不加在下架清單資料表
		OR [ID] = 'D8765BFA-FEF7-45AF-9EF9-D1D1B52F3505';
		SET @TempMessage = CONCAT(@TempMessage, N', [GovernRe] 下架 ', @@ROWCOUNT, N' 筆資料至 [', @TB_GovernReDataRemoval, ']');
		
		-- 刪除 [GovernRe] 資料表的下架資料 (Governance 資料表不需要刪除是因為他有設定 DELETE CASCADE 依照 GovernReID)
		DELETE FROM [dbo].[GovernRe]
		WHERE [D1] IN (
			SELECT [ProjectNo] AS [D1] FROM [dbo].[CasesRemovalList]
		)
		-- 大溪區瑞源市民活動中心新建工程(前瞻): 此案件有兩筆相同的資料, 需要下架其中一筆, 故直接寫在 Stored Procedure 中, 而不加在下架清單資料表
		OR [ID] = 'D8765BFA-FEF7-45AF-9EF9-D1D1B52F3505';
		SET @TempMessage = CONCAT(@TempMessage, N'(刪除 ' , @@ROWCOUNT, ' 筆)');
		
		/*
		-- 測試用-模擬拋出例外錯誤的情境
		DECLARE @Result FLOAT;
        SET @Result = 1 / 0; -- 這裡嘗試除以零，將引發錯誤
		*/
		
		COMMIT TRANSACTION;
		
		
		SET @ReturnMessage = CONCAT(@TempMessage, @NewLine, N'[dbo].[SP_CaseRemoval] 流程結束 (時間: ', CONVERT(NVARCHAR(20), GETDATE(), 120), ')',
							@NewLine, '----------------------------------------------------------------------');
		PRINT @ReturnMessage;
	END TRY
	BEGIN CATCH
		-- 發生錯誤, ROLLBACK 交易
		ROLLBACK TRANSACTION;
		SET @ErrorMessage = CONCAT(@TempMessage, @NewLine,
			N'[dbo].[SP_CaseRemoval] 流程發生錯誤 (時間: ', CONVERT(NVARCHAR(20), GETDATE(), 120), '), 錯誤訊息: ', ERROR_MESSAGE(), @NewLine,
			N'交易 Rollback, 資料還原 ...', @NewLine,
			'----------------------------------------------------------------------');
		PRINT @ErrorMessage;
	END CATCH
	
END