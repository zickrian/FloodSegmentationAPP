# ⚡ QUICK START GUIDE

Get your Flood Segmentation App running in **5 minutes**!

---

## 🎯 Prerequisites

- Python 3.10+ ✅
- Node.js 18+ ✅
- Model files: `unet_baseline_best.pth`, `unetplus.pth` ✅

---

## 🚀 Setup Steps

### 1️⃣ Copy Model Weights

```bash
mkdir backend/models_weights
cp Models/unet_baseline_best.pth backend/models_weights/
cp Models/unetplus.pth backend/models_weights/
```

### 2️⃣ Setup Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 3️⃣ Setup Frontend

```bash
# From project root
npm install
echo "NEXT_PUBLIC_API_URL=http://localhost:8000" > .env.local
```

### 4️⃣ Start Backend

```bash
# In backend/, with venv activated
uvicorn app.main:app --reload
```

Backend runs at: `http://localhost:8000`

### 5️⃣ Start Frontend

```bash
# In project root, new terminal
npm run dev
```

Frontend runs at: `http://localhost:3000`

### 6️⃣ Test It!

Open `http://localhost:3000` and upload a flood image! 🎉

---

## 📋 Commands Reference

### Backend Commands

```bash
# Start server
uvicorn app.main:app --reload

# Start on custom port
uvicorn app.main:app --reload --port 8080

# Run tests
pytest tests/ -v

# Check health
curl http://localhost:8000/health
```

### Frontend Commands

```bash
# Development mode
npm run dev

# Production build
npm run build
npm start

# Lint code
npm run lint

# Run tests
npm test
```

---

## 🔍 Verify Installation

### Check Backend

```bash
curl http://localhost:8000/health
```

Expected response:
```json
{
  "status": "healthy",
  "models_loaded": true,
  "device": "cpu"
}
```

### Check Frontend

Open `http://localhost:3000` in browser. You should see the upload interface.

---

## 🐛 Troubleshooting

### Backend Issues

**Problem:** Module not found
```bash
# Solution: Activate virtual environment
cd backend
source venv/bin/activate  # Windows: venv\Scripts\activate
```

**Problem:** Models not loading
```bash
# Solution: Verify model files exist
ls -lh backend/models_weights/
# Should show: unet_baseline_best.pth, unetplus.pth
```

**Problem:** Port already in use
```bash
# Solution: Use different port
uvicorn app.main:app --reload --port 8001
# Update frontend .env.local: NEXT_PUBLIC_API_URL=http://localhost:8001
```

### Frontend Issues

**Problem:** Module not found
```bash
# Solution: Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

**Problem:** API connection failed
```bash
# Solution: Check .env.local
cat .env.local
# Should show: NEXT_PUBLIC_API_URL=http://localhost:8000

# Verify backend is running
curl http://localhost:8000/health
```

**Problem:** Port 3000 in use
```bash
# Solution: Use different port
PORT=3001 npm run dev
```

---

## 📦 Environment Variables

### Backend (.env)

```env
MODEL_PATH_UNET=./models_weights/unet_baseline_best.pth
MODEL_PATH_UNETPP=./models_weights/unetplus.pth
DEVICE=cpu
CORS_ORIGINS=http://localhost:3000
```

### Frontend (.env.local)

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

---

## 🎨 Features to Test

- [ ] Drag & drop image upload
- [ ] Click to browse upload
- [ ] Image preview displays
- [ ] Segmentation runs (1-3 seconds)
- [ ] Results display with 4 tabs
- [ ] Statistics table shows data
- [ ] Summaries are readable
- [ ] Works on mobile (resize browser)

---

## 📚 Next Steps

1. ✅ **Test locally** - Upload different flood images
2. ✅ **Read documentation:**
   - `ARCHITECTURE.md` - System design
   - `DEPLOYMENT.md` - Deploy to Railway
   - `TESTING.md` - Testing procedures
3. ✅ **Deploy to production** - Follow DEPLOYMENT.md
4. ✅ **Customize** - Add your own features

---

## 🆘 Need Help?

- **Architecture:** See `ARCHITECTURE.md`
- **Deployment:** See `DEPLOYMENT.md`
- **Testing:** See `TESTING.md`
- **Full docs:** See `README.md`
- **Summary:** See `PROJECT_SUMMARY.md`

---

## ⚡ One-Line Setup (Alternative)

Use the automated setup script:

```bash
chmod +x setup.sh && ./setup.sh
```

Then start services:

```bash
# Terminal 1
cd backend && source venv/bin/activate && uvicorn app.main:app --reload

# Terminal 2
npm run dev
```

---

**That's it! You're ready to segment floods! 🌊**

Open `http://localhost:3000` and start testing!

