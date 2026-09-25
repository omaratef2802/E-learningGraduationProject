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

`PATCH /course/status/:id` accepts `draft`, `published`, or `archived`.
A course must have at least one section and one lesson before publishing.

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

Quiz creation requires `lessonId`. The backend derives the course and instructor from the lesson.
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

## Known production TODOs

- Replace admin payment confirmation with a real payment gateway webhook.
- Add a real payout provider/integration.
- Decide and implement a business commission/fee policy if the platform should not credit instructors 100% of course price.
- Add rate limiting and stronger request validation at the API edge.
- Use a managed secrets store and rotate any credentials that were previously committed to `.env`.
- Add automated integration tests against a dedicated test database.
