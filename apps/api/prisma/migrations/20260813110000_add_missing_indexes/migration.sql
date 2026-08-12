BEGIN TRY

BEGIN TRAN;

-- CreateIndex
CREATE NONCLUSTERED INDEX [addresses_userId_idx] ON [dbo].[addresses]([userId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [cart_items_userId_idx] ON [dbo].[cart_items]([userId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [design_asset_model_shots_designAssetId_idx] ON [dbo].[design_asset_model_shots]([designAssetId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [design_assets_designCategoryId_idx] ON [dbo].[design_assets]([designCategoryId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [designs_ownerUserId_idx] ON [dbo].[designs]([ownerUserId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [order_items_orderId_idx] ON [dbo].[order_items]([orderId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [orders_userId_createdAt_idx] ON [dbo].[orders]([userId], [createdAt]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [orders_status_createdAt_idx] ON [dbo].[orders]([status], [createdAt]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [products_categoryId_idx] ON [dbo].[products]([categoryId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [refresh_tokens_tokenHash_idx] ON [dbo].[refresh_tokens]([tokenHash]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [refresh_tokens_userId_idx] ON [dbo].[refresh_tokens]([userId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [user_uploads_userId_idx] ON [dbo].[user_uploads]([userId]);

-- NOTE: `prisma migrate diff` against this schema also proposed re-adding
-- `user_uploads_promotedAssetId_key` as a plain UNIQUE CONSTRAINT -- deliberately omitted here.
-- That's the exact constraint migration 20260813100000_fix_user_upload_null_unique replaced with
-- a filtered unique index, because SQL Server's plain unique constraints only allow one NULL per
-- table. Prisma's schema diffing can't see that the live index is filtered, so it keeps proposing
-- to "fix" it back to a plain constraint -- reject that part of any future diff too.

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
