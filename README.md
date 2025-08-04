# E-Commerce Dashboard

A comprehensive dashboard for e-commerce clients to manage their products, catalogs, and AI-powered customer support.

## Features

- **Authentication**: Secure login/signup using Clerk
- **Catalog Management**: Create and organize product catalogs with categories
- **Product Management**: Add products to categories with detailed information
- **AI Context Upload**: Upload product context via text or PDF files
- **Chat Query Tracking**: View customer questions and AI responses
- **Modern UI**: Beautiful, responsive interface built with Tailwind CSS

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **Authentication**: Clerk
- **Database**: PostgreSQL with Prisma ORM
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI + Custom components
- **File Upload**: UploadThing integration

## Database Schema

The application uses the following main entities:

- **Client**: E-commerce site owners
- **Catalog**: Product catalogs created by clients
- **Category**: Product categories within catalogs
- **Product**: Individual products with details
- **ProductContext**: AI context for each product
- **ChatQuery**: Customer questions and AI responses

## Setup Instructions

### 1. Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard

# Database
DATABASE_URL="postgresql://username:password@host:port/database?sslmode=require"

# UploadThing (optional for file uploads)
UPLOADTHING_SECRET=your_uploadthing_secret
UPLOADTHING_APP_ID=your_uploadthing_app_id
```

### 2. Database Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Set up the database:

   ```bash
   npx prisma generate
   npx prisma db push
   ```

3. (Optional) Seed the database:
   ```bash
   npx prisma db seed
   ```

### 3. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes
│   ├── dashboard/         # Dashboard pages
│   └── globals.css        # Global styles
├── components/            # Reusable UI components
│   └── ui/               # Base UI components
├── hooks/                # Custom React hooks
├── lib/                  # Utility functions
└── middleware.ts         # Clerk middleware
```

## Key Features

### Authentication Flow

- Users sign up/sign in through Clerk
- Automatic client creation in database
- Protected dashboard routes

### Catalog Management

- Create catalogs with multiple categories
- Organize products by category
- View catalog statistics

### Product Context

- Upload product information via text or PDF
- Rich text editor for detailed descriptions
- Context powers AI customer support

### Chat Query Tracking

- View customer questions in real-time
- Track AI response quality
- Monitor product-specific queries

## API Endpoints

- `POST /api/catalogs` - Create new catalog
- `GET /api/catalogs` - Fetch user's catalogs
- `GET /api/products/[id]` - Get product details
- `POST /api/products/[id]/context` - Save product context

## Deployment

The application is ready for deployment on Vercel, Netlify, or any other Next.js-compatible platform.

### Environment Setup for Production

1. Set up a PostgreSQL database (Neon, Supabase, etc.)
2. Configure Clerk for production
3. Set up UploadThing for file uploads (optional)
4. Deploy with proper environment variables

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License - see LICENSE file for details.
