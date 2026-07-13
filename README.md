# ArtConnect.Ug — Secure Creative Marketplace

A milestone-driven marketplace connecting Clients with vetted Professional Designers in Uganda.

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

