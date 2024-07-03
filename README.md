# Photo Gallery

This is a full-stack web application built using Flask for the backend and Vite React for the frontend. It allows users to upload and browse their photos in a gallery.

## Prerequisites

- Python 3.11+
- Node.js 20.10+

## Installation

1. **Create a virtual environment**:
   ```bash
   python -m venv myenv
   ```

2. **Activate the virtual environment**:
    ```bash
    source myenv/bin/activate
    ```

3. **Install the required dependencies**:
    ```bash
    pip install -r requirements.txt
    ```

4. **Start the Flask app**:
    ```bash
    python app.py
    ```

5. **Setup the React app**:
    - First open folder _client_ in the root:
        ```bash
        cd client
        ```

    - Install dependencies:
        ```bash
        npm install
        ```

    - Start the React app:
        ```bash
        npm run dev
        ```

## Features

- Users can upload photos to the gallery.
- Users can create folders.
- Users can view their uploaded photos in folders.
- Photos are stored on the server and displayed in the gallery.

## Technologies Used

### Backend:
- Flask

### Frontend:
- Vite React
- React
- Axios

## Contributing

If you'd like to contribute to this project, please follow these steps:

1. Fork the repository.
2. Create a new branch for your feature or bug fix.
3. Make your changes and commit them.
4. Push your changes to your fork.
5. Submit a pull request.