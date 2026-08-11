BEGIN TRY

BEGIN TRAN;

-- DropForeignKey
ALTER TABLE [dbo].[user_uploads] DROP CONSTRAINT [user_uploads_userId_fkey];

-- AlterTable: guests can use the designer canvas without signing in, so uploads made while
-- browsing anonymously must be trackable without a user row to attach to.
ALTER TABLE [dbo].[user_uploads] ALTER COLUMN [userId] NVARCHAR(1000) NULL;

-- AddForeignKey
ALTER TABLE [dbo].[user_uploads] ADD CONSTRAINT [user_uploads_userId_fkey] FOREIGN KEY ([userId]) REFERENCES [dbo].[users]([id]) ON DELETE CASCADE ON UPDATE NO ACTION;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
