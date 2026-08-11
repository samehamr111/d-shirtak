BEGIN TRY

BEGIN TRAN;

-- CreateTable
CREATE TABLE [dbo].[video_jobs] (
    [id] NVARCHAR(1000) NOT NULL,
    [status] NVARCHAR(1000) NOT NULL CONSTRAINT [video_jobs_status_df] DEFAULT 'PENDING',
    [specJson] NVARCHAR(max) NOT NULL,
    [videoUrl] NVARCHAR(1000),
    [errorMessage] NVARCHAR(1000),
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [video_jobs_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [video_jobs_pkey] PRIMARY KEY CLUSTERED ([id])
);

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
