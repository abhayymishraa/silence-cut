CREATE TABLE "video_processor_account" (
	"userId" varchar(255) NOT NULL,
	"type" varchar(255) NOT NULL,
	"provider" varchar(255) NOT NULL,
	"providerAccountId" varchar(255) NOT NULL,
	"refresh_token" text,
	"access_token" text,
	"expires_at" integer,
	"token_type" varchar(255),
	"scope" varchar(255),
	"id_token" text,
	"session_state" varchar(255),
	CONSTRAINT "video_processor_account_provider_providerAccountId_pk" PRIMARY KEY("provider","providerAccountId")
);
--> statement-breakpoint
CREATE TABLE "video_processor_membership" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"userId" varchar(255) NOT NULL,
	"workspaceId" varchar(255) NOT NULL,
	"role" varchar(50) DEFAULT 'member' NOT NULL,
	"createdAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	CONSTRAINT "membership_user_workspace_unique" UNIQUE("userId","workspaceId")
);
--> statement-breakpoint
CREATE TABLE "video_processor_payment" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"workspaceId" varchar(255) NOT NULL,
	"stripeSessionId" varchar(255) NOT NULL,
	"amount" integer NOT NULL,
	"credits" integer NOT NULL,
	"status" varchar(50) DEFAULT 'pending' NOT NULL,
	"createdAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"completedAt" timestamp with time zone,
	CONSTRAINT "payment_stripe_session_id_unique" UNIQUE("stripeSessionId")
);
--> statement-breakpoint
CREATE TABLE "video_processor_session" (
	"sessionToken" varchar(255) PRIMARY KEY NOT NULL,
	"userId" varchar(255) NOT NULL,
	"expires" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "video_processor_user" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"name" varchar(255),
	"email" varchar(255) NOT NULL,
	"emailVerified" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
	"image" varchar(255),
	"createdAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "video_processor_verification_token" (
	"identifier" varchar(255) NOT NULL,
	"token" varchar(255) NOT NULL,
	"expires" timestamp with time zone NOT NULL,
	CONSTRAINT "video_processor_verification_token_identifier_token_pk" PRIMARY KEY("identifier","token")
);
--> statement-breakpoint
CREATE TABLE "video_processor_video_job" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"workspaceId" varchar(255) NOT NULL,
	"userId" varchar(255) NOT NULL,
	"originalUrl" varchar(500) NOT NULL,
	"processedUrl" varchar(500),
	"status" varchar(50) DEFAULT 'queued' NOT NULL,
	"duration" integer,
	"errorMessage" text,
	"createdAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"completedAt" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "video_processor_workspace" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"slug" varchar(255) NOT NULL,
	"logoUrl" varchar(500),
	"primaryColor" varchar(7) DEFAULT '#3b82f6',
	"customDomain" varchar(255),
	"credits" integer DEFAULT 1 NOT NULL,
	"createdAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updatedAt" timestamp with time zone,
	CONSTRAINT "workspace_slug_unique" UNIQUE("slug"),
	CONSTRAINT "workspace_custom_domain_unique" UNIQUE("customDomain")
);
--> statement-breakpoint
ALTER TABLE "video_processor_account" ADD CONSTRAINT "video_processor_account_userId_video_processor_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."video_processor_user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "video_processor_membership" ADD CONSTRAINT "video_processor_membership_userId_video_processor_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."video_processor_user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "video_processor_membership" ADD CONSTRAINT "video_processor_membership_workspaceId_video_processor_workspace_id_fk" FOREIGN KEY ("workspaceId") REFERENCES "public"."video_processor_workspace"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "video_processor_payment" ADD CONSTRAINT "video_processor_payment_workspaceId_video_processor_workspace_id_fk" FOREIGN KEY ("workspaceId") REFERENCES "public"."video_processor_workspace"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "video_processor_session" ADD CONSTRAINT "video_processor_session_userId_video_processor_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."video_processor_user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "video_processor_video_job" ADD CONSTRAINT "video_processor_video_job_workspaceId_video_processor_workspace_id_fk" FOREIGN KEY ("workspaceId") REFERENCES "public"."video_processor_workspace"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "video_processor_video_job" ADD CONSTRAINT "video_processor_video_job_userId_video_processor_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."video_processor_user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "account_user_id_idx" ON "video_processor_account" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "membership_user_id_idx" ON "video_processor_membership" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "membership_workspace_id_idx" ON "video_processor_membership" USING btree ("workspaceId");--> statement-breakpoint
CREATE INDEX "payment_workspace_id_idx" ON "video_processor_payment" USING btree ("workspaceId");--> statement-breakpoint
CREATE INDEX "payment_status_idx" ON "video_processor_payment" USING btree ("status");--> statement-breakpoint
CREATE INDEX "session_user_id_idx" ON "video_processor_session" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "video_job_workspace_id_idx" ON "video_processor_video_job" USING btree ("workspaceId");--> statement-breakpoint
CREATE INDEX "video_job_user_id_idx" ON "video_processor_video_job" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "video_job_status_idx" ON "video_processor_video_job" USING btree ("status");--> statement-breakpoint
CREATE INDEX "video_job_created_at_idx" ON "video_processor_video_job" USING btree ("createdAt");--> statement-breakpoint
CREATE INDEX "workspace_slug_idx" ON "video_processor_workspace" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "workspace_custom_domain_idx" ON "video_processor_workspace" USING btree ("customDomain");