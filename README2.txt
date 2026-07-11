ArtConnect.Ug - Secure Creative Marketplace
Problem and Solution
Problem: Uganda's creative industry faces significant challenges in connecting clients with professional designers. Clients struggle to find vetted, reliable designers, while designers face difficulties in securing fair payment for their work. Traditional freelance platforms lack Uganda-specific payment integration, intellectual property protection, and milestone-based payment systems that build trust between parties.
Solution: ArtConnect.Ug is a secure milestone-driven marketplace that connects Ugandan clients with vetted professional designers. The platform addresses these challenges through:
•	Escrow-based payment system - Funds are locked in escrow and released incrementally as milestones are approved, ensuring designers get paid and clients get deliverables
•	Designer vetting process - All designers undergo administrative review before participating, ensuring quality and reliability
•	Secure IP file lock - Deliverable files are locked until milestone approval, protecting intellectual property
•	Manufacturing Readiness Review (MRR) - Specialized workflow for industrial and packaging projects requiring manufacturing readiness verification
•	Simulated MTN Mobile Money integration - USSD-based payment interface familiar to Ugandan users
•	Role-based access control - Separate interfaces for clients, designers, and administrators with appropriate permissions
Setup Instructions
Prerequisites
Before you begin, ensure you have the following installed:
•	Node.js (version 18 or higher)
•	npm or yarn package manager
•	Git
•	A code editor (VS Code recommended)
•	A Supabase account (for backend services)
Step 1: Clone the Repository
bash
git clone https://github.com/your-username/artconnect-ug.git
cd artconnect-ug
Step 2: Install Dependencies
bash
npm install
This will install all required packages including React, TypeScript, Vite, Supabase, Zustand, Tailwind CSS, and other dependencies listed in 
package.json.

Skip this step unless the environment variable file (.env) doesn’t have the keys to our Supabase. Or if our database is not responding you can configure your own Supabase 

Step 3: Configure Environment Variables
Create a 
.env file in the root directory of the project:
bash
# Supabase Configuration
VITE_SUPABASE_URL=your-supabase-project-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
To obtain these values:
1.	Go to Supabase and create a new project
2.	Navigate to Project Settings → API
3.	Copy the Project URL and anon key
4.	Paste them into your 
.env file
Step 4: Set Up Database Schema
1.	In your Supabase dashboard, navigate to the SQL Editor
2.	Open the file 
20260416175258_artconnect_core_schema.sql from the project
3.	Copy and execute the SQL script to create all 15 database tables and RLS policies
4.	Verify that all tables are created in your Supabase database
Step 5: Initialize Demo Data
The application includes demo data initialization. When you first run the app, it will create sample users, projects, contracts, and transactions for testing purposes.

Step 6: Run the Development Server
bash
npm run dev
The application will start and be available at http://localhost:5173/
Step 7: Access the Application
Open your browser and navigate to http://localhost:5173/
Demo Login Credentials:
•	Client: Use the demo quick-login button or phone + OTP (1234)
•	Designer: Use the demo quick-login button or phone + OTP (1234)
•	Admin: Use the demo quick-login button or phone + OTP (1234)
Or you can decide to register an account. 
Note: incase wallet balance is 0 try to logout and login again in your registered account

Step 8: Build for Production
To create a production build:
bash
npm run build
The optimized files will be generated in the 
dist/ directory.

Step 9: Deploy
You can deploy the application to various platforms:
•	Vercel: Connect your GitHub repository and deploy
•	Netlify: Drag and drop the 
dist/ folder or connect via Git
•	GitHub Pages: Configure GitHub Pages to serve from the 
dist/ directory
Project Structure
artconnect-ug/
├── src/
│   ├── components/     # Reusable UI components
│   ├── lib/           # Utilities, API, types, store
│   ├── pages/         # Page components (client, designer, admin, shared)
│   └── App.tsx        # Main application component
├── supabase/
│   └── migrations/    # Database schema files
├── public/            # Static assets
├── package.json       # Dependencies and scripts
├── vite.config.ts     # Vite configuration
├── tsconfig.json      # TypeScript configuration
└── tailwind.config.js # Tailwind CSS configuration

Tech Stack
•	Frontend: React 18, TypeScript, Vite
•	State Management: Zustand
•	Styling: Tailwind CSS
•	Backend: Supabase (PostgreSQL, Authentication, Real-time, Storage)
•	Routing: React Router DOM
•	Animations: Framer Motion

Key Features
•	Multi-role authentication (Client, Designer, Admin)
•	Escrow-based payment system with dual wallet balances
•	Milestone-based project management
•	Secure IP file lock for deliverable protection
•	Manufacturing Readiness Review (MRR) for industrial projects
•	Simulated MTN Mobile Money USSD payment interface
•	Real-time messaging and notifications
•	Designer vetting and portfolio management
•	Dispute resolution system
•	Dark mode support
License
This project is developed for academic purposes.

