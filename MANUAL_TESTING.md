# Manual Testing Guide

Step-by-step checks for the Vacation Management app, covering both the Requester and Validator roles.

## 1. Setup

Prerequisites: Node.js 20+, npm 9+, and Docker.

```bash
npm install
cp backend/.env.example backend/.env   # set JWT_SECRET to any random string of 32+ characters
npm run db:up
npm run db:migrate
npm run db:seed
```

Start the app in two terminals:

```bash
npm run dev:backend    # API on http://localhost:8888
npm run dev:frontend   # App on http://localhost:3000
```

Open http://localhost:3000.

## 2. Test accounts

All accounts use the password **`demo1234`**.

| Role | Name | Email | Password |
| --- | --- | --- | --- |
| Requester | Alex Morgan | `alex.requester@company.internal` | `demo1234` |
| Requester | Sarah Chen | `sarah.dev@company.internal` | `demo1234` |
| Requester | Marcus Vance | `marcus.eng@company.internal` | `demo1234` |
| Validator | Elena Rostova | `elena.validator@company.internal` | `demo1234` |

Pick two future date ranges that don't overlap each other or Alex's existing requests. This guide calls them **Range A** and **Range B**.

## 3. Login

| # | Steps | Expected |
| --- | --- | --- |
| 1 | While signed out, open http://localhost:3000/approvals | Redirected to the login page |
| 2 | Sign in as Alex with a wrong password | Error message; you stay on the login page |
| 3 | Sign in as Alex with `demo1234` | You land on **My Requests** |
| 4 | Click **Sign Out** | You return to the login page |

## 4. Requester (sign in as Alex)

| # | Steps | Expected |
| --- | --- | --- |
| 1 | Open **My Requests** | Only Alex's requests are listed, with their status (Pending, Approved, or Rejected) |
| 2 | Submit Range A with a reason | A new **Pending** request appears with the correct day count |
| 3 | Submit Range B without a reason | A new **Pending** request appears |
| 4 | Submit a request with a start date in the past | Blocked with an error |
| 5 | Submit a request whose end date is on or before its start date | Blocked with an error |
| 6 | Submit a request overlapping Range A | Blocked with an overlap error |
| 7 | Open http://localhost:3000/approvals | Redirected back to **My Requests** (Requesters cannot approve) |
| 8 | Open **Team Planning** and navigate months | Pending and approved vacations appear on the calendar |

## 5. Validator (sign out, then sign in as Elena)

| # | Steps | Expected |
| --- | --- | --- |
| 1 | Open **Approvals** | Requests from all users are listed |
| 2 | Filter by each status | Only requests with that status are shown |
| 3 | Filter by requester (e.g. Alex) | Only that user's requests are shown |
| 4 | Type a name or reason into the search box | Matching requests are shown |
| 5 | Set rows per page to 5 and use the page arrows | Pages change with correct counts |
| 6 | **Approve** Alex's Range A request | Status becomes **Approved**; action buttons disappear |
| 7 | Click **Reject** on Alex's Range B request and leave the comment empty | You cannot confirm the rejection |
| 8 | Enter a comment and confirm the rejection | Status becomes **Rejected**; the comment is shown |
| 9 | Open **Team Planning** | Range A shows as approved; Range B is not shown |

## 6. Final check (sign in as Alex again)

| # | Steps | Expected |
| --- | --- | --- |
| 1 | Open **My Requests** | Range A is **Approved** and marked locked; Range B is **Rejected** with Elena's comment |
| 2 | Submit a request overlapping Range A | Blocked with an overlap error |
| 3 | Submit Range B again | Accepted as **Pending** (rejected requests free their dates) |

## Reporting issues

For each failure, note the account used, the steps taken, the expected and actual result, and the browser. A screenshot helps.

To start over with fresh data, run `docker compose -f backend/docker-compose.yml down -v`, then `npm run db:up`, `npm run db:migrate`, and `npm run db:seed`.
