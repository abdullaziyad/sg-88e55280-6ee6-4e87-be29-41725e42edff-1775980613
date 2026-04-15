-- Create stores table
CREATE TABLE stores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  address TEXT,
  phone TEXT,
  email TEXT,
  tax_registration_number TEXT,
  settings JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create store_users table (junction table for users and stores)
CREATE TABLE store_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('owner', 'admin', 'cashier')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(store_id, user_id)
);

-- Create products table
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  sku TEXT NOT NULL,
  category TEXT NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  cost DECIMAL(10, 2) DEFAULT 0,
  stock INTEGER NOT NULL DEFAULT 0,
  has_expiry BOOLEAN DEFAULT FALSE,
  expiry_date DATE,
  batch_number TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(store_id, sku)
);

-- Create transactions table
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE SET NULL,
  transaction_number TEXT NOT NULL,
  total DECIMAL(10, 2) NOT NULL,
  subtotal DECIMAL(10, 2) NOT NULL,
  tax DECIMAL(10, 2) DEFAULT 0,
  payment_method TEXT NOT NULL,
  status TEXT DEFAULT 'completed',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(store_id, transaction_number)
);

-- Create transaction_items table
CREATE TABLE transaction_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id UUID NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  product_sku TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(10, 2) NOT NULL,
  total DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on all tables
ALTER TABLE stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE transaction_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies for stores
CREATE POLICY "Users can view their stores" ON stores
  FOR SELECT USING (
    id IN (SELECT store_id FROM store_users WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can update their stores if admin/owner" ON stores
  FOR UPDATE USING (
    id IN (
      SELECT store_id FROM store_users 
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

-- RLS Policies for store_users
CREATE POLICY "Users can view store members" ON store_users
  FOR SELECT USING (
    store_id IN (SELECT store_id FROM store_users WHERE user_id = auth.uid())
  );

CREATE POLICY "Owners can manage store users" ON store_users
  FOR ALL USING (
    store_id IN (
      SELECT store_id FROM store_users 
      WHERE user_id = auth.uid() AND role = 'owner'
    )
  );

-- RLS Policies for products
CREATE POLICY "Users can view store products" ON products
  FOR SELECT USING (
    store_id IN (SELECT store_id FROM store_users WHERE user_id = auth.uid())
  );

CREATE POLICY "Admins can manage products" ON products
  FOR ALL USING (
    store_id IN (
      SELECT store_id FROM store_users 
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

-- RLS Policies for transactions
CREATE POLICY "Users can view store transactions" ON transactions
  FOR SELECT USING (
    store_id IN (SELECT store_id FROM store_users WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can create transactions" ON transactions
  FOR INSERT WITH CHECK (
    store_id IN (SELECT store_id FROM store_users WHERE user_id = auth.uid())
  );

-- RLS Policies for transaction_items
CREATE POLICY "Users can view transaction items" ON transaction_items
  FOR SELECT USING (
    transaction_id IN (
      SELECT t.id FROM transactions t
      JOIN store_users su ON su.store_id = t.store_id
      WHERE su.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create transaction items" ON transaction_items
  FOR INSERT WITH CHECK (
    transaction_id IN (
      SELECT t.id FROM transactions t
      JOIN store_users su ON su.store_id = t.store_id
      WHERE su.user_id = auth.uid()
    )
  );

-- Create indexes for better performance
CREATE INDEX idx_store_users_user_id ON store_users(user_id);
CREATE INDEX idx_store_users_store_id ON store_users(store_id);
CREATE INDEX idx_products_store_id ON products(store_id);
CREATE INDEX idx_transactions_store_id ON transactions(store_id);
CREATE INDEX idx_transactions_created_at ON transactions(created_at);
CREATE INDEX idx_transaction_items_transaction_id ON transaction_items(transaction_id);