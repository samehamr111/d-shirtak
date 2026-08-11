BEGIN TRY

BEGIN TRAN;

-- CreateTable
CREATE TABLE [dbo].[users] (
    [id] NVARCHAR(1000) NOT NULL,
    [username] NVARCHAR(1000) NOT NULL,
    [email] NVARCHAR(1000) NOT NULL,
    [passwordHash] NVARCHAR(1000) NOT NULL,
    [role] NVARCHAR(1000) NOT NULL CONSTRAINT [users_role_df] DEFAULT 'CUSTOMER',
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [users_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [users_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [users_email_key] UNIQUE NONCLUSTERED ([email])
);

-- CreateTable
CREATE TABLE [dbo].[addresses] (
    [id] NVARCHAR(1000) NOT NULL,
    [userId] NVARCHAR(1000) NOT NULL,
    [label] NVARCHAR(1000) NOT NULL CONSTRAINT [addresses_label_df] DEFAULT 'Home',
    [fullName] NVARCHAR(1000) NOT NULL,
    [phone] NVARCHAR(1000) NOT NULL,
    [line1] NVARCHAR(1000) NOT NULL,
    [line2] NVARCHAR(1000),
    [city] NVARCHAR(1000) NOT NULL,
    [governorate] NVARCHAR(1000) NOT NULL,
    [postalCode] NVARCHAR(1000),
    [country] NVARCHAR(1000) NOT NULL CONSTRAINT [addresses_country_df] DEFAULT 'Egypt',
    [isDefault] BIT NOT NULL CONSTRAINT [addresses_isDefault_df] DEFAULT 0,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [addresses_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [addresses_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[refresh_tokens] (
    [id] NVARCHAR(1000) NOT NULL,
    [userId] NVARCHAR(1000) NOT NULL,
    [tokenHash] NVARCHAR(1000) NOT NULL,
    [expiresAt] DATETIME2 NOT NULL,
    [revokedAt] DATETIME2,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [refresh_tokens_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [refresh_tokens_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[categories] (
    [id] NVARCHAR(1000) NOT NULL,
    [name] NVARCHAR(1000) NOT NULL,
    [slug] NVARCHAR(1000) NOT NULL,
    CONSTRAINT [categories_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [categories_slug_key] UNIQUE NONCLUSTERED ([slug])
);

-- CreateTable
CREATE TABLE [dbo].[colors] (
    [id] NVARCHAR(1000) NOT NULL,
    [name] NVARCHAR(1000) NOT NULL,
    [hexCode] NVARCHAR(1000) NOT NULL,
    CONSTRAINT [colors_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[sizes] (
    [id] NVARCHAR(1000) NOT NULL,
    [name] NVARCHAR(1000) NOT NULL,
    [sortOrder] INT NOT NULL,
    CONSTRAINT [sizes_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[products] (
    [id] NVARCHAR(1000) NOT NULL,
    [categoryId] NVARCHAR(1000) NOT NULL,
    [code] NVARCHAR(1000) NOT NULL,
    [name] NVARCHAR(1000) NOT NULL,
    [slug] NVARCHAR(1000) NOT NULL,
    [description] NVARCHAR(4000) NOT NULL,
    [basePrice] DECIMAL(10,2) NOT NULL,
    [isCustomizable] BIT NOT NULL CONSTRAINT [products_isCustomizable_df] DEFAULT 1,
    [isActive] BIT NOT NULL CONSTRAINT [products_isActive_df] DEFAULT 1,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [products_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [products_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [products_code_key] UNIQUE NONCLUSTERED ([code]),
    CONSTRAINT [products_slug_key] UNIQUE NONCLUSTERED ([slug])
);

-- CreateTable
CREATE TABLE [dbo].[product_colors] (
    [id] NVARCHAR(1000) NOT NULL,
    [productId] NVARCHAR(1000) NOT NULL,
    [colorId] NVARCHAR(1000) NOT NULL,
    [frontImageUrl] NVARCHAR(1000) NOT NULL,
    [backImageUrl] NVARCHAR(1000) NOT NULL,
    CONSTRAINT [product_colors_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [product_colors_productId_colorId_key] UNIQUE NONCLUSTERED ([productId],[colorId])
);

-- CreateTable
CREATE TABLE [dbo].[product_sizes] (
    [id] NVARCHAR(1000) NOT NULL,
    [productId] NVARCHAR(1000) NOT NULL,
    [sizeId] NVARCHAR(1000) NOT NULL,
    [printAreaFrontWidthCm] FLOAT(53) NOT NULL,
    [printAreaFrontHeightCm] FLOAT(53) NOT NULL,
    [printAreaFrontOffsetXCm] FLOAT(53) NOT NULL,
    [printAreaFrontOffsetYCm] FLOAT(53) NOT NULL,
    [printAreaBackWidthCm] FLOAT(53) NOT NULL,
    [printAreaBackHeightCm] FLOAT(53) NOT NULL,
    [printAreaBackOffsetXCm] FLOAT(53) NOT NULL,
    [printAreaBackOffsetYCm] FLOAT(53) NOT NULL,
    [chestWidthCm] FLOAT(53) NOT NULL,
    [lengthCm] FLOAT(53) NOT NULL,
    [waistCm] FLOAT(53) NOT NULL,
    CONSTRAINT [product_sizes_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [product_sizes_productId_sizeId_key] UNIQUE NONCLUSTERED ([productId],[sizeId])
);

-- CreateTable
CREATE TABLE [dbo].[product_variants] (
    [id] NVARCHAR(1000) NOT NULL,
    [productId] NVARCHAR(1000) NOT NULL,
    [colorId] NVARCHAR(1000) NOT NULL,
    [sizeId] NVARCHAR(1000) NOT NULL,
    [sku] NVARCHAR(1000) NOT NULL,
    [stockQuantity] INT NOT NULL CONSTRAINT [product_variants_stockQuantity_df] DEFAULT 0,
    [priceOverride] DECIMAL(10,2),
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [product_variants_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [product_variants_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [product_variants_sku_key] UNIQUE NONCLUSTERED ([sku]),
    CONSTRAINT [product_variants_productId_colorId_sizeId_key] UNIQUE NONCLUSTERED ([productId],[colorId],[sizeId])
);

-- CreateTable
CREATE TABLE [dbo].[fonts] (
    [id] NVARCHAR(1000) NOT NULL,
    [name] NVARCHAR(1000) NOT NULL,
    [language] NVARCHAR(1000) NOT NULL,
    [fileUrl] NVARCHAR(1000) NOT NULL,
    [fontFamily] NVARCHAR(1000) NOT NULL,
    CONSTRAINT [fonts_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[design_categories] (
    [id] NVARCHAR(1000) NOT NULL,
    [name] NVARCHAR(1000) NOT NULL,
    CONSTRAINT [design_categories_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[design_assets] (
    [id] NVARCHAR(1000) NOT NULL,
    [name] NVARCHAR(1000) NOT NULL,
    [imageUrl] NVARCHAR(1000) NOT NULL,
    [designCategoryId] NVARCHAR(1000) NOT NULL,
    CONSTRAINT [design_assets_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[designs] (
    [id] NVARCHAR(1000) NOT NULL,
    [ownerUserId] NVARCHAR(1000) NOT NULL,
    [productVariantId] NVARCHAR(1000) NOT NULL,
    [side] NVARCHAR(1000) NOT NULL,
    [canvasJson] NVARCHAR(max) NOT NULL,
    [previewImageUrl] NVARCHAR(1000) NOT NULL,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [designs_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [designs_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[cart_items] (
    [id] NVARCHAR(1000) NOT NULL,
    [userId] NVARCHAR(1000) NOT NULL,
    [productVariantId] NVARCHAR(1000) NOT NULL,
    [quantity] INT NOT NULL,
    [frontDesignId] NVARCHAR(1000),
    [backDesignId] NVARCHAR(1000),
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [cart_items_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [cart_items_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[orders] (
    [id] NVARCHAR(1000) NOT NULL,
    [orderNumber] NVARCHAR(1000) NOT NULL,
    [userId] NVARCHAR(1000) NOT NULL,
    [status] NVARCHAR(1000) NOT NULL CONSTRAINT [orders_status_df] DEFAULT 'PENDING',
    [paymentMethod] NVARCHAR(1000) NOT NULL CONSTRAINT [orders_paymentMethod_df] DEFAULT 'COD',
    [subtotal] DECIMAL(10,2) NOT NULL,
    [shippingFee] DECIMAL(10,2) NOT NULL,
    [total] DECIMAL(10,2) NOT NULL,
    [shipFullName] NVARCHAR(1000) NOT NULL,
    [shipPhone] NVARCHAR(1000) NOT NULL,
    [shipLine1] NVARCHAR(1000) NOT NULL,
    [shipLine2] NVARCHAR(1000),
    [shipCity] NVARCHAR(1000) NOT NULL,
    [shipGovernorate] NVARCHAR(1000) NOT NULL,
    [shipPostalCode] NVARCHAR(1000),
    [shipCountry] NVARCHAR(1000) NOT NULL,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [orders_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [orders_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [orders_orderNumber_key] UNIQUE NONCLUSTERED ([orderNumber])
);

-- CreateTable
CREATE TABLE [dbo].[order_items] (
    [id] NVARCHAR(1000) NOT NULL,
    [orderId] NVARCHAR(1000) NOT NULL,
    [productVariantId] NVARCHAR(1000) NOT NULL,
    [productNameSnapshot] NVARCHAR(1000) NOT NULL,
    [colorNameSnapshot] NVARCHAR(1000) NOT NULL,
    [sizeNameSnapshot] NVARCHAR(1000) NOT NULL,
    [quantity] INT NOT NULL,
    [unitPrice] DECIMAL(10,2) NOT NULL,
    [frontDesignId] NVARCHAR(1000),
    [backDesignId] NVARCHAR(1000),
    CONSTRAINT [order_items_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- AddForeignKey
ALTER TABLE [dbo].[addresses] ADD CONSTRAINT [addresses_userId_fkey] FOREIGN KEY ([userId]) REFERENCES [dbo].[users]([id]) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[refresh_tokens] ADD CONSTRAINT [refresh_tokens_userId_fkey] FOREIGN KEY ([userId]) REFERENCES [dbo].[users]([id]) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[products] ADD CONSTRAINT [products_categoryId_fkey] FOREIGN KEY ([categoryId]) REFERENCES [dbo].[categories]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[product_colors] ADD CONSTRAINT [product_colors_productId_fkey] FOREIGN KEY ([productId]) REFERENCES [dbo].[products]([id]) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[product_colors] ADD CONSTRAINT [product_colors_colorId_fkey] FOREIGN KEY ([colorId]) REFERENCES [dbo].[colors]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[product_sizes] ADD CONSTRAINT [product_sizes_productId_fkey] FOREIGN KEY ([productId]) REFERENCES [dbo].[products]([id]) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[product_sizes] ADD CONSTRAINT [product_sizes_sizeId_fkey] FOREIGN KEY ([sizeId]) REFERENCES [dbo].[sizes]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[product_variants] ADD CONSTRAINT [product_variants_productId_fkey] FOREIGN KEY ([productId]) REFERENCES [dbo].[products]([id]) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[product_variants] ADD CONSTRAINT [product_variants_colorId_fkey] FOREIGN KEY ([colorId]) REFERENCES [dbo].[colors]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[product_variants] ADD CONSTRAINT [product_variants_sizeId_fkey] FOREIGN KEY ([sizeId]) REFERENCES [dbo].[sizes]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[design_assets] ADD CONSTRAINT [design_assets_designCategoryId_fkey] FOREIGN KEY ([designCategoryId]) REFERENCES [dbo].[design_categories]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[designs] ADD CONSTRAINT [designs_ownerUserId_fkey] FOREIGN KEY ([ownerUserId]) REFERENCES [dbo].[users]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[designs] ADD CONSTRAINT [designs_productVariantId_fkey] FOREIGN KEY ([productVariantId]) REFERENCES [dbo].[product_variants]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[cart_items] ADD CONSTRAINT [cart_items_userId_fkey] FOREIGN KEY ([userId]) REFERENCES [dbo].[users]([id]) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[cart_items] ADD CONSTRAINT [cart_items_productVariantId_fkey] FOREIGN KEY ([productVariantId]) REFERENCES [dbo].[product_variants]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[cart_items] ADD CONSTRAINT [cart_items_frontDesignId_fkey] FOREIGN KEY ([frontDesignId]) REFERENCES [dbo].[designs]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[cart_items] ADD CONSTRAINT [cart_items_backDesignId_fkey] FOREIGN KEY ([backDesignId]) REFERENCES [dbo].[designs]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[orders] ADD CONSTRAINT [orders_userId_fkey] FOREIGN KEY ([userId]) REFERENCES [dbo].[users]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[order_items] ADD CONSTRAINT [order_items_orderId_fkey] FOREIGN KEY ([orderId]) REFERENCES [dbo].[orders]([id]) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[order_items] ADD CONSTRAINT [order_items_productVariantId_fkey] FOREIGN KEY ([productVariantId]) REFERENCES [dbo].[product_variants]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[order_items] ADD CONSTRAINT [order_items_frontDesignId_fkey] FOREIGN KEY ([frontDesignId]) REFERENCES [dbo].[designs]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[order_items] ADD CONSTRAINT [order_items_backDesignId_fkey] FOREIGN KEY ([backDesignId]) REFERENCES [dbo].[designs]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
