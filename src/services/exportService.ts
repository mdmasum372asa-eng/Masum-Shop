import JSZip from 'jszip';

export async function generateProjectZip(): Promise<Blob> {
  const zip = new JSZip();

  // 1. Root configuration files
  zip.file(
    'package.json',
    JSON.stringify(
      {
        name: 'masum-shop',
        private: true,
        version: '1.0.0',
        type: 'module',
        scripts: {
          dev: 'vite --port=3000 --host=0.0.0.0',
          build: 'vite build',
          preview: 'vite preview',
          lint: 'tsc --noEmit',
        },
        dependencies: {
          firebase: '^11.4.0',
          jszip: '^3.10.1',
          'lucide-react': '^0.546.0',
          'canvas-confetti': '^1.9.4',
          react: '^19.0.1',
          'react-dom': '^19.0.1',
          vite: '^8.3.0',
        },
        devDependencies: {
          '@tailwindcss/vite': '^4.3.3',
          '@vitejs/plugin-react': '^6.1.1',
          tailwindcss: '^4.3.3',
          typescript: '^7.0.2',
          '@types/react': '^19.3.0',
          '@types/react-dom': '^19.3.0',
          '@types/canvas-confetti': '^1.9.0',
          '@types/jszip': '^3.4.1',
        },
      },
      null,
      2
    )
  );

  zip.file(
    'tsconfig.json',
    JSON.stringify(
      {
        compilerOptions: {
          target: 'ES2022',
          module: 'ESNext',
          lib: ['ES2022', 'DOM', 'DOM.Iterable'],
          moduleResolution: 'bundler',
          jsx: 'react-jsx',
          skipLibCheck: true,
          isolatedModules: true,
          noEmit: true,
        },
      },
      null,
      2
    )
  );

  zip.file(
    'vite.config.ts',
    `import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
  server: {
    port: 3000,
  },
});
`
  );

  zip.file(
    'index.html',
    `<!doctype html>
<html lang="bn">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>MASUM SHOP - প্রিমিয়াম গ্যাজেট ও লাইফস্টাইল ই-কমার্স</title>
    <meta name="description" content="কক্সবাজার সহ সারা বাংলাদেশে দ্রুত হোম ডেলিভারি।" />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>`
  );

  zip.file(
    '.env.example',
    `# Firebase Configuration
VITE_FIREBASE_API_KEY=YOUR_API_KEY
VITE_FIREBASE_AUTH_DOMAIN=YOUR_PROJECT.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=YOUR_PROJECT_ID
VITE_FIREBASE_STORAGE_BUCKET=YOUR_PROJECT.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=YOUR_SENDER_ID
VITE_FIREBASE_APP_ID=YOUR_APP_ID
VITE_FIREBASE_FIRESTORE_DATABASE_ID=(default)
`
  );

  zip.file(
    'firebase-applet-config.template.json',
    JSON.stringify(
      {
        projectId: 'YOUR_FIREBASE_PROJECT_ID',
        appId: 'YOUR_FIREBASE_APP_ID',
        apiKey: 'YOUR_FIREBASE_API_KEY',
        authDomain: 'YOUR_PROJECT_ID.firebaseapp.com',
        firestoreDatabaseId: '(default)',
        storageBucket: 'YOUR_PROJECT_ID.firebasestorage.app',
        messagingSenderId: 'YOUR_MESSAGING_SENDER_ID',
      },
      null,
      2
    )
  );

  zip.file(
    'firestore.rules',
    `rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} { allow read, write: if false; }
    function isSignedIn() { return request.auth != null; }
    function isAdmin() {
      return isSignedIn() && (
        request.auth.token.email == 'mdmasum372asa@gmail.com' ||
        exists(/databases/$(database)/documents/admins/$(request.auth.uid))
      );
    }
    match /products/{productId} {
      allow read: if resource.data.isPublished == true || isAdmin();
      allow write: if isAdmin();
    }
    match /categories/{catId} {
      allow read: if true;
      allow write: if isAdmin();
    }
    match /orders/{orderId} {
      allow get: if true;
      allow list, update, delete: if isAdmin();
      allow create: if true;
    }
    match /banners/{bannerId} {
      allow read: if true;
      allow write: if isAdmin();
    }
    match /settings/{settingId} {
      allow read: if true;
      allow write: if isAdmin();
    }
    match /admins/{adminId} {
      allow read: if isAdmin();
      allow write: if isSignedIn() && request.auth.token.email == 'mdmasum372asa@gmail.com';
    }
  }
}`
  );

  // 2. Comprehensive README.md as specified in item 21
  zip.file(
    'README.md',
    `# MASUM SHOP - Premium Bangladeshi E-Commerce Website

Welcome to the production source code of **MASUM SHOP**.

---

## 1. How to Install Dependencies

Make sure you have **Node.js (v18 or v20+)** installed on your computer.

Open your terminal in the extracted project folder and run:

\`\`\`bash
npm install
\`\`\`

---

## 2. How to Configure Firebase

1. Go to [Firebase Console](https://console.firebase.google.com/) and create a new Firebase Project (or select existing).
2. Enable **Firebase Authentication**:
   - Go to Authentication > Sign-in method.
   - Enable **Email/Password**.
   - (Optional) Enable **Google Sign-In**.
3. Enable **Cloud Firestore**:
   - Go to Firestore Database > Create Database.
   - Choose production mode or test mode.
4. Copy your Web App credentials from Project Settings > General > Your apps.
5. Rename \`firebase-applet-config.template.json\` to \`firebase-applet-config.json\` and fill in your keys:
   \`\`\`json
   {
     "projectId": "your-project-id",
     "appId": "your-app-id",
     "apiKey": "your-api-key",
     "authDomain": "your-project-id.firebaseapp.com",
     "firestoreDatabaseId": "(default)",
     "storageBucket": "your-project-id.firebasestorage.app",
     "messagingSenderId": "your-sender-id"
   }
   \`\`\`
6. Deploy the included \`firestore.rules\` to your Firebase project.

---

## 3. How to Run Locally

To launch the development server on your local machine:

\`\`\`bash
npm run dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 4. How to Build the Website

To create an optimized production build:

\`\`\`bash
npm run build
\`\`\`

The production-ready assets will be generated in the \`dist/\` folder.

---

## 5. How to Deploy to Hosting Providers

### Option A: Firebase Hosting
\`\`\`bash
npm install -g firebase-tools
firebase login
firebase init hosting
firebase deploy
\`\`\`

### Option B: Vercel
1. Install Vercel CLI: \`npm install -g vercel\`
2. Run \`vercel\` in the project root.
3. Configure Framework Preset as **Vite**.

### Option C: Netlify
1. Drag and drop the \`dist/\` folder into [Netlify Drop](https://app.netlify.com/drop).
2. Or link with your GitHub repository.

---

## Security & Secrets
- Never commit private service accounts or admin passwords to public repositories.
- Admin email configured: **mdmasum372asa@gmail.com**.
`
  );

  return await zip.generateAsync({ type: 'blob' });
}
