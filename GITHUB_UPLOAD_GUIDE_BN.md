# ScentMuse AI — GitHub upload guide (বাংলা)

**শুরু করার আগে:** ZIP ডাউনলোড করে Extract করবে। প্রথমে `index.html`-এ double-click করে কম্পিউটারের ব্রাউজারে interactive demo দেখতে পারবে। ফোনে HTML file খুলতে কিছু file manager-এর সীমাবদ্ধতা থাকতে পারে; তখন GitHub Pages-এ publish করা site link ব্যবহার করো।

## GitHub Pages-এ website live করার ধাপ

1. GitHub-এ লগইন করো: https://github.com
2. **New repository** থেকে `ScentMuse-AI` নাম দাও। **Public** নির্বাচন করো।
3. Repository-তে **Add file → Upload files** বেছে নাও। Extract করা `ScentMuse_AI_Final` folder-এর **ভেতরের** সব files এবং subfolders upload করো। ZIP file একা upload করবে না।
4. Commit changes চাপো। নিশ্চিত করো repository-এর root-এ `index.html` আছে, এবং `data/`, `ml/`, `docs/`-এর folders-ও আছে।
5. **Settings → Pages → Build and deployment → Source: Deploy from a branch → main → /(root) → Save**।
6. Github-এর deployment শেষ হলে সাধারণত website address হবে `https://YOUR-USERNAME.github.io/ScentMuse-AI/`। GitHub account `esha2310` হলে সম্ভাব্য address `https://esha2310.github.io/ScentMuse-AI/`। এটি live verified link নয়; publish করার পর খুলে দেখতে হবে।
7. Phone ও laptop দুটো থেকেই পরীক্ষা করো: Search, family filter, perfume details, favourites, bag, note selection ও AI results।

**গুরুত্বপূর্ণ:** এটি educational portfolio ও discovery demo; কেনাকাটা, payment, product prices এবং user login নেই। Recommendation score preference/liking probability নয়।

## পরে পরিবর্তন করতে চাইলে

`src/index.template.html`, `style.css`, `app.js`, `data/` ও `ml/` edit করে `python tools/build_site.py` চালিয়ে root `index.html` আবার বানাবে; তারপর GitHub-এ changed files commit করবে। Model retraining-এর জন্য `python ml-research/train.py` (scikit-learn প্রয়োজন)।
