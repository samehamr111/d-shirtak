BEGIN TRY

BEGIN TRAN;

-- CreateTable
CREATE TABLE [dbo].[pending_signups] (
    [id] NVARCHAR(1000) NOT NULL,
    [username] NVARCHAR(1000) NOT NULL,
    [email] NVARCHAR(1000) NOT NULL,
    [passwordHash] NVARCHAR(1000) NOT NULL,
    [otpCodeHash] NVARCHAR(1000) NOT NULL,
    [attempts] INT NOT NULL CONSTRAINT [pending_signups_attempts_df] DEFAULT 0,
    [expiresAt] DATETIME2 NOT NULL,
    [lastSentAt] DATETIME2 NOT NULL CONSTRAINT [pending_signups_lastSentAt_df] DEFAULT CURRENT_TIMESTAMP,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [pending_signups_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [pending_signups_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [pending_signups_email_key] UNIQUE NONCLUSTERED ([email])
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
