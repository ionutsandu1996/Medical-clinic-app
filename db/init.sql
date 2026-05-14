-- Specializari medicale
CREATE TABLE IF NOT EXISTS specializations (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Doctori
CREATE TABLE IF NOT EXISTS doctors (
    id SERIAL PRIMARY KEY,
    firebase_uid VARCHAR(128) UNIQUE,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(20),
    specialization_id INT REFERENCES specializations(id),
    bio TEXT,
    avatar_url TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Pacienti
CREATE TABLE IF NOT EXISTS patients (
    id SERIAL PRIMARY KEY,
    firebase_uid VARCHAR(128) UNIQUE,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(20),
    date_of_birth DATE,
    gender VARCHAR(10),
    address TEXT,
    emergency_contact VARCHAR(255),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Program doctori
CREATE TABLE IF NOT EXISTS doctor_schedules (
    id SERIAL PRIMARY KEY,
    doctor_id INT REFERENCES doctors(id) ON DELETE CASCADE,
    day_of_week INT NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    slot_duration_minutes INT DEFAULT 30,
    is_active BOOLEAN DEFAULT TRUE
);

-- Programari
CREATE TABLE IF NOT EXISTS appointments (
    id SERIAL PRIMARY KEY,
    patient_id INT REFERENCES patients(id) ON DELETE CASCADE,
    doctor_id INT REFERENCES doctors(id) ON DELETE CASCADE,
    appointment_date DATE NOT NULL,
    appointment_time TIME NOT NULL,
    duration_minutes INT DEFAULT 30,
    status VARCHAR(20) DEFAULT 'pending',
    reason TEXT,
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(doctor_id, appointment_date, appointment_time)
);

-- Fise medicale
CREATE TABLE IF NOT EXISTS medical_records (
    id SERIAL PRIMARY KEY,
    appointment_id INT REFERENCES appointments(id) ON DELETE CASCADE,
    patient_id INT REFERENCES patients(id) ON DELETE CASCADE,
    doctor_id INT REFERENCES doctors(id) ON DELETE CASCADE,
    diagnosis TEXT,
    treatment TEXT,
    prescription TEXT,
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Date initiale - specializari
INSERT INTO specializations (name, description) VALUES
    ('Cardiologie', 'Diagnostic si tratament boli cardiovasculare'),
    ('Dermatologie', 'Diagnostic si tratament boli de piele'),
    ('Neurologie', 'Diagnostic si tratament boli ale sistemului nervos'),
    ('Pediatrie', 'Ingrijire medicala pentru copii'),
    ('Ortopedie', 'Diagnostic si tratament boli ale sistemului osos')
ON CONFLICT (name) DO NOTHING;