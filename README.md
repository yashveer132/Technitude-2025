# GenAI Assistant - Versatile Domain-Adaptable System

A GenAI-powered system with an easy-to-use interface adaptable for different domains including restaurant menu-based online ordering and clinic doctor schedule-based appointment booking.

## Project Overview

This project is a solution for creating a versatile, domain-adaptable GenAI assistant that can be used across different business domains. Currently, it has been configured for two primary use cases:

1. **Restaurant Online Ordering** - Allows users to browse menu items, get recommendations based on dietary preferences, and place orders.
2. **Clinic Appointment Booking** - Enables users to check doctor availability, book appointments, and get information about medical services.

## Key Features

- **Adaptable Architecture** - The system is designed to easily extend to new domains beyond restaurants and clinics
- **Natural Language Interface** - Users can interact with the system using natural language queries
- **Domain-Specific Knowledge** - The AI responses are enhanced with domain-specific data
- **Responsive Design** - Works well on both desktop and mobile devices
- **Dark/Light Mode** - Supports both light and dark themes for user preference

## Technical Details

### Architecture

The project follows a modular architecture that separates domain-specific knowledge from the core AI assistant functionality:

```
src/
├── components/       # Reusable UI components
│   ├── chat/         # Chat interface components
│   └── common/       # Common UI components like Header and Footer
├── data/             # Domain-specific data
│   ├── restaurantData.js  # Restaurant menu and ordering information
│   └── clinicData.js      # Clinic doctors and services information
├── pages/            # Main page components
│   ├── HomePage.js        # Landing page
│   ├── RestaurantPage.js  # Restaurant interface
│   └── ClinicPage.js      # Clinic interface
├── services/         # External API services
│   └── aiService.js      # Google Generative AI integration
├── utils/            # Utility functions
│   └── domainAdapter.js   # Domain adaptation utilities
├── firebase/         # Firebase configuration
└── App.js           # Main application component
```

### Technologies Used

- **React** - Frontend library
- **Chakra UI** - Component library for consistent design
- **OpenAI API** - For natural language processing
- **Firebase** - Backend as a service for data storage
- **React Router** - For navigation between different sections

## Sample Queries

### Restaurant Assistant:
- "What dishes do you offer that are vegetarian?"
- "Do you have any gluten-free options?"
- "Can you recommend a meal combo based on my preferences for seafood?"
- "How long will it take for my order to be ready?"

### Clinic Assistant:
- "Which doctors are available today?"
- "Can I book an appointment with Dr. Johnson for next Tuesday?"
- "What is the consultation fee for a general check-up?"
- "Do you accept BlueCross insurance?"

## Extensibility

The system is designed to be easily extended to new domains by:

1. Creating a new domain data file with the appropriate structure
2. Configuring domain-specific prompt enhancements in the domainAdapter
3. Creating a new page component for the domain interface

## Setup and Installation

1. Clone the repository
2. Run `npm install` to install dependencies
3. Create a `.env` file with the OpenAI API key:
   ```
   REACT_APP_OPENAI_API_KEY=your_openai_api_key
   ```
4. Set up a Firebase project and update the configuration in `firebase/config.js`
5. Run `npm start` to start the development server

## Judging Criteria Addressed

- **Portability**: The system is designed with a domain-adapter pattern that makes it easy to adapt to new domains.
- **Code Quality**: The code is structured into reusable components with clear separation of concerns.
- **Versatility**: The system can be extended to multiple domains beyond the given scenarios as demonstrated by the hotel booking example in the domainAdapter.
- **Usability**: The interface is intuitive and user-friendly with responsive design.
- **Efficiency**: The system optimizes API calls and enhances responses with local data when possible.
- **Presentation**: The UI is clean and professional with consistent design elements.
