# Simple Working Route Structure

## 📁 **CLEAN ROUTE STRUCTURE**

```
app/
├── _layout.tsx                    # Root layout
├── index.tsx                      # Homepage
├── (auth)/                        # Auth screens
│   ├── _layout.tsx
│   ├── login.tsx
│   ├── register.tsx
│   ├── forgot-password.tsx
│   └── verify-nin.tsx
├── (tabs)/                        # Main app
│   ├── _layout.tsx
│   └── elections.tsx
├── elections/
│   └── [id].tsx                   # Election details
├── results/
│   └── [id].tsx                   # Results
├── vote/
│   └── [id].tsx                   # Voting
├── dashboard/
│   └── page.tsx
└── profile/
    └── page.tsx
```

## 🎯 **SIMPLE NAMING RULES**

- **Routes**: Use what works (kebab-case or camelCase)
- **Components**: PascalCase (LoginScreen, RegisterScreen)
- **Files**: Keep it simple and descriptive
- **Groups**: Use (auth), (tabs) for organization

## ✅ **CURRENT WORKING ROUTES**

- `/` → Homepage
- `/login` → Login
- `/register` → Register  
- `/forgot-password` → Forgot Password
- `/verify-nin` → NIN Verification
- `/elections` → Elections List
- `/elections/[id]` → Election Details
- `/results/[id]` → Results
- `/vote/[id]` → Voting
- `/dashboard` → Dashboard
- `/profile` → Profile

**Rule: If it works, don't change it!** 🚀