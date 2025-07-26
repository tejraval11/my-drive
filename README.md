# My Drive - Secure File Storage System

A secure file storage application built with Next.js, MongoDB, and Backblaze B2 (S3-compatible storage). Users can register, login, upload, download, and manage their files with a modern, responsive interface.

## Features

- 🔐 **Secure Authentication**: JWT-based authentication with access and refresh tokens
- 📁 **File Management**: Upload, download, and delete files
- 🗂️ **Folder Support**: Organize files in folders
- 🔍 **File Filtering**: Filter files by type (images, PDFs, documents, etc.)
- 📱 **Responsive Design**: Modern UI that works on all devices
- 🚀 **Fast Performance**: Built with Next.js 15 and optimized for speed
- ☁️ **Cloud Storage**: Files stored securely in Backblaze B2

## Tech Stack

- **Frontend**: Next.js 15, React 19, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: MongoDB with Mongoose
- **Storage**: Backblaze B2 (S3-compatible)
- **Authentication**: JWT (JSON Web Tokens)
- **File Upload**: Multer with FormData

## Prerequisites

- Node.js 18+ 
- MongoDB database
- Backblaze B2 account with bucket and API keys

## Setup Instructions

### 1. Clone the Repository

```bash
git clone <repository-url>
cd my-drive
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Configuration

Copy the example environment file and configure your variables:

```bash
cp env.example .env
```

Edit `.env` with your configuration:

```env
# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/my-drive

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here
JWT_REFRESH_SECRET=your-super-secret-refresh-jwt-key-here

# Backblaze B2 Configuration
B2_APPLICATION_KEY_ID=your-application-key-id
B2_APPLICATION_KEY=your-application-key
B2_BUCKET_ID=your-bucket-id
B2_BUCKET_NAME=your-bucket-name
B2_ENDPOINT=https://s3.us-west-002.backblazeb2.com

# Server Configuration
NEXTAUTH_SECRET=your-nextauth-secret
NEXTAUTH_URL=http://localhost:3000
```

### 4. Backblaze B2 Setup

1. Create a Backblaze B2 account
2. Create a new bucket
3. Generate Application Keys with read/write permissions
4. Note your bucket ID, bucket name, and endpoint URL

### 5. Run the Application

```bash
# Development
npm run dev

# Production
npm run build
npm start
```

The application will be available at `http://localhost:3000`

## API Documentation

### Authentication Endpoints

#### Register User
```
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

#### Login User
```
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

#### Refresh Token
```
POST /api/auth/refresh
Content-Type: application/json

{
  "refreshToken": "your-refresh-token"
}
```

### File Management Endpoints

#### Upload Files
```
POST /api/files/upload
Authorization: Bearer <access-token>
Content-Type: multipart/form-data

FormData:
- files: File[] (multiple files)
- folder: string (optional, default: "root")
```

#### List Files
```
GET /api/files?folder=root&type=image&page=1&limit=20
Authorization: Bearer <access-token>
```

Query Parameters:
- `folder`: Folder name (default: "root")
- `type`: File type filter (optional)
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20)

#### Delete File
```
DELETE /api/files/:id
Authorization: Bearer <access-token>
```

#### Download File
```
GET /api/files/download/:id
Authorization: Bearer <access-token>
```

## File Structure

```
my-drive/
├── app/
│   ├── api/
│   │   ├── auth/
│   │   │   ├── login/
│   │   │   ├── register/
│   │   │   └── refresh/
│   │   └── files/
│   │       ├── upload/
│   │       ├── download/
│   │       └── [id]/
│   ├── components/
│   │   ├── LoginForm.js
│   │   ├── RegisterForm.js
│   │   ├── FileManager.js
│   │   ├── FileUpload.js
│   │   ├── FileList.js
│   │   └── Header.js
│   ├── globals.css
│   ├── layout.js
│   └── page.js
├── lib/
│   ├── models/
│   │   ├── User.js
│   │   └── File.js
│   ├── auth.js
│   ├── b2.js
│   ├── db.js
│   └── jwt.js
├── public/
├── package.json
└── README.md
```

## Security Features

- **Password Hashing**: Passwords are hashed using bcrypt
- **JWT Authentication**: Secure token-based authentication
- **File Access Control**: Users can only access their own files
- **Input Validation**: Server-side validation for all inputs
- **CORS Protection**: Configured for secure cross-origin requests

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Configure environment variables in Vercel dashboard
4. Deploy

### Other Platforms

The application can be deployed to any platform that supports Next.js:

- Netlify
- Railway
- DigitalOcean App Platform
- AWS Amplify

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `MONGODB_URI` | MongoDB connection string | Yes |
| `JWT_SECRET` | Secret for JWT access tokens | Yes |
| `JWT_REFRESH_SECRET` | Secret for JWT refresh tokens | Yes |
| `B2_APPLICATION_KEY_ID` | Backblaze B2 application key ID | Yes |
| `B2_APPLICATION_KEY` | Backblaze B2 application key | Yes |
| `B2_BUCKET_ID` | Backblaze B2 bucket ID | Yes |
| `B2_BUCKET_NAME` | Backblaze B2 bucket name | Yes |
| `B2_ENDPOINT` | Backblaze B2 endpoint URL | Yes |

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support, please open an issue on GitHub or contact the development team.
