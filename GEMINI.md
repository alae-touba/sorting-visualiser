# Project Overview

This is a sorting algorithm visualizer built with Angular. It allows users to see various sorting algorithms in action. The application displays multiple sorting algorithms side-by-side, and the user can control the speed and data density of the visualization.

This project was generated from the instructions in the `angular_sorting_visualiser_full_project_scaffold.md` file.

## Main Technologies

*   **Framework**: Angular
*   **Language**: TypeScript
*   **Styling**: SCSS, Bootstrap
*   **Build Tool**: Angular CLI

## Architecture

The application is structured as a standard Angular project.

*   `src/app/app.component.ts`: The main application component that orchestrates the UI and interactions.
*   `src/app/services/sorting.service.ts`: A service that manages the global settings for the sorting visualizations, such as speed and density.
*   `src/app/algorithms/index.ts`: This file contains the implementations of the sorting algorithms: Quick Sort, Shell Sort, Insertion Sort, Selection Sort, and Bubble Sort.
*   `src/app/components/algorithm-card/algorithm-card.component.ts`: A component that displays a single sorting algorithm visualization.
*   `src/app/components/header/header.component.ts`: The header component that contains the controls for the visualizations.

# Building and Running

## Development Server

To start a local development server, run:

```bash
ng serve
```

Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

## Building

To build the project, run:

```bash
ng build
```

The build artifacts will be stored in the `dist/` directory.

## Running Unit Tests

To run unit tests, run:

```bash
ng test
```

# Development Conventions

*   **Styling**: The project uses SCSS for styling.
*   **Components**: Components are standalone and follow the standard Angular component structure.
*   **Services**: Services are used to share state and logic across components.
*   **Algorithms**: Sorting algorithms are implemented as classes that extend a base `SortingAlgorithm` class.