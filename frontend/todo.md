# MVP Todo - Matrix Messenger Layout

## Files to Create/Modify:
1. **src/pages/Index.tsx** - Main layout with sidebar and content area
2. **src/components/Sidebar.tsx** - Left sidebar with logo, navigation, and chat list
3. **src/components/MainContent.tsx** - Right content area with Matrix Messenger header and user sections
4. **src/components/UserProfile.tsx** - Telegram User profile display section
5. **src/components/CreateUserForm.tsx** - Create Matrix User form component
6. **index.html** - Update title to "Matrix Messenger"

## Layout Structure:
- **Sidebar (Left)**: Logo, New Chat button, Go to App World link, Starred/Recents sections with chat items
- **Main Content (Right)**: Matrix Messenger header, Telegram User profile, Create User/Subscription buttons, Create Matrix User form
- **Color Scheme**: Blue/purple gradient matching mockup
- **Responsive**: Mobile-first design

## Implementation Notes:
- Use CSS Grid for main layout
- Simple CSS styling, minimal external dependencies
- Focus on layout structure and visual hierarchy
- Keep components simple and functional