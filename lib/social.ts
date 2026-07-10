import { Facebook, Instagram, Twitter, Github, Linkedin, Globe, MessageCircle, Music2, LucideIcon } from 'lucide-react';

export interface SocialPlatform {
  key: string;
  label: string;
  icon: LucideIcon;
  match: RegExp;
}

// Social platform detection for link icons
export const SOCIAL_PLATFORMS: SocialPlatform[] = [
  { key: 'facebook', label: 'Facebook', icon: Facebook, match: /facebook\.com|fb\.me/i },
  { key: 'instagram', label: 'Instagram', icon: Instagram, match: /instagram\.com/i },
  { key: 'tiktok', label: 'TikTok', icon: Music2, match: /tiktok\.com/i },
  { key: 'twitter', label: 'X / Twitter', icon: Twitter, match: /twitter\.com|x\.com/i },
  { key: 'github', label: 'GitHub', icon: Github, match: /github\.com/i },
  { key: 'linkedin', label: 'LinkedIn', icon: Linkedin, match: /linkedin\.com/i },
  { key: 'line', label: 'Line', icon: MessageCircle, match: /line\.me|line\.app/i },
  { key: 'website', label: 'Website', icon: Globe, match: /.*/i },
];

export const detectPlatform = (url: string): SocialPlatform => {
  for (const p of SOCIAL_PLATFORMS) {
    if (p.match.test(url)) return p;
  }
  return SOCIAL_PLATFORMS[SOCIAL_PLATFORMS.length - 1];
};

// Validate URL to prevent javascript:/data: injection
export const isValidUrl = (url: string): boolean => {
  try {
    const u = new URL(url);
    return ['http:', 'https:'].includes(u.protocol);
  } catch {
    return false;
  }
};
