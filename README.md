# Revio


## Overview

Revio is a smart restaurant feedback management platform that uses NFC technology to simplify customer review collection and improve service quality.

Each server in the restaurant owns a unique NFC card. After finishing their meal, customers can scan the card using their smartphone and instantly access a feedback form to rate their experience and leave comments.

The platform centralizes all customer reviews inside a management dashboard where restaurant managers can:
- monitor customer satisfaction,
- evaluate server performance,
- manage public testimonials,
- analyze service quality,
- and handle critical reviews.

---

# Problem Statement

Traditional restaurant feedback systems often suffer from:
- low customer participation,
- inefficient paper feedback collection,
- lack of real-time analytics,
- poor server performance tracking,
- and unmanaged online reputation.

Revio solves these issues through:
- instant NFC-based review collection,
- centralized analytics,
- testimonial moderation,
- performance monitoring,
- and smart review management.

---

# Main Objectives

- Simplify customer feedback collection
- Improve restaurant service quality
- Track server performance
- Increase customer engagement
- Provide real-time management insights
- Modernize restaurant operations using NFC technology

---

# Core Features

## Customer Feedback System

- NFC card scanning
- Mobile-friendly review form
- Star rating system
- Comment submission
- Anonymous feedback support

---

## Review Management

- Review approval workflow
- Critical review detection
- Positive testimonial moderation
- Review filtering system
- Public testimonial management

---

## Manager Dashboard

The manager dashboard allows:
- server management,
- NFC card assignment,
- review monitoring,
- performance analysis,
- statistics visualization,
- testimonial approval,
- critical review tracking.

---

## Server Space

Each server can:
- access personal statistics,
- monitor ratings,
- view rankings,
- consult review history.

Servers cannot:
- modify reviews,
- delete reviews,
- approve testimonials,
- access administration settings.

---

# Review Workflow

```text
Client scans NFC card
        ↓
Feedback form opens
        ↓
Client submits review
        ↓
Review saved in database
        ↓
System analyzes rating
        ↓
Positive Review → Pending Approval
Neutral Review → Internal Analytics
Negative Review → Critical Alert
        ↓
Manager reviews feedback
        ↓
Approved testimonials appear publicly
```

---

# Review Status System

| Status | Description |
|---|---|
| PENDING | Newly submitted review |
| APPROVED | Approved for public display |
| REJECTED | Refused by manager |
| CRITICAL | Negative review requiring attention |
| FEATURED | Highlighted testimonial |

---

# User Roles

## Manager / Admin

The manager can:
- manage servers,
- assign NFC cards,
- approve testimonials,
- reject testimonials,
- view analytics,
- monitor restaurant performance,
- receive critical alerts.

---

## Server

The server can:
- view personal statistics,
- monitor average rating,
- access rankings,
- consult review history.

---

## Customer

The customer can:
- scan NFC cards,
- submit reviews,
- rate service quality,
- write comments,
- send anonymous feedback.

---

# Business Rules

- Each NFC card must be unique.
- One server can only own one active NFC card.
- Negative reviews are never displayed publicly.
- Only managers can approve public testimonials.
- Servers cannot modify or delete customer reviews.

---

# Dashboard Features

The dashboard provides:
- recent reviews,
- critical review alerts,
- best-performing servers,
- global restaurant statistics,
- average rating monitoring,
- review management,
- testimonial moderation.

---

# Future Improvements

- QR Code support
- Real-time notifications
- AI review analysis
- Reward system for servers
- Multi-restaurant management
- Dedicated mobile application
- Google Reviews integration

---

# Technology Stack

## Frontend

- React
- JavaScript
- CSS

---

## Backend

- PHP
- Laravel
- Laravel Sanctum
- REST API Architecture

---

## Database

- MySQL

---

# Project Architecture

The project follows a modern client-server architecture:

```text
React Frontend
       ↓
Laravel REST API
       ↓
MySQL Database
```

---

# Security Features

- Authentication system
- Role-based authorization
- Protected API routes
- Password encryption
- Review moderation system

---

# UML & Conception

The project includes:
- Use Case Diagram
- Class Diagram
- Sequence Diagram
- Activity Diagram
- ERD (Entity Relationship Diagram)

---

# Project Vision

Revio aims to modernize customer feedback collection in restaurants through smart NFC interactions and data-driven management tools.

The platform combines:
- customer experience optimization,
- employee performance tracking,
- restaurant analytics,
- and digital reputation management
into a single scalable solution.

---

# Author

Revio — Smart Restaurant Feedback Management Platform
