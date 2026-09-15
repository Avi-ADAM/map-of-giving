CREATE TYPE "public"."spot_status" AS ENUM('active', 'closed');--> statement-breakpoint
CREATE TYPE "public"."spot_visit_outcome" AS ENUM('found', 'empty', 'unusable', 'stopped');--> statement-breakpoint
CREATE TABLE "spot" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"category" "category" NOT NULL,
	"description" text NOT NULL,
	"when_hint" text,
	"lat" double precision NOT NULL,
	"lng" double precision NOT NULL,
	"status" "spot_status" DEFAULT 'active' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"last_found_at" timestamp with time zone,
	"closed_at" timestamp with time zone,
	"anon_id" text NOT NULL,
	"user_id" text
);
--> statement-breakpoint
CREATE TABLE "spot_visit" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"spot_id" uuid NOT NULL,
	"outcome" "spot_visit_outcome" NOT NULL,
	"anon_id" text NOT NULL,
	"user_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "spot_visit" ADD CONSTRAINT "spot_visit_spot_id_spot_id_fk" FOREIGN KEY ("spot_id") REFERENCES "public"."spot"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "spot_status_idx" ON "spot" USING btree ("status");--> statement-breakpoint
CREATE INDEX "spot_location_idx" ON "spot" USING btree ("lat","lng");--> statement-breakpoint
CREATE INDEX "spot_anon_created_idx" ON "spot" USING btree ("anon_id","created_at");--> statement-breakpoint
CREATE INDEX "spot_visit_spot_created_idx" ON "spot_visit" USING btree ("spot_id","created_at");