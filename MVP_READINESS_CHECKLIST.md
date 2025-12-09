# MVP Readiness Checklist

## 🔴 Critical Issues (Must Fix Before Launch)

### 1. **Hardcoded API URLs**
- **Location**: `frontend/src/lib/api.ts` (line 14), `frontend/src/lib/auth.ts` (line 7), `frontend/src/app/dashboard/page.tsx` (line 34)
- **Issue**: API URLs are hardcoded as `http://localhost:8000`
- **Fix**: Use environment variable `NEXT_PUBLIC_API_URL` with fallback
- **Impact**: App won't work in production

### 2. **Missing Route Pages**
- **Location**: Sidebar references `/stats` and `/games/wordle`, `/games/connection`
- **Issue**: These routes don't exist - will cause 404 errors
- **Fix**: Create placeholder pages or remove from sidebar
- **Impact**: Broken navigation links

### 3. **Design Inconsistencies**
- **Home page** (`/app/page.tsx`): Still has old gradient colors (slate-50, amber-50, rose-50)
- **Login page**: Missing dark mode support, doesn't match design system
- **Learn page**: "Go to Dashboard" button still uses blue color instead of pink
- **Impact**: Inconsistent user experience

### 4. **Error Handling**
- **Issue**: Using `alert()` for errors (found in Flashcards.tsx, crossword/page.tsx, auth.ts)
- **Fix**: Replace with proper error UI components/toasts
- **Impact**: Poor UX, unprofessional appearance

## 🟡 Important Issues (Should Fix)

### 5. **Missing Error Boundaries**
- **Issue**: No React error boundaries to catch component errors
- **Fix**: Add error boundary component
- **Impact**: App crashes show blank screen instead of error message

### 6. **Missing 404 Page**
- **Issue**: No custom 404 page for Next.js
- **Fix**: Create `app/not-found.tsx`
- **Impact**: Generic 404 page doesn't match app design

### 7. **Word History Sync**
- **Issue**: Word history only stored in localStorage, not synced with backend for logged-in users
- **Fix**: Save to backend when user is authenticated
- **Impact**: Users lose history if they clear browser data

### 8. **Loading States**
- **Issue**: Some pages have inconsistent loading states
- **Fix**: Standardize loading components
- **Impact**: Confusing UX during data fetching

### 9. **Environment Variables**
- **Issue**: No `.env.example` file documenting required variables
- **Fix**: Create example file with all required env vars
- **Impact**: Difficult setup for new developers/deployment

## 🟢 Nice-to-Have (Can Fix Later)

### 10. **Console Logs**
- **Issue**: Multiple `console.error` and `console.log` statements
- **Fix**: Replace with proper logging service or remove
- **Impact**: Clutters browser console

### 11. **TypeScript Types**
- **Issue**: Some `any` types used (e.g., `useState<any>`)
- **Fix**: Define proper interfaces
- **Impact**: Reduced type safety

### 12. **Accessibility**
- **Issue**: Missing ARIA labels, keyboard navigation
- **Fix**: Add proper accessibility attributes
- **Impact**: Poor experience for screen readers

### 13. **Performance**
- **Issue**: No image optimization, large bundle size
- **Fix**: Optimize images, code splitting
- **Impact**: Slower load times

## ✅ What's Working Well

1. ✅ Core functionality (flashcards, crosswords, word history)
2. ✅ Authentication flow
3. ✅ Dark/light mode theming
4. ✅ Responsive design
5. ✅ API integration
6. ✅ Database models and migrations

## 📋 Recommended Action Plan

### Phase 1: Critical Fixes (Before MVP)
1. Fix hardcoded API URLs
2. Create missing route pages or remove links
3. Fix design inconsistencies
4. Replace alert() with proper error UI

### Phase 2: Important Fixes (Before Public Launch)
5. Add error boundaries
6. Create 404 page
7. Sync word history with backend
8. Standardize loading states

### Phase 3: Polish (Post-MVP)
9. Clean up console logs
10. Improve TypeScript types
11. Add accessibility features
12. Performance optimization

