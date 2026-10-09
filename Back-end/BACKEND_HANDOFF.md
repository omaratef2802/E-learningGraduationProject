# E-Learning Backend Handoff

## Runtime

- Node.js + Express
- MongoDB + Mongoose
- JWT authentication
- Google OAuth for user accounts
- Cloudinary for images/videos
- Bootstrap/frontend should use the API base URL below

## API Base URL

```text
http://localhost:3000/E-learning
```

## Authentication

The backend expects the JWT directly in the `Authorization` header.

```http
Authorization: <JWT_TOKEN>
```

It does not currently expect the `Bearer ` prefix.

JWT payload contains:

- `userId`
- `fullname`
- `role`

User roles:

- `student`
- `instructor`

There is also a separate `admin` model/login flow.

## Main frontend API map

### Users

| Method | Endpoint | Auth | Role |
|---|---|---|---|
| POST | `/users/signup` | No | Public |
| POST | `/users/login` | No | Public |
| GET | `/users/myProfile` | Yes | Any user |
| PATCH | `/users/profile` | Yes | Any user |
| POST | `/users/updatePassword` | Yes | Any user |
| POST | `/users/profile/uploadImg` | Yes | Any user |
| POST | `/users/forgetPassword` | No | Public |
| POST | `/users/verifyOtp` | Reset token | Public reset flow |
| POST | `/users/changePassword` | Verified reset token | Public reset flow |
| GET | `/users/login/google` | No | Public |

### Courses

| Method | Endpoint | Auth | Role |
|---|---|---|---|
| GET | `/course` | No | Public/instructor-aware if token supplied |
| GET | `/course/:id` | No | Public/instructor-aware if token supplied |
| GET | `/course/category/:categoryId` | No | Public |
| GET | `/course/track/:trackId` | No | Public |
| POST | `/course/addCourse` | Yes | Instructor |
| PUT | `/course/updateCourse/:id` | Yes | Instructor(owner) |
| PATCH | `/course/status/:id` | Yes | Instructor(owner) |
| DELETE | `/course/deleteCourse/:id` | Yes | Instructor(owner) |
| GET | `/course/review/pending` | Yes | Admin |
| PATCH | `/course/review/:id` | Yes | Admin |

### Course review workflow

Course status is stored in MongoDB and moves through the following states:

```text
draft ──submit──> in_review ──approve──> published
  ^                   │                       │
  │                   └──request_changes──> changes_required
  │                                             │
  └──────────────withdraw / resubmit───────────┘
```

`PATCH /course/status/:id` (instructor) accepts `draft`, `in_review`, `changes_required`,
`published`, or `archived`, but only allows these transitions:

| From | To |
|---|---|
| `draft` | `in_review` |
| `changes_required` | `in_review` |
| `in_review` | `draft` (withdraw) |

`PATCH /course/review/:id` (admin) takes `{ "decision": "approve" | "request_changes", "message" }`.
`request_changes` requires a message, which is stored on `course.reviewMessage` and shown to
the instructor. Approving sets the course to `published`.

A course must contain at least one section and at least one lesson before it can be sent to
review or published.

Submitting for review creates a `course` notification for every active admin, and an admin
decision creates one back for the instructor.

### Categories

| Method | Endpoint | Auth | Role |
|---|---|---|---|
| GET | `/category/` | No | Public |
| GET | `/category/:id` | No | Public |
| GET | `/category/subcategories/:id` | No | Public |
| GET | `/category/catogrybyslugs/:slug` | No | Public |
| POST | `/category/AddCatogry` | Yes | Admin |
| PUT | `/category/:id` | Yes | Admin |
| DELETE | `/category/:id` | Yes | Admin |
| POST | `/category/:id/subcategories` | Yes | Admin |
| PUT | `/category/:id/subcategories/:subId` | Yes | Admin |
| DELETE | `/category/:id/subcategories/:subId` | Yes | Admin |

### Tracks

| Method | Endpoint | Auth | Role |
|---|---|---|---|
| GET | `/track/` | No | Public |
| GET | `/track/category/:categoryId` | No | Public |
| GET | `/track/trackById/:id` | No | Public |
| GET | `/track/trackBySlug/:slug` | No | Public |
| POST | `/track/AddTrack` | Yes | Admin |
| PUT | `/track/updateTrack/:id` | Yes | Admin |
| DELETE | `/track/deleteTrack/:id` | Yes | Admin |

### Sections

| Method | Endpoint | Auth | Role |
|---|---|---|---|
| POST | `/section/course/:courseId` | Yes | Instructor(owner) |
| GET | `/section/course/:courseId` | Yes | Student/Instructor |
| GET | `/section/:id` | Yes | Student/Instructor |
| PATCH | `/section/:id` | Yes | Instructor(owner) |
| DELETE | `/section/:id` | Yes | Instructor(owner) |

### Lessons

| Method | Endpoint | Auth | Role |
|---|---|---|---|
| POST | `/lesson/course/:courseId` | Yes | Instructor(owner) |
| GET | `/lesson/course/:courseId` | Yes | Student/Instructor |
| GET | `/lesson/:id` | Yes | Student/Instructor |
| PATCH | `/lesson/:id` | Yes | Instructor(owner) |
| DELETE | `/lesson/:id` | Yes | Instructor(owner) |

Video upload field name: `video`.

### Cart / Wishlist

| Method | Endpoint | Auth | Role |
|---|---|---|---|
| GET | `/cart/` | Yes | Student |
| POST | `/cart/courses` | Yes | Student |
| DELETE | `/cart/courses/:courseId` | Yes | Student |
| DELETE | `/cart/courses` | Yes | Student |
| GET | `/wishlist/` | Yes | Student |
| POST | `/wishlist/courses` | Yes | Student |
| DELETE | `/wishlist/courses/:courseId` | Yes | Student |
| DELETE | `/wishlist/courses` | Yes | Student |

### Orders

| Method | Endpoint | Auth | Role |
|---|---|---|---|
| POST | `/orders/` | Yes | Student |
| POST | `/orders/buy-now` | Yes | Student |
| GET | `/orders/` | Yes | Student |
| GET | `/orders/:id` | Yes | Student(owner) |

### Payments

| Method | Endpoint | Auth | Role |
|---|---|---|---|
| POST | `/payments/` | Yes | Student |
| GET | `/payments/` | Yes | Student |
| PATCH | `/payments/:id/confirm` | Yes | Admin |

Payment confirmation is currently an admin/testing flow. A real gateway webhook should replace it in production.

Successful payment performs the backend-controlled flow:

`Payment Success -> Order Paid -> Enrollment -> Instructor Wallet`

### Enrollment

There is intentionally no public/direct enrollment creation endpoint anymore.

| Method | Endpoint | Auth | Role |
|---|---|---|---|
| GET | `/enroll/myCourses` | Yes | Student |
| GET | `/enroll/course/:id` | Yes | Student(owner) |
| PATCH | `/enroll/progress/:id` | Yes | Student(owner) |

Progress endpoint body:

```json
{
  "lessonId": "LESSON_ID"
}
```

The backend calculates progress from completed lessons. The client cannot set an arbitrary percentage.
When all lessons are completed, the backend generates the certificate automatically.

### Quizzes

| Method | Endpoint | Auth | Role |
|---|---|---|---|
| POST | `/Quiz/createQuiz` | Yes | Instructor(owner) |
| GET | `/Quiz/getQuizzes` | Yes | Student/Instructor |
| GET | `/Quiz/getQuiz/:id` | Yes | Student/Instructor |
| PATCH | `/Quiz/updateQuiz/:id` | Yes | Instructor(owner) |
| DELETE | `/Quiz/deleteQuiz/:id` | Yes | Instructor(owner) |

Quiz creation requires either `lessonId` (lesson quiz) or `sectionId` (section final quiz — at most one per section). The backend derives the course and instructor from the lesson or the section.
Correct answers are never returned to students.

### Quiz Attempts

| Method | Endpoint | Auth | Role |
|---|---|---|---|
| POST | `/QuizAttempt/submit` | Yes | Student |
| GET | `/QuizAttempt/my-attempts` | Yes | Student |
| GET | `/QuizAttempt/my-attempts/:attemptId` | Yes | Student(owner) |

### Reviews

| Method | Endpoint | Auth | Role |
|---|---|---|---|
| GET | `/review/getReviews/:courseId` | No | Public |
| POST | `/review/createReview/:courseId` | Yes | Student |
| PATCH | `/review/updateReview/:id` | Yes | Student(owner) |
| DELETE | `/review/deleteReview/:id` | Yes | Student(owner) |

Students can review only completed courses. Course rating is recalculated after review create/update/delete.

### Certificates

| Method | Endpoint | Auth | Role |
|---|---|---|---|
| GET | `/certificate/verify/:certificateId` | No | Public |
| GET | `/certificate/myCertificates` | Yes | Student |

### Projects

| Method | Endpoint | Auth | Role |
|---|---|---|---|
| GET | `/project/` | Yes | Student/Instructor/Admin |
| GET | `/project/:projectId` | Yes | Student/Instructor/Admin |
| POST | `/project/` | Yes | Instructor(owner) |
| PATCH | `/project/:projectId` | Yes | Instructor(owner) |
| DELETE | `/project/:projectId` | Yes | Instructor(owner) |

### Project submissions

| Method | Endpoint | Auth | Role |
|---|---|---|---|
| POST | `/project-submission/submit` | Yes | Student |
| GET | `/project-submission/my-submissions` | Yes | Student |
| GET | `/project-submission/my-submissions/:submissionId` | Yes | Student(owner) |
| GET | `/project-submission/project/:projectId` | Yes | Instructor(owner) |
| PATCH | `/project-submission/:submissionId/grade` | Yes | Instructor(owner) |

### Wallet / Payout

| Method | Endpoint | Auth | Role |
|---|---|---|---|
| GET | `/wallet/` | Yes | Instructor |
| POST | `/payouts/` | Yes | Instructor |
| GET | `/payouts/` | Yes | Instructor |
| PATCH | `/payouts/:id` | Yes | Admin |

Wallet fields include:

- `balance`
- `pendingPayout`
- virtual `availableBalance`

### Refunds

| Method | Endpoint | Auth | Role |
|---|---|---|---|
| POST | `/refunds/` | Yes | Student |
| GET | `/refunds/` | Yes | Student |
| PATCH | `/refunds/:id` | Yes | Admin |

Approved refund revokes the related enrollment/certificate and reverses the instructor wallet credit. If an instructor's available wallet cannot cover the reversal, the refund remains pending and the admin receives an error instead of creating a negative wallet.

### Notifications

| Method | Endpoint | Auth | Role |
|---|---|---|---|
| GET | `/Notification/getNotification` | Yes | Any authenticated user |
| PATCH | `/Notification/updateNotification/:id` | Yes | Recipient |
| DELETE | `/Notification/deleteNotification/:id` | Yes | Recipient |
| POST | `/Notification/sendNotification` | Yes | Admin |

## Important frontend rules

1. Do not send `instructorId` when creating a course. The backend gets it from JWT.
2. Do not send arbitrary `progress`. Send only the completed `lessonId`.
3. Do not create enrollment directly.
4. Do not expose quiz `correctAnswer` in student UI.
5. Do not trust frontend role checks for security; backend remains authoritative.
6. Store the JWT securely on the client and send it in `Authorization` exactly as returned.
7. Do not put MongoDB, Cloudinary, email, Google secret, or JWT secrets in Angular.

## Backend changes completed

- Fixed role consistency: student/instructor/admin.
- Added active-account enforcement.
- Added JWT expiration.
- Hardened signup/update payloads.
- Removed password hashes from normal API responses.
- Fixed password reset so change-password requires verified OTP.
- Added compound unique indexes for enrollment/review/project submission and one-cart/one-wishlist-per-user behavior.
- Added course/category/track integrity checks.
- Added section/lesson ordering protection.
- Added quiz ownership through course/instructor and hid answers from students.
- Server-controlled course progress.
- Automatic certificate generation after course completion.
- Verified skills can be populated from track required skills on certificate generation.
- Added streak update on meaningful learning/review activity.
- Fixed review rating recalculation.
- Added course publishing/status endpoint.
- Added Buy Now.
- Payment confirmation is admin-controlled.
- Successful payment creates enrollment and instructor wallet credit.
- Added wallet payout reservation using `pendingPayout`.
- Added refund flow with enrollment/certificate revocation and wallet reversal.
- Added cleanup for course/section/lesson/quiz/project deletion where safe.
- Added centralized 400/404/409 error handling.
- Added a database-backed course review workflow: `in_review` / `changes_required`
  statuses, instructor transitions, admin approve/request-changes endpoints, and
  notifications in both directions.

## Frontend data layer

The Angular app reads everything through `src/app/services/instructor-data.service.ts`,
which wraps the endpoints above. `src/app/mock-types.ts` holds the interfaces that mirror
the MongoDB schemas. The deleted mock store (`page/instructor-data.ts`) is gone; nothing
in the frontend holds placeholder course, section, lesson, quiz or certificate data.

| Concern | Endpoint |
|---|---|
| Instructor profile | `GET`/`PATCH /users/myProfile`, `PATCH /users/profile` |
| Categories / tracks | `GET /category/`, `GET /track/` |
| Own courses | `GET /course/myCourses` |
| Curriculum | `GET /section/course/:courseId` + `GET /lesson/course/:courseId` + `GET /Quiz/getQuizzes` |
| Sections | `POST /section/course/:courseId`, `PATCH`/`DELETE /section/:id` |
| Lessons | `POST /lesson/course/:courseId`, `PATCH`/`DELETE /lesson/:id` |
| Quizzes | `POST /Quiz/createQuiz`, `PATCH /Quiz/updateQuiz/:id`, `DELETE /Quiz/deleteQuiz/:id` |
| Certificates | `GET /certificate/myCertificates`, `GET /certificate/verify/:id` |
| Review | `PATCH /course/status/:id`, `GET /course/review/pending`, `PATCH /course/review/:id` |

Notes:

- The backend expects the JWT directly in `Authorization` (no `Bearer` prefix).
- Response envelopes differ per resource, so each Angular service unwraps its own
  key and always hands the component a plain array:

  | Endpoint | Envelope |
  |---|---|
  | `/category/`, `/category/:id`, `/category/:id/subcategories` | `{ categories }`, `{ category }`, `{ subcategories }` |
  | `/track/`, `/track/category/:id`, `/track/trackById/:id` | `{ tracks }`, `{ track }` |
  | `/course`, `/course/category/:id`, `/course/track/:id` | `{ data, count, total, ... }` |
  | `/admins/myUsers`, `/myInstructors`, `/myAdmins` | `{ data }` |
  | `/Notification/getNotification` | `{ notifications }` |
  | `/users/myProfile`, `/course/:id`, `/section/course/:courseId`, `/lesson/course/:courseId` | `{ data }` |

  Do not write `res?.data || res` in a component — that returns the whole
  envelope object when `data` is absent, and calling `.find`/`.map` on it throws
  `TypeError: ... is not a function`.

- Field names follow the schemas: tracks use `title` (not `name`) and
  `categoryId`; categories use `subcategories` (lowercase, no capital S) and
  have no `status`; users have `isActive` (not a `status` string).
- Lesson `type` is `video` | `text`; video lessons are created through the multipart
  upload route, so creating a video lesson from the JSON form is not supported.
- Quiz questions use the `question` field (not `text`), and `createQuiz` requires a
  `lessonId` because the quiz is attached through `Lesson.quizId`.
- Certificates have no status field; they are issued automatically when a student
  completes a course and are revoked when a refund is approved.

## Maintenance scripts

| Script | Purpose |
|---|---|
| `node src/scripts/consolidateCategories.js` | Merges the duplicate `Category` / `categories` collections and reassigns tracks by slug. Run once; safe to re-run. |
| `node src/scripts/migrateData.js` | Normalises the seeded rows and adds the missing categories/tracks. Safe to run again — it matches on slug and skips what already exists. |
| `node src/scripts/checkData.js` | Prints collection counts plus any tracks still missing `title` / `categoryId`. |
| `node src/scripts/seed/curriculum.js` | Wipes sections/lessons/quizzes/quiz attempts and regenerates the roadmap for every course: 3 sections × 3-4 lessons, one quiz per lesson, and one section final quiz per section. Destructive — re-running rebuilds everything. |
| `node src/scripts/seed/testSectionQuizApi.js` | API smoke test for section final quizzes (requires the server running on port 3000). Creates and removes its own temporary data. |

### Two category collections

The database held the same resource in two collections:

- `Category` (capital C) — 6 rows with subcategories; the 22 tracks and 26 courses
  referenced these ids
- `categories` (lower case) — 4 rows without subcategories

`mongoose.model("Category", schema)` actually reads `categories`, because Mongoose
pluralises the model name. So the catalog navigated with an id from `categories`
while every track was keyed to `Category`, and `GET /track/category/:id` correctly
returned an empty list. `consolidateCategories.js` resolves this by keeping
`categories`, filling in the missing slugs, and repointing every track and course
at the surviving rows by slug.

Note for scripts: the MongoDB driver bundled with Mongoose 9 has no
`countDocuments()` on a native collection, and `findOne()` returns the document
directly instead of a cursor — so do not chain `.limit().next()` after it. Use
`collection.find(...).toArray()` for lists, or go through the Mongoose models.

## Known production TODOs

- Replace admin payment confirmation with a real payment gateway webhook.
- Add a real payout provider/integration.
- Decide and implement a business commission/fee policy if the platform should not credit instructors 100% of course price.
- Add rate limiting and stronger request validation at the API edge.
- Use a managed secrets store and rotate any credentials that were previously committed to `.env`.
- Add automated integration tests against a dedicated test database.
# Paymob checkout setup

The course details page starts a single-course order and opens Paymob Unified Checkout. The cart checkout uses the same flow. Enrollment and instructor wallet credit happen only after the signed Paymob transaction callback confirms payment.

Add these values to the backend `.env` (keep the secret values private):

```env
PAYMOB_SECRET_KEY=sk_test_or_live_key
PAYMOB_PUBLIC_KEY=pk_test_or_live_key
PAYMOB_INTEGRATION_ID=your_card_or_checkout_integration_id
PAYMOB_HMAC_SECRET=your_callback_hmac_secret
PAYMOB_NOTIFICATION_URL=https://your-public-api-domain/E-learning/payments/paymob/callback
FRONTEND_URL=http://localhost:4200
```

Use Paymob test credentials and a publicly reachable callback URL for sandbox testing. Configure the same callback URL in the Paymob dashboard if required by the account. Set `FRONTEND_URL` to the deployed frontend origin in production. The integration currently passes one Paymob integration ID to Unified Checkout; enable the payment methods for that integration in the Paymob dashboard.
