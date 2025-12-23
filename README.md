# Big M Boards

Big M Boards is a web application designed to manage and showcase second-hand snowboards and gear. The platform includes an **admin dashboard** for the client to manage listings and a **public interface** for browsing available products. It is built with [Next.js](https://nextjs.org) and deployed on [Vercel](https://vercel.com).

## Features

### 1. Admin Dashboard
- **Manage Listings:** Create, edit, and delete product listings with fields for titles, prices, descriptions, and images.
- **Detailed Statistics:** View total listings, system health, and recent activity.
- **Secure Access:** Enforced authentication to protect admin resources.

### 2. Public Listings
- **Explore Products:** Users can browse all available listings via a clean, paginated gallery.
- **Listing Details:** View detailed pages containing product descriptions, images, and pricing info.
- **User-Friendly Navigation:** Includes helpful features like "Back to all listings" buttons and breadcrumb tracking.

### 3. General Highlights
- **Responsive Design:** Optimized for all devices and screen sizes.
- **Image Management:** Drag-and-drop functionality for images on the admin side (hosted securely in the database).
- **Email Contact:** Users and admins can conveniently connect via “Contact” buttons.
- **Deployment on Vercel:** Blazing fast performance and scalable hosting.

## Deployment
Live at: [big-m-boards.vercel.app](https://big-m-boards.vercel.app)

## Getting Started

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/DylaneElyse/big-m-boards.git
   cd big-m-boards
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000).

4. Build the project for production:
   ```bash
   npm run build
   ```

### Configuration
Sensitive assets like images are stored securely in the database, and configurations for image domains and payload sizes are defined in `next.config.mjs`.

## Licensing

This project is licensed under the MIT License. See the [LICENSE](./LICENSE) file for details.

Additionally, the app's images and other sensitive data are hosted securely and are not included in this repository.