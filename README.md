# Workout Planner & Recovery Tracker

A full-stack workout planning application that helps users organize their weekly training, track completed workouts, monitor muscle recovery, and receive AI-powered workout recommendations based on their recent activity and recovery status.

**Live Demo:** workout-recovery-tracker.vercel.app

---

## Overview

Workout Planner & Recovery Tracker was built as a full-stack application using Next.js, Supabase, Vercel, and the Anthropic Claude API.

The application combines traditional workflow automation with an AI-powered recommendation system. Users can log workouts, save recovery notes, and receive personalized training recommendations based on their workout history, recovery status, and planned weekly schedule.

---

# Features

### Dashboard
- Displays today's scheduled workout
- Shows recovery status for each tracked muscle group
- Allows users to save recovery notes
- Generates AI workout recommendations using Claude

### Workout Logging
- Record completed workouts
- Add multiple exercises to each workout
- Save weights, sets, and repetitions
- Automatically updates muscle recovery information

### Workout History
- View all previously logged workouts
- Open individual workouts
- Review exercises and workout notes

### Recovery Tracking
- Tracks recovery for:
  - Chest
  - Back
  - Legs
  - Biceps
  - Triceps

### AI Recommendations
The **"What Should I Train Today?"** button sends your recent workout data to Claude, which evaluates:

- Today's scheduled workout
- Recent workout history
- Missed workouts
- Muscle recovery status
- Recovery notes

Claude then recommends whether you should:

- Follow today's workout
- Modify today's workout
- Take an additional recovery day

Each recommendation includes a short explanation describing why the suggestion was made.

### Daily Automation
A Vercel Cron Job runs once per day to recalculate muscle recovery from the complete workout history. This ensures recovery information remains accurate even if workouts are entered out of chronological order.

---

# Technologies Used

## Frontend
- Next.js 15
- TypeScript
- CSS

## Backend
- Next.js Server Actions
- Next.js API Routes

## Database
- Supabase PostgreSQL

## AI
- Anthropic Claude API

## Deployment
- Vercel
- Vercel Cron Jobs

---

# Database Tables

The application stores data using the following Supabase tables:

- weekly_split
- workouts
- exercises
- muscle_recovery
- recovery_notes
- recommendations

---

# How to Use the App

## 1. View the Dashboard

The Dashboard displays:

- Today's scheduled workout
- Current muscle recovery status
- Recovery notes
- AI recommendation button

---

## 2. Save Recovery Notes

Type any recovery observations such as:

> "Left shoulder feels sore."

or

> "Legs are still fatigued from squats."

Click **Save Notes** to store them.

---

## 3. Log a Workout

Select **Log Workout**.

Choose:

- Workout type
- Date

Add one or more exercises by entering:

- Exercise name
- Weight
- Sets
- Repetitions

Click **Save Workout**.

The workout is stored in Supabase and recovery information is updated automatically.

---

## 4. Review Workout History

Open **Workout History**.

You'll see every workout that has been logged.

Click **View Workout** to review:

- Exercises
- Workout notes
- Workout details

---

## 5. Generate an AI Recommendation

Return to the Dashboard.

Click:

**What Should I Train Today?**

The application will:

1. Read your recent workout history.
2. Read your recovery notes.
3. Check today's scheduled workout.
4. Evaluate muscle recovery.
5. Send the information to Claude.
6. Display a recommendation explaining whether you should:
   - Follow today's workout
   - Modify the workout
   - Take a recovery day

The recommendation is also stored in the database.

---

# Scheduled Automation

Once per day, a Vercel Cron Job:

- Reviews every completed workout
- Determines the most recent workout for each muscle group
- Recalculates recovery days
- Updates the recovery table in Supabase

This prevents recovery data from becoming inaccurate if workouts are logged with older dates.

---

# Running Locally

Clone the repository:

```bash
git clone https://github.com/lnelson-mp3/workout-recovery-tracker.git
```

Install dependencies:

```bash
npm install
```

Create a `.env.local` file:

```text
SUPABASE_URL=
SUPABASE_SECRET_KEY=
ANTHROPIC_API_KEY=
```

Start the development server:

```bash
npm run dev
```

Open:

```
http://localhost:3000
```

---

# Environment Variables

The application requires:

| Variable | Purpose |
|-----------|----------|
| SUPABASE_URL | Connects to the Supabase project |
| SUPABASE_SECRET_KEY | Authenticates server-side database access |
| ANTHROPIC_API_KEY | Generates AI workout recommendations |

Environment variables are stored locally and in Vercel and are never committed to Git.

---

# Future Improvements

Possible future enhancements include:

- User authentication
- Multiple user support
- Editable workout splits
- Progress charts
- PR tracking
- Nutrition tracking
- Body weight tracking
- Push notifications
- Apple Health and Strava integration

---

# Author

**Logan Nelson**

Built as part of an AI application development course demonstrating full-stack development, workflow automation, database integration, scheduled tasks, and AI-assisted decision making.
