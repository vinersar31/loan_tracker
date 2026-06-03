# Mortgage Tracker

A modern, feature-rich mortgage tracking application built with Next.js and Firebase.

## Features

- 📊 **Dashboard Overview** - Track remaining balance, principal, interest, and fees with visual progress indicator
- 💰 **Payment Management** - Add, edit, and delete payments with detailed breakdowns
- 📈 **Payment Breakdown Chart** - Interactive pie chart showing principal/interest/fees distribution
- 🏦 **BNR Economic Indicators** - Real-time EUR/RON exchange rate and Romanian economic data
- 🌓 **Dark/Light Mode** - Toggle between themes with preference persistence
- ⚙️ **Customizable Dashboard** - Show/hide stat cards and indicators, drag-and-drop reordering
- 💾 **Data Persistence** - All data stored in Firebase Firestore
- 📱 **Responsive Design** - Works on desktop and mobile devices

## Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Database:** Firebase Firestore
- **Charts:** Recharts
- **Drag & Drop:** @dnd-kit
- **Styling:** CSS with custom variables
- **Fonts:** Google Fonts (Outfit)

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Firebase project

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd loan_tracker
```

2. Install dependencies:
```bash
npm install
```

3. Set up Firebase:
   - Create a Firebase project at https://console.firebase.google.com
   - Copy `utils/firebase.template.js` to `utils/firebase.js`
   - Fill in your Firebase configuration with your project credentials

4. Run the development server:
```bash
npm run dev
```

5. Open http://localhost:3000 in your browser

## Firebase Setup

Create these Firestore collections:
- `payments` - stores payment records
- `indicators` - stores economic indicator data (with a `latest` document)

## License

This project is open source and available under the MIT License.

### Firebase Trigger Email Extension

To enable automatic email notifications when a payment is added or removed, install the **Trigger Email from Firestore** extension in your Firebase project.

- Collection path: \`mail\`
- SMTP connection URI: Provide your SMTP credentials.

Emails will be sent automatically to the currently authenticated user's email address.
