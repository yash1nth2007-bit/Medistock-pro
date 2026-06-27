INSERT INTO categories (name) VALUES
  ('Analgesics'),
  ('Antibiotics'),
  ('Vitamins'),
  ('Anti-diabetic'),
  ('Antihypertensive');

INSERT INTO medicines (medicine_id, name, generic_name, brand_name, manufacturer, category_id, batch_number, manufacturing_date, expiry_date, purchase_price, selling_price, gst_percentage, quantity, reorder_level, storage_conditions, unit, barcode, status)
VALUES
  ('MED-001', 'Paracetamol 500mg', 'Paracetamol', 'Crocin', 'GSK', 1, 'BATCH-1001', '2024-01-01', '2026-01-01', 20.00, 30.00, 5, 120, 20, 'Store in a cool dry place', 'tablets', '8901234567890', 'active'),
  ('MED-002', 'Amoxicillin 250mg', 'Amoxicillin', 'Mox', 'Sun Pharma', 2, 'BATCH-2002', '2024-02-15', '2025-02-15', 50.00, 70.00, 12, 80, 15, 'Keep away from sunlight', 'capsules', '8901234567891', 'active'),
  ('MED-003', 'Vitamin C 500mg', 'Ascorbic Acid', 'Cevit', 'Himalaya', 3, 'BATCH-3003', '2024-03-10', '2026-03-10', 10.00, 18.00, 5, 150, 20, 'Store in cool place', 'tablets', '8901234567892', 'active');

INSERT INTO suppliers (name, company_name, contact_person, phone, email, gst_number, address, city, state, credit_limit, status)
VALUES
  ('Healthy Pharma', 'Healthy Pharma Pvt Ltd', 'Priya Sharma', '9876543210', 'priya@healthypharma.com', 'GSTIN1234', '12 Pharma Street', 'Mumbai', 'Maharashtra', 100000, 'active'),
  ('Medicorp Distributors', 'Medicorp Distributors', 'Anil Kumar', '9123456780', 'anil@medicorp.com', 'GSTIN5678', '45 Health Avenue', 'Delhi', 'Delhi', 50000, 'active');

INSERT INTO patients (patient_id, full_name, age, gender, blood_group, phone, email, address, city, state, allergies, medical_history, status)
VALUES
  ('PAT-001', 'Asha Verma', 35, 'female', 'O+', '9876501234', 'asha.verma@example.com', 'Flat 12, Green Apartments', 'Pune', 'Maharashtra', 'Penicillin', 'Hypertension, occasional cold', 'active'),
  ('PAT-002', 'Ravi Singh', 28, 'male', 'B+', '9876505678', 'ravi.singh@example.com', 'House 5, Blue Street', 'Lucknow', 'Uttar Pradesh', '', 'Mild asthma', 'active');

INSERT INTO doctors (doctor_id, full_name, specialization, qualification, experience_years, phone, email, license_number, consultation_fee, bio, status)
VALUES
  ('DOC-001', 'Dr. Suman Gupta', 'General Physician', 'MBBS', 12, '9876507890', 'suman.gupta@example.com', 'LIC12345', 300, 'Experienced in family medicine', 'active'),
  ('DOC-002', 'Dr. Rajesh Mehta', 'Cardiologist', 'MD', 15, '9876506789', 'rajesh.mehta@example.com', 'LIC67890', 500, 'Specialist in heart care', 'active');

INSERT INTO settings (site_name, currency, timezone, notification_email)
VALUES ('MediStock Pro', 'INR', 'Asia/Kolkata', 'support@medistock.com');

INSERT INTO notifications (title, message, type, is_read)
VALUES
  ('Low stock alert', 'Paracetamol 500mg stock is below reorder level', 'low_stock', 0),
  ('Expiry alert', 'Amoxicillin 250mg will expire in 30 days', 'near_expiry', 0);
