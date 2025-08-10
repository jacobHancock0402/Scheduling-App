# Study Tracker App

A React Native application for tracking study topics using spaced repetition and color-coded decay visualization.

## Features

- **Subject Management**: Create and organize study subjects hierarchically
- **Topic Tracking**: Add subtopics to subjects with time-based decay visualization
- **Spaced Repetition**: SM2 algorithm implementation for optimal review scheduling
- **Color-Coded System**: Visual representation of topic freshness using RGB colors
- **Navigation**: Tab-based navigation between subjects and topics views

## Architecture

### File Structure

```
src/
├── components/
│   ├── App.js                 # Main navigation container
│   └── screens/
│       ├── HomeScreen.js      # Welcome screen
│       ├── SubjectsScreen.js  # Subject creation and management
│       ├── SubTopicsScreen.js # Topic and subtopic management
│       └── OrderedTopicsScreen.js # Sorted topic view
├── constants/
│   └── constants.js           # App-wide constants and configurations
└── utils/
    └── helpers.js             # Utility functions and helpers
```

### Key Components

#### App.js
- Main navigation container using React Navigation
- Stack navigator for screen transitions
- Tab navigator for main app sections

#### SubjectsScreen.js
- Create and manage study subjects
- Visual decay calculation based on subtopic activity
- Color-coded subject cards
- Hierarchical topic organization

#### SubTopicsScreen.js
- Add topics and subtopics to subjects
- SM2 spaced repetition algorithm implementation
- Color slider for manual topic reset
- Real-time decay visualization

#### OrderedTopicsScreen.js
- View all topics sorted by review priority
- Toggle between regular intervals and SM2 intervals
- Formatted time display for review scheduling

### Constants and Configuration

#### constants.js
- Time conversion factors
- Color constants and RGB values
- SM2 algorithm parameters
- Storage keys
- Default configurations

#### helpers.js
- Time formatting utilities
- RGB color parsing and creation
- SM2 score calculations
- Value limiting functions

## Technical Implementation

### State Management
- React hooks for local state management
- AsyncStorage for persistent data storage
- Real-time updates using useFocusEffect

### Color System
- RGB-based color representation
- Red component: time since last review
- Green component: time until next review
- Dynamic color calculation based on decay

### SM2 Algorithm
- Spaced repetition algorithm implementation
- Easing factor adjustments
- Interval calculations
- Review scheduling optimization

### Data Structure
```javascript
{
  "subjectName": {
    "name": "Subject Name",
    "subjects": [...],
    "topics": [...],
    "parent": null,
    "colour": "rgb(0,255,0)"
  }
}
```

## Dependencies

- **React Navigation**: Screen navigation and routing
- **AsyncStorage**: Local data persistence
- **React Native Slider**: Color adjustment controls
- **Expo**: Development and build tools

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm expo start
   ```
3. Use the QR code to open the project in Expo GO


## Usage

1. **Create Subjects**: Use the input field to create new study subjects
2. **Add Topics**: Navigate to a subject and add study topics
3. **Track Progress**: Monitor topic decay through color changes
4. **Review Schedule**: Use the topics view to see what needs review
5. **Reset Topics**: Use the color slider to mark topics as reviewed




## Future Enhancements?

- User authentication and cloud sync
- Advanced analytics and progress tracking
- Customizable review intervals
- Export/import functionality
- Dark mode support
- Accessibility improvements 