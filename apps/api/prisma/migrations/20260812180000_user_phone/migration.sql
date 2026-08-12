BEGIN TRY

BEGIN TRAN;

-- AlterTable: nullable -- existing users predate this field and were never asked for a phone.
ALTER TABLE [dbo].[users] ADD [phone] NVARCHAR(1000);

-- pending_signups rows are ephemeral (10-minute OTP window) and safe to clear -- lets the new
-- phone column be added as NOT NULL without needing a throwaway default value.
DELETE FROM [dbo].[pending_signups];
ALTER TABLE [dbo].[pending_signups] ADD [phone] NVARCHAR(1000) NOT NULL;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
