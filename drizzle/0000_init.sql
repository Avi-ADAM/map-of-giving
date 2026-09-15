CREATE TYPE "public"."category" AS ENUM('food', 'furniture', 'clothing', 'kids', 'household', 'other');--> statement-breakpoint
CREATE TYPE "public"."listing_status" AS ENUM('available', 'gone');--> statement-breakpoint
CREATE TYPE "public"."report_kind" AS ENUM('still_there', 'taken', 'not_found', 'unusable');--> statement-breakpoint
CREATE TABLE "listing" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"category" "category" NOT NULL,
	"description" text NOT NULL,
	"location_hint" text,
	"lat" double precision NOT NULL,
	"lng" double precision NOT NULL,
	"status" "listing_status" DEFAULT 'available' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"last_confirmed_at" timestamp with time zone DEFAULT now() NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"gone_at" timestamp with time zone,
	"anon_id" text NOT NULL,
	"user_id" text
);
--> statement-breakpoint
CREATE TABLE "report" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"listing_id" uuid NOT NULL,
	"kind" "report_kind" NOT NULL,
	"anon_id" text NOT NULL,
	"user_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "report" ADD CONSTRAINT "report_listing_id_listing_id_fk" FOREIGN KEY ("listing_id") REFERENCES "public"."listing"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "listing_active_idx" ON "listing" USING btree ("status","expires_at");--> statement-breakpoint
CREATE INDEX "listing_location_idx" ON "listing" USING btree ("lat","lng");--> statement-breakpoint
CREATE INDEX "listing_anon_created_idx" ON "listing" USING btree ("anon_id","created_at");--> statement-breakpoint
CREATE INDEX "report_listing_created_idx" ON "report" USING btree ("listing_id","created_at");