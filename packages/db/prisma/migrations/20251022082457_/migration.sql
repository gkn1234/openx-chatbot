-- CreateTable
CREATE TABLE `t_chatbot_agent` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(255) NOT NULL DEFAULT '',
    `desc` VARCHAR(255) NOT NULL DEFAULT '',
    `modelId` INTEGER NOT NULL,
    `tools` TEXT NOT NULL,
    `maxRound` INTEGER NOT NULL DEFAULT 5,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `t_chatbot_agent_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `t_chatbot_conversation` (
    `id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(255) NOT NULL DEFAULT '',
    `userId` VARCHAR(255) NOT NULL DEFAULT '',
    `status` ENUM('normal', 'disabled', 'buzy') NOT NULL DEFAULT 'normal',
    `type` ENUM('main', 'sub') NOT NULL DEFAULT 'main',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `t_chatbot_feedback` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` VARCHAR(255) NOT NULL DEFAULT '',
    `rating` ENUM('like', 'dislike') NULL,
    `content` VARCHAR(1023) NOT NULL DEFAULT '',
    `messageId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `t_chatbot_feedback_messageId_userId_key`(`messageId`, `userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `t_chatbot_memory` (
    `id` VARCHAR(191) NOT NULL,
    `content` LONGTEXT NOT NULL,
    `sign` VARCHAR(255) NOT NULL,
    `type` ENUM('toolcall') NOT NULL,
    `conversationId` VARCHAR(191) NOT NULL,
    `messageId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `expiresAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `t_chatbot_memory_sign_type_conversationId_messageId_key`(`sign`, `type`, `conversationId`, `messageId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `t_chatbot_message` (
    `id` VARCHAR(191) NOT NULL,
    `inputs` JSON NOT NULL,
    `query` LONGTEXT NOT NULL,
    `processContent` LONGTEXT NOT NULL,
    `answer` LONGTEXT NOT NULL,
    `agentId` INTEGER NOT NULL,
    `conversationId` VARCHAR(191) NOT NULL,
    `status` ENUM('success', 'running', 'failed', 'stopped') NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `t_chatbot_model` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `provider` VARCHAR(255) NOT NULL DEFAULT '',
    `name` VARCHAR(255) NOT NULL DEFAULT '',
    `desc` VARCHAR(255) NOT NULL DEFAULT '',
    `baseUrl` VARCHAR(255) NOT NULL DEFAULT '',
    `apiKey` VARCHAR(1023) NOT NULL DEFAULT '',
    `selectable` BOOLEAN NOT NULL DEFAULT true,
    `maxTokens` INTEGER NOT NULL DEFAULT 0,
    `outputTokens` INTEGER NOT NULL DEFAULT 0,
    `tokenEncoding` VARCHAR(255) NOT NULL DEFAULT '',

    UNIQUE INDEX `t_chatbot_model_provider_name_key`(`provider`, `name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `t_chatbot_agent` ADD CONSTRAINT `t_chatbot_agent_modelId_fkey` FOREIGN KEY (`modelId`) REFERENCES `t_chatbot_model`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `t_chatbot_feedback` ADD CONSTRAINT `t_chatbot_feedback_messageId_fkey` FOREIGN KEY (`messageId`) REFERENCES `t_chatbot_message`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `t_chatbot_memory` ADD CONSTRAINT `t_chatbot_memory_conversationId_fkey` FOREIGN KEY (`conversationId`) REFERENCES `t_chatbot_conversation`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `t_chatbot_memory` ADD CONSTRAINT `t_chatbot_memory_messageId_fkey` FOREIGN KEY (`messageId`) REFERENCES `t_chatbot_message`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `t_chatbot_message` ADD CONSTRAINT `t_chatbot_message_agentId_fkey` FOREIGN KEY (`agentId`) REFERENCES `t_chatbot_agent`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `t_chatbot_message` ADD CONSTRAINT `t_chatbot_message_conversationId_fkey` FOREIGN KEY (`conversationId`) REFERENCES `t_chatbot_conversation`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
