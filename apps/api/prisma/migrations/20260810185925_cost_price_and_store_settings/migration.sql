BEGIN TRY

BEGIN TRAN;

-- AlterTable
ALTER TABLE [dbo].[products] ADD [costPrice] DECIMAL(10,2);

-- CreateTable
CREATE TABLE [dbo].[store_settings] (
    [id] NVARCHAR(1000) NOT NULL,
    [customizationSurchargeEgp] DECIMAL(10,2) NOT NULL CONSTRAINT [store_settings_customizationSurchargeEgp_df] DEFAULT 50,
    CONSTRAINT [store_settings_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- Seed the one singleton settings row every read/update assumes exists.
INSERT INTO [dbo].[store_settings] ([id], [customizationSurchargeEgp]) VALUES ('singleton', 50);

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
