BEGIN TRY

BEGIN TRAN;

-- AlterTable: replace the single modelShotUrl column with a one-to-many gallery table so a
-- design can have any number of model shots.
ALTER TABLE [dbo].[design_assets] DROP COLUMN [modelShotUrl];

-- CreateTable
CREATE TABLE [dbo].[design_asset_model_shots] (
    [id] NVARCHAR(1000) NOT NULL,
    [designAssetId] NVARCHAR(1000) NOT NULL,
    [imageUrl] NVARCHAR(1000) NOT NULL,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [design_asset_model_shots_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [design_asset_model_shots_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- AddForeignKey
ALTER TABLE [dbo].[design_asset_model_shots] ADD CONSTRAINT [design_asset_model_shots_designAssetId_fkey] FOREIGN KEY ([designAssetId]) REFERENCES [dbo].[design_assets]([id]) ON DELETE CASCADE ON UPDATE NO ACTION;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
