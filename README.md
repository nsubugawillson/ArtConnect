# ArtConnect.Ug — Secure Creative Marketplace

A milestone-driven marketplace connecting Clients with vetted Professional Designers in Uganda.

# Problem and Solution
Problem: Uganda's creative industry faces significant challenges in connecting clients with professional designers. Clients struggle to find vetted, reliable designers, while designers face difficulties in securing fair payment for their work. Traditional freelance platforms lack Uganda-specific payment integration, intellectual property protection, and milestone-based payment systems that build trust between parties.

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

OR JUST GO TO OUR LIVE HOSTED LINK DIRECT TO VIEW OUR APP https://art-connect-blond.vercel.app/

## Demo Logins

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

OR REGISTER AND LOGIN TO NAVIGATE LIVE PRODUCTION FUNCTIONALITY OF THE APP 
IF THIS README FILE FAILS REFER TO README2

