# Luna Documentation

Welcome to the Luna photography portfolio and client management system documentation!

This documentation is organized into two main sections:

- **Developer Documentation**: For developers, agents, and technical contributors
- **Site Manager Documentation**: For Ashley and site administrators

## Quick Navigation

### For Developers & Agents

Start here if you're working on the codebase, deploying, or maintaining the technical infrastructure.

📚 **[Developer Documentation](./developer/)**

| Document                                                 | Description                                                 |
| -------------------------------------------------------- | ----------------------------------------------------------- |
| **[Architecture Overview](./developer/architecture.md)** | System design, technology stack, and architectural patterns |
| **[Setup Guide](./developer/setup.md)**                  | Getting started with local development environment          |
| **[Development Guide](./developer/development.md)**      | Day-to-day development workflow and best practices          |
| **[API Reference](./developer/api-reference.md)**        | Complete API endpoint documentation                         |
| **[Database Schema](./developer/database-schema.md)**    | Database models, relationships, and schema reference        |
| **[Deployment Guide](./developer/deployment.md)**        | Production deployment instructions and platform guides      |

**Quick Links**:

- 🚀 [Getting Started](./developer/setup.md#initial-setup)
- 🏗️ [Architecture Patterns](./developer/architecture.md#architecture-patterns)
- 🔌 [API Endpoints](./developer/api-reference.md)
- 🗄️ [Database Models](./developer/database-schema.md#models)
- 📦 [Deployment Checklist](./developer/deployment.md#pre-deployment-checklist)

---

### For Site Managers

Start here if you're managing content, galleries, bookings, and client interactions.

👤 **[Site Manager Documentation](./site-manager/)**

| Document                                                       | Description                                                         |
| -------------------------------------------------------------- | ------------------------------------------------------------------- |
| **[Getting Started](./site-manager/getting-started.md)**       | Introduction to the admin dashboard and basic tasks                 |
| **[Managing Portfolio](./site-manager/managing-portfolio.md)** | Creating galleries, uploading images, and organizing your portfolio |
| **[Client Galleries](./site-manager/client-galleries.md)**     | Private photo delivery and client gallery management                |
| **[Bookings](./site-manager/bookings.md)**                     | Managing availability and booking requests                          |
| **[Inquiries](./site-manager/inquiries.md)**                   | Handling contact form submissions and leads                         |
| **[Troubleshooting](./site-manager/troubleshooting.md)**       | Common issues and solutions                                         |

**Quick Links**:

- 🎯 [Dashboard Overview](./site-manager/getting-started.md#dashboard-overview)
- 📸 [Upload Images](./site-manager/managing-portfolio.md#uploading-images)
- 🔐 [Create Client Gallery](./site-manager/client-galleries.md#creating-a-client-gallery)
- 📅 [Set Availability](./site-manager/bookings.md#creating-availability-slots)
- 📧 [Respond to Inquiries](./site-manager/inquiries.md#responding-to-new-inquiries)
- 🔧 [Common Issues](./site-manager/troubleshooting.md)

---

## Documentation Organization

```
docs/
├── README.md (you are here)
├── developer/
│   ├── architecture.md        # System architecture and design patterns
│   ├── setup.md              # Development environment setup
│   ├── development.md        # Development workflow and guidelines
│   ├── api-reference.md      # API endpoints and usage
│   ├── database-schema.md    # Database models and relationships
│   └── deployment.md         # Deployment guides and checklists
└── site-manager/
    ├── getting-started.md    # Admin dashboard introduction
    ├── managing-portfolio.md # Gallery and image management
    ├── client-galleries.md   # Private client photo delivery
    ├── bookings.md          # Availability and booking management
    ├── inquiries.md         # Contact form and inquiry handling
    └── troubleshooting.md   # Common issues and solutions
```

---

## About Luna

Luna is a modern, full-stack photography portfolio and booking management system built with:

- **Frontend**: Next.js 15, React 18, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, NextAuth.js, Prisma ORM
- **Database**: PostgreSQL
- **Services**: Resend (email), Sharp (image processing)

### Key Features

**Public Features**:

- Portfolio gallery showcase with lightbox viewer
- Online booking system with calendar
- Contact form
- About and pricing pages
- Dark mode support

**Admin Features**:

- Gallery and image management
- Client gallery creation (private photo delivery)
- Booking request management
- Inquiry tracking
- Availability calendar management
- Dashboard with analytics

**Client Features**:

- Private gallery access
- Favorite marking
- Image downloads
- Gallery expiration tracking

---

## Getting Help

### For Developers

- Review the [Architecture Overview](./developer/architecture.md) to understand the system
- Check the [Setup Guide](./developer/setup.md) for environment configuration
- Reference the [API Documentation](./developer/api-reference.md) for endpoints
- See [Database Schema](./developer/database-schema.md) for data models

**Issues?**

- Check the [Development Guide](./developer/development.md#troubleshooting) for common problems
- Review error messages carefully
- Search the codebase for similar implementations
- Contact the development team

### For Site Managers

- Start with [Getting Started](./site-manager/getting-started.md) for an overview
- Use specific guides for each feature
- Check [Troubleshooting](./site-manager/troubleshooting.md) for common issues

**Need Help?**

- Review the relevant guide in [Site Manager Documentation](./site-manager/)
- Check [Troubleshooting](./site-manager/troubleshooting.md)
- Contact your web developer for technical issues

---

## Common Tasks

### Developers

| Task                           | Documentation                                                   |
| ------------------------------ | --------------------------------------------------------------- |
| Set up development environment | [Setup Guide](./developer/setup.md)                             |
| Create a new API endpoint      | [Development Guide](./developer/development.md#api-development) |
| Modify database schema         | [Development Guide](./developer/development.md#schema-changes)  |
| Deploy to production           | [Deployment Guide](./developer/deployment.md)                   |
| Understand authentication      | [Architecture](./developer/architecture.md#authentication-flow) |

### Site Managers

| Task                           | Documentation                                                                    |
| ------------------------------ | -------------------------------------------------------------------------------- |
| Upload photos to portfolio     | [Managing Portfolio](./site-manager/managing-portfolio.md#uploading-images)      |
| Create client delivery gallery | [Client Galleries](./site-manager/client-galleries.md#creating-a-client-gallery) |
| Respond to booking request     | [Bookings](./site-manager/bookings.md#responding-to-booking-requests)            |
| Reply to contact form inquiry  | [Inquiries](./site-manager/inquiries.md#responding-to-new-inquiries)             |
| Set available dates            | [Bookings](./site-manager/bookings.md#creating-availability-slots)               |

---

## Contributing to Documentation

### For Developers

When adding features or making changes:

1. Update relevant documentation
2. Add API endpoints to [API Reference](./developer/api-reference.md)
3. Update [Database Schema](./developer/database-schema.md) if models change
4. Document new workflows in [Development Guide](./developer/development.md)

### Documentation Standards

- Use clear, concise language
- Include code examples where helpful
- Add screenshots for UI features (in Site Manager docs)
- Keep table of contents updated
- Link between related documents
- Test all code examples

---

## Project Links

- **Repository**: [Link to Git repository]
- **Production Site**: [Link to live site]
- **Admin Dashboard**: [Link to admin login]
- **Issue Tracker**: [Link to issues/project management]

---

## Version Information

**Luna Version**: 1.0
**Documentation Last Updated**: January 2025
**Next.js Version**: 15.5
**Node.js Requirement**: 18.17.0+

---

## License

[Include license information if applicable]

---

## Contact

**For Technical Issues**: Contact development team
**For Site Management**: See [Getting Started](./site-manager/getting-started.md)

---

**Happy building! 📸✨**
