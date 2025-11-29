# CalmKid - Behavior & Emotion Improvement App

## 👋 Welcome!
This is your CalmKid app source code. Follow these steps to get it running.

## 🛠️ Step 1: Supabase Setup (Backend)
1.  Go to [Supabase.com](https://supabase.com/) and sign up.
2.  Click **"New Project"**.
3.  Give it a name (e.g., "CalmKid") and a password.
4.  Wait for the database to set up.
5.  Go to the **SQL Editor** (icon on the left sidebar).
6.  Click **"New Query"**.
7.  Open the file `supabase_schema.sql` from this project folder.
8.  Copy all the text from `supabase_schema.sql` and paste it into the Supabase SQL Editor.
9.  Click **"Run"** (bottom right). This will create all your tables (Moods, Activities, Rewards, etc.).

## 🔑 Step 2: Connect App to Supabase
1.  In Supabase, go to **Project Settings** (gear icon) -> **API**.
2.  Copy the **Project URL**.
3.  Copy the **anon public** key.
4.  Open the file `src/services/supabase.js` in your code editor.
5.  Replace `'https://your-project-url.supabase.co'` with your **Project URL**.
6.  Replace `'your-anon-key'` with your **anon key**.
    ```javascript
    const SUPABASE_URL = 'https://xyz.supabase.co';
    const SUPABASE_ANON_KEY = 'eyJh...';
    ```

## 📱 Step 3: Run the App
1.  Open your terminal in this folder (`CalmKid`).
2.  Run the command:
    ```bash
    npm start
    ```
3.  You will see a QR code.
    -   **Android**: Install **Expo Go** from Play Store. Scan the QR code.
    -   **iPhone**: Install **Expo Go** from App Store. Scan the QR code with your Camera app.

## 🧩 Features Guide
-   **Login**: Create an account with email/password.
-   **Home**: Log your mood daily. See your stars.
-   **Activities**: Do calming tasks to earn stars.
-   **Rewards**: Spend stars on stickers/avatars.
-   **Parent Section**: Click "Parent" tab. Enter PIN **1234**.
    -   **Journal**: Write notes about behavior.
    -   **Triggers**: Log what caused aggression.
    -   **Reports**: See charts of mood/behavior.
    -   **Tips**: Read parenting advice.

## 🆘 Troubleshooting
-   If you see "Table not found" errors, make sure you ran the SQL script in Supabase.
-   If login fails, check your Supabase URL and Key.
