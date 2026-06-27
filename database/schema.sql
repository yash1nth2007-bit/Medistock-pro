CREATE TABLE IF NOT EXISTS categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(128) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS medicines (
  id INT AUTO_INCREMENT PRIMARY KEY,
  medicine_id VARCHAR(64) DEFAULT NULL,
  name VARCHAR(255) NOT NULL,
  generic_name VARCHAR(255),
  brand_name VARCHAR(255),
  manufacturer VARCHAR(255),
  category_id INT DEFAULT NULL,
  batch_number VARCHAR(128),
  manufacturing_date DATE,
  expiry_date DATE,
  purchase_price DECIMAL(12,2) DEFAULT 0,
  selling_price DECIMAL(12,2) DEFAULT 0,
  gst_percentage DECIMAL(5,2) DEFAULT 0,
  quantity INT DEFAULT 0,
  reorder_level INT DEFAULT 0,
  storage_conditions VARCHAR(255),
  description TEXT,
  unit VARCHAR(64) DEFAULT 'tablets',
  barcode VARCHAR(128),
  status VARCHAR(32) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS suppliers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  company_name VARCHAR(255),
  contact_person VARCHAR(255),
  phone VARCHAR(64),
  email VARCHAR(255),
  gst_number VARCHAR(64),
  address TEXT,
  city VARCHAR(128),
  state VARCHAR(128),
  credit_limit DECIMAL(12,2) DEFAULT 0,
  status VARCHAR(32) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS patients (
  id INT AUTO_INCREMENT PRIMARY KEY,
  patient_id VARCHAR(64) DEFAULT NULL,
  full_name VARCHAR(255) NOT NULL,
  age INT,
  gender VARCHAR(32),
  blood_group VARCHAR(16),
  phone VARCHAR(64),
  email VARCHAR(255),
  address TEXT,
  city VARCHAR(128),
  state VARCHAR(128),
  allergies TEXT,
  medical_history TEXT,
  status VARCHAR(32) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS doctors (
  id INT AUTO_INCREMENT PRIMARY KEY,
  doctor_id VARCHAR(64) DEFAULT NULL,
  full_name VARCHAR(255) NOT NULL,
  specialization VARCHAR(255),
  qualification VARCHAR(255),
  experience_years INT DEFAULT 0,
  phone VARCHAR(64),
  email VARCHAR(255),
  license_number VARCHAR(128),
  consultation_fee DECIMAL(12,2) DEFAULT 0,
  bio TEXT,
  status VARCHAR(32) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS sales (
  id INT AUTO_INCREMENT PRIMARY KEY,
  invoice_number VARCHAR(64) NOT NULL,
  patient_id INT,
  patient_name VARCHAR(255),
  total_amount DECIMAL(12,2) DEFAULT 0,
  tax_amount DECIMAL(12,2) DEFAULT 0,
  discount_percentage DECIMAL(5,2) DEFAULT 0,
  payment_method VARCHAR(64) DEFAULT 'cash',
  paid_amount DECIMAL(12,2) DEFAULT 0,
  payment_status VARCHAR(32) DEFAULT 'paid',
  sale_date DATE,
  sale_time TIME,
  created_by_name VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS sale_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  sale_id INT NOT NULL,
  medicine_id INT NOT NULL,
  quantity INT DEFAULT 0,
  unit_price DECIMAL(12,2) DEFAULT 0,
  gst_percentage DECIMAL(5,2) DEFAULT 0,
  discount_percentage DECIMAL(5,2) DEFAULT 0,
  FOREIGN KEY (sale_id) REFERENCES sales(id),
  FOREIGN KEY (medicine_id) REFERENCES medicines(id)
);

CREATE TABLE IF NOT EXISTS purchases (
  id INT AUTO_INCREMENT PRIMARY KEY,
  supplier_id INT NOT NULL,
  supplier_name VARCHAR(255),
  purchase_number VARCHAR(64) NOT NULL,
  purchase_date DATE,
  invoice_number VARCHAR(64),
  payment_method VARCHAR(64) DEFAULT 'cash',
  total_amount DECIMAL(12,2) DEFAULT 0,
  status VARCHAR(32) DEFAULT 'received',
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS purchase_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  purchase_id INT NOT NULL,
  medicine_id INT NOT NULL,
  quantity INT DEFAULT 0,
  unit_price DECIMAL(12,2) DEFAULT 0,
  gst_percentage DECIMAL(5,2) DEFAULT 0,
  batch_number VARCHAR(128),
  expiry_date DATE,
  FOREIGN KEY (purchase_id) REFERENCES purchases(id),
  FOREIGN KEY (medicine_id) REFERENCES medicines(id)
);

CREATE TABLE IF NOT EXISTS notifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255),
  message TEXT,
  type VARCHAR(64) DEFAULT 'system',
  is_read TINYINT(1) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS prescriptions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  prescription_number VARCHAR(64) NOT NULL,
  patient_id INT,
  patient_name VARCHAR(255),
  doctor_id INT,
  doctor_name VARCHAR(255),
  notes TEXT,
  medicines JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS settings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  site_name VARCHAR(255) DEFAULT 'MediStock Pro',
  currency VARCHAR(16) DEFAULT 'INR',
  timezone VARCHAR(64) DEFAULT 'Asia/Kolkata',
  notification_email VARCHAR(255) DEFAULT '',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
