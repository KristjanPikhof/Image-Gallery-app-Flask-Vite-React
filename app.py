import os
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from werkzeug.utils import secure_filename
from PIL import Image
from dotenv import load_dotenv

# Load the environment variables from the .env file
load_dotenv()

# Get the path to the .env and .env.local files
env_path = os.path.join(os.path.dirname(__file__), '.env')
env_local_path = os.path.join(os.path.dirname(__file__), 'client', '.env.local')

# Write the environment variables to the .env.local file in /client folder
with open(env_local_path, 'w') as env_local_file:
    with open(env_path, 'r') as env_file:
        for line in env_file:
            key, value = line.strip().split('=', 1)
            env_local_file.write(f"{key}={value}\n")

VITE_APP_URL = os.getenv('VILE_APP_URL', 'http://localhost:5173')

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": VITE_APP_URL, "methods": ["GET", "POST", "OPTIONS"]}})

UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {
    'png', 'jpg', 'jpeg', 'gif',  # Standard web image formats
    'heic', 'heif',               # iPhone's default image format
    'webp',                       # Google's image format
    'tiff', 'tif',                # High-quality image format
    'bmp',                        # Bitmap image format
    'svg',                        # Vector image format
    'raw', 'cr2', 'nef', 'arw',   # Common RAW image formats
    'mp4', 'mov', 'm4v',          # Common video formats
    'avi', 'wmv', 'flv',          # Additional video formats
    'mkv',                        # Matroska video format
    'webm'                        # Web-optimized video format
}

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = 32 * 1024 * 1024  # 32MB max file size

UPLOAD_PASSWORD = os.getenv('UPLOAD_PASSWORD', '')

if not os.path.exists(app.config['UPLOAD_FOLDER']):
    os.makedirs(app.config['UPLOAD_FOLDER'])

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/api/is-password-protected', methods=['GET'])
def is_password_protected():
    print("Received request for /api/is-password-protected")
    return jsonify({'isPasswordProtected': bool(UPLOAD_PASSWORD)})

@app.route('/api/upload', methods=['POST'])
def upload_file():
    print("Received upload request")
    print("Request data:", request.data)
    print("Request files:", request.files)
    if UPLOAD_PASSWORD:
        if request.form.get('password') != UPLOAD_PASSWORD:
            print(f"Invalid password: {request.form.get('password')}")  # Debug print
            return jsonify({'error': 'Invalid password'}), 403

    if 'file' not in request.files:
        print("No file part in request")  # Debug print
        return jsonify({'error': 'No file part'}), 400
    
    file = request.files['file']
    if file.filename == '':
        print("No selected file")  # Debug print
        return jsonify({'error': 'No selected file'}), 400
    
    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        folder = request.form.get('folder', '')
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], folder, filename)
        try:
            os.makedirs(os.path.dirname(file_path), exist_ok=True)
            file.save(file_path)
            print(f"File saved successfully at {file_path}")  # Debug print
            return jsonify({'message': 'File uploaded successfully'}), 200
        except Exception as e:
            print(f"Error saving file: {str(e)}")  # Debug print
            return jsonify({'error': 'Error saving file'}), 500
    
    print(f"File type not allowed: {file.filename}")  # Debug print
    return jsonify({'error': 'File type not allowed'}), 400

@app.route('/api/images', methods=['GET'])
def get_images():
    folder = request.args.get('folder', '')
    path = os.path.join(app.config['UPLOAD_FOLDER'], folder)
    print(f"Searching for images in: {path}")  # Debug print
    images = []
    for root, dirs, files in os.walk(path):
        for file in files:
            if allowed_file(file):
                file_path = os.path.join(root, file)
                rel_path = os.path.relpath(file_path, app.config['UPLOAD_FOLDER'])
                try:
                    with Image.open(file_path) as img:
                        width, height = img.size
                    image_info = {
                        'name': file,
                        'path': rel_path,
                        'size': os.path.getsize(file_path),
                        'date': os.path.getmtime(file_path),
                        'width': width,
                        'height': height
                    }
                    images.append(image_info)
                    print(f"Added image: {image_info}")
                except Exception as e:
                    print(f"Error processing image {file}: {str(e)}")
    print(f"Total images found: {len(images)}")  # Debug print
    return jsonify(images)

@app.route('/api/folders', methods=['GET'])
def get_folders():
    def get_folder_structure(path):
        structure = []
        for item in os.listdir(path):
            item_path = os.path.join(path, item)
            if os.path.isdir(item_path):
                structure.append({
                    'name': item,
                    'children': get_folder_structure(item_path)
                })
        return structure

    folders = get_folder_structure(app.config['UPLOAD_FOLDER'])
    return jsonify(folders)

@app.route('/api/create_folder', methods=['POST'])
def create_folder():
    folder_name = request.json.get('folderName')
    parent_folder = request.json.get('parentFolder', '')
    if not folder_name:
        print("No folder name provided")  # Debug print
        return jsonify({'error': 'No folder name provided'}), 400
    
    new_folder_path = os.path.join(app.config['UPLOAD_FOLDER'], parent_folder, folder_name)
    try:
        os.makedirs(new_folder_path)
        print(f"Folder created successfully at {new_folder_path}")  # Debug print
        return jsonify({'message': 'Folder created successfully'}), 200
    except FileExistsError:
        print(f"Folder already exists: {new_folder_path}")  # Debug print
        return jsonify({'error': 'Folder already exists'}), 400
    except Exception as e:
        print(f"Error creating folder: {str(e)}")  # Debug print
        return jsonify({'error': f'Error creating folder: {str(e)}'}), 500

@app.route('/images/<path:filename>')
def serve_image(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename, as_attachment=False)

if __name__ == '__main__':
    app.run(debug=True)
