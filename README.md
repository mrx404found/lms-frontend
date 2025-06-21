# LMS Frontend

A React-based frontend for the Learning Management System (LMS).

## Features

- User authentication (login/signup)
- Course browsing and enrollment
- Course progress tracking
- Profile management
- Responsive design using Bootstrap

## Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)

## Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd lms-frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory with the following content:
```
VITE_API_URL=https://lms-backend-xpwc.onrender.com/api/
```

4. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## Building for Production

To create a production build:

```bash
npm run build
```

The built files will be in the `dist` directory.

## Project Structure

```
src/
  components/
    Auth/
      Login.jsx
      Signup.jsx
    Dashboard/
      Dashboard.jsx
    Courses/
      CourseList.jsx
      CourseDetails.jsx
    Profile/
      Profile.jsx
  context/
    AuthContext.jsx
  utils/
    PrivateRoute.jsx
  App.jsx
  main.jsx
```

## Technologies Used

- React
- React Router
- Axios
- Bootstrap
- Vite
# lms-frontend
