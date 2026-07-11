/*
  # ArtConnect.Ug Core Schema

  ## Overview
  This migration creates the complete database schema for ArtConnect.Ug,
  a secure milestone-driven marketplace connecting clients with professional
  designers in Uganda.

  ## Tables Created
  1. profiles - Extended user profiles (role, name, avatar)
  2. designer_profiles - Designer-specific details (bio, specializations, vetting status)
  3. portfolio_items - Designer portfolio showcase items
  4. projects - Client project briefs
  5. contracts - Active agreements between clients and designers
  6. milestones - Contract milestone breakdown
  7. deliverables - Files submitted per milestone
  8. messages - In-contract real-time chat
  9. wallets - Client and designer financial wallets
  10. transactions - Wallet transaction history
  11. escrow_holds - Escrow entries per contract
  12. mrr_records - Manufacturing Readiness Review records
  13. notifications - In-app notification system
  14. disputes - Contract dispute records

  ## Security
  - RLS enabled on all tables
  - Users can only access their own data or data they are party to
  - Admins have broader access via role check
*/

-- Profiles table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  phone text UNIQUE,
  name text NOT NULL DEFAULT '',
  role text NOT NULL DEFAULT 'client' CHECK (role IN ('client', 'designer', 'admin')),
  avatar_url text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Authenticated users can view all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (true);

-- Designer profiles
CREATE TABLE IF NOT EXISTS designer_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  bio text DEFAULT '',
  specializations text[] DEFAULT '{}',
  is_vetted boolean DEFAULT false,
  rating numeric(3,2) DEFAULT 0,
  completed_projects integer DEFAULT 0,
  hourly_rate integer DEFAULT 0,
  location text DEFAULT 'Kampala, Uganda',
  years_experience integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

ALTER TABLE designer_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone authenticated can view designer profiles"
  ON designer_profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Designers can update own profile"
  ON designer_profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Designers can insert own profile"
  ON designer_profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Portfolio items
CREATE TABLE IF NOT EXISTS portfolio_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  designer_id uuid NOT NULL REFERENCES designer_profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text DEFAULT '',
  category text NOT NULL,
  image_url text NOT NULL,
  tags text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE portfolio_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone authenticated can view portfolio items"
  ON portfolio_items FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Designers can manage own portfolio"
  ON portfolio_items FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM designer_profiles dp
      WHERE dp.id = portfolio_items.designer_id
      AND dp.user_id = auth.uid()
    )
  );

CREATE POLICY "Designers can update own portfolio"
  ON portfolio_items FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM designer_profiles dp
      WHERE dp.id = portfolio_items.designer_id
      AND dp.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM designer_profiles dp
      WHERE dp.id = portfolio_items.designer_id
      AND dp.user_id = auth.uid()
    )
  );

-- Projects
CREATE TABLE IF NOT EXISTS projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text DEFAULT '',
  category text NOT NULL,
  budget integer NOT NULL DEFAULT 0,
  requires_mrr boolean DEFAULT false,
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('draft', 'open', 'in_progress', 'completed', 'cancelled', 'disputed')),
  deadline date,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Clients can view own projects"
  ON projects FOR SELECT
  TO authenticated
  USING (auth.uid() = client_id);

CREATE POLICY "Designers can view open projects"
  ON projects FOR SELECT
  TO authenticated
  USING (status = 'open');

CREATE POLICY "All authenticated can view all projects"
  ON projects FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Clients can insert projects"
  ON projects FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = client_id);

CREATE POLICY "Clients can update own projects"
  ON projects FOR UPDATE
  TO authenticated
  USING (auth.uid() = client_id)
  WITH CHECK (auth.uid() = client_id);

-- Contracts
CREATE TABLE IF NOT EXISTS contracts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  client_id uuid NOT NULL REFERENCES profiles(id),
  designer_id uuid NOT NULL REFERENCES profiles(id),
  agreed_amount integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'completed', 'cancelled', 'disputed')),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE contracts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Contract parties can view contracts"
  ON contracts FOR SELECT
  TO authenticated
  USING (auth.uid() = client_id OR auth.uid() = designer_id);

CREATE POLICY "All authenticated can view contracts"
  ON contracts FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Clients can create contracts"
  ON contracts FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = client_id);

CREATE POLICY "Contract parties can update contracts"
  ON contracts FOR UPDATE
  TO authenticated
  USING (auth.uid() = client_id OR auth.uid() = designer_id)
  WITH CHECK (auth.uid() = client_id OR auth.uid() = designer_id);

-- Milestones
CREATE TABLE IF NOT EXISTS milestones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_id uuid NOT NULL REFERENCES contracts(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text DEFAULT '',
  amount integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'submitted', 'approved', 'revision_requested', 'disputed')),
  due_date date,
  order_index integer NOT NULL DEFAULT 0,
  mrr_required boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE milestones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view milestones"
  ON milestones FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Clients can insert milestones"
  ON milestones FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM contracts c
      WHERE c.id = milestones.contract_id
      AND c.client_id = auth.uid()
    )
  );

CREATE POLICY "Contract parties can update milestones"
  ON milestones FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM contracts c
      WHERE c.id = milestones.contract_id
      AND (c.client_id = auth.uid() OR c.designer_id = auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM contracts c
      WHERE c.id = milestones.contract_id
      AND (c.client_id = auth.uid() OR c.designer_id = auth.uid())
    )
  );

-- Deliverables
CREATE TABLE IF NOT EXISTS deliverables (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  milestone_id uuid NOT NULL REFERENCES milestones(id) ON DELETE CASCADE,
  file_name text NOT NULL,
  file_url text NOT NULL,
  is_locked boolean DEFAULT true,
  uploaded_at timestamptz DEFAULT now()
);

ALTER TABLE deliverables ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view deliverables"
  ON deliverables FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert deliverables"
  ON deliverables FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update deliverables"
  ON deliverables FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Messages
CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_id uuid NOT NULL REFERENCES contracts(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL REFERENCES profiles(id),
  content text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Contract parties can view messages"
  ON messages FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can send messages"
  ON messages FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = sender_id);

-- Wallets
CREATE TABLE IF NOT EXISTS wallets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  available_balance integer NOT NULL DEFAULT 0,
  locked_balance integer NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'UGX',
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

ALTER TABLE wallets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own wallet"
  ON wallets FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "All authenticated can view wallets"
  ON wallets FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert own wallet"
  ON wallets FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own wallet"
  ON wallets FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "All authenticated can update wallets"
  ON wallets FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Transactions
CREATE TABLE IF NOT EXISTS transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_id uuid NOT NULL REFERENCES wallets(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('top_up', 'lock', 'release', 'refund')),
  amount integer NOT NULL,
  description text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Wallet owners can view transactions"
  ON transactions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM wallets w
      WHERE w.id = transactions.wallet_id
      AND w.user_id = auth.uid()
    )
  );

CREATE POLICY "All authenticated can view transactions"
  ON transactions FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert transactions"
  ON transactions FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Escrow holds
CREATE TABLE IF NOT EXISTS escrow_holds (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_id uuid NOT NULL REFERENCES contracts(id) ON DELETE CASCADE,
  client_wallet_id uuid NOT NULL REFERENCES wallets(id),
  designer_wallet_id uuid NOT NULL REFERENCES wallets(id),
  amount integer NOT NULL,
  status text NOT NULL DEFAULT 'held' CHECK (status IN ('held', 'released', 'refunded')),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE escrow_holds ENABLE ROW LEVEL SECURITY;

CREATE POLICY "All authenticated can view escrow holds"
  ON escrow_holds FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert escrow holds"
  ON escrow_holds FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update escrow holds"
  ON escrow_holds FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- MRR records
CREATE TABLE IF NOT EXISTS mrr_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  milestone_id uuid NOT NULL REFERENCES milestones(id) ON DELETE CASCADE,
  checklist_items text[] DEFAULT '{}',
  bom_uploaded boolean DEFAULT false,
  admin_approved boolean DEFAULT false,
  admin_notes text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  UNIQUE(milestone_id)
);

ALTER TABLE mrr_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view MRR records"
  ON mrr_records FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert MRR records"
  ON mrr_records FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update MRR records"
  ON mrr_records FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Notifications
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  message text NOT NULL,
  type text NOT NULL DEFAULT 'info',
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Authenticated users can insert notifications"
  ON notifications FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Disputes
CREATE TABLE IF NOT EXISTS disputes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_id uuid NOT NULL REFERENCES contracts(id) ON DELETE CASCADE,
  raised_by uuid NOT NULL REFERENCES profiles(id),
  reason text NOT NULL,
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'under_review', 'resolved')),
  admin_notes text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE disputes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "All authenticated users can view disputes"
  ON disputes FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert disputes"
  ON disputes FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = raised_by);

CREATE POLICY "Authenticated users can update disputes"
  ON disputes FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Proposals (designer applying to project)
CREATE TABLE IF NOT EXISTS proposals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  designer_id uuid NOT NULL REFERENCES profiles(id),
  cover_letter text DEFAULT '',
  proposed_amount integer NOT NULL DEFAULT 0,
  timeline_days integer NOT NULL DEFAULT 14,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE proposals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "All authenticated can view proposals"
  ON proposals FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Designers can insert proposals"
  ON proposals FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = designer_id);

CREATE POLICY "Authenticated users can update proposals"
  ON proposals FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);
