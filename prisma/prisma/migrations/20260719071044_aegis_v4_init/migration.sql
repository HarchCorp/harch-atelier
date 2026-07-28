-- CreateTable
CREATE TABLE "Company" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "aliases" TEXT NOT NULL,
    "sector" TEXT NOT NULL,
    "ticker" TEXT,
    "foundedYear" INTEGER,
    "headquarters" TEXT,
    "website" TEXT,
    "description" TEXT,
    "logoUrl" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Article" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "companyId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "sourceId" TEXT,
    "publishedAt" DATETIME,
    "scrapedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "content" TEXT,
    "summary" TEXT,
    "language" TEXT,
    "sentimentLabel" TEXT,
    "sentimentScore" REAL,
    "relevanceScore" REAL,
    "urlHash" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Article_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SocialMention" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "companyId" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "handle" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "url" TEXT,
    "likes" INTEGER,
    "shares" INTEGER,
    "comments" INTEGER,
    "sentimentLabel" TEXT,
    "sentimentScore" REAL,
    "publishedAt" DATETIME,
    "scrapedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SocialMention_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "RegulatoryFiling" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "companyId" TEXT NOT NULL,
    "regulator" TEXT NOT NULL,
    "filingType" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "url" TEXT,
    "summary" TEXT,
    "publishedAt" DATETIME,
    "scrapedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "RegulatoryFiling_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SentimentScore" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "companyId" TEXT NOT NULL,
    "score" REAL NOT NULL,
    "positivePct" REAL NOT NULL,
    "neutralPct" REAL NOT NULL,
    "negativePct" REAL NOT NULL,
    "articleCount" INTEGER NOT NULL,
    "language" TEXT,
    "sourceBreakdown" TEXT,
    "calculatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SentimentScore_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "RiskAssessment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "companyId" TEXT NOT NULL,
    "overallRisk" REAL NOT NULL,
    "riskLevel" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "frequency" REAL,
    "impactSeverity" REAL,
    "velocity" REAL,
    "riskScore" REAL NOT NULL,
    "trajectory" TEXT,
    "recommendation" TEXT,
    "articleCount" INTEGER,
    "assessedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "RiskAssessment_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ReputationScore" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "companyId" TEXT NOT NULL,
    "overall" REAL NOT NULL,
    "sentiment" REAL,
    "aiVisibility" REAL,
    "volume" REAL,
    "authority" REAL,
    "innovationScore" REAL,
    "innovationWeight" REAL,
    "performanceScore" REAL,
    "performanceWeight" REAL,
    "purposeScore" REAL,
    "purposeWeight" REAL,
    "shareOfVoice" REAL,
    "trend" TEXT,
    "calculatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ReputationScore_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AIVisibility" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "companyId" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "cited" BOOLEAN NOT NULL,
    "position" TEXT,
    "sentiment" TEXT,
    "confidence" REAL,
    "summary" TEXT,
    "checkedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AIVisibility_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ThreatScore" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "companyId" TEXT NOT NULL,
    "overall" REAL NOT NULL,
    "sentimentFactor" REAL,
    "riskFactor" REAL,
    "sourceFactor" REAL,
    "recencyFactor" REAL,
    "trajectory" TEXT,
    "assessedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ThreatScore_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Alert" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "companyId" TEXT NOT NULL,
    "alertType" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "evidence" TEXT,
    "detectedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "acknowledgedAt" DATETIME,
    "resolvedAt" DATETIME,
    "status" TEXT NOT NULL DEFAULT 'active',
    "recommendations" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Alert_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Entity" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "entityType" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "aliases" TEXT NOT NULL,
    "confidence" REAL NOT NULL DEFAULT 0.5,
    "firstSeen" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastSeen" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sources" TEXT NOT NULL,
    "tags" TEXT NOT NULL,
    "metadata" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "EntityMention" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "entityId" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "articleId" TEXT,
    "mentionText" TEXT NOT NULL,
    "sentimentLabel" TEXT,
    "sentimentScore" REAL,
    "mentionedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "EntityMention_entityId_fkey" FOREIGN KEY ("entityId") REFERENCES "Entity" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "EntityMention_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "GraphNode" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nodeType" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "properties" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "GraphEdge" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sourceId" TEXT NOT NULL,
    "targetId" TEXT NOT NULL,
    "edgeType" TEXT NOT NULL,
    "weight" REAL NOT NULL DEFAULT 1.0,
    "firstSeen" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastSeen" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "metadata" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "GraphEdge_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "Entity" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "GraphEdge_targetId_fkey" FOREIGN KEY ("targetId") REFERENCES "Entity" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "NarrativeIntel" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "companyId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "sentiment" TEXT,
    "intensity" REAL,
    "momentum" TEXT,
    "articleCount" INTEGER,
    "firstSeen" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastSeen" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL DEFAULT 'active',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "NarrativeIntel_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CyberIntel" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "companyId" TEXT NOT NULL,
    "threatType" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "source" TEXT,
    "cveId" TEXT,
    "iocIndicators" TEXT,
    "detectedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CyberIntel_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Valuation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "companyId" TEXT NOT NULL,
    "marketCap" REAL,
    "sharePrice" REAL,
    "currency" TEXT NOT NULL DEFAULT 'MAD',
    "pERatio" REAL,
    "source" TEXT,
    "recordedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Valuation_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CompetitiveIntel" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "companyId" TEXT NOT NULL,
    "competitorName" TEXT NOT NULL,
    "threatLevel" TEXT NOT NULL,
    "threatDescription" TEXT,
    "marketShareDelta" REAL,
    "sentimentGap" REAL,
    "aiVisibilityGap" REAL,
    "assessedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CompetitiveIntel_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "TechnicalIntel" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "companyId" TEXT NOT NULL,
    "intelType" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "source" TEXT,
    "severity" TEXT,
    "metadata" TEXT,
    "detectedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "TechnicalIntel_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "BlockchainIntel" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "companyId" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "addressType" TEXT NOT NULL,
    "cluster" TEXT,
    "transactionHash" TEXT,
    "amount" REAL,
    "currency" TEXT,
    "flowDirection" TEXT,
    "detectedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "BlockchainIntel_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SatelliteIntel" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "companyId" TEXT NOT NULL,
    "imageryType" TEXT NOT NULL,
    "location" TEXT,
    "coordinates" TEXT,
    "analysisResult" TEXT,
    "capturedAt" DATETIME,
    "processedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SatelliteIntel_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ImageAnalysis" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "companyId" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "sourceUrl" TEXT,
    "exifData" TEXT,
    "gpsCoordinates" TEXT,
    "shadowAnalysis" TEXT,
    "analysisResult" TEXT,
    "analyzedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ImageAnalysis_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "GLMAnalysis" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "inputHash" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "promptType" TEXT NOT NULL,
    "inputPayload" TEXT NOT NULL,
    "outputPayload" TEXT NOT NULL,
    "inputTokens" INTEGER,
    "outputTokens" INTEGER,
    "latencyMs" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Job" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "jobType" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "payload" TEXT,
    "result" TEXT,
    "error" TEXT,
    "scheduledAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "startedAt" DATETIME,
    "completedAt" DATETIME,
    "durationMs" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "ScraperLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sourceId" TEXT NOT NULL,
    "sourceName" TEXT NOT NULL,
    "sourceUrl" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "articlesFound" INTEGER NOT NULL DEFAULT 0,
    "articlesNew" INTEGER NOT NULL DEFAULT 0,
    "errorMessage" TEXT,
    "durationMs" INTEGER,
    "startedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" DATETIME
);

-- CreateTable
CREATE TABLE "SystemLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "level" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "metadata" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT,
    "action" TEXT NOT NULL,
    "resource" TEXT NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "result" TEXT NOT NULL,
    "metadata" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "passwordHash" TEXT,
    "role" TEXT NOT NULL DEFAULT 'user',
    "tier" TEXT NOT NULL DEFAULT 'free',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expiresAt" DATETIME NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ApiKey" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "keyHash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "tier" TEXT NOT NULL DEFAULT 'pro',
    "lastUsedAt" DATETIME,
    "expiresAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ApiKey_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Company_slug_key" ON "Company"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Article_url_key" ON "Article"("url");

-- CreateIndex
CREATE UNIQUE INDEX "Article_urlHash_key" ON "Article"("urlHash");

-- CreateIndex
CREATE INDEX "Article_companyId_publishedAt_idx" ON "Article"("companyId", "publishedAt");

-- CreateIndex
CREATE INDEX "Article_source_idx" ON "Article"("source");

-- CreateIndex
CREATE INDEX "Article_sentimentLabel_idx" ON "Article"("sentimentLabel");

-- CreateIndex
CREATE INDEX "SocialMention_companyId_platform_idx" ON "SocialMention"("companyId", "platform");

-- CreateIndex
CREATE INDEX "SocialMention_companyId_publishedAt_idx" ON "SocialMention"("companyId", "publishedAt");

-- CreateIndex
CREATE INDEX "RegulatoryFiling_companyId_regulator_idx" ON "RegulatoryFiling"("companyId", "regulator");

-- CreateIndex
CREATE INDEX "RegulatoryFiling_companyId_publishedAt_idx" ON "RegulatoryFiling"("companyId", "publishedAt");

-- CreateIndex
CREATE INDEX "SentimentScore_companyId_calculatedAt_idx" ON "SentimentScore"("companyId", "calculatedAt");

-- CreateIndex
CREATE INDEX "RiskAssessment_companyId_assessedAt_idx" ON "RiskAssessment"("companyId", "assessedAt");

-- CreateIndex
CREATE INDEX "RiskAssessment_riskLevel_idx" ON "RiskAssessment"("riskLevel");

-- CreateIndex
CREATE INDEX "RiskAssessment_category_idx" ON "RiskAssessment"("category");

-- CreateIndex
CREATE INDEX "ReputationScore_companyId_calculatedAt_idx" ON "ReputationScore"("companyId", "calculatedAt");

-- CreateIndex
CREATE INDEX "AIVisibility_companyId_platform_idx" ON "AIVisibility"("companyId", "platform");

-- CreateIndex
CREATE INDEX "AIVisibility_companyId_checkedAt_idx" ON "AIVisibility"("companyId", "checkedAt");

-- CreateIndex
CREATE INDEX "ThreatScore_companyId_assessedAt_idx" ON "ThreatScore"("companyId", "assessedAt");

-- CreateIndex
CREATE INDEX "Alert_companyId_status_idx" ON "Alert"("companyId", "status");

-- CreateIndex
CREATE INDEX "Alert_severity_idx" ON "Alert"("severity");

-- CreateIndex
CREATE INDEX "Alert_detectedAt_idx" ON "Alert"("detectedAt");

-- CreateIndex
CREATE INDEX "Entity_entityType_idx" ON "Entity"("entityType");

-- CreateIndex
CREATE INDEX "Entity_name_idx" ON "Entity"("name");

-- CreateIndex
CREATE INDEX "EntityMention_entityId_idx" ON "EntityMention"("entityId");

-- CreateIndex
CREATE INDEX "EntityMention_companyId_idx" ON "EntityMention"("companyId");

-- CreateIndex
CREATE INDEX "GraphNode_nodeType_idx" ON "GraphNode"("nodeType");

-- CreateIndex
CREATE INDEX "GraphNode_label_idx" ON "GraphNode"("label");

-- CreateIndex
CREATE INDEX "GraphEdge_sourceId_idx" ON "GraphEdge"("sourceId");

-- CreateIndex
CREATE INDEX "GraphEdge_targetId_idx" ON "GraphEdge"("targetId");

-- CreateIndex
CREATE INDEX "GraphEdge_edgeType_idx" ON "GraphEdge"("edgeType");

-- CreateIndex
CREATE INDEX "NarrativeIntel_companyId_status_idx" ON "NarrativeIntel"("companyId", "status");

-- CreateIndex
CREATE INDEX "CyberIntel_companyId_severity_idx" ON "CyberIntel"("companyId", "severity");

-- CreateIndex
CREATE INDEX "Valuation_companyId_recordedAt_idx" ON "Valuation"("companyId", "recordedAt");

-- CreateIndex
CREATE INDEX "CompetitiveIntel_companyId_idx" ON "CompetitiveIntel"("companyId");

-- CreateIndex
CREATE INDEX "TechnicalIntel_companyId_intelType_idx" ON "TechnicalIntel"("companyId", "intelType");

-- CreateIndex
CREATE INDEX "BlockchainIntel_companyId_idx" ON "BlockchainIntel"("companyId");

-- CreateIndex
CREATE INDEX "BlockchainIntel_address_idx" ON "BlockchainIntel"("address");

-- CreateIndex
CREATE INDEX "SatelliteIntel_companyId_idx" ON "SatelliteIntel"("companyId");

-- CreateIndex
CREATE INDEX "ImageAnalysis_companyId_idx" ON "ImageAnalysis"("companyId");

-- CreateIndex
CREATE UNIQUE INDEX "GLMAnalysis_inputHash_key" ON "GLMAnalysis"("inputHash");

-- CreateIndex
CREATE INDEX "GLMAnalysis_inputHash_idx" ON "GLMAnalysis"("inputHash");

-- CreateIndex
CREATE INDEX "GLMAnalysis_promptType_idx" ON "GLMAnalysis"("promptType");

-- CreateIndex
CREATE INDEX "GLMAnalysis_createdAt_idx" ON "GLMAnalysis"("createdAt");

-- CreateIndex
CREATE INDEX "Job_jobType_status_idx" ON "Job"("jobType", "status");

-- CreateIndex
CREATE INDEX "Job_status_idx" ON "Job"("status");

-- CreateIndex
CREATE INDEX "ScraperLog_sourceId_startedAt_idx" ON "ScraperLog"("sourceId", "startedAt");

-- CreateIndex
CREATE INDEX "ScraperLog_status_idx" ON "ScraperLog"("status");

-- CreateIndex
CREATE INDEX "SystemLog_level_createdAt_idx" ON "SystemLog"("level", "createdAt");

-- CreateIndex
CREATE INDEX "SystemLog_category_idx" ON "SystemLog"("category");

-- CreateIndex
CREATE INDEX "AuditLog_userId_createdAt_idx" ON "AuditLog"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "AuditLog_action_idx" ON "AuditLog"("action");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Session_token_key" ON "Session"("token");

-- CreateIndex
CREATE INDEX "Session_userId_idx" ON "Session"("userId");

-- CreateIndex
CREATE INDEX "Session_expiresAt_idx" ON "Session"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "ApiKey_keyHash_key" ON "ApiKey"("keyHash");

-- CreateIndex
CREATE INDEX "ApiKey_userId_idx" ON "ApiKey"("userId");

-- CreateIndex
CREATE INDEX "ApiKey_keyHash_idx" ON "ApiKey"("keyHash");
