BEGIN TRY

BEGIN TRAN;

-- DataMigration: the OrderStatus column is a plain string (SQL Server has no native enum), and
-- the order workflow was rebuilt from PENDING/CONFIRMED/PROCESSING/SHIPPED/DELIVERED/CANCELLED to
-- PENDING/CONTACTED/PRINTING/PACKAGING/DELIVERY/CANCELLED. Remap existing rows to the equivalent
-- new stage rather than leaving them holding a status value the app no longer recognizes.
UPDATE [dbo].[orders] SET [status] = 'CONTACTED' WHERE [status] = 'CONFIRMED';
UPDATE [dbo].[orders] SET [status] = 'PRINTING' WHERE [status] = 'PROCESSING';
UPDATE [dbo].[orders] SET [status] = 'PACKAGING' WHERE [status] = 'SHIPPED';
UPDATE [dbo].[orders] SET [status] = 'DELIVERY' WHERE [status] = 'DELIVERED';
-- PENDING and CANCELLED are unchanged -- same names in both schemes.

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
