# Setting Up Your Backend on PythonAnywhere

This guide will help you deploy your TrustIt-AI backend on PythonAnywhere.

## 1. Sign Up for PythonAnywhere

- Go to [PythonAnywhere](https://www.pythonanywhere.com/) and sign up for a free account

## 2. Set Up Your Code

1. From the PythonAnywhere dashboard, open a **Bash console**
2. Clone your repository:
   ```bash
   git clone https://github.com/your-username/TrustIt-AI.git
   ```
   (Or upload files manually through the Files tab)

## 3. Create a Virtual Environment

```bash
mkvirtualenv --python=python3.10 trustit-env
cd TrustIt-AI
pip install -r backend/requirements.txt
```

## 4. Set Up Your Web App

1. Go to the **Web** tab in PythonAnywhere
2. Click **Add a new web app**
3. Select **Manual configuration**
4. Choose **Python 3.10**
5. Set the following configuration:
   - Source code: `/home/yourusername/TrustIt-AI`
   - Working directory: `/home/yourusername/TrustIt-AI/backend`
   - WSGI file: `/home/yourusername/TrustIt-AI/backend/wsgi.py`
   - Virtual environment: `/home/yourusername/.virtualenvs/trustit-env`

## 5. Set Environment Variables

1. In the **Web** tab, scroll to the "Environment variables" section
2. Add the following environment variables:
   ```
   PORTIA_API_KEY=your_portia_key
   TAVILY_API_KEY=your_tavily_key
   GOOGLE_API_KEY=your_google_key
   ```

## 6. Configure Your WSGI File

The WSGI file has already been created for you (wsgi.py), and it should work out of the box.

## 7. Update Your Frontend

In your frontend code (`frontend/lib/api.ts`), update the API_BASE_URL:

```typescript
const API_BASE_URL = "https://YOUR_PYTHONANYWHERE_USERNAME.pythonanywhere.com";
```

Replace `YOUR_PYTHONANYWHERE_USERNAME` with your actual PythonAnywhere username.

## 8. Reload Your Web App

Click the **Reload** button in the Web tab to apply all your changes.

Your API will now be available at `https://yourusername.pythonanywhere.com/api/analyze`
