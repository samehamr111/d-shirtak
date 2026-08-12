BEGIN TRY

BEGIN TRAN;

-- The plain UNIQUE CONSTRAINT on promotedAssetId only allows a single NULL across the whole
-- table in SQL Server (unlike Postgres), so every upload after the very first one -- almost
-- all of them, since promotedAssetId is only set once an admin promotes an upload into the
-- design library -- was hitting a P2002 unique-violation. Swap it for a filtered unique index
-- that only applies to non-null values, which is what was actually intended.
ALTER TABLE [dbo].[user_uploads] DROP CONSTRAINT [user_uploads_promotedAssetId_key];

CREATE UNIQUE NONCLUSTERED INDEX [user_uploads_promotedAssetId_key] ON [dbo].[user_uploads]([promotedAssetId]) WHERE [promotedAssetId] IS NOT NULL;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
