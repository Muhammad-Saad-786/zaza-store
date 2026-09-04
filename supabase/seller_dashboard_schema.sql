-- =========================================================
-- ZAZA STORE: SELLER DASHBOARD SUPABASE DATABASE SCHEMA
-- Execute this script in your Supabase SQL Editor
-- =========================================================

-- 1. EXTEND PROFILES TABLE WITH SELLER FIELDS (IF NOT EXISTS)
ALTER TABLE IF EXISTS public.profiles 
  ADD COLUMN IF NOT EXISTS banner_url TEXT,
  ADD COLUMN IF NOT EXISTS trust_score NUMERIC DEFAULT 100,
  ADD COLUMN IF NOT EXISTS total_sales INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS completed_orders INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS cancelled_orders INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS avg_response_time INTEGER DEFAULT 15, -- in minutes
  ADD COLUMN IF NOT EXISTS two_factor_enabled BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS default_currency TEXT DEFAULT 'USD',
  ADD COLUMN IF NOT EXISTS timezone TEXT DEFAULT 'UTC',
  ADD COLUMN IF NOT EXISTS email_notifications BOOLEAN DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS push_notifications BOOLEAN DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS sms_notifications BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS social_discord TEXT,
  ADD COLUMN IF NOT EXISTS social_whatsapp TEXT,
  ADD COLUMN IF NOT EXISTS social_telegram TEXT,
  ADD COLUMN IF NOT EXISTS social_instagram TEXT;

-- 2. EXTEND ACCOUNTS TABLE WITH STATUS AND AUTO-RULES
ALTER TABLE IF EXISTS public.accounts
  ADD COLUMN IF NOT EXISTS views INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS clicks INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS highest_rank TEXT,
  ADD COLUMN IF NOT EXISTS stars INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS win_rate NUMERIC DEFAULT 0,
  ADD COLUMN IF NOT EXISTS hero_count INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS skin_count INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS collector_count INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS legend_count INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS is_negotiable BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS auto_price_enabled BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS auto_relist_enabled BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS is_archived BOOLEAN DEFAULT FALSE;

-- 3. EXTEND ORDERS TABLE WITH ESCROW & CREDENTIALS
ALTER TABLE IF EXISTS public.orders
  ADD COLUMN IF NOT EXISTS escrow_status TEXT DEFAULT 'awaiting_payment',
  ADD COLUMN IF NOT EXISTS payment_method TEXT,
  ADD COLUMN IF NOT EXISTS payment_proof TEXT,
  ADD COLUMN IF NOT EXISTS credentials_delivered TEXT,
  ADD COLUMN IF NOT EXISTS notes TEXT;

-- 4. WITHDRAWALS TABLE
CREATE TABLE IF NOT EXISTS public.withdrawals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  seller_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  amount NUMERIC NOT NULL CHECK (amount > 0),
  fee NUMERIC DEFAULT 0,
  net_amount NUMERIC NOT NULL,
  payment_method TEXT NOT NULL,
  account_details JSONB DEFAULT '{}'::jsonb,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'rejected')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS for withdrawals
ALTER TABLE public.withdrawals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Sellers can view their own withdrawals"
  ON public.withdrawals FOR SELECT
  USING (auth.uid() = seller_id);

CREATE POLICY "Sellers can insert their own withdrawals"
  ON public.withdrawals FOR INSERT
  WITH CHECK (auth.uid() = seller_id);

CREATE POLICY "Admins can manage all withdrawals"
  ON public.withdrawals FOR ALL
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- 5. REVIEWS & RATINGS REPLIES EXTENSION
ALTER TABLE IF EXISTS public.reviews
  ADD COLUMN IF NOT EXISTS seller_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS reply TEXT,
  ADD COLUMN IF NOT EXISTS reply_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS is_pinned BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS is_reported BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS report_reason TEXT;

-- 6. SELLER SAVED REPLIES (CANNED RESPONSES)
CREATE TABLE IF NOT EXISTS public.seller_saved_replies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  seller_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  shortcut TEXT,
  category TEXT DEFAULT 'general',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.seller_saved_replies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Sellers can manage their own saved replies"
  ON public.seller_saved_replies FOR ALL
  USING (auth.uid() = seller_id)
  WITH CHECK (auth.uid() = seller_id);

-- 7. SELLER AUTOMATION RULES
CREATE TABLE IF NOT EXISTS public.seller_automation_rules (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  seller_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  rule_type TEXT NOT NULL CHECK (rule_type IN ('auto_pricing', 'auto_relisting', 'competitor_tracking')),
  title TEXT NOT NULL,
  settings JSONB NOT NULL DEFAULT '{}'::jsonb,
  is_enabled BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.seller_automation_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Sellers can manage their own automation rules"
  ON public.seller_automation_rules FOR ALL
  USING (auth.uid() = seller_id)
  WITH CHECK (auth.uid() = seller_id);

-- 8. SELLER ANALYTICS SNAPSHOTS (DAILY AGGREGATES)
CREATE TABLE IF NOT EXISTS public.seller_analytics_snapshots (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  seller_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  views INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  orders_count INTEGER DEFAULT 0,
  revenue NUMERIC DEFAULT 0,
  conversion_rate NUMERIC DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE (seller_id, date)
);

ALTER TABLE public.seller_analytics_snapshots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Sellers can view their analytics snapshots"
  ON public.seller_analytics_snapshots FOR SELECT
  USING (auth.uid() = seller_id);

-- 9. HELPER FUNCTIONS
CREATE OR REPLACE FUNCTION public.increment_seller_sales(seller_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.profiles
  SET 
    total_sales = COALESCE(total_sales, 0) + 1,
    completed_orders = COALESCE(completed_orders, 0) + 1
  WHERE id = seller_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
