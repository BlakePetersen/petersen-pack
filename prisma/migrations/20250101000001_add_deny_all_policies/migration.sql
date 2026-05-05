-- ABOUTME: Adds explicit deny-all RLS policies to silence Supabase linter
-- ABOUTME: These policies block all PostgREST access (Prisma service role bypasses RLS)

-- Create deny-all policies for each table
CREATE POLICY "deny_all" ON "AvailabilitySlot" FOR ALL USING (false);
CREATE POLICY "deny_all" ON "BlogCategory" FOR ALL USING (false);
CREATE POLICY "deny_all" ON "BlogPost" FOR ALL USING (false);
CREATE POLICY "deny_all" ON "BlogPostCategory" FOR ALL USING (false);
CREATE POLICY "deny_all" ON "BlogPostImage" FOR ALL USING (false);
CREATE POLICY "deny_all" ON "BlogPostTag" FOR ALL USING (false);
CREATE POLICY "deny_all" ON "BlogTag" FOR ALL USING (false);
CREATE POLICY "deny_all" ON "Booking" FOR ALL USING (false);
CREATE POLICY "deny_all" ON "ChangeRequest" FOR ALL USING (false);
CREATE POLICY "deny_all" ON "ClientGallery" FOR ALL USING (false);
CREATE POLICY "deny_all" ON "ClientImage" FOR ALL USING (false);
CREATE POLICY "deny_all" ON "Contract" FOR ALL USING (false);
CREATE POLICY "deny_all" ON "ContractTemplate" FOR ALL USING (false);
CREATE POLICY "deny_all" ON "ContractUsageRight" FOR ALL USING (false);
CREATE POLICY "deny_all" ON "Faq" FOR ALL USING (false);
CREATE POLICY "deny_all" ON "Gallery" FOR ALL USING (false);
CREATE POLICY "deny_all" ON "GalleryPreference" FOR ALL USING (false);
CREATE POLICY "deny_all" ON "HeroSlide" FOR ALL USING (false);
CREATE POLICY "deny_all" ON "HomepageContent" FOR ALL USING (false);
CREATE POLICY "deny_all" ON "Image" FOR ALL USING (false);
CREATE POLICY "deny_all" ON "InfoCard" FOR ALL USING (false);
CREATE POLICY "deny_all" ON "Inquiry" FOR ALL USING (false);
CREATE POLICY "deny_all" ON "Payment" FOR ALL USING (false);
CREATE POLICY "deny_all" ON "PricingAddOn" FOR ALL USING (false);
CREATE POLICY "deny_all" ON "PricingCategory" FOR ALL USING (false);
CREATE POLICY "deny_all" ON "PricingPackage" FOR ALL USING (false);
CREATE POLICY "deny_all" ON "ProcessStep" FOR ALL USING (false);
CREATE POLICY "deny_all" ON "RetouchRequest" FOR ALL USING (false);
CREATE POLICY "deny_all" ON "Service" FOR ALL USING (false);
CREATE POLICY "deny_all" ON "ServiceImage" FOR ALL USING (false);
CREATE POLICY "deny_all" ON "ServiceInfoCard" FOR ALL USING (false);
CREATE POLICY "deny_all" ON "ServiceProcessStep" FOR ALL USING (false);
CREATE POLICY "deny_all" ON "Session" FOR ALL USING (false);
CREATE POLICY "deny_all" ON "Testimonial" FOR ALL USING (false);
CREATE POLICY "deny_all" ON "UsageRight" FOR ALL USING (false);
CREATE POLICY "deny_all" ON "User" FOR ALL USING (false);
CREATE POLICY "deny_all" ON "_prisma_migrations" FOR ALL USING (false);
