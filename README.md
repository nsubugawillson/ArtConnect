# ArtConnect.Ug — Secure Creative Marketplace

A milestone-driven marketplace connecting Clients with vetted Professional Designers in Uganda.

# Problem and Solution
Problem: Uganda's creative design industry lacks a structured digital marketplace that is secure to manage the full cycle of design-to-fulfilment contracts. Clients struggle to find vetted, reliable designers, while designers face difficulties in securing fair payment for their work. Traditional freelance platforms lack Uganda-specific payment integration, intellectual property protection, and milestone-based payment systems that build trust between parties.

Solution: ArtConnect.Ug is a secure milestone-driven marketplace that connects Ugandan clients with vetted professional designers. The platform addresses these challenges through:
•	Escrow-based payment system - Funds are locked in escrow and released incrementally as milestones are approved, ensuring designers get paid and clients get deliverables
•	Designer vetting process - All designers undergo administrative review before participating, ensuring quality and reliability
•	Secure IP file lock - Deliverable files are locked until milestone approval, protecting intellectual property
•	Manufacturing Readiness Review (MRR) - Specialized workflow for industrial and packaging projects requiring manufacturing readiness verification
•	Simulated MTN Mobile Money integration - USSD-based payment interface familiar to Ugandan users
•	Role-based access control - Separate interfaces for clients, designers, and administrators with appropriate permissions

## Quick Start

```bash
npm install
npm run dev
```

Open http://localhost:5173

### OR JUST GO TO OUR LIVE HOSTED LINK DIRECT TO VIEW OUR APP:
For Demonstration version use this link https://artconnectug.vercel.app/ and for pure live functionality use this link https://art-connect-blond.vercel.app/

# Setup Instructions

### Prerequisites

Before you begin, ensure you have the following installed:

•	Node.js (version 18 or higher)

•	npm or yarn package manager

•	Git

•	A code editor (VS Code recommended)

•	A Supabase account (for backend services)

# Option one

### Step 1: Clone the Repository 
bash
git clone https://github.com/your-username/artconnect-ug.git
cd artconnect-ug

### Step 2: Install Dependencies
bash
npm install
This will install all required packages including React, TypeScript, Vite, Supabase, Zustand, Tailwind CSS, and other dependencies listed in 
package.json.

### Step 3: Run the Development Server
bash
npm run dev
The application will start and be available at http://localhost:5173/

### Step 4: Access the Application
Open your browser and navigate to http://localhost:5173/


# Option two

### Step 1: Download the zip file from git hub 
### Step 2: Extract this file to directory 
### Step 3: Open your code editor (vs code) and open the project from the extracted directory.
### Step 4: Open your terminal 
### Step 5: Install Dependencies
bash

npm install

This will install all required packages including React, TypeScript, Vite, Supabase, Zustand, Tailwind CSS, and other dependencies listed in 
package.json.
### Step 6: Run the Development Server
bash

npm run dev

The application will start and be available at http://localhost:5173/

### Step 7: Access the Application
Open your browser and navigate to http://localhost:5173/

## Demo Logins Or you can create your own account and ensure to record your login details. 

On the Auth screen, use the **Demo Quick Login** buttons at the bottom:

| Role | Name | Access |
|------|------|--------|
| Client | Amara Okafor | Browse designers, post briefs, manage projects, wallet |
| Designer | Sarah Nakato | Portfolio, contracts, milestone workspace, wallet |
| Admin | Admin User | Vetting queue, disputes, transactions, projects |

Or enter any phone number + OTP code **1234** to register a new account.

## Demo Journey

### Client Flow
1. **Login as Demo Client** → ClientHome dashboard
2. **Browse Designers** → Filter by specialization, view portfolios
3. **Hire a Designer** → Designer Profile → Post Brief (pre-filled)
4. **View Proposals** → Accept a proposal → Contract created
5. **Fund Escrow** → Contract Detail → "Fund Escrow" → MTN USSD simulation
6. **Track Milestones** → Contract Detail → milestone list with status badges
7. **Approve Milestone** → Click "Approve" on a submitted milestone → escrow released

### Designer Flow
1. **Login as Demo Designer** → DesignerHome dashboard
2. **Portfolio** → View/add portfolio items, submit for vetting
3. **Contracts** → View active contracts → "Open Workspace"
4. **Milestone Workspace**:
   - Click "Start Work" → status changes to In Progress
   - For MRR projects: complete checklist, "Upload BOM", submit for review
   - Add files (simulated) → "Submit Milestone"
5. **Wallet** → View earnings, simulate withdrawal

### Admin Flow
1. **Login as Demo Admin** → AdminDashboard
2. **Vetting Tab** → Approve/reject designer applications
3. **MRR Queue** → Approve manufacturing readiness reviews
4. **Transactions Tab** → Monitor platform financial activity
5. **Projects Tab** → Overview of all projects and status updates

## Security Features Demonstrated

- **Simulated Escrow**: Funds locked on contract creation, released on milestone approval
- **File Lock Protocol**: Deliverables show lock icon until milestone approved
- **MRR Gate**: Industrial/Packaging projects require Manufacturing Readiness Review before submission
- **Dual-wallet Architecture**: Client `availableBalance` + `lockedBalance`, Designer earning tracking

## Design System

- **Primary**: Burnt Copper `#A0430A`
- **Background**: Sea Mist `#DFE8E6`
- **Dark**: Charcoal `#1A1A1A`
- **Fonts**: Space Grotesk (headings), Inter (body)

## Tech Stack

- React 18 + TypeScript + Vite
- Zustand (state management with demo data)
- Framer Motion (animations)
- Tailwind CSS (styling)
- Supabase (database — schema applied)
- Lucide React (icons)

License
This project is developed for academic purposes.


