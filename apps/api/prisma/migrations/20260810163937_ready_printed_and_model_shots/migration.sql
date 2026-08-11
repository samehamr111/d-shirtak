BEGIN TRY

BEGIN TRAN;

-- AlterTable
ALTER TABLE [dbo].[product_colors] ADD [modelBackImageUrl] NVARCHAR(1000),
[modelFrontImageUrl] NVARCHAR(1000);

-- AlterTable: add productType with a default, backfill from the old isCustomizable flag,
-- then drop isCustomizable. The backfill UPDATE runs via EXEC(...) dynamic SQL so it's
-- parsed/bound at runtime (after the ALTER TABLE above has executed) rather than at the
-- start of this batch, where the newly added [productType] column wouldn't resolve yet.
ALTER TABLE [dbo].[products] ADD [productType] NVARCHAR(1000) NOT NULL CONSTRAINT [products_productType_df] DEFAULT 'CUSTOMIZABLE';

EXEC(N'UPDATE [dbo].[products] SET [productType] = CASE WHEN [isCustomizable] = 1 THEN ''CUSTOMIZABLE'' ELSE ''READY_PRINTED'' END');

ALTER TABLE [dbo].[products] DROP CONSTRAINT [products_isCustomizable_df];
ALTER TABLE [dbo].[products] DROP COLUMN [isCustomizable];

-- CreateTable
CREATE TABLE [dbo].[user_uploads] (
    [id] NVARCHAR(1000) NOT NULL,
    [userId] NVARCHAR(1000) NOT NULL,
    [imageUrl] NVARCHAR(1000) NOT NULL,
    [originalName] NVARCHAR(1000),
    [promotedAssetId] NVARCHAR(1000),
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [user_uploads_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [user_uploads_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [user_uploads_promotedAssetId_key] UNIQUE NONCLUSTERED ([promotedAssetId])
);

-- AddForeignKey
ALTER TABLE [dbo].[user_uploads] ADD CONSTRAINT [user_uploads_userId_fkey] FOREIGN KEY ([userId]) REFERENCES [dbo].[users]([id]) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[user_uploads] ADD CONSTRAINT [user_uploads_promotedAssetId_fkey] FOREIGN KEY ([promotedAssetId]) REFERENCES [dbo].[design_assets]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
