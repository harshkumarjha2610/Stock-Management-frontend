import { defineRouting } from 'next-intl/routing';
import { createNavigation } from 'next-intl/navigation';

export const routing = defineRouting({
  locales: ['en', 'ar'],
  defaultLocale: 'en',
  localePrefix: 'always',
  localeDetection: false,   // ← ADD THIS — disables auto browser detection
});

export const { Link, redirect, usePathname, useRouter } = createNavigation(routing);
