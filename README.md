# Rowin Academy Website

Rowin Academy is a professional rowing academy based in Cairo, Egypt. This website showcases our training programs, events, and booking services.

## About the Project

Rowin Academy has been providing excellence in rowing education since 2017. This website allows visitors to learn about our services, explore events, book sessions, and connect with our team. We train rowers of all levels, from beginners to competitive athletes.

## Website Pages

The website consists of the following pages:

- **Home Page (index.html)** - Landing page with hero section and quick links to services and bookings
- **Services (services.html)** - Detailed information about all training programs and services offered
- **Events (events.html)** - Information about team building events, competitions, and rowing trips
- **Bookings (bookings.html)** - Booking system for sessions and programs
- **Contact (contact.html)** - Contact information and inquiry form
- **About Us (about.html)** - Academy story, values, coaches, and achievements
- **Login (login.html)** - User login page
- **Register (register.html)** - User registration page
- **Profile (profile.html)** - User profile page
- **Dashboard (Dashboard.html)** - Admin dashboard

## Services Offered

1. Rowing Training - Professional programs for all levels
2. Kayak Adventures - Guided tours and training sessions
3. Stand Up Paddle (SUP) - Fitness-focused paddleboarding
4. Private Coaching - One-on-one personalized training
5. Equipment Rental - High-quality boats and paddleboards
6. Fitness & Conditioning - Strength and endurance programs

## Key Features

- Modern and responsive design
- Full-width hero section with call-to-action buttons
- Dynamic service and booking sections
- Detailed information about events and trips
- Coach profiles and expertise
- Easy navigation with sticky navbar
- Social media integration
- Contact form for inquiries
- User authentication system
- Professional coaching team profiles

## Technical Stack

- HTML5 - Semantic markup for structure
- CSS3 - Styling with custom CSS files
- Bootstrap 5 - Responsive framework
- JavaScript - Interactivity and dynamic features
- Font Awesome - Icon library
- Google Fonts - Poppins font family

## File Structure

```
RowingAcademyWebsite/
├── index.html
├── services.html
├── events.html
├── bookings.html
├── contact.html
├── about.html
├── login.html
├── register.html
├── profile.html
├── Dashboard.html
├── README.md
├── css/
│   ├── adhamCSS.css         ← all custom styles (merged from karimCSS)
│   ├── bootstrap.min.css
│   ├── bootstrap.min.css.map
│   └── all.min.css
├── js/
│   ├── admin.js
│   ├── auth.js
│   ├── booking.js
│   ├── profile.js
│   ├── bootstrap.bundle.min.js
│   ├── bootstrap.bundle.min.js.map
│   └── all.min.js
├── images/
│   ├── logo.PNG
│   ├── recolored-logo.png
│   ├── cover1.JPG
│   ├── cover2.JPG
│   ├── cover3.jpeg
│   ├── team.JPG
│   ├── rowathon.png
│   ├── olympix.jpg
│   ├── olympix2.JPG
│   ├── ismalia.jpg
│   ├── berlin.JPG
│   ├── adham.jpeg
│   ├── asmaa.jpeg
│   ├── rana.jpeg
│   ├── storyimage.jpeg
│   └── Rowing.jpg
└── webfonts/
    ├── fa-brands-400.woff2
    ├── fa-regular-400.woff2
    ├── fa-solid-900.woff2
    └── fa-v4compatibility.woff2
```

## Color Scheme

- Primary Blue: rgb(34, 56, 145)
- Light Blue: rgb(19, 59, 222)
- Orange Accent: rgb(248, 158, 69)
- Light Gray Background: rgba(245, 244, 244, 0.721)

## Typography

- Font Family: Poppins (Google Fonts)
- Font Weights: 300, 400, 600, 700
- Used for all text elements across the website

## Getting Started

1. Clone or download the project files
2. Open any HTML file in a web browser
3. Navigate through pages using the navbar menu
4. Fill out contact forms or booking requests as needed

## Contact Information

- Address: 122 Nile Street, Giza, Egypt
- Phone: +201067001695
- Email: info@rowinacademy.com
- Website: rowinacademy.com

## Social Media

- Facebook: www.facebook.com/rowin.eg
- Instagram: www.instagram.com/rowin.eg
- WhatsApp: wa.me/201140637023

## Browser Support

- Chrome (recommended)
- Firefox
- Safari
- Edge
- Mobile browsers

## Credits

Design and development by the Rowin Academy team

## License

All rights reserved. Copyright 2026 Rowin Academy.

---

## SPA Refactoring (v2)

This project has been refactored into a **Single-Page Application (SPA)** using AngularJS `ngRoute`.

### How it works
- **One HTML shell**: `index.html` is the only entry point. Angular loads views from the `views/` folder dynamically.
- **All routes use hash navigation** (`#!/`, `#!/services`, `#!/bookings`, etc.) — no server config needed.
- **Views folder**: `views/` contains one `.html` partial per page.

### Changing the brand blue color
Open `css/adhamCSS.css` and update the **single variable** at the top:
```css
:root {
  --brand-blue: rgb(34, 56, 145);  /* ← Change this one value */
}
```
All blue elements site-wide update automatically.

### Route map
| URL | View |
|-----|------|
| `#!/` | `views/home.html` |
| `#!/services` | `views/services.html` |
| `#!/events` | `views/events.html` |
| `#!/bookings` | `views/bookings.html` |
| `#!/contact` | `views/contact.html` |
| `#!/about` | `views/about.html` |
| `#!/login` | `views/login.html` |
| `#!/register` | `views/register.html` |
| `#!/profile` | `views/profile.html` |
| `#!/dashboard` | `views/dashboard.html` |
| `#!/reset-password` | `views/reset-password-confirm.html` |
