# دليل النشر - EduMaster Frontend

## 🚀 خيارات النشر

### 1. Vercel (الأسهل والأسرع)

```bash
# تثبيت Vercel CLI
npm i -g vercel

# تسجيل الدخول
vercel login

# نشر المشروع
vercel

# للنشر في الإنتاج
vercel --prod
```

### 2. Netlify

```bash
# بناء المشروع
npm run build

# رفع مجلد dist إلى Netlify
# أو ربط المستودع مباشرة
```

### 3. GitHub Pages

```bash
# تثبيت gh-pages
npm install --save-dev gh-pages

# إضافة سكريبت في package.json
"deploy": "gh-pages -d dist"

# بناء ونشر
npm run build
npm run deploy
```

### 4. خادم خاص

```bash
# بناء المشروع
npm run build

# نسخ محتويات مجلد dist إلى خادم الويب
# مثل Apache أو Nginx
```

## ⚙️ إعدادات الإنتاج

### متغيرات البيئة
```env
VITE_API_BASE_URL=https://your-api-domain.com
VITE_APP_NAME=EduMaster
VITE_APP_VERSION=1.0.0
```

### إعدادات Nginx
```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /path/to/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # ضغط الملفات
    gzip on;
    gzip_types text/css application/javascript application/json;
}
```

### إعدادات Apache
```apache
<VirtualHost *:80>
    ServerName your-domain.com
    DocumentRoot /path/to/dist
    
    <Directory /path/to/dist>
        Options -Indexes
        AllowOverride All
        Require all granted
    </Directory>
    
    # إعادة توجيه للـ SPA
    FallbackResource /index.html
</VirtualHost>
```

## 🔧 تحسينات الأداء

### 1. ضغط الأصول
```bash
# تثبيت أدوات الضغط
npm install --save-dev vite-plugin-compression

# إضافة في vite.config.js
import compression from 'vite-plugin-compression'

export default {
  plugins: [compression()]
}
```

### 2. تحليل الحزمة
```bash
# تحليل حجم الحزمة
npm run build -- --analyze
```

### 3. PWA (اختياري)
```bash
# تثبيت PWA plugin
npm install --save-dev vite-plugin-pwa

# إضافة في vite.config.js
import { VitePWA } from 'vite-plugin-pwa'

export default {
  plugins: [
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}']
      }
    })
  ]
}
```

## 🛡️ الأمان

### 1. HTTPS
- تأكد من استخدام HTTPS في الإنتاج
- استخدم شهادات SSL مجانية من Let's Encrypt

### 2. CSP Headers
```html
<meta http-equiv="Content-Security-Policy" 
      content="default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';">
```

### 3. Environment Variables
- لا تضع أسرار في متغيرات البيئة العامة
- استخدم VITE_ prefix للمتغيرات العامة فقط

## 📊 المراقبة

### 1. Google Analytics
```javascript
// إضافة في index.html
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_MEASUREMENT_ID');
</script>
```

### 2. Error Tracking
```bash
# تثبيت Sentry
npm install @sentry/react

# إعداد في main.jsx
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: "YOUR_DSN_HERE",
});
```

## 🔄 CI/CD

### GitHub Actions
```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v2
    - name: Setup Node.js
      uses: actions/setup-node@v2
      with:
        node-version: '18'
    - name: Install dependencies
      run: npm ci
    - name: Build
      run: npm run build
    - name: Deploy to Vercel
      uses: amondnet/vercel-action@v20
      with:
        vercel-token: ${{ secrets.VERCEL_TOKEN }}
        vercel-org-id: ${{ secrets.ORG_ID}}
        vercel-project-id: ${{ secrets.PROJECT_ID}}
        vercel-args: '--prod'
```

## ✅ قائمة مراجعة النشر

- [ ] تحديث متغيرات البيئة
- [ ] اختبار جميع الصفحات
- [ ] فحص الروابط المكسورة
- [ ] تحسين الصور
- [ ] ضغط الأصول
- [ ] إعداد HTTPS
- [ ] إعداد المراقبة
- [ ] اختبار الأداء
- [ ] نسخ احتياطية
- [ ] توثيق التغييرات

## 🆘 استكشاف الأخطاء

### مشاكل شائعة

1. **صفحة 404 عند التحديث**
   - تأكد من إعداد fallback للـ SPA

2. **مشاكل CORS**
   - تحقق من إعدادات الخادم الخلفي

3. **ملفات CSS لا تُحمل**
   - تحقق من مسارات الأصول

4. **بطء التحميل**
   - فعل ضغط gzip
   - استخدم CDN

---

للمساعدة الإضافية، راجع الوثائق الرسمية أو تواصل مع فريق التطوير.

